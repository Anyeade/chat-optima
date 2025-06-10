// Test all problematic models with the updated fix
import { cerebras } from '@ai-sdk/cerebras';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText } from 'ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Simple tools for testing
const simpleTools = {
  getWeather: {
    description: 'Get weather',
    parameters: {
      type: 'object',
      properties: {
        location: { type: 'string' }
      },
      required: ['location']
    }
  }
};

async function testModelFix(modelName, modelInstance, providerName) {
  console.log(`\n🔄 Testing ${providerName}: ${modelName}...`);
  
  // Simulate the chat interface logic
  const isModelWithoutTools = modelName.includes('cerebras') || 
                             modelName.includes('llama3.1-8b-cerebras') ||
                             modelName.includes('llama-3.3-70b-cerebras') ||
                             modelName.includes('openrouter') ||
                             modelName.includes('glama') ||
                             modelName.includes('qwen/qwen2.5-vl-72b-instruct:free') ||
                             modelName.includes('meta-llama/llama-3.1-8b-instruct:free') ||
                             modelName.includes('phi-3-medium-128k-instruct') ||
                             modelName.includes('phi-3-mini-128k-instruct');

  if (isModelWithoutTools) {
    console.log('   🚫 Model detected that doesn\'t work well with tools - disabling for compatibility');
  } else {
    console.log('   🛠️ Tools enabled for this model');
  }

  try {
    // Configure stream based on our fix logic
    const streamConfig = {
      model: modelInstance,
      system: 'You are a helpful AI assistant.',
      prompt: 'Hello! Say "Hi from [your model name]" in one sentence.',
      maxTokens: 50,
    };

    // Only add tools if the model supports them
    if (!isModelWithoutTools) {
      streamConfig.tools = simpleTools;
    }

    const { textStream } = streamText(streamConfig);

    let response = '';
    const timeout = setTimeout(() => {
      console.log('   ⏰ Timed out after 10 seconds');
    }, 10000);

    for await (const delta of textStream) {
      response += delta;
      if (response.length > 30) break; // Stop early
    }
    clearTimeout(timeout);

    if (response.trim() === '') {
      console.log('   ❌ STILL EMPTY - Model has deeper issues');
      return false;
    } else {
      console.log(`   ✅ SUCCESS: "${response.trim()}"`);
      return true;
    }

  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function testAllModels() {
  console.log('🧪 Testing All Problematic Models with Updated Fix');
  console.log('==================================================');

  const results = [];

  // Test Cerebras models
  const cerebrasKey = process.env.CEREBRAS_API_KEY;
  if (cerebrasKey) {
    console.log('\n🧠 Testing Cerebras Models...');
    
    const cerebrasModels = ['llama3.1-8b', 'llama-3.3-70b'];
    for (const modelName of cerebrasModels) {
      try {
        const model = cerebras(modelName);
        const result = await testModelFix(`${modelName}-cerebras`, model, 'Cerebras');
        results.push({ provider: 'Cerebras', model: modelName, success: result });
      } catch (error) {
        console.log(`   ❌ Failed to create ${modelName}: ${error.message}`);
        results.push({ provider: 'Cerebras', model: modelName, success: false });
      }
    }
  }

  // Test OpenRouter models
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (openrouterKey) {
    console.log('\n🌐 Testing OpenRouter Models...');
    
    try {
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
        try {
          const model = openRouter.chat(modelName);
          const result = await testModelFix(modelName, model, 'OpenRouter');
          results.push({ provider: 'OpenRouter', model: modelName, success: result });
        } catch (error) {
          console.log(`   ❌ Failed to create ${modelName}: ${error.message}`);
          results.push({ provider: 'OpenRouter', model: modelName, success: false });
        }
      }
    } catch (error) {
      console.log(`   ❌ Failed to create OpenRouter provider: ${error.message}`);
    }
  }

  // Test Glama models
  const glamaKey = process.env.GLAMAAI_API_KEY;
  if (glamaKey) {
    console.log('\n✨ Testing Glama Models...');
    
    try {
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
        try {
          const model = glamaAI(modelName);
          const result = await testModelFix(modelName, model, 'Glama');
          results.push({ provider: 'Glama', model: modelName, success: result });
        } catch (error) {
          console.log(`   ❌ Failed to create ${modelName}: ${error.message}`);
          results.push({ provider: 'Glama', model: modelName, success: false });
        }
      }
    } catch (error) {
      console.log(`   ❌ Failed to create Glama provider: ${error.message}`);
    }
  }

  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  if (results.length === 0) {
    console.log('❌ No models were tested (missing API keys?)');
  } else {
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    console.log(`🎯 Overall: ${successCount}/${totalCount} models working`);
    console.log('\nDetailed Results:');
    
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.provider}: ${result.model}`);
    });
    
    if (successCount === totalCount) {
      console.log('\n🎉 All models are now working with the fix!');
    } else {
      console.log('\n⚠️ Some models still need attention.');
      console.log('   This might be due to API key issues or model availability.');
    }
  }

  console.log('\n🚀 Next Step: Test in your actual chat interface!');
}

testAllModels().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
