import { xai } from '@ai-sdk/xai';
import { generateText } from 'ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🔍 Testing X.AI (Grok) Integration...\n');

// Check API key
const apiKey = process.env.XAI_API_KEY;
console.log(`API Key: ${apiKey ? `Set (length: ${apiKey.length})` : 'Not set'}\n`);

// Models to test
const models = [
  'grok-2-vision-1212',
  'grok-3-mini-beta', 
  'grok-2-1212'
];

async function testModel(modelName) {
  console.log(`➡️ Testing ${modelName}...`);
  
  try {
    const { text, usage } = await generateText({
      model: xai(modelName),
      prompt: 'Say "Hello from Grok!" and nothing else.',
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
      console.log(`   💡 Quota/billing issue detected`);
    }
    if (error.message.includes('credits')) {
      console.log(`   💡 Credit limit reached`);
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
  console.log('- Check credit balance for failed models');
  console.log('- Verify API key has access to Grok models');
}

runTests().catch(console.error);
