import { createHash } from 'crypto';

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheOptions {
  defaultTTL?: number; // Default TTL in milliseconds
  maxSize?: number; // Maximum number of entries
  cleanupInterval?: number; // Cleanup interval in milliseconds
}

export interface CacheKeyParams {
  modelId?: string;
  userId?: string;
  conversationId?: string;
  prompt?: string;
  temperature?: number;
  maxTokens?: number;
  [key: string]: any;
}

/**
 * In-memory cache with TTL support for AI requests and responses
 */
export class TTLCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private defaultTTL: number;
  private maxSize: number;
  private cleanupInterval: number;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.defaultTTL || 5 * 60 * 1000; // 5 minutes default
    this.maxSize = options.maxSize || 1000;
    this.cleanupInterval = options.cleanupInterval || 60 * 1000; // 1 minute cleanup

    // Start periodic cleanup
    this.startCleanup();
  }

  /**
   * Generate a cache key from request parameters
   */
  static generateKey(params: CacheKeyParams): string {
    // Sort keys for consistent hashing
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as CacheKeyParams);

    const paramString = JSON.stringify(sortedParams);
    return createHash('sha256').update(paramString).digest('hex');
  }

  /**
   * Set a value in the cache with optional TTL
   */
  set(key: string, value: T, ttl?: number): void {
    const now = Date.now();
    const entryTTL = ttl || this.defaultTTL;

    // Remove oldest entry if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data: value,
      timestamp: now,
      ttl: entryTTL,
      accessCount: 0,
      lastAccessed: now,
    });
  }

  /**
   * Get a value from the cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    
    // Check if entry has expired
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = now;

    return entry.data;
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a specific key from the cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all entries from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.values());
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      expired: entries.filter(entry => now - entry.timestamp > entry.ttl).length,
      totalAccesses: entries.reduce((sum, entry) => sum + entry.accessCount, 0),
      averageAge: entries.length > 0 
        ? entries.reduce((sum, entry) => sum + (now - entry.timestamp), 0) / entries.length 
        : 0,
    };
  }

  /**
   * Remove expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    return removedCount;
  }

  /**
   * Evict the oldest entry (LRU-style)
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Start periodic cleanup
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  /**
   * Stop periodic cleanup
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    this.clear();
  }
}

/**
 * Async cache wrapper for Promise-based operations
 */
export class AsyncCache<T = any> extends TTLCache<T> {
  private pendingPromises = new Map<string, Promise<T>>();

  /**
   * Get or set with async operation
   */
  async getOrSet(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    // Check if value exists in cache
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Check if promise is already pending
    const pending = this.pendingPromises.get(key);
    if (pending) {
      return pending;
    }

    // Create new promise
    const promise = fetcher().then(result => {
      this.set(key, result, ttl);
      this.pendingPromises.delete(key);
      return result;
    }).catch(error => {
      this.pendingPromises.delete(key);
      throw error;
    });

    this.pendingPromises.set(key, promise);
    return promise;
  }

  /**
   * Clear pending promises
   */
  clearPending(): void {
    this.pendingPromises.clear();
  }

  /**
   * Override destroy to clear pending promises
   */
  destroy(): void {
    this.clearPending();
    super.destroy();
  }
}

// Export singleton instances for different use cases
export const responseCache = new AsyncCache<any>({
  defaultTTL: 10 * 60 * 1000, // 10 minutes for AI responses
  maxSize: 500,
  cleanupInterval: 2 * 60 * 1000, // 2 minutes cleanup
});

export const contextCache = new TTLCache<any>({
  defaultTTL: 30 * 60 * 1000, // 30 minutes for conversation context
  maxSize: 200,
  cleanupInterval: 5 * 60 * 1000, // 5 minutes cleanup
});

export const rateLimitCache = new TTLCache<number>({
  defaultTTL: 60 * 1000, // 1 minute for rate limiting
  maxSize: 10000, // Support many users
  cleanupInterval: 30 * 1000, // 30 seconds cleanup
});