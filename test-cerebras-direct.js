// Direct test of Cerebras AI provider
import { cerebras } from '@ai-sdk/cerebras';
import { generateText, streamText } from 'ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testCerebrasDirectly() {
  console.log('🧠 Direct Cerebras AI Test');
  console.log('==========================');

  const apiKey = process.env.CEREBRAS_API_KEY;
  console.log(`API Key: ${apiKey ? `${apiKey.substring(0, 12)}...` : '❌ Not set'}`);

  if (!apiKey) {
    console.log('❌ CEREBRAS_API_KEY not found in environment variables');
    return;
  }

  // Test available models
  const modelsToTest = [
    'llama3.1-8b'
  ];

  for (const modelName of modelsToTest) {
    console.log(`\n➡️ Testing ${modelName}...`);
    
    try {
      // Test with generateText (simple completion)
      console.log('   🔄 Testing generateText...');
      console.log('   📡 Making API call...');
      
      const startTime = Date.now();
      const { text, usage } = await generateText({
        model: cerebras(modelName),
        prompt: 'Say "Hello from Cerebras!" and nothing else.',
        maxTokens: 50,
      });
      const endTime = Date.now();

      console.log(`   ✅ Success: "${text.trim()}"`);
      console.log(`   ⏱️ Time: ${endTime - startTime}ms`);
      if (usage) {
        console.log(`   📊 Tokens: ${usage.totalTokens || 'N/A'}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      console.log(`   📝 Status: ${error.status || 'N/A'}`);
      console.log(`   🔍 Code: ${error.code || 'N/A'}`);
      console.log(`   🔍 Stack: ${error.stack}`);
      
      // Check for specific error types
      if (error.message?.includes('model')) {
        console.log('   💡 Model may not exist or be available');
      } else if (error.message?.includes('auth')) {
        console.log('   💡 Authentication issue detected');
      } else if (error.message?.includes('quota')) {
        console.log('   💡 Rate limit or quota exceeded');
      } else if (error.message?.includes('timeout')) {
        console.log('   💡 Request timeout - try again');
      }
      
      if (error.response?.data) {
        console.log(`   📄 Response: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
  }

  console.log('\n🔧 Troubleshooting Tips:');
  console.log('========================');
  console.log('1. Verify API key is correct and active');
  console.log('2. Check Cerebras platform status: https://platform.cerebras.ai/');
  console.log('3. Ensure you have sufficient credits/quota');
  console.log('4. Try with a simpler model first (llama3.1-8b)');
  console.log('5. Check your account status at https://platform.cerebras.ai/');
}

// Add more error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  process.exit(1);
});

// Run the test
console.log('🚀 Starting test...');
testCerebrasDirectly()
  .then(() => {
    console.log('✅ Test completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
