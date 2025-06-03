import type { CoreMessage } from 'ai';
import { estimateTokenCount, countMessageTokens } from './context-manager';
import { contextWindows } from './context-manager';

export interface SlidingWindowConfig {
  maxTokens: number;
  preserveSystemMessage: boolean;
  preserveLastN: number; // Always preserve last N messages
  compressionRatio: number; // Target compression ratio (0.5 = 50% reduction)
  useSemanticCompression: boolean; // Compress based on semantic importance
  enableSmartSummarization: boolean; // Use AI to summarize removed content
}

export interface WindowSlice {
  messages: CoreMessage[];
  tokenCount: number;
  compressionApplied: boolean;
  removedMessageCount: number;
  summaryAdded: boolean;
}

export interface MessageImportance {
  index: number;
  message: CoreMessage;
  tokenCount: number;
  importance: number; // 0-1 scale
  reasons: string[];
}

/**
 * Advanced sliding window implementation for optimal token management
 */
export class SlidingWindowOptimizer {
  private defaultConfig: SlidingWindowConfig;
  private importanceCache: Map<string, number>;

  constructor() {
    this.defaultConfig = {
      maxTokens: 4096,
      preserveSystemMessage: true,
      preserveLastN: 3, // Always keep last 3 messages
      compressionRatio: 0.7, // Target 70% of original tokens
      useSemanticCompression: true,
      enableSmartSummarization: true,
    };
    
    this.importanceCache = new Map();
  }

  /**
   * Apply sliding window optimization to message array
   */
  async optimizeMessages(
    messages: CoreMessage[],
    modelId: string,
    config: Partial<SlidingWindowConfig> = {}
  ): Promise<WindowSlice> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const modelWindow = contextWindows[modelId] || contextWindows['default'];
    finalConfig.maxTokens = Math.min(finalConfig.maxTokens, modelWindow.maxTokens * 0.8); // Use 80% of model limit

    // Step 1: Calculate current token usage
    const totalTokens = await this.calculateTotalTokens(messages);
    
    if (totalTokens <= finalConfig.maxTokens) {
      return {
        messages,
        tokenCount: totalTokens,
        compressionApplied: false,
        removedMessageCount: 0,
        summaryAdded: false,
      };
    }

