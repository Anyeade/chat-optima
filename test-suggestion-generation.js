// Test script to debug prompt suggestion generation issues
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testSuggestionGeneration() {
  console.log('🧪 Testing Prompt Suggestion Generation');
  console.log('======================================');

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.log('❌ GROQ_API_KEY not found');
    return;
  }

  // Test the exact same model and configuration as in actions.ts
  const model = groq('llama3-70b-8192');
  
  const systemPrompt = `You are a JSON generator. ONLY return valid JSON, no explanations or additional text.

Generate exactly 5 diverse and engaging prompt suggestions for an AI chat interface.

CRITICAL: Return ONLY a valid JSON array with NO additional text, explanations, or formatting. Start directly with [ and end with ].

Format:
[
  {"title": "Create a modern website", "label": "for a tech startup", "action": "Create a modern website for a tech startup with hero section, features, and pricing"},
  {"title": "Write code to", "label": "demonstrate dijkstra's algorithm", "action": "Write code to demonstrate dijkstra's algorithm"},
  {"title": "Analyze the performance", "label": "of this React component", "action": "Analyze the performance of this React component and suggest optimizations"},
  {"title": "Help me plan", "label": "a weekend hiking trip", "action": "Help me plan a weekend hiking trip with route suggestions and gear recommendations"},
  {"title": "Explain the concept", "label": "of machine learning", "action": "Explain the concept of machine learning in simple terms with practical examples"}
]`;

  try {
    console.log('🔄 Testing suggestion generation...');
    
    const { text: suggestions } = await generateText({
      model,
      system: systemPrompt,
      prompt: 'Generate exactly 5 diverse prompt suggestions as valid JSON array only',
      maxTokens: 800,
    });

    console.log('\n📝 Raw Response:');
    console.log('================');
    console.log(suggestions);

    // Test the cleaning logic
    console.log('\n🧹 Testing Response Cleaning:');
    console.log('==============================');
    
    let cleanSuggestions = suggestions.trim();
    console.log('After trim:', cleanSuggestions.substring(0, 100) + '...');
    
    const startIndex = cleanSuggestions.indexOf('[');
    const endIndex = cleanSuggestions.lastIndexOf(']');
    
    console.log(`Start index: ${startIndex}, End index: ${endIndex}`);
    
    if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
      cleanSuggestions = cleanSuggestions.substring(startIndex, endIndex + 1);
      console.log('After extraction:', cleanSuggestions.substring(0, 100) + '...');
    }

    // Test parsing
    console.log('\n🔍 Testing JSON Parsing:');
    console.log('=========================');
    
    try {
      const parsedSuggestions = JSON.parse(cleanSuggestions);
      console.log('✅ JSON parsing successful');
      console.log(`Number of suggestions: ${parsedSuggestions.length}`);
      
      if (Array.isArray(parsedSuggestions) && parsedSuggestions.length > 0) {
        console.log('\n📋 Parsed Suggestions:');
        parsedSuggestions.forEach((suggestion, index) => {
          console.log(`${index + 1}. Title: "${suggestion.title}"`);
          console.log(`   Label: "${suggestion.label}"`);
          console.log(`   Action: "${suggestion.action}"`);
          
          // Check for incomplete suggestions
          if (suggestion.title && suggestion.title.length < 20) {
            console.log(`   ⚠️ WARNING: Title seems incomplete (${suggestion.title.length} chars)`);
          }
          if (suggestion.action && suggestion.action.length < 30) {
            console.log(`   ⚠️ WARNING: Action seems incomplete (${suggestion.action.length} chars)`);
          }
          console.log('');
        });
      }
    } catch (parseError) {
      console.log('❌ JSON parsing failed:', parseError.message);
      console.log('Raw content for debugging:', cleanSuggestions);
    }

  } catch (error) {
    console.log(`❌ Generation failed: ${error.message}`);
  }
}

async function testAlternativeModels() {
  console.log('\n🔄 Testing Alternative Models for Suggestions');
  console.log('==============================================');

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.log('❌ GROQ_API_KEY not found');
    return;
  }

  const modelsToTest = [
    'llama3-8b-8192',      // Smaller, might be more reliable
    'llama-3.1-8b-instant', // Different model variant
    'gemma2-9b-it'         // Different model family
  ];

  const simplePrompt = `Generate 5 prompt suggestions as JSON array:
[
  {"title": "Create a website", "label": "for startups", "action": "Create a modern website for a tech startup"},
  {"title": "Write code", "label": "in Python", "action": "Write Python code for data analysis"}
]`;

  for (const modelName of modelsToTest) {
    console.log(`\n🔄 Testing ${modelName}...`);
    
    try {
      const model = groq(modelName);
      const { text: response } = await generateText({
        model,
        system: 'You are a helpful assistant. Return only JSON.',
        prompt: simplePrompt,
        maxTokens: 500,
      });

      console.log(`   Response length: ${response.length} characters`);
      console.log(`   Preview: "${response.substring(0, 80)}..."`);
      
      // Quick validation
      if (response.includes('[') && response.includes(']')) {
        console.log('   ✅ Contains JSON array markers');
      } else {
        console.log('   ❌ Missing JSON array markers');
      }

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
}

async function main() {
  await testSuggestionGeneration();
  await testAlternativeModels();
  
  console.log('\n💡 Analysis:');
  console.log('=============');
  console.log('If the main model produces incomplete suggestions:');
  console.log('1. The model might be cutting off responses');
  console.log('2. The system prompt might be too complex');
  console.log('3. maxTokens might be too low');
  console.log('4. Try switching to a more reliable model');
}

main().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
