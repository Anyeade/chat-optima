import { TTLCache, contextCache, rateLimitCache } from './cache';
import { RateLimiter } from './rate-limiter';
import type { CoreMessage } from 'ai';

export interface ConversationMessage {
  id: string;
  role: CoreMessage['role'];
  content: CoreMessage['content'];
  timestamp: number;
  tokenCount?: number;
  cached?: boolean;
}

export interface ConversationContext {
  id: string;
  userId: string;
  messages: ConversationMessage[];
  totalTokens: number;
  createdAt: number;
  updatedAt: number;
  summary?: string;
  modelId?: string;
}

export interface ContextWindow {
  maxTokens: number;
  reserveTokens: number; // Tokens to reserve for response
  warningThreshold: number; // When to start summarizing
}

export interface SummarizationStrategy {
  name: string;
  triggerTokenCount: number;
  targetTokenCount: number;
  preserveRecentMessages: number;
  summarizeOldMessages: boolean;
}

export interface TokenCountResult {
  prompt: number;
  completion?: number;
  total: number;
}

/**
 * Estimates token count for text (rough approximation)
 * More accurate token counting would require tiktoken or similar
 */
export function estimateTokenCount(text: string): number {
  // Safety check for undefined/null text
  if (!text || typeof text !== 'string') {
    return 0;
  }
  
  // Rough approximation: 1 token ≈ 4 characters for English text
  // This is a simplified approach - real implementations should use tiktoken
  return Math.ceil(text.length / 4);
}

/**
 * Count tokens in a message
 */
export function countMessageTokens(message: CoreMessage): number {
  let tokens = 0;
  
  // Safety check for undefined message
  if (!message || !message.content) {
    return 3; // Just return role overhead
  }
  
  if (typeof message.content === 'string') {
    tokens += estimateTokenCount(message.content);
  } else if (Array.isArray(message.content)) {
    for (const part of message.content) {
      if (part.type === 'text' && part.text) {
        tokens += estimateTokenCount(part.text);
      } else if (part.type === 'image') {
        // Rough estimate for image tokens (varies by model)
        tokens += 765; // Base image token cost for many vision models
      }
    }
  }
  
  // Add role overhead (rough estimate)
  tokens += 3;
  
  return tokens;
}

/**
 * Summarization strategies
 */
export const summarizationStrategies: Record<string, SummarizationStrategy> = {
  conservative: {
    name: 'Conservative',
    triggerTokenCount: 32000,
    targetTokenCount: 16000,
    preserveRecentMessages: 10,
    summarizeOldMessages: true,
  },
  aggressive: {
    name: 'Aggressive',
    triggerTokenCount: 24000,
    targetTokenCount: 8000,
    preserveRecentMessages: 6,
    summarizeOldMessages: true,
  },
  balanced: {
    name: 'Balanced',
    triggerTokenCount: 28000,
    targetTokenCount: 12000,
    preserveRecentMessages: 8,
    summarizeOldMessages: true,
  },
  minimal: {
    name: 'Minimal',
    triggerTokenCount: 20000,
    targetTokenCount: 4000,
    preserveRecentMessages: 4,
    summarizeOldMessages: true,
  },
};

/**
 * Context window configurations for different models
 */
export const contextWindows: Record<string, ContextWindow> = {
  'default': {
    maxTokens: 32000,
    reserveTokens: 4096,
    warningThreshold: 28000,
  },
  'chat-model': {
    maxTokens: 16000,
    reserveTokens: 2048,
    warningThreshold: 14000,
  },
  'chat-model-reasoning': {
    maxTokens: 32000,
    reserveTokens: 8192,
    warningThreshold: 24000,
  },
  // High context models
  'command-a-03-2025': {
    maxTokens: 128000,
    reserveTokens: 8192,
    warningThreshold: 120000,
  },
  'command-nightly': {
    maxTokens: 128000,
    reserveTokens: 8192,
    warningThreshold: 120000,
  },
  'command-r-plus-04-2024': {
    maxTokens: 128000,
    reserveTokens: 8192,
    warningThreshold: 120000,
  },
  'command-r-08-2024': {
    maxTokens: 128000,
    reserveTokens: 8192,
    warningThreshold: 120000,
  },
  'phi-3-medium-128k-instruct': {
    maxTokens: 128000,
    reserveTokens: 4096,
    warningThreshold: 124000,
  },
  'phi-3-mini-128k-instruct': {
    maxTokens: 128000,
    reserveTokens: 4096,
    warningThreshold: 124000,
  },
  // Llama models
  'meta-llama/llama-4-scout-17b-16e-instruct': {
    maxTokens: 32000,
    reserveTokens: 4096,
    warningThreshold: 28000,
  },
  'meta-llama/llama-3.3-70b-instruct': {
    maxTokens: 128000,
    reserveTokens: 8192,
    warningThreshold: 120000,
  },
  'meta-llama/llama-3.1-405b-instruct': {
    maxTokens: 128000,
    reserveTokens: 8192,
    warningThreshold: 120000,
  },
  'meta-llama/llama-3.1-70b-instruct': {
    maxTokens: 128000,
    reserveTokens: 8192,
    warningThreshold: 120000,
  },
  'meta-llama/llama-3.1-8b-instruct': {
    maxTokens: 128000,
    reserveTokens: 4096,
    warningThreshold: 124000,
  },
};

