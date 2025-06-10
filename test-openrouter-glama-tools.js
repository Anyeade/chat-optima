// Test OpenRouter and Glama models with tools to verify the same issue
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
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

async function testModelsWithTools() {
  console.log('🧪 Testing OpenRouter and Glama Models with Tools');
  console.log('==================================================');

  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const glamaKey = process.env.GLAMAAI_API_KEY;

  if (!openrouterKey && !glamaKey) {
    console.log('❌ No API keys found for OpenRouter or Glama');
    return;
  }

  // Test OpenRouter models
  if (openrouterKey) {
    console.log('\n🌐 Testing OpenRouter Models...');
    
    const openRouter = createOpenRouter({
      apiKey: openrouterKey,
      headers: {
        'HTTP-Referer': process.env.VERCEL_URL || 'https://chat-optima.vercel.app',
        'X-Title': 'Chat Optima',
      },
    });

    const openRouterModels = [
      'qwen/qwen2.5-vl-72b-instruct:free',
      'meta-llama/llama-3.1-8b-instruct:free'
    ];

    for (const modelName of openRouterModels) {
      await testModel('OpenRouter', openRouter.chat(modelName), modelName);
    }
  }
  // Test Glama models
  if (glamaKey) {
    console.log('\n✨ Testing Glama Models...');
    
    const glamaAI = createOpenAICompatible({
      name: 'glama-ai',
      baseURL: 'https://glama.ai/api/gateway/openai/v1',
      apiKey: glamaKey,
    });

    const glamaModels = [
      'phi-3-medium-128k-instruct',
      'phi-3-mini-128k-instruct'
    ];

    for (const modelName of glamaModels) {
      await testModel('Glama', glamaAI(modelName), modelName);
    }
  }
}

async function testModel(providerName, model, modelName) {
  console.log(`\n🔄 Testing ${providerName}: ${modelName}...`);
  
  try {
    // Test 1: With tools enabled
    console.log('   📝 Test 1: With tools enabled...');
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
        console.log(`   ✅ Test 1: "${response1.substring(0, 50)}..."`);
      }
    } catch (streamError) {
      clearTimeout(timeout1);
      console.log(`   ❌ Test 1 Error: ${streamError.message}`);
    }

    // Test 2: Without tools
    console.log('   📝 Test 2: Without tools...');
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
        console.log(`   ✅ Test 2: "${response2.substring(0, 50)}..."`);
      }
    } catch (streamError) {
      clearTimeout(timeout2);
      console.log(`   ❌ Test 2 Error: ${streamError.message}`);
    }

    // Analysis
    if (response1.trim() === '' && response2.trim() !== '') {
      console.log('   🔍 CONFIRMED: Tools cause empty responses for this model');
    } else if (response1.trim() !== '' && response2.trim() !== '') {
      console.log('   🔍 OK: Model works fine with and without tools');
    } else if (response1.trim() === '' && response2.trim() === '') {
      console.log('   🔍 ISSUE: Model has problems even without tools');
    }

  } catch (error) {
    console.log(`   ❌ Model Creation Error: ${error.message}`);
  }
}

testModelsWithTools().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
