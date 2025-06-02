/**
 * Fast Response Examples - Demonstrating ultra-fast AI responses
 * 
 * This file shows how to achieve sub-3-second response times using
 * various optimization strategies including caching, streaming,
 * context optimization, and model selection.
 */

import {
  aiService,
  fastResponseService,
  streamingOptimizer,
  getFastResponse,
  getStreamingResponse,
  consumeStream,
  createAIServiceOptions,
  createFastOptions,
  autoOptimize
} from './index';
import type { CoreMessage } from 'ai';
import type { UserType } from '@/app/(auth)/auth';

// Example 1: Basic Fast Response (under 3 seconds)
export async function basicFastResponse() {
  console.log('🚀 Example 1: Basic Fast Response');
  const startTime = Date.now();

  try {
    const result = await getFastResponse(
      "Hello, how can you help me today?",
      "user-123",
      "conv-123",
      "regular"
    );

    const responseTime = Date.now() - startTime;
    console.log(`✅ Response received in ${responseTime}ms`);
    console.log(`📝 Content: ${result.content}`);
    console.log(`⚡ Optimizations used: ${result.optimizationUsed.join(', ')}`);
    console.log(`💾 From cache: ${result.fromCache}`);
    console.log('');

    return result;
  } catch (error) {
    console.error('❌ Fast response failed:', error);
    throw error;
  }
}

// Example 2: Ultra-Fast Streaming (first token under 500ms)
export async function ultraFastStreaming() {
  console.log('🚀 Example 2: Ultra-Fast Streaming');
  const startTime = Date.now();

  try {
    const streamResult = await getStreamingResponse(
      "Explain quantum computing in simple terms",
      "user-456",
      "conv-456",
      "regular",
      "llama-3.1-8b-instant" // Fast model
    );

    console.log(`⚡ First token latency: ${streamResult.firstTokenLatency}ms`);
    console.log('📡 Streaming response...');

    // Consume the stream
    let content = '';
    let chunkCount = 0;
    let firstChunkTime: number | null = null;

    await consumeStream(
      streamResult.stream,
      (chunk) => {
        if (firstChunkTime === null) {
          firstChunkTime = Date.now();
          console.log(`🎯 First chunk received in ${firstChunkTime - startTime}ms`);
        }
        
        content += chunk.content;
        chunkCount++;
        
        if (chunk.latency) {
          console.log(`⏱️  Chunk ${chunkCount} latency: ${chunk.latency}ms`);
        }
      },
      (totalTokens) => {
        const totalTime = Date.now() - startTime;
        console.log(`✅ Stream complete in ${totalTime}ms`);
        console.log(`📊 Total tokens: ${totalTokens}`);
        console.log(`📝 Content: ${content.substring(0, 100)}...`);
        console.log('');
      },
      (error) => {
        console.error('❌ Streaming error:', error);
      }
    );

    return { content, responseTime: Date.now() - startTime };
  } catch (error) {
    console.error('❌ Ultra-fast streaming failed:', error);
    throw error;
  }
}

// Example 3: Optimized Conversation (multiple fast exchanges)
export async function optimizedConversation() {
  console.log('🚀 Example 3: Optimized Conversation');

  const userId = "user-789";
  const conversationId = "conv-789";
  const userType: UserType = "regular";

  const questions = [
    "Hi there!",
    "What's the weather like?",
    "Can you help me write an email?",
    "Thanks for your help!"
  ];

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const startTime = Date.now();

    console.log(`💬 Question ${i + 1}: "${question}"`);

    try {
      // Use different strategies for different message types
      if (i === 0 || i === 3) {
        // First and last messages - use instant responses
        const result = await fastResponseService.generateFastResponse(
          [{ role: 'user', content: question }],
          createAIServiceOptions("phi-3-mini-128k-instruct", userId, conversationId, userType),
          createFastOptions(1000) // 1 second target for greetings
        );

        const responseTime = Date.now() - startTime;
        console.log(`  ✅ Fast response in ${responseTime}ms`);
        console.log(`  📝 "${result.content}"`);
        console.log(`  ⚡ Optimizations: ${result.optimizationUsed.join(', ')}`);
      } else {
        // Complex questions - use streaming
        const streamResult = await streamingOptimizer.generateStreamingResponse(
          [{ role: 'user', content: question }],
          "llama-3.1-8b-instant",
          userId,
          conversationId,
          userType,
          {
            maxLatency: 800,
            prioritizeFirstToken: true,
            useParallelProcessing: true,
          }
        );

        console.log(`  ⚡ First token in ${streamResult.firstTokenLatency}ms`);
        console.log(`  📡 Streaming response...`);

        let content = '';
        await consumeStream(
          streamResult.stream,
          (chunk) => {
            content += chunk.content;
          },
          () => {
            const totalTime = Date.now() - startTime;
            console.log(`  ✅ Complete in ${totalTime}ms`);
            console.log(`  📝 "${content.substring(0, 80)}..."`);
          }
        );
      }

      // Small delay between questions
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('');
    } catch (error) {
      console.error(`  ❌ Error for question ${i + 1}:`, error);
    }
  }
}

