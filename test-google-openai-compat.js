import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { generateText } from 'ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Create Google OpenAI-compatible provider
const googleAI = createOpenAICompatible({
  name: 'google-ai',
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || 'dummy-key',
});

console.log('🔍 Testing Google Gemini via OpenAI-compatible endpoint...\n');

// Check API key
const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
console.log(`API Key: ${apiKey ? `Set (length: ${apiKey.length})` : 'Not set'}\n`);

// Models to test
const models = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash-exp',
  'gemini-2.0-flash-thinking-exp-01-21'
];

async function testModel(modelName) {
  console.log(`➡️ Testing ${modelName}...`);
  
  try {
    const { text, usage } = await generateText({
      model: googleAI(modelName),
      prompt: 'Say "Hello World" and nothing else.',
      maxTokens: 50,
    });

    console.log(`✅ ${modelName}: "${text.trim()}"`);
    if (usage) {
      console.log(`   Tokens used: ${usage.totalTokens || 'N/A'}`);
    }
  } catch (error) {
    console.log(`❌ ${modelName} failed:`);
    console.log(`   Error: ${error.message}`);
    console.log(`   Status: ${error.status || 'N/A'}`);
    console.log(`   Code: ${error.code || 'N/A'}`);
    
    if (error.message.includes('quota') || error.message.includes('billing')) {
      console.log(`   💡 Quota exceeded`);
    }
  }
  console.log('');
}

async function runTests() {
  for (const model of models) {
    await testModel(model);
  }
  
  console.log('📝 Test Results Summary:');
  console.log('- Use working models in the Chat Optima interface');
  console.log('- Check quota limits for failed models');
  console.log('- Verify API key has access to Gemini 2.0 models');
}

runTests().catch(console.error);
