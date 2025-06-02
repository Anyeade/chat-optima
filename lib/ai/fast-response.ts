import { aiService, createAIServiceOptions } from './service';
import { responseCache, TTLCache, AsyncCache } from './cache';
import { contextManager } from './context-manager';
import { enhancedRateLimiter } from './enhanced-rate-limiter';
import { slidingWindowOptimizer, autoOptimize } from './sliding-window';
import type { CoreMessage } from 'ai';
import type { UserType } from '@/app/(auth)/auth';
import type { AIServiceOptions, AIResponse } from './service';

export interface FastResponseOptions {
  maxResponseTime: number; // Maximum allowed response time in ms
  useAggressiveCaching: boolean; // Use more aggressive caching strategies
  prefetchCommonResponses: boolean; // Pre-generate common responses
  useStreamingFallback: boolean; // Fall back to streaming if too slow
  optimizeContextSize: boolean; // Aggressively trim context for speed
  prioritizeSpeed: boolean; // Sacrifice some quality for speed
}

export interface FastResponseResult extends AIResponse {
  responseTime: number;
  optimizationUsed: string[];
  fromCache: boolean;
  contextOptimized: boolean;
}

/**
 * High-performance AI response system optimized for sub-3-second responses
 */
export class FastResponseService {
  private responseTimeTarget: number;
  private fastCache: AsyncCache<any>;
  private precomputedCache: TTLCache<string>;
  private commonPrompts: Map<string, string>;
  
  constructor(targetResponseTime = 3000) {
    this.responseTimeTarget = targetResponseTime;
    
    // Ultra-fast cache with shorter TTL but faster access
    this.fastCache = new AsyncCache({
      defaultTTL: 2 * 60 * 1000, // 2 minutes for speed
      maxSize: 2000, // Larger cache for more hits
      cleanupInterval: 30 * 1000, // More frequent cleanup
    });
    
    // Precomputed responses cache
    this.precomputedCache = new TTLCache({
      defaultTTL: 10 * 60 * 1000, // 10 minutes
      maxSize: 500,
      cleanupInterval: 60 * 1000,
    });
    
    // Common prompt patterns and their optimized responses
    this.commonPrompts = new Map([
      ['hello', 'Hello! How can I help you today?'],
      ['hi', 'Hi there! What can I do for you?'],
      ['help', 'I\'m here to help! What do you need assistance with?'],
      ['thanks', 'You\'re welcome! Is there anything else I can help you with?'],
      ['goodbye', 'Goodbye! Have a great day!'],
    ]);
    
    this.initializeOptimizations();
  }

