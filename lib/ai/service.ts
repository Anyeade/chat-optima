import { generateObject, generateText, streamText } from 'ai';
import { myProvider } from './providers';
import { responseCache, TTLCache, AsyncCache } from './cache';
import { contextManager, type ConversationContext } from './context-manager';
import { enhancedRateLimiter } from './enhanced-rate-limiter';
import { entitlementsByUserType } from './entitlements';
import { fastResponseService, type FastResponseOptions, type FastResponseResult } from './fast-response';
import { streamingOptimizer, type StreamingOptions, type StreamingResult } from './streaming-optimizer';
import { slidingWindowOptimizer, autoOptimize } from './sliding-window';
import type { UserType } from '@/app/(auth)/auth';
import type { CoreMessage } from 'ai';
import type { ChatModel } from './models';

export interface AIServiceOptions {
  modelId: string;
  userId: string;
  conversationId: string;
  userType: UserType;
  useCache?: boolean;
  cacheTTL?: number;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  metadata?: Record<string, any>;
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cached?: boolean;
  conversationId: string;
  messageId: string;
}

export interface AIStreamResponse {
  stream: ReadableStream;
  conversationId: string;
  messageId: string;
}

/**
 * Comprehensive AI service with caching, context management, and rate limiting
 */
export class AIService {
  private responseCache: AsyncCache<any>;
  private modelCache: TTLCache<any>;

  constructor() {
    this.responseCache = responseCache;
    this.modelCache = new TTLCache({
      defaultTTL: 60 * 60 * 1000, // 1 hour for model metadata
      maxSize: 100,
    });
  }

  /**
   * Generate a text response with full context management
   */
  async generateResponse(
    messages: CoreMessage[],
    options: AIServiceOptions
  ): Promise<AIResponse> {
    // Check rate limits
    const rateLimitResult = enhancedRateLimiter.checkRateLimit(
      options.userId,
      options.userType
    );

    if (!rateLimitResult.allowed) {
      throw new Error(`Rate limit exceeded: ${rateLimitResult.reason}`);
    }

    // Check model entitlements
    this.checkModelEntitlements(options.modelId, options.userType);

    // Get or create conversation context
    let context = contextManager.getContext(options.conversationId);
    if (!context) {
      context = contextManager.createContext(
        options.conversationId,
        options.userId,
        options.modelId
      );
    }

    // Add user message to context
    const userMessage = messages[messages.length - 1];
    if (userMessage) {
      const messageId = this.generateMessageId();
      contextManager.addMessage(options.conversationId, userMessage, messageId);
    }

    // Get optimized messages for request
    const { messages: optimizedMessages, tokenCount, truncated } = 
      contextManager.getMessagesForRequest(options.conversationId, options.modelId);

    // Generate cache key
    const cacheKey = this.generateCacheKey({
      modelId: options.modelId,
      messages: optimizedMessages,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
    });

    // Try cache first if enabled
    if (options.useCache !== false) {
      const cached = this.responseCache.get(cacheKey);
      if (cached) {
        return {
          ...cached,
          cached: true,
          conversationId: options.conversationId,
          messageId: this.generateMessageId(),
        };
      }
    }

    // Generate response
    const result = await this.executeGeneration(optimizedMessages, options);

    // Add assistant response to context
    const assistantMessage: CoreMessage = {
      role: 'assistant',
      content: result.content,
    };
    const assistantMessageId = this.generateMessageId();
    contextManager.addMessage(
      options.conversationId, 
      assistantMessage, 
      assistantMessageId
    );

    // Cache response if enabled
    if (options.useCache !== false) {
      const cacheTTL = options.cacheTTL || 10 * 60 * 1000; // 10 minutes default
      this.responseCache.set(cacheKey, result, cacheTTL);
    }

    return {
      ...result,
      cached: false,
      conversationId: options.conversationId,
      messageId: assistantMessageId,
    };
  }

