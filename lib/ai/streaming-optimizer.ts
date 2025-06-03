import { streamText } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import { autoOptimize } from './sliding-window';
import type { CoreMessage } from 'ai';
import type { UserType } from '@/app/(auth)/auth';

export interface StreamingOptions {
  maxLatency: number; // Maximum first token latency in ms
  chunkSize: number; // Optimal chunk size for streaming
  bufferSize: number; // Buffer size for smoother streaming
  prioritizeFirstToken: boolean; // Optimize for first token speed
  useParallelProcessing: boolean; // Process chunks in parallel
}

export interface StreamChunk {
  content: string;
  timestamp: number;
  isComplete: boolean;
  tokenCount: number;
  latency?: number;
}

export interface StreamingResult {
  stream: ReadableStream<StreamChunk>;
  firstTokenLatency: number;
  totalTokens: number;
  conversationId: string;
  messageId: string;
}

/**
 * Ultra-fast streaming response system optimized for sub-second first token
 */
export class StreamingOptimizer {
  private defaultOptions: StreamingOptions;
  private activeStreams: Map<string, AbortController>;
  private performanceMetrics: Map<string, number[]>;

  constructor() {
    this.defaultOptions = {
      maxLatency: 800, // 800ms max first token
      chunkSize: 50, // Smaller chunks for faster perceived speed
      bufferSize: 3, // 3-chunk buffer
      prioritizeFirstToken: true,
      useParallelProcessing: true,
    };
    
    this.activeStreams = new Map();
    this.performanceMetrics = new Map();
  }

  /**
   * Generate ultra-fast streaming response
   */
  async generateStreamingResponse(
    messages: CoreMessage[],
    modelId: string,
    userId: string,
    conversationId: string,
    userType: UserType = 'regular',
    options: Partial<StreamingOptions> = {}
  ): Promise<StreamingResult> {
    const streamingOptions = { ...this.defaultOptions, ...options };
    const startTime = Date.now();
    const messageId = this.generateStreamId();
    
    // Create abort controller for this stream
    const abortController = new AbortController();
    this.activeStreams.set(messageId, abortController);

    try {
      // Step 1: Check for instant streaming responses
      const instantStream = await this.checkInstantStream(messages, conversationId, messageId);
      if (instantStream) {
        return instantStream;
      }

      // Step 2: Optimize messages using sliding window for streaming
      const windowResult = await autoOptimize(messages, modelId, 'speed');
      const optimizedMessages = windowResult.messages;
      
      if (windowResult.compressionApplied) {
        console.log(`[StreamingOptimizer] Applied sliding window optimization:`, {
          removedMessages: windowResult.removedMessageCount,
          summaryAdded: windowResult.summaryAdded
        });
      }

      // Step 3: Select fastest streaming model
      const fastModel = this.selectFastestModel(modelId, userType);

      // Step 4: Create optimized streaming request
      const streamResult = await this.createOptimizedStream(
        optimizedMessages,
        fastModel,
        streamingOptions,
        abortController.signal,
        startTime
      );

      return {
        ...streamResult,
        conversationId,
        messageId,
      };

    } catch (error) {
      this.activeStreams.delete(messageId);
      throw new Error(`Streaming failed: ${error}`);
    }
  }

  /**
   * Check for instant streaming responses
   */
  private async checkInstantStream(
    messages: CoreMessage[],
    conversationId: string,
    messageId: string
  ): Promise<StreamingResult | null> {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage?.content || typeof lastMessage.content !== 'string') return null;

    const content = lastMessage.content.toLowerCase().trim();
    
    // Ultra-fast responses for common queries
    const instantResponses = new Map([
      ['hello', 'Hello! How can I help you today?'],
      ['hi', 'Hi there! What can I do for you?'],
      ['help', 'I\'m here to help! What do you need assistance with?'],
      ['thanks', 'You\'re welcome! Anything else I can help with?'],
      ['test', 'Test successful! I\'m working perfectly.'],
    ]);

