// Test OpenRouter and Glama models step by step to find the exact issue
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText } from 'ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testStepByStep() {
  console.log('🔍 Step-by-Step OpenRouter and Glama Diagnosis');
  console.log('===============================================');

  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const glamaKey = process.env.GLAMAAI_API_KEY;

  console.log(`\n🔑 API Keys Status:`);
  console.log(`OpenRouter: ${openrouterKey ? `${openrouterKey.substring(0, 12)}...` : '❌ Missing'}`);
  console.log(`Glama: ${glamaKey ? `${glamaKey.substring(0, 12)}...` : '❌ Missing'}`);

  // Test 1: OpenRouter Provider Creation
  if (openrouterKey) {
    console.log('\n📝 Step 1: Testing OpenRouter Provider Creation...');
    
    try {
      const openRouter = createOpenRouter({
        apiKey: openrouterKey,
        headers: {
          'HTTP-Referer': process.env.VERCEL_URL || 'https://chat-optima.vercel.app',
          'X-Title': 'Chat Optima',
        },
      });
      console.log('✅ OpenRouter provider created successfully');

      // Test 2: Model Creation
      console.log('\n📝 Step 2: Testing OpenRouter Model Creation...');
      try {
        const model = openRouter.chat('meta-llama/llama-3.1-8b-instruct:free');
        console.log('✅ OpenRouter model created successfully');

        // Test 3: Simple API call
        console.log('\n📝 Step 3: Testing OpenRouter API Call (simple)...');
        try {
          const { textStream } = streamText({
            model,
            prompt: 'Say hello',
            maxTokens: 10,
          });

          let response = '';
          const timeout = setTimeout(() => {
            console.log('⏰ OpenRouter API call timed out after 15 seconds');
          }, 15000);

          for await (const delta of textStream) {
            response += delta;
            console.log(`   📥 Chunk: "${delta}"`);
            if (response.length > 20) break; // Stop early
          }
          clearTimeout(timeout);

          if (response.trim() === '') {
            console.log('❌ OpenRouter API returned empty response');
          } else {
            console.log(`✅ OpenRouter API working! Response: "${response.trim()}"`);
          }

        } catch (apiError) {
          console.log(`❌ OpenRouter API Error: ${apiError.message}`);
          console.log(`   Status: ${apiError.status || 'N/A'}`);
          console.log(`   Code: ${apiError.code || 'N/A'}`);
          if (apiError.response?.data) {
            console.log(`   Response: ${JSON.stringify(apiError.response.data, null, 2)}`);
          }
        }

      } catch (modelError) {
        console.log(`❌ OpenRouter Model Creation Error: ${modelError.message}`);
      }

    } catch (providerError) {
      console.log(`❌ OpenRouter Provider Creation Error: ${providerError.message}`);
    }
  }

  // Test Glama
  if (glamaKey) {
    console.log('\n📝 Step 4: Testing Glama Provider Creation...');
    
    try {
      const glamaAI = createOpenAICompatible({
        name: 'glama-ai',
        baseURL: 'https://glama.ai/api/gateway/openai/v1',
        apiKey: glamaKey,
      });
      console.log('✅ Glama provider created successfully');

      // Test 5: Glama Model Creation
      console.log('\n📝 Step 5: Testing Glama Model Creation...');
      try {
        const model = glamaAI('phi-3-mini-128k-instruct');
        console.log('✅ Glama model created successfully');

        // Test 6: Simple API call
        console.log('\n📝 Step 6: Testing Glama API Call (simple)...');
        try {
          const { textStream } = streamText({
            model,
            prompt: 'Say hello',
            maxTokens: 10,
          });

          let response = '';
          const timeout = setTimeout(() => {
            console.log('⏰ Glama API call timed out after 15 seconds');
          }, 15000);

          for await (const delta of textStream) {
            response += delta;
            console.log(`   📥 Chunk: "${delta}"`);
            if (response.length > 20) break; // Stop early
          }
          clearTimeout(timeout);

          if (response.trim() === '') {
            console.log('❌ Glama API returned empty response');
          } else {
            console.log(`✅ Glama API working! Response: "${response.trim()}"`);
          }

        } catch (apiError) {
          console.log(`❌ Glama API Error: ${apiError.message}`);
          console.log(`   Status: ${apiError.status || 'N/A'}`);
          console.log(`   Code: ${apiError.code || 'N/A'}`);
          if (apiError.response?.data) {
            console.log(`   Response: ${JSON.stringify(apiError.response.data, null, 2)}`);
          }
        }

      } catch (modelError) {
        console.log(`❌ Glama Model Creation Error: ${modelError.message}`);
      }

    } catch (providerError) {
      console.log(`❌ Glama Provider Creation Error: ${providerError.message}`);
    }
  }

  console.log('\n💡 Summary:');
  console.log('============');
  console.log('If provider creation succeeds but API calls fail:');
  console.log('  → Check API key permissions and account status');
  console.log('If models return empty responses:');
  console.log('  → The models may not support the tools configuration');
  console.log('If API calls timeout:');
  console.log('  → Network or rate limiting issues');
}

testStepByStep().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
