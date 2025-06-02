import { RateLimiter } from './rate-limiter';
import { entitlementsByUserType } from './entitlements';
import { TTLCache } from './cache';
import type { UserType } from '@/app/(auth)/auth';

// Create a dedicated cache for rate limiting data
const rateLimitDataCache = new TTLCache<number[]>({
  defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
  maxSize: 5000,
  cleanupInterval: 60 * 1000, // 1 minute
});

export interface RateLimitConfig {
  requestsPerSecond: number;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstAllowance: number;
}

export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  resetTime?: number;
  remaining?: {
    perSecond: number;
    perMinute: number;
    perHour: number;
    perDay: number;
  };
}

/**
 * Enhanced rate limiter with user-based limits and entitlements
 */
export class EnhancedRateLimiter {
  private readonly globalLimiter: RateLimiter;
  private readonly userLimiters = new Map<string, RateLimiter>();

  // Default rate limits (can be overridden per user)
  private readonly defaultLimits: RateLimitConfig = {
    requestsPerSecond: 0.1, // 1 request per 10 seconds
    requestsPerMinute: 10,
    requestsPerHour: 100,
    requestsPerDay: 500,
    burstAllowance: 5,
  };

  // Rate limits per user type
  private readonly userTypeLimits: Record<UserType, RateLimitConfig> = {
    guest: {
      requestsPerSecond: 0.1, // 1 request per 10 seconds
      requestsPerMinute: 6, // 6 requests per minute
      requestsPerHour: 30, // 30 requests per hour
      requestsPerDay: 30, // Matches entitlements
      burstAllowance: 3,
    },
    regular: {
      requestsPerSecond: 0.2, // 1 request per 5 seconds
      requestsPerMinute: 20, // 20 requests per minute
      requestsPerHour: 200, // 200 requests per hour
      requestsPerDay: 200, // Matches entitlements
      burstAllowance: 10,
    },
  };

  constructor() {
    // Global rate limiter (10 requests per minute across all users)
    this.globalLimiter = new RateLimiter(10, 60 * 1000);
  }

  /**
   * Check if a request is allowed for a user
   */
  checkRateLimit(
    userId: string, 
    userType: UserType = 'guest'
  ): RateLimitResult {
    const limits = this.userTypeLimits[userType] || this.defaultLimits;
    const now = Date.now();

    // Check global rate limit first
    if (!this.globalLimiter.allowRequest()) {
      return {
        allowed: false,
        reason: 'Global rate limit exceeded. Please try again later.',
        resetTime: now + 60000, // 1 minute
      };
    }

    // Check user-specific limits
    const userLimitResult = this.checkUserLimits(userId, limits, now);
    if (!userLimitResult.allowed) {
      return userLimitResult;
    }

    // Check daily entitlement limit
    const dailyUsage = this.getDailyUsage(userId);
    const maxDaily = entitlementsByUserType[userType].maxMessagesPerDay;
    
    if (dailyUsage >= maxDaily) {
      return {
        allowed: false,
        reason: `Daily message limit reached (${maxDaily} messages per day)`,
        resetTime: this.getNextDayReset(),
      };
    }

    // Update usage counters
    this.updateUsageCounters(userId, now);

    return {
      allowed: true,
      remaining: this.getRemainingLimits(userId, limits, now),
    };
  }