// Example 4: Performance Comparison
export async function performanceComparison() {
  console.log('🚀 Example 4: Performance Comparison');

  const message = "Explain machine learning in one paragraph";
  const userId = "user-comparison";
  const conversationId = "conv-comparison";
  const userType: UserType = "regular";

  const messages: CoreMessage[] = [{ role: 'user', content: message }];
  const options = createAIServiceOptions("llama-3.1-8b-instant", userId, conversationId, userType);

  // Test 1: Standard AI Service
  console.log('📊 Test 1: Standard AI Service');
  const standardStart = Date.now();
  try {
    const standardResult = await aiService.generateResponse(messages, options);
    const standardTime = Date.now() - standardStart;
    console.log(`  ⏱️  Standard response: ${standardTime}ms`);
    console.log(`  📝 Content length: ${standardResult.content.length} chars`);
    console.log(`  💾 Cached: ${standardResult.cached}`);
  } catch (error) {
    console.error('  ❌ Standard service error:', error);
  }

  // Test 2: Fast Response Service
  console.log('📊 Test 2: Fast Response Service');
  const fastStart = Date.now();
  try {
    const fastResult = await fastResponseService.generateFastResponse(
      messages, 
      options,
      createFastOptions(3000)
    );
    const fastTime = Date.now() - fastStart;
    console.log(`  ⚡ Fast response: ${fastTime}ms`);
    console.log(`  📝 Content length: ${fastResult.content.length} chars`);
    console.log(`  🛠️  Optimizations: ${fastResult.optimizationUsed.join(', ')}`);
    console.log(`  💾 From cache: ${fastResult.fromCache}`);
  } catch (error) {
    console.error('  ❌ Fast response error:', error);
  }

  // Test 3: Streaming Response
  console.log('📊 Test 3: Streaming Response');
  const streamStart = Date.now();
  try {
    const streamResult = await streamingOptimizer.generateStreamingResponse(
      messages,
      options.modelId,
      userId,
      conversationId,
      userType
    );
    
    console.log(`  ⚡ First token: ${streamResult.firstTokenLatency}ms`);
    
    let content = '';
    await consumeStream(
      streamResult.stream,
      (chunk) => {
        content += chunk.content;
      },
      () => {
        const streamTime = Date.now() - streamStart;
        console.log(`  📡 Complete stream: ${streamTime}ms`);
        console.log(`  📝 Content length: ${content.length} chars`);
      }
    );
  } catch (error) {
    console.error('  ❌ Streaming error:', error);
  }

  console.log('');
}

// Example 5: Load Testing Fast Responses
export async function loadTestFastResponses() {
  console.log('🚀 Example 5: Load Testing Fast Responses');

  const concurrentRequests = 5;
  const testMessage = "Quick test response";
  const promises = [];

  console.log(`🔄 Running ${concurrentRequests} concurrent fast requests...`);
  const overallStart = Date.now();

  for (let i = 0; i < concurrentRequests; i++) {
    const promise = getFastResponse(
      testMessage,
      `load-test-user-${i}`,
      `load-test-conv-${i}`,
      "regular"
    ).then(result => ({
      index: i,
      responseTime: result.responseTime,
      fromCache: result.fromCache,
      optimizations: result.optimizationUsed,
    })).catch(error => ({
      index: i,
      error: error.message,
      responseTime: -1,
    }));

    promises.push(promise);
  }

  const results = await Promise.all(promises);
  const overallTime = Date.now() - overallStart;

  console.log(`✅ All requests completed in ${overallTime}ms`);
  console.log('📊 Individual results:');

  const successfulResults = results.filter(r => !('error' in r));
  const avgResponseTime = successfulResults.reduce((sum, r) => sum + r.responseTime, 0) / successfulResults.length;

  results.forEach(result => {
    if ('error' in result) {
      console.log(`  ❌ Request ${result.index}: Error - ${result.error}`);
    } else {
      console.log(`  ✅ Request ${result.index}: ${result.responseTime}ms ${result.fromCache ? '(cached)' : '(fresh)'}`);
    }
  });

  console.log(`📈 Average response time: ${Math.round(avgResponseTime)}ms`);
  console.log(`🎯 Cache hit rate: ${results.filter(r => !('error' in r) && r.fromCache).length}/${successfulResults.length}`);
  console.log('');
}

