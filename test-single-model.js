import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { generateText } from 'ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const googleAI = createOpenAICompatible({
  name: 'google-ai',
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || 'dummy-key',
});

console.log('🔍 Testing gemini-2.0-flash...');

async function testGemini2Flash() {
  try {
    const { text, usage } = await generateText({
      model: googleAI('gemini-2.0-flash'),
      prompt: 'Say "Hello World" and nothing else.',
      maxTokens: 50,
    });

    console.log(`✅ gemini-2.0-flash: "${text.trim()}"`);
    if (usage) {
      console.log(`   Tokens used: ${usage.totalTokens || 'N/A'}`);
    }
  } catch (error) {
    console.log('❌ gemini-2.0-flash failed:');
    console.log(`   Error: ${error.message}`);
    console.log(`   Status: ${error.status || 'N/A'}`);
    console.log(`   Code: ${error.code || 'N/A'}`);
    
    if (error.message.includes('quota') || error.message.includes('billing')) {
      console.log('   💡 Quota exceeded');
    }
  }
}

testGemini2Flash();