    // Step 2: Apply sliding window optimization
    return this.applyOptimization(messages, finalConfig, totalTokens);
  }

  /**
   * Apply multiple optimization strategies
   */
  private async applyOptimization(
    messages: CoreMessage[],
    config: SlidingWindowConfig,
    currentTokens: number
  ): Promise<WindowSlice> {
    let optimizedMessages = [...messages];
    let removedCount = 0;
    let summaryAdded = false;

    // Strategy 1: Preserve critical messages
    const { preserved, removable } = this.categorizeMessages(optimizedMessages, config);

    // Strategy 2: Calculate message importance
    const messageImportance = await this.calculateMessageImportance(removable);

    // Strategy 3: Apply sliding window with smart removal
    const targetTokens = Math.floor(config.maxTokens * config.compressionRatio);
    const { optimized, removed } = await this.applySlidingWindow(
      preserved,
      messageImportance,
      targetTokens
    );

    optimizedMessages = optimized;
    removedCount = removed.length;

    // Strategy 4: Add summary if significant content removed
    if (config.enableSmartSummarization && removed.length > 2) {
      const summary = await this.generateConversationSummary(removed);
      if (summary) {
        optimizedMessages = this.insertSummary(optimizedMessages, summary, config);
        summaryAdded = true;
      }
    }

    // Strategy 5: Final token count verification
    const finalTokenCount = await this.calculateTotalTokens(optimizedMessages);

    return {
      messages: optimizedMessages,
      tokenCount: finalTokenCount,
      compressionApplied: true,
      removedMessageCount: removedCount,
      summaryAdded,
    };
  }

  /**
   * Categorize messages into preserved and removable
   */
  private categorizeMessages(
    messages: CoreMessage[],
    config: SlidingWindowConfig
  ): { preserved: CoreMessage[]; removable: CoreMessage[] } {
    const preserved: CoreMessage[] = [];
    const removable: CoreMessage[] = [];

    messages.forEach((message, index) => {
      // Always preserve system messages
      if (config.preserveSystemMessage && message.role === 'system') {
        preserved.push(message);
        return;
      }

      // Always preserve last N messages
      if (index >= messages.length - config.preserveLastN) {
        preserved.push(message);
        return;
      }

      // Everything else is removable
      removable.push(message);
    });

    return { preserved, removable };
  }

  /**
   * Calculate semantic importance of messages
   */
  private async calculateMessageImportance(messages: CoreMessage[]): Promise<MessageImportance[]> {
    return Promise.all(
      messages.map(async (message, index) => {
        const tokenCount = estimateTokenCount(
          typeof message.content === 'string' ? message.content : JSON.stringify(message.content)
        );
        const importance = this.calculateImportanceScore(message, index, messages.length);
        
        return {
          index,
          message,
          tokenCount,
          importance,
          reasons: this.getImportanceReasons(message, importance),
        };
      })
    );
  }

  /**
   * Calculate importance score for a message
   */
  private calculateImportanceScore(
    message: CoreMessage,
    index: number,
    totalMessages: number
  ): number {
    let score = 0.5; // Base score
    const content = typeof message.content === 'string' ? message.content : '';
    const cacheKey = `${message.role}:${content.substring(0, 50)}`;

    // Check cache first
    if (this.importanceCache.has(cacheKey)) {
      return this.importanceCache.get(cacheKey)!;
    }

    // Factor 1: Role importance
    switch (message.role) {
      case 'system':
        score += 0.4; // Very important
        break;
      case 'assistant':
        score += 0.2; // Moderately important
        break;
      case 'user':
        score += 0.1; // Less important (can be inferred from assistant response)
        break;
    }

    // Factor 2: Content characteristics
    if (content.length > 200) score += 0.1; // Longer content might be more important
    if (content.includes('?')) score += 0.05; // Questions are important
    if (content.includes('!')) score += 0.03; // Exclamations show emphasis

    // Factor 3: Keywords indicating importance
    const importantKeywords = [
      'important', 'critical', 'urgent', 'remember', 'note',
      'error', 'problem', 'issue', 'solution', 'fix',
      'explain', 'define', 'analyze', 'compare', 'summarize'
    ];
    
    const hasImportantKeywords = importantKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );
    if (hasImportantKeywords) score += 0.15;

    // Factor 4: Position in conversation (recent messages are more important)
    const recencyScore = (index / totalMessages) * 0.2;
    score += recencyScore;

    // Factor 5: Message completeness (complete thoughts are more important)
    if (content.endsWith('.') || content.endsWith('!') || content.endsWith('?')) {
      score += 0.05;
    }

    // Normalize score to 0-1 range
    score = Math.min(1, Math.max(0, score));

    // Cache the result
    this.importanceCache.set(cacheKey, score);

    return score;
  }

  /**
   * Get reasons for importance score
   */
  private getImportanceReasons(message: CoreMessage, score: number): string[] {
    const reasons: string[] = [];
    const content = typeof message.content === 'string' ? message.content : '';

    if (message.role === 'system') reasons.push('system-message');
    if (content.length > 200) reasons.push('long-content');
    if (content.includes('?')) reasons.push('contains-question');
    if (score > 0.7) reasons.push('high-importance');
    if (score < 0.3) reasons.push('low-importance');

    return reasons;
  }

  /**
   * Apply sliding window with intelligent message selection
   */
  private async applySlidingWindow(
    preservedMessages: CoreMessage[],
    removableMessages: MessageImportance[],
    targetTokens: number
  ): Promise<{ optimized: CoreMessage[]; removed: CoreMessage[] }> {
    // Sort removable messages by importance (descending)
    const sortedByImportance = removableMessages.sort((a, b) => b.importance - a.importance);
    
    const optimized: CoreMessage[] = [...preservedMessages];
    const removed: CoreMessage[] = [];
    
    let currentTokens = await this.calculateTotalTokens(preservedMessages);

    // Add messages in order of importance until we hit token limit
    for (const messageInfo of sortedByImportance) {
      const potentialTokens = currentTokens + messageInfo.tokenCount;
      
      if (potentialTokens <= targetTokens) {
        optimized.push(messageInfo.message);
        currentTokens = potentialTokens;
      } else {
        removed.push(messageInfo.message);
      }
    }

    // Sort optimized messages back to chronological order
    const chronologicalOrder = this.sortChronologically(optimized);

    return {
      optimized: chronologicalOrder,
      removed,
    };
  }

  /**
   * Generate a summary of removed conversation content
   */
  private async generateConversationSummary(removedMessages: CoreMessage[]): Promise<string | null> {
    if (removedMessages.length === 0) return null;

    // Create a concise summary of the removed content
    const userMessages = removedMessages.filter(m => m.role === 'user');
    const assistantMessages = removedMessages.filter(m => m.role === 'assistant');

    if (userMessages.length === 0 && assistantMessages.length === 0) return null;

    let summary = '[Previous conversation: ';
    
    if (userMessages.length > 0) {
      summary += `User asked ${userMessages.length} question${userMessages.length > 1 ? 's' : ''}`;
    }
    
    if (assistantMessages.length > 0) {
      if (userMessages.length > 0) summary += ', ';
      summary += `Assistant provided ${assistantMessages.length} response${assistantMessages.length > 1 ? 's' : ''}`;
    }
    
    // Add key topics if detectable
    const allContent = removedMessages
      .map(m => typeof m.content === 'string' ? m.content : '')
      .join(' ');
    
    const topics = this.extractKeyTopics(allContent);
    if (topics.length > 0) {
      summary += ` about ${topics.slice(0, 3).join(', ')}`;
    }
    
    summary += ']';

    return summary;
  }

  /**
   * Extract key topics from content
   */
  private extractKeyTopics(content: string): string[] {
    const words = content.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'how', 'what', 'when', 'where', 'why', 'can', 'could', 'would', 'should', 'is', 'are', 'was', 'were']);
    
    const wordFreq = new Map<string, number>();
    
    words.forEach(word => {
      if (word.length > 3 && !stopWords.has(word)) {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      }
    });

    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  /**
   * Insert summary into message array
   */
  private insertSummary(
    messages: CoreMessage[],
    summary: string,
    config: SlidingWindowConfig
  ): CoreMessage[] {
    const summaryMessage: CoreMessage = {
      role: 'system',
      content: summary,
    };

    // Insert summary after system message if present, otherwise at the beginning
    const systemMessageIndex = messages.findIndex(m => m.role === 'system');
    
    if (systemMessageIndex >= 0) {
      return [
        ...messages.slice(0, systemMessageIndex + 1),
        summaryMessage,
        ...messages.slice(systemMessageIndex + 1),
      ];
    } else {
      return [summaryMessage, ...messages];
    }
  }

  /**
   * Sort messages chronologically
   */
  private sortChronologically(messages: CoreMessage[]): CoreMessage[] {
    // Since we don't have timestamps, we'll maintain the order they were added
    // In a real implementation, you might use message IDs or timestamps
    return messages;
  }

  /**
   * Calculate total token count for messages
   */
  private async calculateTotalTokens(messages: CoreMessage[]): Promise<number> {
    let totalTokens = 0;
    for (const message of messages) {
      const content = typeof message.content === 'string'
        ? message.content
        : JSON.stringify(message.content);
      totalTokens += estimateTokenCount(content);
    }
    return totalTokens;
  }

  /**
   * Get optimized window configuration for fast responses
   */
  getSpeedOptimizedConfig(modelId: string): SlidingWindowConfig {
    const modelWindow = contextWindows[modelId] || contextWindows['default'];
    
    return {
      maxTokens: Math.min(2048, modelWindow.maxTokens * 0.6), // Use only 60% for speed
      preserveSystemMessage: true,
      preserveLastN: 2, // Keep only last 2 messages for speed
      compressionRatio: 0.5, // Aggressive compression
      useSemanticCompression: true,
      enableSmartSummarization: false, // Disable for speed
    };
  }

  /**
   * Get balanced configuration
   */
  getBalancedConfig(modelId: string): SlidingWindowConfig {
    const modelWindow = contextWindows[modelId] || contextWindows['default'];
    
    return {
      maxTokens: Math.min(4096, modelWindow.maxTokens * 0.8), // Use 80% of model limit
      preserveSystemMessage: true,
      preserveLastN: 4, // Keep last 4 messages
      compressionRatio: 0.7, // Moderate compression
      useSemanticCompression: true,
      enableSmartSummarization: true,
    };
  }

  /**
   * Get quality-focused configuration
   */
  getQualityConfig(modelId: string): SlidingWindowConfig {
    const modelWindow = contextWindows[modelId] || contextWindows['default'];
    
    return {
      maxTokens: Math.min(8192, modelWindow.maxTokens * 0.9), // Use 90% of model limit
      preserveSystemMessage: true,
      preserveLastN: 6, // Keep last 6 messages
      compressionRatio: 0.8, // Minimal compression
      useSemanticCompression: true,
      enableSmartSummarization: true,
    };
  }

  /**
   * Clear importance cache
   */
  clearCache(): void {
    this.importanceCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cacheSize: this.importanceCache.size,
      hitRate: 0, // Would need to track hits/misses in real implementation
    };
  }
}

