// Simple debug script to test one provider at a time
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

console.log('🔍 Testing Groq Provider');
console.log('========================');

async function testGroq() {
  try {
    console.log('Testing Groq with simple prompt...');
    
    const result = await generateText({
      model: groq('meta-llama/llama-4-scout-17b-16e-instruct'),
      prompt: "Hello! Please respond with a simple greeting.",
      maxTokens: 50,
    });
    
    console.log('✅ Groq Response:', result.text);
    console.log('📊 Response length:', result.text.length);
    
  } catch (error) {
    console.log('❌ Groq Error:', error.message);
    console.log('Full error:', error);
  }
}

testGroq();
