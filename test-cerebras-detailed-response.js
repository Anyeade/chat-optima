// Test to see exactly what Cerebras models return when tools are enabled
import { cerebras } from '@ai-sdk/cerebras';
import { streamText } from 'ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Simulated tools
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

async function testCerebrasDetailedResponse() {
  console.log('🔍 Detailed Cerebras Response Analysis');
  console.log('=====================================');

  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) {
    console.log('❌ CEREBRAS_API_KEY not found');
    return;
  }

  const model = cerebras('llama3.1-8b');
  
  // Test with tools enabled - capture full response
  console.log('\n🔧 Testing WITH tools enabled...');
  console.log('================================');
  
  try {
    const { textStream } = streamText({
      model,
      system: 'You are a helpful AI assistant. Always provide complete and helpful responses.',
      prompt: 'Hello! Please tell me about yourself and what you can help me with. Write at least 2-3 sentences.',
      maxTokens: 200,
      tools: {
        getWeather
      }
    });

    let fullResponse = '';
    let tokenCount = 0;
    const chunks = [];
    
    console.log('📝 Streaming response:');
    console.log('----------------------');
    
    for await (const delta of textStream) {
      fullResponse += delta;
      tokenCount++;
      chunks.push(delta);
      
      // Show each chunk as it comes
      if (delta.trim()) {
        console.log(`Chunk ${tokenCount}: "${delta}"`);
      }
    }
    
    console.log('\n📊 Response Analysis:');
    console.log('=====================');
    console.log(`Total chunks: ${chunks.length}`);
    console.log(`Total characters: ${fullResponse.length}`);
    console.log(`Full response: "${fullResponse}"`);
    console.log(`Response trimmed: "${fullResponse.trim()}"`);
    console.log(`Is empty: ${fullResponse.trim() === ''}`);
    console.log(`Contains only whitespace: ${!fullResponse.trim()}`);
    
  } catch (error) {
    console.log(`❌ Error with tools: ${error.message}`);
  }

  // Test without tools for comparison
  console.log('\n🔧 Testing WITHOUT tools (comparison)...');
  console.log('=========================================');
  
  try {
    const { textStream } = streamText({
      model,
      system: 'You are a helpful AI assistant. Always provide complete and helpful responses.',
      prompt: 'Hello! Please tell me about yourself and what you can help me with. Write at least 2-3 sentences.',
      maxTokens: 200
    });

    let fullResponse = '';
    let tokenCount = 0;
    
    console.log('📝 Streaming response:');
    console.log('----------------------');
    
    for await (const delta of textStream) {
      fullResponse += delta;
      tokenCount++;
      
      // Show first few chunks
      if (tokenCount <= 5 && delta.trim()) {
        console.log(`Chunk ${tokenCount}: "${delta}"`);
      }
    }
    
    console.log('\n📊 Response Analysis:');
    console.log('=====================');
    console.log(`Total characters: ${fullResponse.length}`);
    console.log(`First 100 chars: "${fullResponse.substring(0, 100)}"`);
    console.log(`Is empty: ${fullResponse.trim() === ''}`);
    
  } catch (error) {
    console.log(`❌ Error without tools: ${error.message}`);
  }

  console.log('\n🎯 Conclusion:');
  console.log('==============');
  console.log('If the response WITH tools is empty or minimal,');
  console.log('then Cerebras models have issues with tool definitions.');
  console.log('This would explain why your chat interface gets no response!');
}

testCerebrasDetailedResponse().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
