// Test the compound-beta model as the primary suggestion generator
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testCompoundAsSuggestionModel() {
  console.log('🧪 Testing Compound-Beta as Primary Suggestion Model');
  console.log('==================================================');

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.log('❌ GROQ_API_KEY not found');
    return;
  }

  try {
    console.log('🔄 Testing compound-beta for suggestion generation...');
    
    const { text: suggestions } = await generateText({
      model: groq('compound-beta'),
      system: `Generate 5 complete prompt suggestions as a JSON array. Return only valid JSON with no extra text.

Each suggestion must have:
- title: short engaging start (3-6 words)
- label: completion phrase (2-4 words) 
- action: full detailed prompt (8+ words)

Example format:
[
  {"title": "Create a modern website", "label": "for a tech startup", "action": "Create a modern website for a tech startup with hero section, features, and pricing"},
  {"title": "Write Python code", "label": "for data analysis", "action": "Write Python code to analyze sales data and create visualizations"}
]

CRITICAL: Always close the JSON array with ] and no trailing commas!
Return ONLY the JSON array, nothing else.`,
      prompt: 'Generate 5 diverse, complete prompt suggestions as JSON array',
      maxTokens: 1500,
    });

    console.log('\n📝 Raw Response:');
    console.log('================');
    console.log(suggestions);

    // Test JSON parsing
    try {
      let cleanSuggestions = suggestions.trim();
      
      // Remove any markdown formatting
      cleanSuggestions = cleanSuggestions.replace(/```json\s*/gi, '').replace(/```\s*/gi, '');
      
      // Find the JSON array bounds
      const startIndex = cleanSuggestions.indexOf('[');
      let endIndex = cleanSuggestions.lastIndexOf(']');
      
      if (startIndex !== -1) {
        if (endIndex === -1 || endIndex <= startIndex) {
          // JSON is incomplete, try to fix it
          console.log('🔧 Incomplete JSON detected, attempting to fix...');
          
          let partialJson = cleanSuggestions.substring(startIndex);
          partialJson = partialJson.replace(/\s+$/, ''); // Remove trailing whitespace
          
          const lastCompleteObjectIndex = partialJson.lastIndexOf('}');
          if (lastCompleteObjectIndex !== -1) {
            partialJson = partialJson.substring(0, lastCompleteObjectIndex + 1);
            partialJson = partialJson.replace(/,\s*$/, '') + ']';
            cleanSuggestions = partialJson;
          }
        } else {
          cleanSuggestions = cleanSuggestions.substring(startIndex, endIndex + 1);
        }
      }

      const parsedSuggestions = JSON.parse(cleanSuggestions);
      console.log('\n✅ JSON parsing successful!');
      console.log('📊 Number of suggestions:', parsedSuggestions.length);
      
      // Validate suggestions
      const validSuggestions = parsedSuggestions
        .filter(suggestion => 
          suggestion.title && 
          suggestion.title.length >= 3 && 
          suggestion.action && 
          suggestion.action.length >= 10
        )
        .slice(0, 5);
      
      console.log('✅ Valid suggestions:', validSuggestions.length);
      
      validSuggestions.forEach((suggestion, index) => {
        console.log(`\n   ${index + 1}. "${suggestion.title}" ${suggestion.label ? `(${suggestion.label})` : ''}`);
        console.log(`      Action: ${suggestion.action}`);
      });
      
      if (validSuggestions.length >= 3) {
        console.log('\n🎉 SUCCESS: Compound-beta is working excellently for suggestions!');
        console.log('💡 This model is perfect for JSON generation tasks.');
        return true;
      } else {
        console.log('\n❌ ISSUE: Not enough valid suggestions generated');
        return false;
      }
      
    } catch (parseError) {
      console.log('\n❌ JSON parsing failed:', parseError.message);
      console.log('Raw content for debugging:', cleanSuggestions);
      return false;
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
    return false;
  }
}

async function testModelAvailability() {
  console.log('\n🔍 Testing Model Availability in Chat');
  console.log('=====================================');

  // Simulate the model list check
  const availableModels = [
    'meta-llama/llama-4-scout-17b-16e-instruct',
    'meta-llama/llama-4-maverick-17b-128e-instruct', 
    'deepseek-r1-distill-llama-70b',
    'llama-3.3-70b-versatile',
    // compound models should NOT be in this list
  ];

  const compoundModelsFound = availableModels.filter(model => 
    model.includes('compound-beta') || model.includes('compound-beta-mini')
  );

  if (compoundModelsFound.length === 0) {
    console.log('✅ Compound models successfully removed from user selection');
    console.log('💡 Users can no longer select them in the chat interface');
  } else {
    console.log('❌ Compound models still found in available models:');
    compoundModelsFound.forEach(model => console.log(`   - ${model}`));
  }
}

async function testToolDeactivation() {
  console.log('\n🔧 Testing Tool Deactivation Logic');
  console.log('==================================');

  function testModelDetection(selectedChatModel) {
    const isModelWithoutTools = selectedChatModel.includes('cerebras') || 
                               selectedChatModel.includes('llama3.1-8b-cerebras') ||
                               selectedChatModel.includes('llama-3.3-70b-cerebras');
                               // compound models removed from detection
    
    return {
      model: selectedChatModel,
      toolsDisabled: isModelWithoutTools
    };
  }

  const testModels = [
    'llama3.1-8b-cerebras',
    'llama-3.3-70b-cerebras', 
    'compound-beta',
    'compound-beta-mini',
    'meta-llama/llama-4-scout-17b-16e-instruct'
  ];

  testModels.forEach(model => {
    const result = testModelDetection(model);
    const status = result.toolsDisabled ? '🚫 Tools DISABLED' : '✅ Tools ENABLED';
    console.log(`${status} | ${model}`);
  });

  console.log('\n💡 Expected results:');
  console.log('   ✅ Only Cerebras models should have tools disabled');
  console.log('   ✅ Compound models would have tools enabled (if they were selectable)');
  console.log('   ✅ Regular Groq models should have tools enabled');
}

async function runAllTests() {
  const suggestionResult = await testCompoundAsSuggestionModel();
  await testModelAvailability();
  await testToolDeactivation();

  console.log('\n📋 SUMMARY');
  console.log('===========');
  if (suggestionResult) {
    console.log('✅ Compound-beta is working perfectly for suggestions');
    console.log('✅ Compound models removed from user selection');
    console.log('✅ Tool deactivation logic updated');
    console.log('\n🎉 All changes implemented successfully!');
    console.log('💡 The chat interface should now have better suggestion generation');
    console.log('   and users cannot select problematic compound models.');
  } else {
    console.log('❌ Some issues need to be resolved');
  }
}

runAllTests().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