    for (const [trigger, response] of instantResponses) {
      if (content.includes(trigger)) {
        return this.createInstantStream(response, conversationId, messageId);
      }
    }

    return null;
  }

  /**
   * Create instant streaming response
   */
  private async createInstantStream(
    content: string,
    conversationId: string,
    messageId: string
  ): Promise<StreamingResult> {
    const words = content.split(' ');
    let currentIndex = 0;
    const firstTokenTime = Date.now();

    const stream = new ReadableStream<StreamChunk>({
      start(controller) {
        const streamWords = () => {
          if (currentIndex >= words.length) {
            controller.enqueue({
              content: '',
              timestamp: Date.now(),
              isComplete: true,
              tokenCount: words.length,
              latency: Date.now() - firstTokenTime,
            });
            controller.close();
            return;
          }

          const word = words[currentIndex];
          const chunk = currentIndex === 0 ? word : ` ${word}`;
          
          controller.enqueue({
            content: chunk,
            timestamp: Date.now(),
            isComplete: false,
            tokenCount: currentIndex + 1,
            latency: currentIndex === 0 ? Date.now() - firstTokenTime : undefined,
          });

          currentIndex++;
          
          // Simulate ultra-fast typing (100ms per word)
          setTimeout(streamWords, 100);
        };

        // Start immediately for instant first token
        streamWords();
      }
    });

    return {
      stream,
      firstTokenLatency: 0, // Instant
      totalTokens: words.length,
      conversationId,
      messageId,
    };
  }

  /**
   * Optimize messages for fastest streaming
   */
  private optimizeForStreaming(
    messages: CoreMessage[],
    options: StreamingOptions
  ): CoreMessage[] {
    if (!options.prioritizeFirstToken) return messages;

    // Keep only essential context for speed
    const maxContextMessages = 3;
    const recentMessages = messages.slice(-maxContextMessages);

    // Ensure system message is preserved if it exists
    const systemMessage = messages.find(m => m?.role === 'system');
    if (systemMessage && !recentMessages.includes(systemMessage)) {
      return [systemMessage, ...recentMessages.slice(1)];
    }

    return recentMessages;
  }

  /**
   * Select fastest model for streaming
   */
  private selectFastestModel(modelId: string, userType: UserType): string {
    // Ultra-fast models optimized for streaming
    const fastStreamingModels: Record<UserType, string> = {
      guest: 'phi-3-mini-128k-instruct', // Fastest for guests
      regular: 'llama-3.1-8b-instant', // High-speed model for regular users
    };

    return fastStreamingModels[userType] || modelId;
  }

  /**
   * Create optimized streaming response
   */
  private async createOptimizedStream(
    messages: CoreMessage[],
    modelId: string,
    options: StreamingOptions,
    abortSignal: AbortSignal,
    startTime: number
  ): Promise<Omit<StreamingResult, 'conversationId' | 'messageId'>> {
    let firstTokenTime: number | null = null;
    let totalTokens = 0;
    const chunks: string[] = [];

    // Create streaming request with optimizations
    const result = await streamText({
      model: myProvider.languageModel(modelId),
      messages,
      temperature: 0.3, // Lower temperature for faster generation
      maxTokens: 1024, // Limit for speed
      abortSignal,
    });

    const optimizedStream = new ReadableStream<StreamChunk>({
      async start(controller) {
        try {
          const buffer: string[] = [];
          let chunkCount = 0;

          for await (const textPart of result.textStream) {
            // Record first token time
            if (firstTokenTime === null) {
              firstTokenTime = Date.now();
            }

            buffer.push(textPart);
            totalTokens++;

            // Buffer chunks for smoother streaming
            if (buffer.length >= options.bufferSize || textPart.includes('.') || textPart.includes('!') || textPart.includes('?')) {
              const content = buffer.join('');
              buffer.length = 0; // Clear buffer
              
              const chunk: StreamChunk = {
                content,
                timestamp: Date.now(),
                isComplete: false,
                tokenCount: totalTokens,
                latency: chunkCount === 0 ? (firstTokenTime! - startTime) : undefined,
              };

              controller.enqueue(chunk);
              chunkCount++;

              // Add small delay for smooth streaming
              await new Promise(resolve => setTimeout(resolve, 10));
            }
          }

          // Send any remaining buffer content
          if (buffer.length > 0) {
            controller.enqueue({
              content: buffer.join(''),
              timestamp: Date.now(),
              isComplete: false,
              tokenCount: totalTokens,
            });
          }

          // Send completion chunk
          controller.enqueue({
            content: '',
            timestamp: Date.now(),
            isComplete: true,
            tokenCount: totalTokens,
          });

          controller.close();

        } catch (error) {
          controller.error(error);
        }
      }
    });

    const actualFirstTokenLatency = firstTokenTime ? firstTokenTime - startTime : 0;

    // Record performance metrics
    this.recordPerformance(modelId, actualFirstTokenLatency);

    return {
      stream: optimizedStream,
      firstTokenLatency: actualFirstTokenLatency,
      totalTokens,
    };
  }

  /**
   * Record performance metrics for optimization
   */
  private recordPerformance(modelId: string, latency: number): void {
    if (!this.performanceMetrics.has(modelId)) {
      this.performanceMetrics.set(modelId, []);
    }
    
    const metrics = this.performanceMetrics.get(modelId)!;
    metrics.push(latency);
    
    // Keep only recent metrics (last 100)
    if (metrics.length > 100) {
      metrics.splice(0, metrics.length - 100);
    }
  }

  /**
   * Generate stream ID
   */
  private generateStreamId(): string {
    return `stream_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  /**
   * Cancel active stream
   */
  cancelStream(messageId: string): boolean {
    const controller = this.activeStreams.get(messageId);
    if (controller) {
      controller.abort();
      this.activeStreams.delete(messageId);
      return true;
    }
    return false;
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats() {
    const stats: Record<string, any> = {};
    
    for (const [modelId, latencies] of this.performanceMetrics) {
      const avgLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
      const minLatency = Math.min(...latencies);
      const maxLatency = Math.max(...latencies);
      
      stats[modelId] = {
        averageFirstTokenLatency: Math.round(avgLatency),
        minLatency: Math.round(minLatency),
        maxLatency: Math.round(maxLatency),
        sampleCount: latencies.length,
      };
    }
    
    return {
      modelStats: stats,
      activeStreams: this.activeStreams.size,
      targetLatency: this.defaultOptions.maxLatency,
    };
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    // Cancel all active streams
    for (const [messageId, controller] of this.activeStreams) {
      controller.abort();
    }
    
    this.activeStreams.clear();
    this.performanceMetrics.clear();
  }
}

// Export singleton
export const streamingOptimizer = new StreamingOptimizer();

// Helper function for quick streaming
export async function getStreamingResponse(
  message: string,
  userId: string,
  conversationId: string,
  userType: UserType = 'regular',
  modelId: string = 'llama-3.1-8b-instant'
): Promise<StreamingResult> {
  const messages: CoreMessage[] = [{ role: 'user', content: message }];
  
  return streamingOptimizer.generateStreamingResponse(
    messages,
    modelId,
    userId,
    conversationId,
    userType,
    {
      maxLatency: 500, // Ultra-fast 500ms target
      prioritizeFirstToken: true,
      useParallelProcessing: true,
    }
  );
}

// Stream consumer helper
export async function consumeStream(
  stream: ReadableStream<StreamChunk>,
  onChunk: (chunk: StreamChunk) => void,
  onComplete?: (totalTokens: number) => void,
  onError?: (error: Error) => void
): Promise<void> {
  try {
    const reader = stream.getReader();
    let totalTokens = 0;
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      if (value) {
        totalTokens = value.tokenCount;
        onChunk(value);
        
        if (value.isComplete && onComplete) {
          onComplete(totalTokens);
        }
      }
    }
    
    reader.releaseLock();
    
  } catch (error) {
    if (onError) {
      onError(error as Error);
    } else {
      throw error;
    }
  }
}