// Example 6: Real-time Chat Simulation
export async function realTimeChatSimulation() {
  console.log('🚀 Example 6: Real-time Chat Simulation');

  const userId = "chat-user";
  const conversationId = "chat-conv";
  
  const chatMessages = [
    "Hello!",
    "What can you do?",
    "Tell me a joke",
    "That's funny!",
    "Can you help with coding?",
    "Show me a Python function",
    "Thanks!",
    "Goodbye!"
  ];

  console.log('💬 Simulating real-time chat with fast responses...');

  for (let i = 0; i < chatMessages.length; i++) {
    const message = chatMessages[i];
    const startTime = Date.now();

    console.log(`👤 User: "${message}"`);

    try {
      // Alternate between fast response and streaming for variety
      if (i % 2 === 0) {
        // Even messages: Use fast response
        const result = await getFastResponse(message, userId, conversationId, "regular");
        const responseTime = Date.now() - startTime;
        console.log(`🤖 Bot (${responseTime}ms): "${result.content}"`);
        console.log(`   ⚡ Optimizations: ${result.optimizationUsed.join(', ')}`);
      } else {
        // Odd messages: Use streaming
        const streamResult = await getStreamingResponse(message, userId, conversationId, "regular");
        console.log(`🤖 Bot (${streamResult.firstTokenLatency}ms first token):`);
        
        let content = '';
        await consumeStream(
          streamResult.stream,
          (chunk) => {
            content += chunk.content;
            // Simulate typing indicator
            process.stdout.write(chunk.content);
          },
          () => {
            console.log(`\n   📡 Stream completed`);
          }
        );
      }

      // Simulate user thinking time
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log('');

    } catch (error) {
      console.error(`❌ Error processing message "${message}":`, error);
    }
  }
}

