import { xai } from '@ai-sdk/xai';
import { generateText } from 'ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🔍 Testing Grok Mini (grok-3-mini-beta)...\n');

// Check API key
const apiKey = process.env.XAI_API_KEY;
console.log(`API Key: ${apiKey ? `Set (length: ${apiKey.length})` : 'Not set'}\n`);

async function testGrokMini() {
  console.log('➡️ Testing grok-3-mini-beta...');
  
  try {
    const { text, usage } = await generateText({
      model: xai('grok-3-mini-beta'),
      prompt: 'Say "Hello from Grok Mini!" and explain what you are in one sentence.',
      maxTokens: 100,
    });

    console.log(`✅ grok-3-mini-beta: "${text.trim()}"`);
    if (usage) {
      console.log(`   Tokens used: ${usage.totalTokens || 'N/A'}`);
      console.log(`   Prompt tokens: ${usage.promptTokens || 'N/A'}`);
      console.log(`   Completion tokens: ${usage.completionTokens || 'N/A'}`);
    }
    
    console.log('\n🎉 Grok Mini test successful!');
    
  } catch (error) {
    console.log('❌ grok-3-mini-beta failed:');
    console.log(`   Error: ${error.message}`);
    console.log(`   Status: ${error.status || 'N/A'}`);
    console.log(`   Code: ${error.code || 'N/A'}`);
    
    if (error.message.includes('quota') || error.message.includes('billing')) {
      console.log('   💡 Quota/billing issue detected');
    }
    if (error.message.includes('credits')) {
      console.log('   💡 Credit limit reached');
    }
    if (error.message.includes('unauthorized') || error.message.includes('401')) {
      console.log('   💡 Check your XAI_API_KEY in .env.local');
    }
    
    console.log('\n❌ Grok Mini test failed!');
  }
}

testGrokMini().catch(console.error);
