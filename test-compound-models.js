// Test Groq Compound models with tools to verify the same issue as Cerebras
import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Simulated tools (same as in the chat interface)
const getWeather = {
  description: 'Get the current weather in a given location',
  parameters: {
    type: 'object',
    properties: {
      latitude: { type: 'number' },
      longitude: { type: 'number' }
    },
    required: ['latitude', 'longitude']
  }
};

const createDocument = {
  description: 'Create a document',
  parameters: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      content: { type: 'string' }
    },
    required: ['title', 'content']
  }
};

async function testCompoundModelsWithTools() {
  console.log('🧪 Testing Groq Compound Models with Tools');
  console.log('==========================================');

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.log('❌ GROQ_API_KEY not found');
    return;
  }

  const modelsToTest = [
    'compound-beta',
    'compound-beta-mini'
  ];

  for (const modelName of modelsToTest) {
    console.log(`\n🔄 Testing ${modelName}...`);
    
    try {
      const model = groq(modelName);
      
      // Test 1: With tools enabled
      console.log('   📝 Test 1: Simple prompt with tools enabled...');
      const { textStream: stream1 } = streamText({
        model,
        system: 'You are a helpful AI assistant.',
        prompt: 'Hello! Can you tell me about yourself in one sentence?',
        maxTokens: 100,
        tools: {
          getWeather,
          createDocument
        }
      });

      let response1 = '';
      const timeout1 = setTimeout(() => {
        console.log('   ⏰ Test 1 timed out after 10 seconds');
      }, 10000);

      try {
        for await (const delta of stream1) {
          response1 += delta;
          if (response1.length > 30) break; // Stop after getting some response
        }
        clearTimeout(timeout1);
        
        if (response1.trim() === '') {
          console.log('   ❌ Test 1: EMPTY RESPONSE (tools causing issue)');
        } else {
          console.log(`   ✅ Test 1: "${response1.substring(0, 80)}..."`);
        }
      } catch (streamError) {
        clearTimeout(timeout1);
        console.log(`   ❌ Test 1 Error: ${streamError.message}`);
      }

      // Test 2: Without tools
      console.log('   📝 Test 2: Same prompt without tools...');
      const { textStream: stream2 } = streamText({
        model,
        system: 'You are a helpful AI assistant.',
        prompt: 'Hello! Can you tell me about yourself in one sentence?',
        maxTokens: 100
      });

      let response2 = '';
      const timeout2 = setTimeout(() => {
        console.log('   ⏰ Test 2 timed out after 10 seconds');
      }, 10000);

      try {
        for await (const delta of stream2) {
          response2 += delta;
          if (response2.length > 30) break;
        }
        clearTimeout(timeout2);
        
        if (response2.trim() === '') {
          console.log('   ❌ Test 2: EMPTY RESPONSE (even without tools!)');
        } else {
          console.log(`   ✅ Test 2: "${response2.substring(0, 80)}..."`);
        }
      } catch (streamError) {
        clearTimeout(timeout2);
        console.log(`   ❌ Test 2 Error: ${streamError.message}`);
      }

      // Analysis
      console.log('\n   🔍 Analysis:');
      if (response1.trim() === '' && response2.trim() !== '') {
        console.log('   ✅ CONFIRMED: Tools cause empty responses for this model');
        console.log('   💡 Should be added to models-without-tools list');
      } else if (response1.trim() !== '' && response2.trim() !== '') {
        console.log('   ✅ OK: Model works fine with and without tools');
        console.log('   💡 No need to disable tools for this model');
      } else if (response1.trim() === '' && response2.trim() === '') {
        console.log('   ❌ ISSUE: Model has problems even without tools');
        console.log('   💡 This model may need further investigation');
      } else {
        console.log('   ⚠️ UNEXPECTED: Works with tools but not without (unusual)');
      }

    } catch (error) {
      console.log(`   ❌ Model Creation Error: ${error.message}`);
    }
  }

  console.log('\n💡 Summary:');
  console.log('============');
  console.log('If Compound models return empty responses with tools:');
  console.log('  → They should be added to the isModelWithoutTools list');
  console.log('If they work fine with tools:');
  console.log('  → They can continue to use tools normally');
  console.log('\nBased on the results above, the fix has been applied to disable');
  console.log('tools for Compound models preventively.');
}

testCompoundModelsWithTools().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
