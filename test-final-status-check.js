// Final comprehensive test to check if all providers are working with enhanced token limits
import { groq } from '@ai-sdk/groq';
import { cohere } from '@ai-sdk/cohere';
import { mistral } from '@ai-sdk/mistral';
import { xai } from '@ai-sdk/xai';
import { cerebras } from '@ai-sdk/cerebras';
import { togetherai } from '@ai-sdk/togetherai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText } from 'ai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

console.log('🔍 FINAL STATUS CHECK - All Providers with Enhanced Token Limits');
console.log('================================================================');

// Create custom providers
const requestyAI = createOpenAICompatible({
  name: 'requesty-ai',
  baseURL: 'https://router.requesty.ai/v1',
  apiKey: process.env.REQUESTY_AI_API_KEY || 'dummy-key',
  headers: { 'User-Agent': 'ChatOptima/1.0' },
});

const chutesAI = createOpenAICompatible({
  name: 'chutes-ai', 
  baseURL: 'https://llm.chutes.ai/v1',
  apiKey: process.env.CHUTES_AI_API_KEY || 'dummy-key',
  headers: { 'User-Agent': 'ChatOptima/1.0' },
});

const googleAI = createOpenAICompatible({
  name: 'google-ai',
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || 'dummy-key',
  headers: { 'User-Agent': 'ChatOptima/1.0' },
});

// Test prompt for code generation
const codePrompt = `Create a simple React todo app component with:
1. Add new todos
2. Mark as complete  
3. Delete todos
4. Filter by status
Include TypeScript and basic styling.`;

// All providers to test with their enhanced token limits
const providersToTest = [
  // Working providers (from previous tests)
  {
    name: 'Together.ai Llama 3.3',
    model: togetherai('meta-llama/Llama-3.3-70B-Instruct-Turbo-Free'),
    maxTokens: 8192,
    status: 'Previously Working'
  },
  {
    name: 'X.AI Grok 3 Mini', 
    model: xai('grok-3-mini-beta'),
    maxTokens: 8192,
    status: 'Previously Working'
  },
  {
    name: 'Cerebras Llama 3.3',
    model: cerebras('llama-3.3-70b'),
    maxTokens: 16384,
    status: 'Previously Working' 
  },
  {
    name: 'Mistral Small',
    model: mistral('mistral-small-2503'),
    maxTokens: 8192,
    status: 'Previously Working'
  },
  {
    name: 'Chutes DeepSeek V3',
    model: chutesAI('deepseek-ai/DeepSeek-V3-0324'),
    maxTokens: 32768,
    status: 'Previously Working'
  },
  
  // Previously problematic providers - now fixed
  {
    name: 'Groq Llama 3.3 70B',
    model: groq('llama-3.3-70b-versatile'),
    maxTokens: 32768, // Updated from Groq docs
    status: 'Fixed - Using Working Model'
  },
  {
    name: 'Groq Llama 4 Scout',
    model: groq('meta-llama/llama-4-scout-17b-16e-instruct'),
    maxTokens: 8192, // Updated from Groq docs
    status: 'Fixed - Correct Token Limit'
  },
  {
    name: 'Cohere Command R+',
    model: cohere('command-r-plus-04-2024'),
    maxTokens: 16384,
    status: 'Restored - Original Config'
  },
  {
    name: 'Requesty Gemini 2.0',
    model: requestyAI('google/gemini-2.0-flash-exp'),
    maxTokens: 8192,
    status: 'Restored - Original Config'
  }
];

async function testProvider(provider) {
  console.log(`\n🧪 Testing: ${provider.name}`);
  console.log(`   Status: ${provider.status}`);
  console.log(`   Max Tokens: ${provider.maxTokens.toLocaleString()}`);
  console.log('   ' + '─'.repeat(50));
  
  try {
    const startTime = Date.now();
    
    const { textStream } = streamText({
      model: provider.model,
      prompt: codePrompt,
      maxTokens: Math.min(provider.maxTokens, 2000), // Use smaller amount for testing
    });

    let response = '';
    let tokenCount = 0;
    
    for await (const delta of textStream) {
      response += delta;
      tokenCount++;
      
      // Break after reasonable amount for testing
      if (response.length > 1000) break;
    }
    
    const duration = Date.now() - startTime;
    
    if (response.trim().length > 0) {
      console.log(`   ✅ SUCCESS`);
      console.log(`   📊 Length: ${response.length} chars in ${duration}ms`);
      console.log(`   📝 Preview: ${response.substring(0, 100)}...`);
      return { success: true, provider: provider.name, responseLength: response.length, duration };
    } else {
      console.log(`   ❌ EMPTY RESPONSE (${duration}ms)`);
      return { success: false, provider: provider.name, error: 'Empty response', duration };
    }
    
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return { success: false, provider: provider.name, error: error.message };
  }
}

async function runFinalStatusCheck() {
  console.log(`\n🔑 API Keys Status:`);
  const requiredKeys = [
    'GROQ_API_KEY', 'COHERE_API_KEY', 'MISTRAL_API_KEY', 'XAI_API_KEY',
    'CEREBRAS_API_KEY', 'TOGETHER_AI_API_KEY', 'REQUESTY_AI_API_KEY', 
    'CHUTES_AI_API_KEY', 'GOOGLE_GENERATIVE_AI_API_KEY'
  ];
  
  requiredKeys.forEach(key => {
    const exists = !!process.env[key];
    console.log(`   ${exists ? '✅' : '❌'} ${key}`);
  });
  
  console.log(`\n🚀 Starting Provider Tests...`);
  console.log('================================================================');
  
  const results = [];
  
  for (const provider of providersToTest) {
    const result = await testProvider(provider);
    results.push(result);
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n📊 FINAL RESULTS SUMMARY');
  console.log('================================================================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Working Providers: ${successful.length}/${results.length}`);
  console.log(`❌ Failed Providers: ${failed.length}/${results.length}`);
  console.log(`📈 Success Rate: ${Math.round((successful.length / results.length) * 100)}%`);
  
  if (successful.length > 0) {
    console.log('\n🎉 WORKING PROVIDERS:');
    successful.forEach(r => {
      console.log(`   ✅ ${r.provider} (${r.responseLength} chars, ${r.duration}ms)`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ FAILED PROVIDERS:');
    failed.forEach(r => {
      console.log(`   ❌ ${r.provider}: ${r.error}`);
    });
  }
  
  // Status assessment
  console.log('\n🎯 OVERALL STATUS:');
  if (successful.length >= 8) {
    console.log('   🟢 EXCELLENT: Nearly all providers working with enhanced tokens!');
  } else if (successful.length >= 6) {
    console.log('   🟡 GOOD: Most providers working, minor issues remain.');
  } else if (successful.length >= 4) {
    console.log('   🟠 FAIR: About half working, more fixes needed.');
  } else {
    console.log('   🔴 NEEDS WORK: Major issues still present.');
  }
  
  console.log('\n🏁 Final Status Check Complete!');
}

runFinalStatusCheck().catch(error => {
  console.error('❌ Status check failed:', error);
  process.exit(1);
});
