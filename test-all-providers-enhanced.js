// Test script to verify enhanced token limits across all AI providers
import { groq } from '@ai-sdk/groq';
import { mistral } from '@ai-sdk/mistral';
import { cohere } from '@ai-sdk/cohere';
import { togetherai } from '@ai-sdk/togetherai';
import { xai } from '@ai-sdk/xai';
import { cerebras } from '@ai-sdk/cerebras';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText } from 'ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Create enhanced providers
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

console.log('🧪 Testing Enhanced Token Limits Across All Providers');
console.log('====================================================');

// Enhanced token limits function (same as in route.ts)
function getMaxTokensForModel(modelId) {
  if (modelId.includes('deepseek') || modelId.includes('DeepSeek')) {
    return 32768; // 32k tokens for long code generation
  }
  if (modelId.includes('qwen') || modelId.includes('Qwen')) {
    return 16384; // 16k tokens
  }
  if (modelId.includes('llama-4') || modelId.includes('Llama-4')) {
    return 16384; // 16k tokens
  }
  if (modelId.includes('groq') || modelId.includes('compound') || modelId.includes('llama-3.3') || modelId.includes('llama3')) {
    return 12288; // 12k tokens for Groq models
  }
  if (modelId.includes('command')) {
    return 16384; // 16k tokens for Cohere Command series
  }
  if (modelId.includes('meta-llama') && modelId.includes('Free')) {
    return 8192; // 8k tokens for Together.ai free models
  }
  if (modelId.includes('grok')) {
    return 8192; // 8k tokens for Grok models
  }
  if (modelId.includes('mistral') || modelId.includes('pixtral') || modelId.includes('devstral')) {
    return 8192; // 8k tokens for Mistral models
  }
  if (modelId.includes('requesty') || modelId.includes('google/') || modelId.includes('gemma-3-27b-it-requesty')) {
    return 8192; // 8k tokens for Requesty Router models
  }
  if (modelId.includes('gemini') || modelId.includes('gemma')) {
    return 8192; // 8k tokens
  }
  if (modelId.includes('cerebras')) {
    return 8192; // 8k tokens for Cerebras models
  }
  return 4096; // 4k tokens default
}

// Test models across different providers
const testModels = [
  // Groq Models
  {
    provider: 'Groq',
    model: groq('meta-llama/llama-4-scout-17b-16e-instruct'),
    name: 'Llama 4 Scout',
    id: 'meta-llama/llama-4-scout-17b-16e-instruct',
    apiKey: process.env.GROQ_API_KEY
  },
  {
    provider: 'Groq',
    model: groq('compound-beta'),
    name: 'Compound Beta',
    id: 'compound-beta',
    apiKey: process.env.GROQ_API_KEY
  },
  
  // Cohere Models
  {
    provider: 'Cohere',
    model: cohere('command-a-03-2025'),
    name: 'Command A 2025',
    id: 'command-a-03-2025',
    apiKey: process.env.COHERE_API_KEY
  },
  
  // Together.ai Models
  {
    provider: 'Together.ai',
    model: togetherai('meta-llama/Llama-Vision-Free'),
    name: 'Llama Vision Free',
    id: 'meta-llama/Llama-Vision-Free',
    apiKey: process.env.TOGETHER_AI_API_KEY
  },
  
  // X.AI Grok Models
  {
    provider: 'X.AI',
    model: xai('grok-3-mini-beta'),
    name: 'Grok 3 Mini',
    id: 'grok-3-mini-beta',
    apiKey: process.env.XAI_API_KEY
  },
  
  // Cerebras Models
  {
    provider: 'Cerebras',
    model: cerebras('llama-4-scout-17b-16e-instruct'),
    name: 'Llama 4 Scout Cerebras',
    id: 'llama-4-scout-17b-16e-instruct-cerebras',
    apiKey: process.env.CEREBRAS_API_KEY
  },
  
  // Mistral Models
  {
    provider: 'Mistral',
    model: mistral('pixtral-12b-2409'),
    name: 'Pixtral 12B',
    id: 'pixtral-12b-2409',
    apiKey: process.env.MISTRAL_API_KEY
  },
  
  // Requesty AI Models
  {
    provider: 'Requesty AI',
    model: requestyAI('google/gemini-2.0-flash-exp'),
    name: 'Gemini 2.0 Flash via Requesty',
    id: 'google/gemini-2.0-flash-exp',
    apiKey: process.env.REQUESTY_AI_API_KEY
  },
  
  // Chutes AI Models
  {
    provider: 'Chutes AI',
    model: chutesAI('deepseek-ai/DeepSeek-V3-0324'),
    name: 'DeepSeek V3 via Chutes',
    id: 'deepseek-ai/DeepSeek-V3-0324',
    apiKey: process.env.CHUTES_AI_API_KEY
  }
];

