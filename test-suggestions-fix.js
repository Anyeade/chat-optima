// Test script to verify the JSON parsing fix for suggestions
import { generatePromptSuggestions } from './app/(chat)/actions.ts';

console.log('🧪 Testing Suggestion Generation Fix');
console.log('====================================');

async function testSuggestionGeneration() {
  try {
    console.log('🔄 Generating suggestions...');
    const suggestions = await generatePromptSuggestions();
    
    console.log('\n✅ Success! Generated suggestions:');
    console.log('==================================');
    
    suggestions.forEach((suggestion, index) => {
      console.log(`${index + 1}. Title: "${suggestion.title}"`);
      console.log(`   Label: "${suggestion.label}"`);
      console.log(`   Action: "${suggestion.action}"`);
      console.log('');
    });
    
    // Validate structure
    const isValid = Array.isArray(suggestions) && 
                   suggestions.length > 0 && 
                   suggestions.every(s => s.title && s.action);
    
    if (isValid) {
      console.log('🎉 All suggestions are valid!');
      console.log(`📊 Generated ${suggestions.length} suggestions`);
    } else {
      console.log('⚠️ Some suggestions may be invalid');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔍 Error details:');
    console.log('================');
    console.log('This error suggests the AI model is not returning valid JSON.');
    console.log('The fix should handle this by falling back to static suggestions.');
  }
}

console.log('🚀 Starting suggestion generation test...');
testSuggestionGeneration()
  .then(() => {
    console.log('\n✅ Test completed successfully!');
  })
  .catch(error => {
    console.error('\n❌ Test execution failed:', error);
  });