  /**
   * Generate a streaming response
   */
  async generateStreamingResponse(
    messages: CoreMessage[],
    options: AIServiceOptions
  ): Promise<AIStreamResponse> {
    // Check rate limits
    const rateLimitResult = enhancedRateLimiter.checkRateLimit(
      options.userId,
      options.userType
    );

    if (!rateLimitResult.allowed) {
      throw new Error(`Rate limit exceeded: ${rateLimitResult.reason}`);
    }

    // Check model entitlements
    this.checkModelEntitlements(options.modelId, options.userType);

    // Get or create conversation context
    let context = contextManager.getContext(options.conversationId);
    if (!context) {
      context = contextManager.createContext(
        options.conversationId,
        options.userId,
        options.modelId
      );
    }

    // Add user message to context
    const userMessage = messages[messages.length - 1];
    if (userMessage) {
      const messageId = this.generateMessageId();
      contextManager.addMessage(options.conversationId, userMessage, messageId);
    }

    // Get optimized messages for request
    const { messages: optimizedMessages } = 
      contextManager.getMessagesForRequest(options.conversationId, options.modelId);

    // Generate streaming response
    const result = await streamText({
      model: myProvider.languageModel(options.modelId),
      messages: optimizedMessages,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
    });

    const messageId = this.generateMessageId();

    return {
      stream: result.toTextStreamResponse().body!,
      conversationId: options.conversationId,
      messageId,
    };
  }

  /**
   * Generate ultra-fast response with sliding window optimization (target: under 3 seconds)
   */
  async generateFastResponse(
    messages: CoreMessage[],
    options: AIServiceOptions,
    fastOptions?: Partial<FastResponseOptions>
  ): Promise<FastResponseResult> {
    // Check rate limits first
    const rateLimitResult = enhancedRateLimiter.checkRateLimit(
      options.userId,
      options.userType
    );

    if (!rateLimitResult.allowed) {
      throw new Error(`Rate limit exceeded: ${rateLimitResult.reason}`);
    }

    // Check model entitlements
    this.checkModelEntitlements(options.modelId, options.userType);

    // Apply sliding window optimization before fast response
    const windowResult = await autoOptimize(messages, options.modelId, 'speed');
    
    // Update options with sliding window metadata
    const updatedOptions = {
      ...options,
      metadata: {
        ...options.metadata,
        slidingWindowApplied: windowResult.compressionApplied,
        removedMessages: windowResult.removedMessageCount,
        summaryAdded: windowResult.summaryAdded
      }
    };

    // Use fast response service with optimizations
    return fastResponseService.generateFastResponse(windowResult.messages, updatedOptions, {
      maxResponseTime: 3000, // 3 second target
      useAggressiveCaching: true,
      prefetchCommonResponses: true,
      useStreamingFallback: true,
      optimizeContextSize: true,
      prioritizeSpeed: true,
      ...fastOptions,
    });
  }

  /**
   * Generate ultra-fast streaming response (target: under 500ms first token)
   */
  async generateFastStreamingResponse(
    messages: CoreMessage[],
    options: AIServiceOptions,
    streamingOptions?: Partial<StreamingOptions>
  ): Promise<StreamingResult> {
    // Check rate limits first
    const rateLimitResult = enhancedRateLimiter.checkRateLimit(
      options.userId,
      options.userType
    );

    if (!rateLimitResult.allowed) {
      throw new Error(`Rate limit exceeded: ${rateLimitResult.reason}`);
    }

    // Check model entitlements
    this.checkModelEntitlements(options.modelId, options.userType);

    // Use streaming optimizer for ultra-fast first token
    return streamingOptimizer.generateStreamingResponse(
      messages,
      options.modelId,
      options.userId,
      options.conversationId,
      options.userType,
      {
        maxLatency: 500, // 500ms max first token
        chunkSize: 30, // Smaller chunks for faster perception
        bufferSize: 2, // Minimal buffering
        prioritizeFirstToken: true,
        useParallelProcessing: true,
        ...streamingOptions,
      }
    );
  }

