// Debug test for problematic providers
import { groq } from '@ai-sdk/groq';
import { cohere } from '@ai-sdk/cohere';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { generateText } from 'ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🔍 Debugging Problematic Providers');
console.log('=================================');

// Test Groq with simple prompt
async function testGroq() {
  console.log('\n🔄 Testing Groq...');
  console.log(`API Key: ${process.env.GROQ_API_KEY ? 'Set' : 'Missing'}`);
  
  try {
    const { text } = await generateText({
      model: groq('compound-beta'),
      prompt: 'Say "Hello from Groq" and nothing else.',
      maxTokens: 50,
    });
    
    console.log(`✅ Groq SUCCESS: "${text}"`);
  } catch (error) {
    console.log(`❌ Groq ERROR: ${error.message}`);
    console.log(`   Status: ${error.status || 'N/A'}`);
    console.log(`   Code: ${error.code || 'N/A'}`);
  }
}

// Test Cohere with simple prompt
async function testCohere() {
  console.log('\n🔄 Testing Cohere...');
  console.log(`API Key: ${process.env.COHERE_API_KEY ? 'Set' : 'Missing'}`);
  
  try {
    const { text } = await generateText({
      model: cohere('command-a-03-2025'),
      prompt: 'Say "Hello from Cohere" and nothing else.',
      maxTokens: 50,
    });
    
    console.log(`✅ Cohere SUCCESS: "${text}"`);
  } catch (error) {
    console.log(`❌ Cohere ERROR: ${error.message}`);
    console.log(`   Status: ${error.status || 'N/A'}`);
    console.log(`   Code: ${error.code || 'N/A'}`);
  }
}

// Test Requesty AI with simple prompt
async function testRequesty() {
  console.log('\n🔄 Testing Requesty AI...');
  console.log(`API Key: ${process.env.REQUESTY_AI_API_KEY ? 'Set' : 'Missing'}`);
  
  const requestyAI = createOpenAICompatible({
    name: 'requesty-ai',
    baseURL: 'https://router.requesty.ai/v1',
    apiKey: process.env.REQUESTY_AI_API_KEY || 'dummy-key',
    headers: { 'User-Agent': 'ChatOptima/1.0' },
  });
  
  try {
    const { text } = await generateText({
      model: requestyAI('google/gemini-2.0-flash-exp'),
      prompt: 'Say "Hello from Requesty" and nothing else.',
      maxTokens: 50,
    });
    
    console.log(`✅ Requesty SUCCESS: "${text}"`);
  } catch (error) {
    console.log(`❌ Requesty ERROR: ${error.message}`);
    console.log(`   Status: ${error.status || 'N/A'}`);
    console.log(`   Code: ${error.code || 'N/A'}`);
  }
}

async function runDiagnostics() {
  await testGroq();
  await testCohere();
  await testRequesty();
  
  console.log('\n🏁 Diagnostics Complete');
  console.log('\n💡 Common Issues:');
  console.log('• API key format problems');
  console.log('• Model ID not available');
  console.log('• Rate limiting');
  console.log('• Authentication errors');
}

runDiagnostics().catch(error => {
  console.error('❌ Diagnostic failed:', error);
  process.exit(1);
});