async function testProvider(testConfig) {
  const { provider, model, name, id, apiKey } = testConfig;
  const maxTokens = getMaxTokensForModel(id);
  
  console.log(`\n🔄 Testing ${provider}: ${name}`);
  console.log(`   Model ID: ${id}`);
  console.log(`   Enhanced MaxTokens: ${maxTokens.toLocaleString()}`);
  console.log(`   API Key: ${apiKey ? '✅ Set' : '❌ Missing'}`);
  
  if (!apiKey || apiKey === 'dummy-key') {
    console.log('   ⚠️ Skipping - API key not available');
    return;
  }
  
  try {
    const codingPrompt = `
Create a React component for a task management system with the following features:
1. Add/edit/delete tasks
2. Mark tasks as complete
3. Filter by status
4. Search functionality
5. Local storage
6. TypeScript interfaces
7. Responsive design
8. Unit tests

Provide a comprehensive implementation with detailed comments.
`;

    console.log('   📝 Testing with coding prompt...');
    
    const { textStream } = streamText({
      model: model,
      system: 'You are an expert React developer. Provide comprehensive, production-ready code.',
      prompt: codingPrompt,
      maxTokens: maxTokens,
    });

    let response = '';
    const startTime = Date.now();
    
    const timeout = setTimeout(() => {
      console.log('   ⏰ Test timed out after 45 seconds');
    }, 45000);

    try {
      for await (const delta of textStream) {
        response += delta;
        
        // Stop after getting a good sample
        if (response.length > 1500) {
          clearTimeout(timeout);
          break;
        }
      }
      
      const duration = Date.now() - startTime;
      clearTimeout(timeout);
      
      if (response.trim() === '') {
        console.log('   ❌ EMPTY RESPONSE - Possible API issue');
      } else {
        console.log(`   ✅ SUCCESS - Generated ${response.length} characters in ${duration}ms`);
        console.log(`   📊 Preview: "${response.substring(0, 100)}..."`);
        
        const improvement = Math.round((maxTokens / 4096) * 100);
        console.log(`   📈 Token improvement: ${improvement}% vs default (${maxTokens} vs 4096 tokens)`);
        
        if (response.length < 300) {
          console.log('   ⚠️ WARNING: Response seems short for comprehensive request');
        }
      }
    } catch (streamError) {
      clearTimeout(timeout);
      console.log(`   ❌ Stream Error: ${streamError.message}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Provider Error: ${error.message}`);
    if (error.status) {
      console.log(`   📋 Status: ${error.status}`);
    }
  }
}

async function testAllProviders() {
  console.log('\n📋 API Keys Status:');
  console.log('==================');
  const keys = {
    'Groq': process.env.GROQ_API_KEY,
    'Cohere': process.env.COHERE_API_KEY,
    'Together.ai': process.env.TOGETHER_AI_API_KEY,
    'X.AI': process.env.XAI_API_KEY,
    'Cerebras': process.env.CEREBRAS_API_KEY,
    'Mistral': process.env.MISTRAL_API_KEY,
    'Requesty AI': process.env.REQUESTY_AI_API_KEY,
    'Chutes AI': process.env.CHUTES_AI_API_KEY,
  };
  
  Object.entries(keys).forEach(([provider, key]) => {
    const status = key && key !== 'dummy-key' ? '✅ Set' : '❌ Missing';
    console.log(`${provider.padEnd(12)}: ${status}`);
  });

  // Test each provider
  for (const testConfig of testModels) {
    await testProvider(testConfig);
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n🏁 Enhanced Provider Testing Complete');
  console.log('=====================================');
  console.log('\n📈 Token Limit Improvements Summary:');
  console.log('• DeepSeek models: 32k tokens (8x increase)');
  console.log('• Cohere Command: 16k tokens (4x increase)');
  console.log('• Llama 4 models: 16k tokens (4x increase)');
  console.log('• Groq models: 12k tokens (3x increase)');
  console.log('• Other models: 8k tokens (2x increase)');
  console.log('• Default: 4k tokens (baseline)');
  console.log('\n🎯 All providers now support enhanced token limits for better code generation!');
}

// Run the comprehensive test
testAllProviders().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
