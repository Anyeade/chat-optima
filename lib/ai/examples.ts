/**
 * AI Service Examples
 * 
 * This file demonstrates how to use the comprehensive AI service
 * with caching, context management, and rate limiting.
 */

import { 
  aiService, 
  createAIServiceOptions, 
  contextManager, 
  enhancedRateLimiter,
  TTLCache,
  AsyncCache 
} from './index';
import type { CoreMessage } from 'ai';

// Example 1: Basic AI Chat with Caching
export async function basicChatExample() {
  console.log('🚀 Basic Chat Example');
  
  const options = createAIServiceOptions(
    'chat-model',      // Use the main chat model
    'user123',         // User ID
    'conversation456', // Conversation ID
    'regular'          // User type (regular user)
  );

  const messages: CoreMessage[] = [
    {
      role: 'user',
      content: 'Hello! Can you help me write a professional email?'
    }
  ];

  try {
    const response = await aiService.generateResponse(messages, options);
    
    console.log('Response:', response.content);
    console.log('Cached:', response.cached);
    console.log('Token usage:', response.usage);
    
    // Second request with same parameters should hit cache
    const cachedResponse = await aiService.generateResponse(messages, options);
    console.log('Second request cached:', cachedResponse.cached);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example 2: Streaming Chat
export async function streamingChatExample() {
  console.log('📡 Streaming Chat Example');
  
  const options = createAIServiceOptions(
    'chat-model',
    'user789',
    'stream-conv',
    'regular',
    { stream: true }
  );

  const messages: CoreMessage[] = [
    {
      role: 'user',
      content: 'Write a short story about a robot learning to paint.'
    }
  ];

  try {
    const streamResponse = await aiService.generateStreamingResponse(messages, options);
    
    console.log('Streaming response started');
    console.log('Stream:', streamResponse.stream);
    console.log('Message ID:', streamResponse.messageId);
    
    // In a real app, you would handle the stream here
    
  } catch (error) {
    console.error('Streaming error:', error);
  }
}

// Example 3: Context Management and Conversation History
export async function contextManagementExample() {
  console.log('🧠 Context Management Example');
  
  const conversationId = 'context-demo';
  const userId = 'user456';
  
  // Create conversation context
  const context = contextManager.createContext(conversationId, userId, 'chat-model');
  console.log('Created context:', context.id);
  
  // Simulate a multi-turn conversation
  const conversationTurns = [
    { role: 'user' as const, content: 'What is machine learning?' },
    { role: 'assistant' as const, content: 'Machine learning is a subset of artificial intelligence...' },
    { role: 'user' as const, content: 'Can you give me some examples?' },
    { role: 'assistant' as const, content: 'Sure! Here are some common examples...' },
    { role: 'user' as const, content: 'How do neural networks work?' },
  ];
  
  // Add messages to context
  conversationTurns.forEach((message, index) => {
    contextManager.addMessage(conversationId, message, `msg-${index}`);
  });
  
  // Get optimized messages for AI request
  const { messages, tokenCount, truncated } = 
    contextManager.getMessagesForRequest(conversationId, 'chat-model');
  
  console.log('Optimized messages count:', messages.length);
  console.log('Total tokens:', tokenCount);
  console.log('Was truncated:', truncated);
  
  // Get conversation context
  const updatedContext = contextManager.getContext(conversationId);
  console.log('Context summary:', updatedContext?.summary);
  console.log('Total messages:', updatedContext?.messages.length);
}

// Example 4: Rate Limiting
export async function rateLimitingExample() {
  console.log('🛡️ Rate Limiting Example');
  
  const userId = 'rate-test-user';
  const userType = 'regular';
  
  // Check initial status
  let status = enhancedRateLimiter.getStatus(userId, userType);
  console.log('Initial status:', {
    dailyUsed: status.dailyEntitlement.used,
    dailyRemaining: status.dailyEntitlement.remaining,
    limits: status.limits
  });
  
  // Make several requests to test rate limiting
  for (let i = 0; i < 5; i++) {
    const result = enhancedRateLimiter.checkRateLimit(userId, userType);
    
    if (result.allowed) {
      console.log(`Request ${i + 1}: Allowed`);
    } else {
      console.log(`Request ${i + 1}: Blocked - ${result.reason}`);
      if (result.resetTime) {
        console.log(`Reset time: ${new Date(result.resetTime)}`);
      }
    }
  }
  
  // Check updated status
  status = enhancedRateLimiter.getStatus(userId, userType);
  console.log('Updated status:', {
    dailyUsed: status.dailyEntitlement.used,
    perMinuteUsed: status.usage.perMinute,
    remaining: status.remaining
  });
}

// Example 5: Custom Caching Strategies
export async function customCachingExample() {
  console.log('💾 Custom Caching Example');
  
  // Create a custom cache for expensive operations
  const expensiveCache = new AsyncCache({
    defaultTTL: 300000, // 5 minutes
    maxSize: 100,
    cleanupInterval: 60000 // 1 minute
  });
  
  // Simulate an expensive operation
  const expensiveOperation = async (input: string) => {
    console.log('Performing expensive operation...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
    return `Processed: ${input.toUpperCase()}`;
  };
  
  // Use cache to avoid repeated expensive operations
  const input = 'hello world';
  
  console.time('First call (not cached)');
  const result1 = await expensiveCache.getOrSet(
    `expensive-${input}`, 
    () => expensiveOperation(input)
  );
  console.timeEnd('First call (not cached)');
  console.log('Result 1:', result1);
  
  console.time('Second call (cached)');
  const result2 = await expensiveCache.getOrSet(
    `expensive-${input}`, 
    () => expensiveOperation(input)
  );
  console.timeEnd('Second call (cached)');
  console.log('Result 2:', result2);
  
  // Clean up
  expensiveCache.destroy();
}

// Example 6: Error Handling and Recovery
export async function errorHandlingExample() {
  console.log('⚠️ Error Handling Example');
  
  const options = createAIServiceOptions(
    'invalid-model',  // Use invalid model to trigger error
    'user999',
    'error-test',
    'guest'          // Guest user with limited access
  );

  const messages: CoreMessage[] = [
    { role: 'user', content: 'This should fail gracefully' }
  ];

  try {
    await aiService.generateResponse(messages, options);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('Caught expected error:', errorMessage);
    
    if (errorMessage.includes('not available for user type')) {
      console.log('Model entitlement error - user needs upgrade');
    } else if (errorMessage.includes('Rate limit exceeded')) {
      console.log('Rate limit error - user should wait');
    } else {
      console.log('Other error - check model availability');
    }
  }
  
  // Try with a valid model for guest user
  const validOptions = createAIServiceOptions(
    'phi-3-mini-128k-instruct', // Available for guest users
    'user999',
    'error-test-2',
    'guest'
  );

  try {
    const response = await aiService.generateResponse(messages, validOptions);
    console.log('Success with valid model:', response.content.substring(0, 100) + '...');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('Unexpected error:', errorMessage);
  }
}

// Example 7: Cache Performance Monitoring
export async function cacheMonitoringExample() {
  console.log('📊 Cache Monitoring Example');
  
  // Get service statistics
  const stats = aiService.getStats();
  
  console.log('Response Cache Stats:', {
    size: stats.responseCache.size,
    maxSize: stats.responseCache.maxSize,
    totalAccesses: stats.responseCache.totalAccesses
  });
  
  console.log('Context Manager Stats:', stats.contextManager);
  
  // Create some cache activity for monitoring
  const cache = new TTLCache({ defaultTTL: 5000, maxSize: 10 });
  
  // Add some data
  for (let i = 0; i < 15; i++) {
    cache.set(`key-${i}`, `value-${i}`);
    if (i % 3 === 0) {
      cache.get(`key-${i}`); // Create some access activity
    }
  }
  
  const cacheStats = cache.getStats();
  console.log('Custom Cache Stats:', {
    size: cacheStats.size,
    maxSize: cacheStats.maxSize,
    expired: cacheStats.expired,
    totalAccesses: cacheStats.totalAccesses,
    averageAge: Math.round(cacheStats.averageAge / 1000) + 's'
  });
  
  // Cleanup
  cache.destroy();
}

// Run all examples
export async function runAllExamples() {
  console.log('🎯 Running All AI Service Examples\n');
  
  try {
    await basicChatExample();
    console.log('\n');
    
    await streamingChatExample();
    console.log('\n');
    
    await contextManagementExample();
    console.log('\n');
    
    await rateLimitingExample();
    console.log('\n');
    
    await customCachingExample();
    console.log('\n');
    
    await errorHandlingExample();
    console.log('\n');
    
    await cacheMonitoringExample();
    console.log('\n');
    
    console.log('✅ All examples completed successfully!');
    
  } catch (error) {
    console.error('❌ Example failed:', error);
  } finally {
    // Cleanup
    aiService.cleanup();
    console.log('🧹 Cleanup completed');
  }
}

// Export individual examples for selective testing
export const examples = {
  basicChat: basicChatExample,
  streaming: streamingChatExample,
  contextManagement: contextManagementExample,
  rateLimiting: rateLimitingExample,
  customCaching: customCachingExample,
  errorHandling: errorHandlingExample,
  monitoring: cacheMonitoringExample,
  runAll: runAllExamples
};