  /**
   * Execute the actual AI generation
   */
  private async executeGeneration(
    messages: CoreMessage[],
    options: AIServiceOptions
  ): Promise<{ content: string; usage?: any }> {
    try {
      const result = await generateText({
        model: myProvider.languageModel(options.modelId),
        messages,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
      });

      return {
        content: result.text,
        usage: result.usage ? {
          promptTokens: result.usage.promptTokens,
          completionTokens: result.usage.completionTokens,
          totalTokens: result.usage.totalTokens,
        } : undefined,
      };
    } catch (error) {
      console.error('AI generation error:', error);
      throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if user has access to the specified model
   */
  private checkModelEntitlements(modelId: string, userType: UserType): void {
    const entitlements = entitlementsByUserType[userType];
    if (!entitlements.availableChatModelIds.includes(modelId as any)) {
      throw new Error(
        `Model ${modelId} is not available for user type ${userType}. ` +
        `Available models: ${entitlements.availableChatModelIds.join(', ')}`
      );
    }
  }

  /**
   * Generate a cache key for the request
   */
  private generateCacheKey(params: {
    modelId: string;
    messages: CoreMessage[];
    temperature?: number;
    maxTokens?: number;
  }): string {
    return TTLCache.generateKey({
      modelId: params.modelId,
      messagesHash: this.hashMessages(params.messages),
      temperature: params.temperature || 0.7,
      maxTokens: params.maxTokens || 2048,
    });
  }

  /**
   * Create a hash of messages for caching
   */
  private hashMessages(messages: CoreMessage[]): string {
    const messageStrings = messages.map(msg => {
      if (typeof msg.content === 'string') {
        return `${msg.role}:${msg.content}`;
      } else if (Array.isArray(msg.content)) {
        const contentParts = msg.content.map(part => {
          if (part.type === 'text') {
            return part.text;
          } else if (part.type === 'image') {
            return '[IMAGE]';
          }
          return '[CONTENT]';
        }).join('|');
        return `${msg.role}:${contentParts}`;
      }
      return `${msg.role}:${JSON.stringify(msg.content)}`;
    });

    return messageStrings.join('||');
  }

  /**
   * Generate a unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get conversation context
   */
  getConversationContext(conversationId: string): ConversationContext | null {
    return contextManager.getContext(conversationId);
  }

  /**
   * Delete conversation context
   */
  deleteConversation(conversationId: string): boolean {
    return contextManager.deleteContext(conversationId);
  }

  /**
   * Get user rate limit status
   */
  getUserStatus(userId: string, userType: UserType) {
    return enhancedRateLimiter.getStatus(userId, userType);
  }

  /**
   * Clear rate limits for a user (admin function)
   */
  clearUserRateLimits(userId: string): void {
    enhancedRateLimiter.clearUserLimits(userId);
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      responseCache: this.responseCache.getStats(),
      contextManager: contextManager.getStats(),
      rateLimiter: enhancedRateLimiter.getStatus('system', 'regular'),
    };
  }

  /**
   * Cleanup expired data
   */
  cleanup(): void {
    this.responseCache.cleanup();
    this.modelCache.cleanup();
    contextManager.cleanup();
    enhancedRateLimiter.cleanup();
  }
}

// Export singleton instance
export const aiService = new AIService();

// Export helper functions
export function createAIServiceOptions(
  modelId: string,
  userId: string,
  conversationId: string,
  userType: UserType = 'guest',
  overrides: Partial<AIServiceOptions> = {}
): AIServiceOptions {
  return {
    modelId,
    userId,
    conversationId,
    userType,
    useCache: true,
    temperature: 0.7,
    maxTokens: 2048,
    stream: false,
    ...overrides,
  };
}