  /**
   * Check user-specific rate limits
   */
  private checkUserLimits(
    userId: string, 
    limits: RateLimitConfig, 
    now: number
  ): RateLimitResult {
    const checks = [
      {
        key: `${userId}:second`,
        interval: 1000,
        limit: limits.requestsPerSecond,
        name: 'per second',
      },
      {
        key: `${userId}:minute`,
        interval: 60 * 1000,
        limit: limits.requestsPerMinute,
        name: 'per minute',
      },
      {
        key: `${userId}:hour`,
        interval: 60 * 60 * 1000,
        limit: limits.requestsPerHour,
        name: 'per hour',
      },
    ];

    for (const check of checks) {
      const count = this.getRequestCount(check.key, check.interval, now);
      if (count >= check.limit) {
        return {
          allowed: false,
          reason: `Rate limit exceeded: ${check.limit} requests ${check.name}`,
          resetTime: now + check.interval,
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Get request count for a time window
   */
  private getRequestCount(key: string, interval: number, now: number): number {
    const requests = rateLimitDataCache.get(key) || [];
    
    // Filter requests within the time window
    const validRequests = requests.filter(timestamp => now - timestamp < interval);
    
    // Update cache with valid requests
    rateLimitDataCache.set(key, validRequests, interval);
    
    return validRequests.length;
  }

  /**
   * Update usage counters after allowing a request
   */
  private updateUsageCounters(userId: string, now: number): void {
    const windows = [
      { key: `${userId}:second`, interval: 1000 },
      { key: `${userId}:minute`, interval: 60 * 1000 },
      { key: `${userId}:hour`, interval: 60 * 60 * 1000 },
      { key: `${userId}:day`, interval: 24 * 60 * 60 * 1000 },
    ];

    for (const window of windows) {
      const requests = rateLimitDataCache.get(window.key) || [];
      requests.push(now);
      
      // Keep only requests within the window
      const validRequests = requests.filter(
        timestamp => now - timestamp < window.interval
      );
      
      rateLimitDataCache.set(window.key, validRequests, window.interval);
    }
  }

  /**
   * Get daily usage count for a user
   */
  private getDailyUsage(userId: string): number {
    const now = Date.now();
    return this.getRequestCount(`${userId}:day`, 24 * 60 * 60 * 1000, now);
  }

  /**
   * Get remaining limits for a user
   */
  private getRemainingLimits(
    userId: string, 
    limits: RateLimitConfig, 
    now: number
  ) {
    return {
      perSecond: Math.max(0, limits.requestsPerSecond - this.getRequestCount(`${userId}:second`, 1000, now)),
      perMinute: Math.max(0, limits.requestsPerMinute - this.getRequestCount(`${userId}:minute`, 60 * 1000, now)),
      perHour: Math.max(0, limits.requestsPerHour - this.getRequestCount(`${userId}:hour`, 60 * 60 * 1000, now)),
      perDay: Math.max(0, limits.requestsPerDay - this.getRequestCount(`${userId}:day`, 24 * 60 * 60 * 1000, now)),
    };
  }

  /**
   * Get next day reset time (midnight UTC)
   */
  private getNextDayReset(): number {
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    return tomorrow.getTime();
  }

  /**
   * Clear all rate limit data for a user
   */
  clearUserLimits(userId: string): void {
    const keys = [
      `${userId}:second`,
      `${userId}:minute`,
      `${userId}:hour`,
      `${userId}:day`,
    ];

    for (const key of keys) {
      rateLimitDataCache.delete(key);
    }

    this.userLimiters.delete(userId);
  }

  /**
   * Get rate limit status for a user
   */
  getStatus(userId: string, userType: UserType = 'guest') {
    const limits = this.userTypeLimits[userType] || this.defaultLimits;
    const now = Date.now();
    const dailyUsage = this.getDailyUsage(userId);
    const maxDaily = entitlementsByUserType[userType].maxMessagesPerDay;

    return {
      userId,
      userType,
      limits,
      usage: {
        perSecond: this.getRequestCount(`${userId}:second`, 1000, now),
        perMinute: this.getRequestCount(`${userId}:minute`, 60 * 1000, now),
        perHour: this.getRequestCount(`${userId}:hour`, 60 * 60 * 1000, now),
        perDay: dailyUsage,
      },
      remaining: this.getRemainingLimits(userId, limits, now),
      dailyEntitlement: {
        used: dailyUsage,
        total: maxDaily,
        remaining: Math.max(0, maxDaily - dailyUsage),
      },
      resetTimes: {
        daily: this.getNextDayReset(),
        hourly: now + (60 * 60 * 1000),
        minute: now + (60 * 1000),
      },
    };
  }

  /**
   * Clean up expired data
   */
  cleanup(): void {
    rateLimitDataCache.cleanup();
  }
}

// Export singleton instance
export const enhancedRateLimiter = new EnhancedRateLimiter();