// Test script for official AI SDK providers (OpenRouter and Cerebras)
import { cerebras } from '@ai-sdk/cerebras';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

async function testOfficialProviders() {
  console.log('🧪 Testing Official AI SDK Providers');
  console.log('====================================');

  // Check environment variables
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const cerebrasKey = process.env.CEREBRAS_API_KEY;
  const vercelUrl = process.env.VERCEL_URL;

  console.log('\n📋 Environment Check:');
  console.log(`OPENROUTER_API_KEY: ${openrouterKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`CEREBRAS_API_KEY: ${cerebrasKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`VERCEL_URL: ${vercelUrl || 'Not set (using fallback)'}`);

  const tests = [];

  // Test OpenRouter (Official AI SDK)
  if (openrouterKey) {
    console.log('\n🌐 Testing OpenRouter (Official AI SDK Provider)...');
    try {
      const openRouter = createOpenRouter({
        apiKey: openrouterKey,
        headers: {
          'HTTP-Referer': vercelUrl || 'https://chat-optima.vercel.app',
          'X-Title': 'Chat Optima',
        },
      });

      // Test model creation (don't actually call API)
      const model = openRouter.chat('qwen/qwen2.5-vl-72b-instruct:free');
      console.log('✅ OpenRouter provider created successfully');
      console.log('✅ Vision model configured successfully');
      tests.push({ name: 'OpenRouter', success: true, details: 'Provider configured correctly' });
    } catch (error) {
      console.log('❌ OpenRouter provider error:', error.message);
      tests.push({ name: 'OpenRouter', success: false, details: error.message });
    }
  } else {
    console.log('⚠️ Skipping OpenRouter test - API key not found');
  }

  // Test Cerebras (Official AI SDK)
  if (cerebrasKey) {
    console.log('\n🧠 Testing Cerebras (Official AI SDK Provider)...');
    try {
      // Test model creation (don't actually call API)
      const model = cerebras('llama3.1-8b');
      console.log('✅ Cerebras provider created successfully');
      console.log('✅ Model configured successfully');
      tests.push({ name: 'Cerebras', success: true, details: 'Provider configured correctly' });
    } catch (error) {
      console.log('❌ Cerebras provider error:', error.message);
      tests.push({ name: 'Cerebras', success: false, details: error.message });
    }
  } else {
    console.log('⚠️ Skipping Cerebras test - API key not found');
  }

  // Summary
  console.log('\n📊 Test Summary:');
  console.log('================');
  if (tests.length === 0) {
    console.log('❌ No API keys found. Please set environment variables.');
    console.log('   Required: OPENROUTER_API_KEY and/or CEREBRAS_API_KEY');
  } else {
    tests.forEach(test => {
      const status = test.success ? '✅' : '❌';
      console.log(`${status} ${test.name}: ${test.details}`);
    });

    const successCount = tests.filter(t => t.success).length;
    console.log(`\n🎯 Results: ${successCount}/${tests.length} providers configured successfully`);

    if (successCount === tests.length) {
      console.log('🎉 All available providers are ready to use!');
      console.log('💡 Deploy to Vercel to test with real API calls.');
    } else {
      console.log('⚠️ Some providers need attention. Check the errors above.');
    }
  }

  console.log('\n🔧 Next Steps:');
  console.log('==============');
  console.log('1. Deploy these changes to Vercel');
  console.log('2. Check Vercel function logs for any runtime errors');
  console.log('3. Test the models in the chat interface');
  console.log('4. Monitor for API rate limits and usage');
}

// Handle async execution
testOfficialProviders().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
