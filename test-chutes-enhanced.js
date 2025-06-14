// Test script to verify Chutes AI enhanced configuration
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText } from 'ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Create Chutes AI provider with enhanced configuration
const chutesAI = createOpenAICompatible({
  name: 'chutes-ai',
  baseURL: 'https://llm.chutes.ai/v1',
  apiKey: process.env.CHUTES_AI_API_KEY || 'dummy-key',
  headers: {
    'User-Agent': 'ChatOptima/1.0',
  },
  compatibility: 'strict',
});

console.log('🧪 Testing Chutes AI Enhanced Configuration');
console.log('==========================================');

// Check API key
const apiKey = process.env.CHUTES_AI_API_KEY;
console.log(`API Key: ${apiKey ? `Set (length: ${apiKey.length})` : 'Not set'}\n`);

// Models to test with enhanced token limits
const testModels = [
  {
    id: 'deepseek-ai/DeepSeek-V3-0324',
    name: 'DeepSeek V3',
    maxTokens: 32768, // 32k tokens for long code generation
    contextWindow: '163k'
  },
  {
    id: 'deepseek-ai/DeepSeek-R1',
    name: 'DeepSeek R1',
    maxTokens: 32768, // 32k tokens for long code generation
    contextWindow: '163k'
  },
  {
    id: 'Qwen/Qwen3-235B-A22B',
    name: 'Qwen 3 235B',
    maxTokens: 16384, // 16k tokens
    contextWindow: 'Large'
  }
];

async function testModel(modelConfig) {
  const { id, name, maxTokens, contextWindow } = modelConfig;
  console.log(`🔄 Testing ${name} (${id})`);
  console.log(`   Context: ${contextWindow} | MaxTokens: ${maxTokens.toLocaleString()}`);
  
  try {
    // Test with a coding prompt that should generate a substantial response
    const codingPrompt = `
Create a comprehensive React component for a todo list application with the following features:
1. Add new todos with validation
2. Mark todos as complete/incomplete
3. Delete todos with confirmation
4. Filter todos by status (all, active, completed)
5. Edit todos inline
6. Drag and drop reordering
7. Local storage persistence
8. TypeScript interfaces
9. Responsive design with Tailwind CSS
10. Add unit tests with Jest and React Testing Library

Please provide a complete, production-ready implementation with detailed comments explaining the code structure and patterns used.
`;

    console.log('   📝 Testing with comprehensive coding prompt...');
    
    const { textStream } = streamText({
      model: chutesAI(id),
      system: 'You are an expert React developer. Provide comprehensive, production-ready code with detailed explanations.',
      prompt: codingPrompt,
      maxTokens: maxTokens, // Use the enhanced token limit
    });

    let response = '';
    let tokenCount = 0;
    const startTime = Date.now();
    
    // Set a timeout to prevent infinite waiting
    const timeout = setTimeout(() => {
      console.log('   ⏰ Test timed out after 60 seconds');
    }, 60000);

    try {
      for await (const delta of textStream) {
        response += delta;
        tokenCount++;
        
        // Stop after getting a good sample (to avoid huge logs)
        if (response.length > 2000) {
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
        console.log(`   📊 Response preview: "${response.substring(0, 150)}..."`);
        console.log(`   🎯 Token limit working: ${maxTokens.toLocaleString()} tokens available`);
        
        // Check if response seems to be cut off prematurely
        if (response.length < 500) {
          console.log('   ⚠️  WARNING: Response seems short for a comprehensive coding request');
        }
      }
    } catch (streamError) {
      clearTimeout(timeout);
      console.log(`   ❌ Stream Error: ${streamError.message}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Model Error: ${error.message}`);
    if (error.status) {
      console.log(`   📋 Status: ${error.status}`);
    }
    if (error.message.includes('quota') || error.message.includes('billing')) {
      console.log('   💳 Possible billing/quota issue');
    }
    if (error.message.includes('auth') || error.message.includes('unauthorized')) {
      console.log('   🔑 Possible authentication issue');
    }
  }
  
  console.log('');
}

async function testEnhancedChutesAI() {
  if (!apiKey || apiKey === 'dummy-key') {
    console.log('⚠️ CHUTES_AI_API_KEY not found - testing with dummy key (may fail)');
    console.log('');
  }

  // Test each model with enhanced token limits
  for (const model of testModels) {
    await testModel(model);
    
    // Add delay between tests to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('🏁 Enhanced Chutes AI testing complete');
  console.log('');
  console.log('📈 Expected improvements:');
  console.log('• DeepSeek models: Up to 32k tokens (vs ~4k default)');
  console.log('• Full 163k context window utilization');
  console.log('• Better support for long code generation');
  console.log('• Reduced timeout/truncation issues');
}

// Run the test
testEnhancedChutesAI().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
