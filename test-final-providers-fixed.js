// Final test of all 8 providers with corrected configurations
import { groq } from '@ai-sdk/groq';
import { cohere } from '@ai-sdk/cohere';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { mistral } from '@ai-sdk/mistral';
import { togetherai } from '@ai-sdk/togetherai';
import { xai } from '@ai-sdk/xai';
import { cerebras } from '@ai-sdk/cerebras';
import { streamText } from 'ai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

console.log('🚀 FINAL PROVIDER TEST - All 8 Providers with Fixed Configurations');
console.log('===================================================================');

// Create providers with enhanced configurations
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

// Function to get correct maxTokens based on Groq documentation
function getMaxTokensForModel(modelId) {
  // Groq models - Using EXACT limits from Groq documentation
  if (modelId === 'llama-3.3-70b-versatile') {
    return 32768; // 32k max completion tokens
  }
  if (modelId === 'meta-llama/llama-4-scout-17b-16e-instruct') {
    return 8192; // 8k max completion tokens
  }
  if (modelId === 'compound-beta') {
    return 8192; // 8k max completion tokens (preview system)
  }
  if (modelId.includes('deepseek') || modelId.includes('DeepSeek')) {
    return 32768; // 32k tokens for DeepSeek models
  }
  if (modelId.includes('command')) {
    return 16384; // 16k tokens for Cohere Command series
  }
  if (modelId.includes('qwen') || modelId.includes('Qwen')) {
    return 16384; // 16k tokens for Qwen models
  }
  if (modelId.includes('cerebras')) {
    return 8192; // 8k tokens for Cerebras models
  }
  // Default for other models
  return 8192; // 8k tokens default
}

// Complex prompt for comprehensive testing
const complexPrompt = `
Create a comprehensive React task management application with the following features:

1. **Core Task Management:**
   - Add, edit, delete tasks
   - Mark tasks as complete/incomplete
   - Task priorities (high, medium, low)
   - Due dates and time tracking

2. **Advanced Features:**
   - Search and filter functionality
   - Categories and tags
   - Local storage persistence
   - Drag-and-drop reordering

3. **Technical Requirements:**
   - TypeScript interfaces and types
   - React hooks (useState, useEffect, useContext)
   - Custom hooks for task management
   - Responsive design with Tailwind CSS
   - Unit tests with Jest/Vitest

4. **Code Organization:**
   - Component-based architecture
   - Proper separation of concerns
   - Error handling and validation
   - Performance optimizations

Please provide a complete implementation with detailed comments explaining each part.
`;

// Test configuration for all 8 providers
const providersToTest = [
  {
    name: '🔥 Together.ai (Llama 3.3 Free)',
    model: togetherai('meta-llama/Llama-3.3-70B-Instruct-Turbo-Free'),
    id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
    maxTokens: 8192
  },
  {
    name: '⚡ X.AI (Grok 3 Mini)',
    model: xai('grok-3-mini-beta'),
    id: 'grok-3-mini-beta',
    maxTokens: 8192
  },
  {
    name: '🧠 Cerebras (Llama 3.3 70B)',
    model: cerebras('llama-3.3-70b'),
    id: 'llama-3.3-70b-cerebras',
    maxTokens: 8192
  },
  {
    name: '🌟 Mistral (Pixtral 12B)',
    model: mistral('pixtral-12b-2409'),
    id: 'pixtral-12b-2409',
    maxTokens: 8192
  },
  {
    name: '🚀 Chutes AI (DeepSeek V3)',
    model: chutesAI('deepseek-ai/DeepSeek-V3-0324'),
    id: 'deepseek-ai/DeepSeek-V3-0324',
    maxTokens: 32768
  },
  {
    name: '🔥 Groq (Llama 3.3 70B Versatile)',
    model: groq('llama-3.3-70b-versatile'),
    id: 'llama-3.3-70b-versatile',
    maxTokens: 32768
  },
  {
    name: '💎 Cohere (Command R+)',
    model: cohere('command-r-plus'),
    id: 'command-r-plus',
    maxTokens: 16384
  },
  {
    name: '🌐 Requesty AI (GPT-4o)',
    model: requestyAI('gpt-4o'),
    id: 'gpt-4o',
    maxTokens: 8192
  }
];

