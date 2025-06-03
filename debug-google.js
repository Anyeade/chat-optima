// Debug script for Google Generative AI
// Run this to test Google model specifically

const { google } = require('@ai-sdk/google');
const { generateText } = require('ai');

async function debugGoogleModel() {
  console.log('🔍 Debugging Google Generative AI...\n');
  
  // Check environment
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || 'AIzaSyC77P7YZBOg7da3fIbQWrd2uat4UWKclVc';
  console.log(`API Key: ${apiKey ? 'Set (length: ' + apiKey.length + ')' : 'Missing'}`);
  
  if (!apiKey) {
    console.log('❌ No API key found. Please set GOOGLE_GENERATIVE_AI_API_KEY');
    return;
  }
  
  console.log('\n🧪 Testing Google models...');
  
  // Test the most common working models first
  const modelsToTest = [
    'gemini-1.5-flash',      // Most reliable
    'gemini-1.5-pro',        // Second most reliable  
    'gemini-2.0-flash',      // Newest, might have availability issues
    'gemini-1.5-flash-8b',   // Smallest
    
    // Alternative names to try
    'models/gemini-1.5-flash',
    'models/gemini-1.5-pro',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro-latest',
  ];
  
  for (const modelId of modelsToTest) {
    try {
      console.log(`\n➡️ Testing ${modelId}...`);
        const result = await generateText({
        model: google(modelId, { apiKey: apiKey }), // Pass API key explicitly
        prompt: 'Say "Hello" in exactly one word.',
        maxTokens: 10,
      });
      
      console.log(`✅ ${modelId}: "${result.text}"`);
      console.log(`   Tokens used: ${result.usage?.totalTokens || 'unknown'}`);
      
    } catch (error) {
      console.log(`❌ ${modelId} failed:`);
      console.log(`   Error: ${error.message}`);
      console.log(`   Status: ${error.status || 'N/A'}`);
      console.log(`   Code: ${error.code || 'N/A'}`);
      
      // Check for specific error types
      if (error.message?.includes('not found')) {
        console.log(`   💡 Model "${modelId}" may not exist or be available in your region`);
      } else if (error.message?.includes('API key')) {
        console.log(`   💡 API key issue detected`);
      } else if (error.message?.includes('quota')) {
        console.log(`   💡 Quota exceeded`);
      } else if (error.message?.includes('permission')) {
        console.log(`   💡 Permission denied - check API key permissions`);
      }
      
      if (error.response?.data) {
        console.log(`   Response data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
  }
  
  console.log('\n📝 Recommendations:');
  console.log('1. Try using "gemini-1.5-flash" first (most stable)');
  console.log('2. Check if your API key has access to Gemini 2.0 models');
  console.log('3. Verify your API key at: https://aistudio.google.com/app/apikey');
  console.log('4. Check if models are available in your region');
}

debugGoogleModel().catch(console.error);