/**
 * Context Manager handles conversation history, token counting, and context window management
 */
export class ContextManager {
  private cache: TTLCache<ConversationContext>;
  private defaultStrategy: SummarizationStrategy;
  private rateLimiter: RateLimiter;

  constructor(
    cache: TTLCache<ConversationContext> = contextCache,
    defaultStrategy: SummarizationStrategy = summarizationStrategies.balanced
  ) {
    this.cache = cache;
    this.defaultStrategy = defaultStrategy;
    // Global rate limiter: 1 request per 10 seconds, 10 requests per minute
    this.rateLimiter = new RateLimiter(10, 60 * 1000); // 10 requests per minute
  }

  /**
   * Check rate limiting for user requests
   */
  checkRateLimit(userId: string): { allowed: boolean; reason?: string } {
    const userKey = `user:${userId}`;
    const perSecondKey = `${userKey}:second`;

    // Check per-second limit (1 request per 10 seconds)
    const lastSecondRequest = rateLimitCache.get(perSecondKey);
    if (lastSecondRequest && typeof lastSecondRequest === 'number' && Date.now() - lastSecondRequest < 10000) {
      return {
        allowed: false,
        reason: 'Rate limit exceeded: 1 request per 10 seconds'
      };
    }

    // Check per-minute limit using the rate limiter
    if (!this.rateLimiter.allowRequest()) {
      return {
        allowed: false,
        reason: 'Rate limit exceeded: 10 requests per minute'
      };
    }

    // Update rate limit tracking
    rateLimitCache.set(perSecondKey, Date.now(), 10000); // 10 second TTL
    
    return { allowed: true };
  }

  /**
   * Get conversation context by ID
   */
  getContext(conversationId: string): ConversationContext | null {
    return this.cache.get(conversationId);
  }

  /**
   * Create a new conversation context
   */
  createContext(
    conversationId: string, 
    userId: string, 
    modelId?: string
  ): ConversationContext {
    const context: ConversationContext = {
      id: conversationId,
      userId,
      messages: [],
      totalTokens: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      modelId,
    };

    this.cache.set(conversationId, context);
    return context;
  }

  /**
   * Add a message to the conversation context
   */
  addMessage(
    conversationId: string, 
    message: CoreMessage, 
    messageId: string
  ): ConversationContext {
    let context = this.getContext(conversationId);
    
    if (!context) {
      throw new Error(`Conversation context not found: ${conversationId}`);
    }

    const tokenCount = countMessageTokens(message);
    const conversationMessage: ConversationMessage = {
      ...message,
      id: messageId,
      timestamp: Date.now(),
      tokenCount,
    };

    context.messages.push(conversationMessage);
    context.totalTokens += tokenCount;
    context.updatedAt = Date.now();

    // Check if summarization is needed
    const modelId = context.modelId || 'default';
    const contextWindow = contextWindows[modelId] || contextWindows.default;
    
    if (context.totalTokens > contextWindow.warningThreshold) {
      context = this.summarizeContext(context, this.defaultStrategy);
    }

    this.cache.set(conversationId, context);
    return context;
  }

