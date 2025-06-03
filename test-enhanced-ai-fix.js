/**
 * Test script to verify Enhanced AI optimization error fix
 * Tests that sliding window optimization properly handles edge cases
 */

const { autoOptimize } = require('./lib/ai/sliding-window.ts');

async function testEnhancedAIFix() {
  console.log('🧪 Testing Enhanced AI optimization error fix...\n');

  // Test case 1: Normal conversation
  console.log('Test 1: Normal conversation');
  try {
    const normalMessages = [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello, how are you?' },
      { role: 'assistant', content: 'I am doing well, thank you! How can I help you today?' },
      { role: 'user', content: 'Can you explain quantum computing?' }
    ];

    const result1 = await autoOptimize(normalMessages, 'gpt-4', 'balance');
    console.log('✓ Normal conversation result:', {
      hasMessages: !!result1.messages,
      isArray: Array.isArray(result1.messages),
      messagesLength: result1.messages?.length,
      tokenCount: result1.tokenCount,
      compressionApplied: result1.compressionApplied
    });
  } catch (error) {
    console.error('✗ Normal conversation failed:', error.message);
  }

  // Test case 2: Empty messages array
  console.log('\nTest 2: Empty messages array');
  try {
    const result2 = await autoOptimize([], 'gpt-4', 'balance');
    console.log('✓ Empty array result:', {
      hasMessages: !!result2.messages,
      isArray: Array.isArray(result2.messages),
      messagesLength: result2.messages?.length,
      tokenCount: result2.tokenCount,
      compressionApplied: result2.compressionApplied
    });
  } catch (error) {
    console.error('✗ Empty array failed:', error.message);
  }

  // Test case 3: Null/undefined input
  console.log('\nTest 3: Null/undefined input');
  try {
    const result3 = await autoOptimize(null, 'gpt-4', 'balance');
    console.log('✓ Null input result:', {
      hasMessages: !!result3.messages,
      isArray: Array.isArray(result3.messages),
      messagesLength: result3.messages?.length,
      tokenCount: result3.tokenCount,
      compressionApplied: result3.compressionApplied
    });
  } catch (error) {
    console.error('✗ Null input failed:', error.message);
  }

  // Test case 4: Invalid model ID
  console.log('\nTest 4: Invalid model ID');
  try {
    const invalidModelMessages = [
      { role: 'user', content: 'Test message' }
    ];
    const result4 = await autoOptimize(invalidModelMessages, 'invalid-model', 'balance');
    console.log('✓ Invalid model result:', {
      hasMessages: !!result4.messages,
      isArray: Array.isArray(result4.messages),
      messagesLength: result4.messages?.length,
      tokenCount: result4.tokenCount,
      compressionApplied: result4.compressionApplied
    });
  } catch (error) {
    console.error('✗ Invalid model failed:', error.message);
  }

  // Test case 5: Very long conversation requiring compression
  console.log('\nTest 5: Long conversation requiring compression');
  try {
    const longMessages = [];
    // Add system message
    longMessages.push({ role: 'system', content: 'You are a helpful assistant.' });
    
    // Add many messages to trigger compression
    for (let i = 0; i < 50; i++) {
      longMessages.push({ 
        role: 'user', 
        content: `This is user message number ${i}. It contains some content that might be important for the conversation context. Let's make it a bit longer to increase token count and trigger the sliding window optimization.` 
      });
      longMessages.push({ 
        role: 'assistant', 
        content: `This is assistant response number ${i}. I understand your message and I'm providing a detailed response that also contains multiple sentences to increase the token count and help test the optimization algorithm.` 
      });
    }

    const result5 = await autoOptimize(longMessages, 'gpt-4', 'balance');
    console.log('✓ Long conversation result:', {
      hasMessages: !!result5.messages,
      isArray: Array.isArray(result5.messages),
      originalLength: longMessages.length,
      optimizedLength: result5.messages?.length,
      tokenCount: result5.tokenCount,
      compressionApplied: result5.compressionApplied,
      removedMessageCount: result5.removedMessageCount,
      summaryAdded: result5.summaryAdded
    });
  } catch (error) {
    console.error('✗ Long conversation failed:', error.message);
  }

  console.log('\n🎉 Enhanced AI optimization tests completed!');
}

// Run tests
testEnhancedAIFix().catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