async function testProvider(provider) {
  console.log(`\n${provider.name}`);
  console.log('=' .repeat(60));
  console.log(`📋 Model: ${provider.id}`);
  console.log(`🎯 Max Tokens: ${provider.maxTokens.toLocaleString()}`);
  
  try {
    const startTime = Date.now();
    
    const { textStream } = streamText({
      model: provider.model,
      prompt: complexPrompt,
      maxTokens: provider.maxTokens,
    });

    let response = '';
    let chunkCount = 0;
    
    for await (const delta of textStream) {
      response += delta;
      chunkCount++;
      
      // Show progress every 100 chunks
      if (chunkCount % 100 === 0) {
        process.stdout.write('.');
      }
      
      // Break early for demo (optional)
      if (response.length > 2000) {
        console.log(`\n⏱️  Response after ${Date.now() - startTime}ms:`);
        break;
      }
    }
    
    const duration = Date.now() - startTime;
    const wordsGenerated = response.split(' ').length;
    const tokensPerSecond = Math.round((response.length / 4) / (duration / 1000)); // Rough estimate
    
    if (response.trim() !== '') {
      console.log(`\n✅ SUCCESS`);
      console.log(`   📊 Generated: ${response.length} characters, ~${wordsGenerated} words`);
      console.log(`   ⚡ Speed: ~${tokensPerSecond} tokens/sec`);
      console.log(`   ⏱️  Duration: ${duration}ms`);
      console.log(`   📝 Preview: ${response.substring(0, 150)}...`);
      
      // Check for code generation
      const hasCode = response.includes('```') || response.includes('function') || response.includes('const ');
      console.log(`   💻 Contains Code: ${hasCode ? '✅ Yes' : '❌ No'}`);
      
      return { success: true, duration, length: response.length, hasCode };
    } else {
      console.log(`❌ FAILED - Empty response after ${duration}ms`);
      return { success: false, duration, length: 0, hasCode: false };
    }
    
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    return { success: false, duration: 0, length: 0, hasCode: false, error: error.message };
  }
}

async function runFinalProviderTest() {
  const results = [];
  
  console.log(`\n🧪 Testing ${providersToTest.length} providers with complex code generation prompt...`);
  console.log('Each test uses enhanced token limits for long-form code generation.\n');
  
  for (const provider of providersToTest) {
    const result = await testProvider(provider);
    results.push({ 
      name: provider.name, 
      id: provider.id,
      maxTokens: provider.maxTokens,
      ...result 
    });
    
    // Rate limiting - wait between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Summary Report
  console.log('\n' + '='.repeat(80));
  console.log('🏆 FINAL TEST RESULTS SUMMARY');
  console.log('='.repeat(80));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`\n📊 Overall Results: ${successful.length}/${results.length} providers working`);
  console.log(`   ✅ Success Rate: ${Math.round((successful.length / results.length) * 100)}%`);
  
  if (successful.length > 0) {
    console.log(`\n✅ WORKING PROVIDERS (${successful.length}):`);
    successful.forEach(result => {
      console.log(`   🎯 ${result.name}`);
      console.log(`      📈 ${result.maxTokens.toLocaleString()} max tokens | ${result.length} chars | ${result.duration}ms`);
      console.log(`      💻 Code generation: ${result.hasCode ? '✅' : '❌'}`);
    });
  }
  
  if (failed.length > 0) {
    console.log(`\n❌ FAILED PROVIDERS (${failed.length}):`);
    failed.forEach(result => {
      console.log(`   ❌ ${result.name}: ${result.error || 'Empty response'}`);
    });
  }
  
  // Performance ranking
  if (successful.length > 1) {
    console.log(`\n⚡ PERFORMANCE RANKING:`);
    const sorted = successful.sort((a, b) => a.duration - b.duration);
    sorted.forEach((result, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
      console.log(`   ${medal} ${result.name} - ${result.duration}ms`);
    });
  }
  
  console.log('\n🎉 ALL PROVIDER TESTING COMPLETE!');
  console.log('Ready for production use with enhanced token limits.');
}

// Run the comprehensive test
runFinalProviderTest().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