  /**
   * Get messages for AI request (with context window management)
   */
  getMessagesForRequest(
    conversationId: string,
    modelId?: string
  ): { messages: CoreMessage[]; tokenCount: number; truncated: boolean } {
    const context = this.getContext(conversationId);
    
    if (!context) {
      return { messages: [], tokenCount: 0, truncated: false };
    }

    const contextWindow = contextWindows[modelId || 'default'] || contextWindows.default;
    const maxTokens = contextWindow.maxTokens - contextWindow.reserveTokens;
    
    let tokenCount = 0;
    let truncated = false;
    const messages: CoreMessage[] = [];

    // Add summary if available
    if (context.summary) {
      const summaryMessage: CoreMessage = {
        role: 'system',
        content: `Previous conversation summary: ${context.summary}`,
      };
      const summaryTokens = countMessageTokens(summaryMessage);
      if (summaryTokens <= maxTokens) {
        messages.push(summaryMessage);
        tokenCount += summaryTokens;
      }
    }

    // Add messages from most recent, working backwards
    for (let i = context.messages.length - 1; i >= 0; i--) {
      const msg = context.messages[i];
      const coreMsg = {
        role: msg.role,
        content: msg.content,
      } as CoreMessage;
      const msgTokens = msg.tokenCount || countMessageTokens(coreMsg);
      
      if (tokenCount + msgTokens > maxTokens) {
        truncated = true;
        break;
      }
      
      messages.unshift(coreMsg);
      tokenCount += msgTokens;
    }

    return { messages, tokenCount, truncated };
  }

  /**
   * Summarize conversation context using NLP-style summarization
   */
  summarizeContext(
    context: ConversationContext, 
    strategy: SummarizationStrategy = this.defaultStrategy
  ): ConversationContext {
    if (context.messages.length <= strategy.preserveRecentMessages) {
      return context;
    }

    const recentMessages = context.messages.slice(-strategy.preserveRecentMessages);
    const oldMessages = context.messages.slice(0, -strategy.preserveRecentMessages);
    
    if (oldMessages.length === 0) {
      return context;
    }

    // Create a brief summary of old messages
    const summary = this.createConversationSummary(oldMessages, context.summary);
    
    // Calculate new token count
    const recentTokens = recentMessages.reduce(
      (sum, msg) => {
        const coreMsg = { role: msg.role, content: msg.content } as CoreMessage;
        return sum + (msg.tokenCount || countMessageTokens(coreMsg));
      },
      0
    );
    const summaryTokens = estimateTokenCount(summary);
    
    return {
      ...context,
      messages: recentMessages,
      totalTokens: recentTokens + summaryTokens,
      summary,
      updatedAt: Date.now(),
    };
  }

  /**
   * Create a brief summary of conversation messages
   */
  private createConversationSummary(
    messages: ConversationMessage[], 
    existingSummary?: string
  ): string {
    const topics: string[] = [];
    const userQuestions: string[] = [];
    const assistantResponses: string[] = [];

    for (const message of messages) {
      const content = typeof message.content === 'string'
        ? message.content
        : Array.isArray(message.content)
          ? message.content
              .filter(p => p.type === 'text')
              .map(p => (p as any).text)
              .filter(text => text)
              .join(' ')
          : '';

      if (message.role === 'user') {
        // Extract key questions/requests
        if (content.length > 20) {
          const truncated = content.length > 100 
            ? content.substring(0, 97) + '...'
            : content;
          userQuestions.push(truncated);
        }
      } else if (message.role === 'assistant') {
        // Extract key topics from assistant responses
        if (content.length > 30) {
          const firstSentence = content.split('.')[0];
          if (firstSentence.length > 20 && firstSentence.length < 150) {
            assistantResponses.push(firstSentence);
          }
        }
      }
    }

    let summary = '';
    
    if (existingSummary) {
      summary += `${existingSummary}\n\n`;
    }

    summary += `Conversation continued with ${messages.length} messages.`;
    
    if (userQuestions.length > 0) {
      summary += ` User discussed: ${userQuestions.slice(0, 3).join('; ')}.`;
    }
    
    if (assistantResponses.length > 0) {
      summary += ` Assistant covered: ${assistantResponses.slice(0, 2).join('; ')}.`;
    }

    return summary;
  }

  /**
   * Delete conversation context
   */
  deleteContext(conversationId: string): boolean {
    return this.cache.delete(conversationId);
  }

  /**
   * Get context statistics
   */
  getStats() {
    return {
      ...this.cache.getStats(),
      rateLimiter: {
        tokensPerInterval: this.rateLimiter['tokensPerInterval'],
        interval: this.rateLimiter['interval'],
        currentTokens: this.rateLimiter['tokenBucket'],
      },
    };
  }

  /**
   * Cleanup expired contexts
   */
  cleanup(): number {
    return this.cache.cleanup();
  }
}

// Export singleton instance
export const contextManager = new ContextManager();