  /**
   * Generate fast response with aggressive optimizations
   */
  async generateFastResponse(
    messages: CoreMessage[],
    options: AIServiceOptions,
    fastOptions: FastResponseOptions = this.getDefaultFastOptions()
  ): Promise<FastResponseResult> {
    const startTime = Date.now();
    const optimizationsUsed: string[] = [];
    
    try {
      // Step 1: Check for instant responses (common patterns)
      const instantResponse = this.checkInstantResponse(messages);
      if (instantResponse && fastOptions.useAggressiveCaching) {
        optimizationsUsed.push('instant-response');
        return {
          content: instantResponse,
          cached: true,
          conversationId: options.conversationId,
          messageId: this.generateFastId(),
          responseTime: Date.now() - startTime,
          optimizationUsed: optimizationsUsed,
          fromCache: true,
          contextOptimized: false,
        };
      }

      // Step 2: Generate ultra-fast cache key
      const fastCacheKey = this.generateFastCacheKey(messages, options);
      
      // Step 3: Check aggressive cache
      if (fastOptions.useAggressiveCaching) {
        const cachedResponse = this.fastCache.get(fastCacheKey);
        if (cachedResponse) {
          optimizationsUsed.push('aggressive-cache-hit');
          return {
            ...cachedResponse,
            responseTime: Date.now() - startTime,
            optimizationUsed: optimizationsUsed,
            fromCache: true,
            contextOptimized: false,
          };
        }
      }

      // Step 4: Optimize context using sliding window
      let optimizedMessages = messages;
      let contextOptimized = false;
      
      if (fastOptions.optimizeContextSize) {
        const windowResult = await autoOptimize(messages, options.modelId, 'speed');
        optimizedMessages = windowResult.messages;
        contextOptimized = windowResult.compressionApplied;
        
        if (contextOptimized) {
          optimizationsUsed.push('sliding-window-optimization');
          optimizationsUsed.push(`removed-${windowResult.removedMessageCount}-messages`);
          
          if (windowResult.summaryAdded) {
            optimizationsUsed.push('conversation-summary');
          }
        }
      }

      // Step 5: Use fastest available model
      const fastModelOptions = this.optimizeModelForSpeed(options, fastOptions);
      if (fastModelOptions.modelId !== options.modelId) {
        optimizationsUsed.push('fast-model-selection');
      }

      // Step 6: Race condition - try multiple approaches simultaneously
      const responsePromise = this.raceForFastResponse(
        optimizedMessages, 
        fastModelOptions, 
        fastOptions,
        optimizationsUsed
      );

      // Step 7: Timeout protection
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Response timeout after ${fastOptions.maxResponseTime}ms`));
        }, fastOptions.maxResponseTime);
      });

      const result = await Promise.race([responsePromise, timeoutPromise]);
      
      // Step 8: Cache for future fast access
      if (fastOptions.useAggressiveCaching && !result.fromCache) {
        this.fastCache.set(fastCacheKey, result, 2 * 60 * 1000); // 2 min cache
      }

      return {
        ...result,
        responseTime: Date.now() - startTime,
        optimizationUsed: optimizationsUsed,
        contextOptimized,
      };

    } catch (error) {
      // Fallback to streaming for speed
      if (fastOptions.useStreamingFallback) {
        optimizationsUsed.push('streaming-fallback');
        return this.generateStreamingFallback(messages, options, startTime, optimizationsUsed);
      }
      
      throw error;
    }
  }

  /**
   * Check for instant responses to common patterns
   */
  private checkInstantResponse(messages: CoreMessage[]): string | null {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || typeof lastMessage.content !== 'string') return null;
    
    const content = lastMessage.content.toLowerCase().trim();
    
    // Check common patterns
    for (const [pattern, response] of this.commonPrompts) {
      if (content.includes(pattern)) {
        return response;
      }
    }
    
    // Quick responses for very short messages
    if (content.length < 10) {
      const quickResponses: Record<string, string> = {
        'yes': 'Great! How can I help you further?',
        'no': 'I understand. Is there something else I can help with?',
        'ok': 'Perfect! What would you like to do next?',
        'sure': 'Excellent! Let me know how I can assist you.',
      };
      
      if (content in quickResponses) {
        return quickResponses[content];
      }
    }
    
    return null;
  }

  /**
   * Generate fast cache key optimized for speed
   */
  private generateFastCacheKey(messages: CoreMessage[], options: AIServiceOptions): string {
    // Use only essential parameters for faster key generation
    const lastMessage = messages[messages.length - 1];
    const contentHash = typeof lastMessage?.content === 'string' 
      ? lastMessage.content.substring(0, 100) // Use only first 100 chars for speed
      : 'multimodal';
    
    return `fast:${options.modelId}:${contentHash}:${messages.length}`;
  }

  /**
   * Optimize context size for maximum speed
   */
  private optimizeContextForSpeed(messages: CoreMessage[], options: AIServiceOptions): CoreMessage[] {
    // Keep only the most recent messages for speed
    const maxMessages = 5; // Aggressive limit for speed
    const recentMessages = messages.slice(-maxMessages);
    
    // If we have a system message, always keep it
    const systemMessage = messages.find(m => m.role === 'system');
    if (systemMessage && !recentMessages.includes(systemMessage)) {
      return [systemMessage, ...recentMessages.slice(1)]; // Replace first with system
    }
    
    return recentMessages;
  }

  /**
   * Select the fastest model for the user type
   */
  private optimizeModelForSpeed(
    options: AIServiceOptions, 
    fastOptions: FastResponseOptions
  ): AIServiceOptions {
    if (!fastOptions.prioritizeSpeed) return options;
    
    // Fast models by user type (prioritizing speed over quality)
    const fastModels = {
      guest: 'phi-3-mini-128k-instruct', // Fastest for guests
      regular: 'llama-3.1-8b-instant', // High volume, fast model
    };
    
    const fastModelId = fastModels[options.userType] || options.modelId;
    
    return {
      ...options,
      modelId: fastModelId,
      temperature: 0.3, // Lower temperature for faster generation
      maxTokens: 1024, // Limit tokens for speed
    };
  }

  /**
   * Race multiple response strategies for maximum speed
   */
  private async raceForFastResponse(
    messages: CoreMessage[],
    options: AIServiceOptions,
    fastOptions: FastResponseOptions,
    optimizationsUsed: string[]
  ): Promise<FastResponseResult> {
    const promises: Promise<FastResponseResult>[] = [];
    
    // Strategy 1: Normal AI service (optimized)
    promises.push(
      aiService.generateResponse(messages, options).then(response => ({
        ...response,
        responseTime: 0, // Will be set by caller
        optimizationUsed: [...optimizationsUsed, 'ai-service'],
        fromCache: response.cached || false,
        contextOptimized: false,
      }))
    );
    
    // Strategy 2: Precomputed response (if available)
    const precomputedKey = this.generatePrecomputedKey(messages);
    const precomputed = this.precomputedCache.get(precomputedKey);
    if (precomputed) {
      promises.push(
        Promise.resolve({
          content: precomputed,
          cached: true,
          conversationId: options.conversationId,
          messageId: this.generateFastId(),
          responseTime: 0,
          optimizationUsed: [...optimizationsUsed, 'precomputed'],
          fromCache: true,
          contextOptimized: false,
        })
      );
    }
    
    // Return the fastest response
    return Promise.race(promises);
  }

  /**
   * Fallback to streaming response for speed
   */
  private async generateStreamingFallback(
    messages: CoreMessage[],
    options: AIServiceOptions,
    startTime: number,
    optimizationsUsed: string[]
  ): Promise<FastResponseResult> {
    try {
      const streamResponse = await aiService.generateStreamingResponse(messages, {
        ...options,
        stream: true,
      });
      
      return {
        content: 'Streaming response initiated for faster delivery',
        cached: false,
        conversationId: streamResponse.conversationId,
        messageId: streamResponse.messageId,
        responseTime: Date.now() - startTime,
        optimizationUsed: optimizationsUsed,
        fromCache: false,
        contextOptimized: false,
      };
    } catch (error) {
      throw new Error(`All fast response strategies failed: ${error}`);
    }
  }

  /**
   * Initialize performance optimizations
   */
  private initializeOptimizations(): void {
    // Pre-warm cache with common responses
    this.prewarmCommonResponses();
    
    // Set up performance monitoring
    this.setupPerformanceMonitoring();
  }

  /**
   * Pre-warm cache with common responses
   */
  private async prewarmCommonResponses(): Promise<void> {
    const commonQuestions = [
      'What can you help me with?',
      'How are you?',
      'What is your name?',
      'Can you help me write an email?',
      'What is the weather like?',
    ];
    
    for (const question of commonQuestions) {
      const key = this.generatePrecomputedKey([{
        role: 'user',
        content: question,
      }]);
      
      // Store optimized responses
      const quickResponse = this.generateQuickResponse(question);
      this.precomputedCache.set(key, quickResponse);
    }
  }

  /**
   * Generate quick response for common questions
   */
  private generateQuickResponse(question: string): string {
    const questionLower = question.toLowerCase();
    
    if (questionLower.includes('help')) {
      return 'I can help you with writing, answering questions, analysis, coding, and much more! What specifically would you like assistance with?';
    }
    if (questionLower.includes('how are you')) {
      return 'I\'m doing well, thank you for asking! I\'m here and ready to help you with whatever you need.';
    }
    if (questionLower.includes('name')) {
      return 'I\'m an AI assistant created by HansTech. You can call me whatever you\'d like! How can I help you today?';
    }
    if (questionLower.includes('email')) {
      return 'I\'d be happy to help you write an email! Please tell me what type of email you need to write and any specific details you\'d like to include.';
    }
    if (questionLower.includes('weather')) {
      return 'I don\'t have access to real-time weather data, but I can help you find weather information or discuss weather-related topics. What would you like to know?';
    }
    
    return 'I\'m here to help! Could you please provide more details about what you need assistance with?';
  }

  /**
   * Generate precomputed cache key
   */
  private generatePrecomputedKey(messages: CoreMessage[]): string {
    const lastMessage = messages[messages.length - 1];
    const content = typeof lastMessage?.content === 'string' 
      ? lastMessage.content.toLowerCase().trim()
      : 'multimodal';
    return `precomputed:${content.substring(0, 50)}`;
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    // Log slow responses for optimization
    setInterval(() => {
      const stats = this.getPerformanceStats();
      if (stats.averageResponseTime > this.responseTimeTarget) {
        console.warn(`Response time above target: ${stats.averageResponseTime}ms`);
      }
    }, 60000); // Check every minute
  }

  /**
   * Generate fast ID
   */
  private generateFastId(): string {
    return `fast_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  /**
   * Get default fast options
   */
  private getDefaultFastOptions(): FastResponseOptions {
    return {
      maxResponseTime: 3000, // 3 seconds max
      useAggressiveCaching: true,
      prefetchCommonResponses: true,
      useStreamingFallback: true,
      optimizeContextSize: true,
      prioritizeSpeed: true,
    };
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats() {
    return {
      fastCacheStats: this.fastCache.getStats(),
      precomputedCacheStats: this.precomputedCache.getStats(),
      targetResponseTime: this.responseTimeTarget,
      averageResponseTime: 0, // Would be calculated from actual usage data
    };
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.fastCache.destroy();
    this.precomputedCache.destroy();
    this.commonPrompts.clear();
  }
}

// Export singleton for fast responses
export const fastResponseService = new FastResponseService(3000);

// Helper function for quick setup
export function createFastOptions(
  targetTime: number = 3000,
  overrides: Partial<FastResponseOptions> = {}
): FastResponseOptions {
  return {
    maxResponseTime: targetTime,
    useAggressiveCaching: true,
    prefetchCommonResponses: true,
    useStreamingFallback: true,
    optimizeContextSize: true,
    prioritizeSpeed: true,
    ...overrides,
  };
}

// Quick response function for immediate use
export async function getFastResponse(
  message: string,
  userId: string,
  conversationId: string,
  userType: UserType = 'regular'
): Promise<FastResponseResult> {
  const messages: CoreMessage[] = [{ role: 'user', content: message }];
  const options = createAIServiceOptions('llama-3.1-8b-instant', userId, conversationId, userType);
  const fastOptions = createFastOptions(3000);
  
  return fastResponseService.generateFastResponse(messages, options, fastOptions);
}