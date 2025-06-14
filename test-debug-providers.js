// Debug script to fix empty response issues
import { groq } from '@ai-sdk/groq';
import { cohere } from '@ai-sdk/cohere';
import { togetherai } from '@ai-sdk/togetherai';
import { generateText, streamText } from 'ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🔧 Debugging Provider Issues');
console.log('============================');

// Simple test without complex features
async function testBasicFunctionality(provider, model, name, apiKey) {
  console.log(`\n🔍 Testing ${provider}: ${name}`);
  console.log(`   API Key: ${apiKey ? '✅ Set' : '❌ Missing'}`);
  
  if (!apiKey || apiKey === 'dummy-key') {
    console.log('   ⚠️ Skipping - API key not available');
    return;
  }

  // Test 1: Simple generateText (no streaming)
  console.log('   📝 Test 1: Simple generation...');
  try {
    const { text } = await generateText({
      model: model,
      prompt: 'Say hello and introduce yourself in one sentence.',
      maxTokens: 100,
    });
    
    if (text.trim() === '') {
      console.log('   ❌ Test 1: EMPTY RESPONSE');
    } else {
      console.log(`   ✅ Test 1: SUCCESS - "${text.substring(0, 80)}..."`);
    }
  } catch (error) {
    console.log(`   ❌ Test 1: ERROR - ${error.message}`);
  }

  // Test 2: Simple streaming without system prompt
  console.log('   📝 Test 2: Basic streaming...');
  try {
    const { textStream } = streamText({
      model: model,
      prompt: 'Write a simple "Hello World" React component.',
      maxTokens: 500,
    });

    let response = '';
    const timeout = setTimeout(() => {
      console.log('   ⏰ Test 2: Timed out');
    }, 15000);

    for await (const delta of textStream) {
      response += delta;
      if (response.length > 200) {
        clearTimeout(timeout);
        break;
      }
    }
    
    clearTimeout(timeout);
    
    if (response.trim() === '') {
      console.log('   ❌ Test 2: EMPTY RESPONSE');
    } else {
      console.log(`   ✅ Test 2: SUCCESS - Generated ${response.length} characters`);
      console.log(`   📊 Preview: "${response.substring(0, 80)}..."`);
    }
  } catch (error) {
    console.log(`   ❌ Test 2: ERROR - ${error.message}`);
  }

  // Test 3: With system prompt
  console.log('   📝 Test 3: With system prompt...');
  try {
    const { textStream } = streamText({
      model: model,
      system: 'You are a helpful coding assistant.',
      prompt: 'Create a simple JavaScript function that adds two numbers.',
      maxTokens: 300,
    });

    let response = '';
    const timeout = setTimeout(() => {
      console.log('   ⏰ Test 3: Timed out');
    }, 15000);

    for await (const delta of textStream) {
      response += delta;
      if (response.length > 150) {
        clearTimeout(timeout);
        break;
      }
    }
    
    clearTimeout(timeout);
    
    if (response.trim() === '') {
      console.log('   ❌ Test 3: EMPTY RESPONSE - System prompt might be causing issues');
    } else {
      console.log(`   ✅ Test 3: SUCCESS - Generated ${response.length} characters`);
    }
  } catch (error) {
    console.log(`   ❌ Test 3: ERROR - ${error.message}`);
  }
}

async function debugAllProviders() {
  console.log('\n📋 Provider Debug Status:');
  console.log('========================');
  
  // Test problematic providers first
  await testBasicFunctionality(
    'Groq', 
    groq('llama3-8b-8192'), // Try a simpler, well-known model
    'Llama 3 8B (Simple)',
    process.env.GROQ_API_KEY
  );

  await testBasicFunctionality(
    'Groq', 
    groq('compound-beta'),
    'Compound Beta',
    process.env.GROQ_API_KEY
  );

  await testBasicFunctionality(
    'Cohere', 
    cohere('command-r-08-2024'), // Try older, stable model
    'Command R (Stable)',
    process.env.COHERE_API_KEY
  );

  await testBasicFunctionality(
    'Cohere', 
    cohere('command-a-03-2025'),
    'Command A 2025',
    process.env.COHERE_API_KEY
  );

  await testBasicFunctionality(
    'Together.ai', 
    togetherai('meta-llama/Llama-Vision-Free'),
    'Llama Vision Free',
    process.env.TOGETHER_AI_API_KEY
  );

  console.log('\n🔧 Debug Analysis Complete');
  console.log('===========================');
  console.log('\n💡 Common causes of empty responses:');
  console.log('• Model name incorrect or deprecated');
  console.log('• API key invalid or expired');  
  console.log('• Provider-specific parameter conflicts');
  console.log('• System prompt incompatibility');
  console.log('• Rate limiting or quota exceeded');
  console.log('• Regional restrictions or model availability');
}

// Run debug test
debugAllProviders().catch(error => {
  console.error('❌ Debug test failed:', error);
  process.exit(1);
});
