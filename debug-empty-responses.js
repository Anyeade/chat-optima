// Debug script to investigate empty response issues with specific providers
import { groq } from '@ai-sdk/groq';
import { cohere } from '@ai-sdk/cohere';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText, generateText } from 'ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🔍 Debugging Empty Response Issues');
console.log('===================================');

// Create Requesty AI provider
const requestyAI = createOpenAICompatible({
  name: 'requesty-ai',
  baseURL: 'https://router.requesty.ai/v1',
  apiKey: process.env.REQUESTY_AI_API_KEY || 'dummy-key',
  headers: { 
    'User-Agent': 'ChatOptima/1.0',
    'Content-Type': 'application/json'
  },
});

// Simple test prompt
const simplePrompt = "Hello, please respond with a simple greeting and confirm you can generate code.";

// Complex prompt (the one that failed)
const complexPrompt = `
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

async function debugProvider(providerName, model, modelId) {
  console.log(`\n🔍 Debugging ${providerName}: ${modelId}`);
  console.log('=' .repeat(50));
  
  // Test 1: Simple prompt with generateText (non-streaming)
  console.log('\n📝 Test 1: Simple prompt with generateText');
  try {
    const result = await generateText({
      model: model,
      prompt: simplePrompt,
      maxTokens: 100,
    });
    
    if (result.text && result.text.trim() !== '') {
      console.log('✅ Non-streaming works:', result.text.substring(0, 100));
    } else {
      console.log('❌ Non-streaming returned empty');
    }
  } catch (error) {
    console.log('❌ Non-streaming error:', error.message);
  }
  
  // Test 2: Simple prompt with streaming
  console.log('\n📝 Test 2: Simple prompt with streaming');
  try {
    const { textStream } = streamText({
      model: model,
      prompt: simplePrompt,
      maxTokens: 100,
    });

    let response = '';
    for await (const delta of textStream) {
      response += delta;
      if (response.length > 100) break;
    }
    
    if (response.trim() !== '') {
      console.log('✅ Simple streaming works:', response.substring(0, 100));
    } else {
      console.log('❌ Simple streaming returned empty');
    }
  } catch (error) {
    console.log('❌ Simple streaming error:', error.message);
  }
  
  // Test 3: Complex prompt with lower maxTokens
  console.log('\n📝 Test 3: Complex prompt with 1000 maxTokens');
  try {
    const { textStream } = streamText({
      model: model,
      prompt: complexPrompt,
      maxTokens: 1000,
    });

    let response = '';
    for await (const delta of textStream) {
      response += delta;
      if (response.length > 500) break;
    }
    
    if (response.trim() !== '') {
      console.log('✅ Complex streaming (1k tokens) works:', response.substring(0, 100));
    } else {
      console.log('❌ Complex streaming (1k tokens) returned empty');
    }
  } catch (error) {
    console.log('❌ Complex streaming (1k tokens) error:', error.message);
  }
  
  // Test 4: Complex prompt with original maxTokens
  console.log('\n📝 Test 4: Complex prompt with enhanced maxTokens');
  let maxTokens = 4096;
  if (modelId.includes('groq') || modelId.includes('compound') || modelId.includes('llama-4')) {
    maxTokens = 12288;
  } else if (modelId.includes('command')) {
    maxTokens = 16384;
  } else if (modelId.includes('google/') || modelId.includes('gemini')) {
    maxTokens = 8192;
  }
  
  console.log(`   Using maxTokens: ${maxTokens}`);
  
  try {
    const { textStream } = streamText({
      model: model,
      prompt: complexPrompt,
      maxTokens: maxTokens,
    });

    let response = '';
    const startTime = Date.now();
    
    for await (const delta of textStream) {
      response += delta;
      if (response.length > 500) break;
    }
    
    const duration = Date.now() - startTime;
    
    if (response.trim() !== '') {
      console.log(`✅ Complex streaming (${maxTokens} tokens) works: ${response.substring(0, 100)}`);
      console.log(`   Duration: ${duration}ms, Length: ${response.length}`);
    } else {
      console.log(`❌ Complex streaming (${maxTokens} tokens) returned empty after ${duration}ms`);
    }
  } catch (error) {
    console.log(`❌ Complex streaming (${maxTokens} tokens) error:`, error.message);
  }
}

async function debugAllProblematicProviders() {
  const problematicProviders = [
    {
      name: 'Groq (Llama 4 Scout)',
      model: groq('meta-llama/llama-4-scout-17b-16e-instruct'),
      id: 'meta-llama/llama-4-scout-17b-16e-instruct'
    },
    {
      name: 'Groq (Compound Beta)', 
      model: groq('compound-beta'),
      id: 'compound-beta'
    },
    {
      name: 'Cohere (Command A 2025)',
      model: cohere('command-a-03-2025'),
      id: 'command-a-03-2025'
    },
    {
      name: 'Requesty AI (Gemini 2.0)',
      model: requestyAI('google/gemini-2.0-flash-exp'),
      id: 'google/gemini-2.0-flash-exp'
    }
  ];

  for (const provider of problematicProviders) {
    await debugProvider(provider.name, provider.model, provider.id);
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n🏁 Debug Analysis Complete');
  console.log('===========================');
  console.log('\n📊 Next Steps:');
  console.log('1. Check which test cases work for each provider');
  console.log('2. Identify if issue is with streaming, maxTokens, or model availability');
  console.log('3. Apply targeted fixes based on debug results');
}

// Run the debug analysis
debugAllProblematicProviders().catch(error => {
  console.error('❌ Debug execution failed:', error);
  process.exit(1);
});