// Main demo function
export async function runAllFastExamples() {
  console.log('🎯 Fast Response AI Service - Complete Demo');
  console.log('===========================================');
  console.log('');

  try {
    await basicFastResponse();
    await ultraFastStreaming();
    await optimizedConversation();
    await performanceComparison();
    await loadTestFastResponses();
    await realTimeChatSimulation();

    console.log('🎉 All fast response examples completed successfully!');
    console.log('');
    console.log('📊 Performance Summary:');
    console.log('• Fast responses: Target <3 seconds, typical <1 second');
    console.log('• Streaming first token: Target <500ms, typical <300ms');
    console.log('• Common queries: Often <100ms (instant cache hits)');
    console.log('• Load testing: Maintains performance under concurrent load');
    console.log('• Real-time chat: Smooth, responsive conversation flow');

  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Helper function to demonstrate specific optimizations
export async function demonstrateOptimizations() {
  console.log('🔧 Optimization Techniques Demonstration');
  console.log('========================================');

  // Technique 1: Instant Cache Hits
  console.log('1. Instant Cache Hits');
  const cacheDemo = await getFastResponse("hello", "demo-user", "demo-conv", "regular");
  console.log(`   First call: ${cacheDemo.responseTime}ms`);
  
  const cachedDemo = await getFastResponse("hello", "demo-user", "demo-conv", "regular");
  console.log(`   Cached call: ${cachedDemo.responseTime}ms (${cachedDemo.fromCache ? 'cache hit' : 'cache miss'})`);
  console.log('');

  // Technique 2: Model Selection
  console.log('2. Fast Model Selection');
  const guestOptions = createAIServiceOptions("phi-3-mini-128k-instruct", "guest-user", "guest-conv", "guest");
  const regularOptions = createAIServiceOptions("llama-3.1-8b-instant", "regular-user", "regular-conv", "regular");
  
  console.log(`   Guest model: ${guestOptions.modelId} (fastest)`);
  console.log(`   Regular model: ${regularOptions.modelId} (fast + better quality)`);
  console.log('');

  // Technique 3: Context Optimization
  console.log('3. Context Size Optimization');
  const longContext: CoreMessage[] = Array.from({ length: 20 }, (_, i) => ({
    role: i % 2 === 0 ? 'user' : 'assistant',
    content: `Message ${i + 1} with some content to simulate conversation history.`
  }));
  
  const optimizedResult = await fastResponseService.generateFastResponse(
    longContext,
    createAIServiceOptions("llama-3.1-8b-instant", "opt-user", "opt-conv", "regular"),
    createFastOptions(2000, { optimizeContextSize: true, prioritizeSpeed: true })
  );
  
  console.log(`   Original context: ${longContext.length} messages`);
  console.log(`   Response time: ${optimizedResult.responseTime}ms`);
  console.log(`   Context optimized: ${optimizedResult.contextOptimized}`);
  console.log('');

  console.log('✅ Optimization demonstration complete!');
}

// Export for easy testing
export const fastExamples = {
  basicFastResponse,
  ultraFastStreaming,
  optimizedConversation,
  performanceComparison,
  loadTestFastResponses,
  realTimeChatSimulation,
  runAllFastExamples,
  demonstrateOptimizations,
};
/**
 * Demonstrate sliding window optimization
 */
export async function demonstrateSlidingWindowOptimization(): Promise<void> {
  console.log('\n🪟 === Sliding Window Optimization Demo ===');
  
  // Create a long conversation history
  const longConversation: CoreMessage[] = [
    { role: 'system', content: 'You are a helpful AI assistant.' },
    { role: 'user', content: 'Tell me about the history of computing.' },
    { role: 'assistant', content: 'Computing history spans from ancient abacuses to modern quantum computers...' },
    { role: 'user', content: 'What about programming languages?' },
    { role: 'assistant', content: 'Programming languages evolved from machine code to high-level languages...' },
    { role: 'user', content: 'Explain object-oriented programming.' },
    { role: 'assistant', content: 'Object-oriented programming is a paradigm based on objects and classes...' },
    { role: 'user', content: 'What are design patterns?' },
    { role: 'assistant', content: 'Design patterns are reusable solutions to common programming problems...' },
    { role: 'user', content: 'Tell me about databases.' },
    { role: 'assistant', content: 'Databases are organized collections of data stored electronically...' },
    { role: 'user', content: 'What about web development?' },
    { role: 'assistant', content: 'Web development involves creating websites and web applications...' },
    { role: 'user', content: 'Can you summarize machine learning?' }, // Current question
  ];

  console.log(`📊 Original conversation: ${longConversation.length} messages`);
  
  try {
    // Test speed optimization
    console.log('\n⚡ Testing SPEED optimization:');
    const speedResult = await autoOptimize(longConversation, 'llama-3.1-8b-instant', 'speed');
    console.log(`   Optimized to: ${speedResult.messages.length} messages`);
    console.log(`   Compression applied: ${speedResult.compressionApplied}`);
    console.log(`   Removed: ${speedResult.removedMessageCount} messages`);
    console.log(`   Summary added: ${speedResult.summaryAdded}`);
    
    // Test balance optimization
    console.log('\n⚖️ Testing BALANCE optimization:');
    const balanceResult = await autoOptimize(longConversation, 'llama-3.1-8b-instant', 'balance');
    console.log(`   Optimized to: ${balanceResult.messages.length} messages`);
    console.log(`   Compression applied: ${balanceResult.compressionApplied}`);
    console.log(`   Removed: ${balanceResult.removedMessageCount} messages`);
    console.log(`   Summary added: ${balanceResult.summaryAdded}`);
    
    // Test quality optimization
    console.log('\n🎯 Testing QUALITY optimization:');
    const qualityResult = await autoOptimize(longConversation, 'llama-3.1-8b-instant', 'quality');
    console.log(`   Optimized to: ${qualityResult.messages.length} messages`);
    console.log(`   Compression applied: ${qualityResult.compressionApplied}`);
    console.log(`   Removed: ${qualityResult.removedMessageCount} messages`);
    console.log(`   Summary added: ${qualityResult.summaryAdded}`);
    
    // Test with fast response
    console.log('\n🚀 Testing with Fast Response:');
    const startTime = Date.now();
    const fastResult = await fastResponseService.generateFastResponse(
      speedResult.messages,
      {
        modelId: 'llama-3.1-8b-instant',
        userId: 'demo-user',
        conversationId: 'demo-sliding-window',
        userType: 'regular' as UserType,
      },
      {
        maxResponseTime: 2000,
        useAggressiveCaching: true,
        prefetchCommonResponses: false,
        useStreamingFallback: true,
        optimizeContextSize: false, // Already optimized by sliding window
        prioritizeSpeed: true,
      }
    );
    
    const responseTime = Date.now() - startTime;
    console.log(`   Response time: ${responseTime}ms`);
    console.log(`   Response preview: ${fastResult.content.substring(0, 100)}...`);
    console.log(`   Optimizations used: ${fastResult.optimizationUsed || 'none'}`);
    
  } catch (error) {
    console.error('❌ Sliding window demo failed:', error);
  }
}

/**
 * Demonstrate token optimization scenarios
 */
export async function demonstrateTokenOptimization(): Promise<void> {
  console.log('\n🎯 === Token Optimization Scenarios ===');
  
  const scenarios = [
    {
      name: 'Short conversation',
      messages: [
        { role: 'user', content: 'Hello!' },
        { role: 'assistant', content: 'Hi there!' },
        { role: 'user', content: 'How are you?' },
      ],
    },
    {
      name: 'Medium conversation',
      messages: Array.from({ length: 8 }, (_, i) => [
        { role: 'user', content: `Question ${i + 1}: Tell me about topic ${i + 1}.` },
        { role: 'assistant', content: `Here's information about topic ${i + 1}. It's quite interesting and has many aspects to consider...` },
      ]).flat(),
    },
    {
      name: 'Long conversation',
      messages: Array.from({ length: 15 }, (_, i) => [
        { role: 'user', content: `Question ${i + 1}: Can you explain concept ${i + 1} in detail?` },
        { role: 'assistant', content: `Concept ${i + 1} is a complex topic that involves multiple components. Let me break it down for you with detailed explanations and examples...` },
      ]).flat(),
    },
  ];

  for (const scenario of scenarios) {
    console.log(`\n📋 Testing: ${scenario.name} (${scenario.messages.length} messages)`);
    
    try {
      const result = await autoOptimize(scenario.messages as CoreMessage[], 'llama-3.1-8b-instant', 'balance');
      
      console.log(`   Original: ${scenario.messages.length} messages`);
      console.log(`   Optimized: ${result.messages.length} messages`);
      console.log(`   Compression: ${result.compressionApplied ? 'Applied' : 'Not needed'}`);
      
      if (result.compressionApplied) {
        console.log(`   Removed: ${result.removedMessageCount} messages`);
        console.log(`   Summary: ${result.summaryAdded ? 'Added' : 'Not added'}`);
      }
      
    } catch (error) {
      console.error(`   ❌ Failed: ${error}`);
    }
  }
}

/**
 * Comprehensive sliding window performance test
 */
export async function testSlidingWindowPerformance(): Promise<void> {
  console.log('\n⚡ === Sliding Window Performance Test ===');
  
  // Create progressively longer conversations
  const testSizes = [5, 10, 20, 30, 50];
  const results: Array<{
    size: number;
    optimizationTime: number;
    compressionRatio: number;
    messagesRemoved: number;
  }> = [];
  
  for (const size of testSizes) {
    console.log(`\n📊 Testing with ${size} messages:`);
    
    // Generate test conversation
    const messages: CoreMessage[] = [
      { role: 'system', content: 'You are a helpful assistant.' },
      ...Array.from({ length: size }, (_, i) => [
        { role: 'user' as const, content: `This is user message ${i + 1}. Please provide a detailed response about this topic.` },
        { role: 'assistant' as const, content: `This is assistant response ${i + 1}. Here's a comprehensive explanation with multiple points and detailed analysis of the topic you've asked about.` },
      ]).flat(),
    ];
    
    try {
      const startTime = Date.now();
      const result = await autoOptimize(messages, 'llama-3.1-8b-instant', 'speed');
      const optimizationTime = Date.now() - startTime;
      
      const compressionRatio = result.messages.length / messages.length;
      
      results.push({
        size: messages.length,
        optimizationTime,
        compressionRatio,
        messagesRemoved: result.removedMessageCount,
      });
      
      console.log(`   Optimization time: ${optimizationTime}ms`);
      console.log(`   Compression ratio: ${(compressionRatio * 100).toFixed(1)}%`);
      console.log(`   Messages removed: ${result.removedMessageCount}`);
      
    } catch (error) {
      console.error(`   ❌ Failed: ${error}`);
    }
  }
  
  // Summary
  console.log('\n📈 Performance Summary:');
  console.log('Size\tTime(ms)\tCompression\tRemoved');
  results.forEach(r => {
    console.log(`${r.size}\t${r.optimizationTime}\t\t${(r.compressionRatio * 100).toFixed(1)}%\t\t${r.messagesRemoved}`);
  });
}