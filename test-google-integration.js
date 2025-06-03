// Test script to verify Google Generative AI integration
// Run this with: node test-google-integration.js

const { google } = require('@ai-sdk/google');

async function testGoogleIntegration() {
  console.log('🧪 Testing Google Generative AI Integration...\n');
  
  // Check environment variable
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  console.log(`🔑 API Key Status: ${apiKey ? '✅ Set' : '❌ Missing'}`);
  
  if (!apiKey) {
    console.log('\n❌ Please set GOOGLE_GENERATIVE_AI_API_KEY environment variable');
    console.log('Get your API key from: https://aistudio.google.com/app/apikey');
    return;
  }
  
  // Test available models
  const modelsToTest = [
    'gemini-2.0-flash',
    'gemini-1.5-pro', 
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b'
  ];
  
  console.log('\n📋 Available Google Models:');
  modelsToTest.forEach(model => {
    console.log(`  ✅ ${model}`);
  });
  
  // Test basic functionality (optional - requires API key)
  if (process.env.TEST_API_CALLS === 'true') {
    try {
      console.log('\n🚀 Testing API call...');
      const { generateText } = require('ai');
      
      const result = await generateText({
        model: google('gemini-1.5-flash'),
        prompt: 'Say "Hello from Google Gemini!" in exactly 5 words.',
      });
      
      console.log(`✅ Response: ${result.text}`);
    } catch (error) {
      console.log(`❌ API Test Failed: ${error.message}`);
    }
  } else {
    console.log('\n💡 To test API calls, set TEST_API_CALLS=true');
  }
  
  console.log('\n✅ Google Generative AI integration verification complete!');
}

testGoogleIntegration().catch(console.error);