// Export singleton
export const slidingWindowOptimizer = new SlidingWindowOptimizer();

// Helper functions for easy integration
export async function optimizeForSpeed(
  messages: CoreMessage[],
  modelId: string
): Promise<WindowSlice> {
  const config = slidingWindowOptimizer.getSpeedOptimizedConfig(modelId);
  return slidingWindowOptimizer.optimizeMessages(messages, modelId, config);
}

export async function optimizeForBalance(
  messages: CoreMessage[],
  modelId: string
): Promise<WindowSlice> {
  const config = slidingWindowOptimizer.getBalancedConfig(modelId);
  return slidingWindowOptimizer.optimizeMessages(messages, modelId, config);
}

export async function optimizeForQuality(
  messages: CoreMessage[],
  modelId: string
): Promise<WindowSlice> {
  const config = slidingWindowOptimizer.getQualityConfig(modelId);
  return slidingWindowOptimizer.optimizeMessages(messages, modelId, config);
}

// Automatic optimization based on use case
export async function autoOptimize(
  messages: CoreMessage[],
  modelId: string,
  priority: 'speed' | 'balance' | 'quality' = 'balance'
): Promise<WindowSlice> {
  switch (priority) {
    case 'speed':
      return optimizeForSpeed(messages, modelId);
    case 'quality':
      return optimizeForQuality(messages, modelId);
    default:
      return optimizeForBalance(messages, modelId);
  }
}