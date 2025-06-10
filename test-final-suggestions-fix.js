// Test the improved suggestion generation with better JSON completion
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testImprovedSuggestions() {
  console.log('🧪 Testing Improved Suggestion Generation');
  console.log('=========================================');

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.log('❌ GROQ_API_KEY not found');
    return;
  }

  try {
    // Use the updated model and prompt
    console.log('🔄 Testing with Gemma2-9b-it model...');
    
    const { text: suggestions } = await generateText({
      model: groq('gemma2-9b-it'),
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

    console.log('\n🧹 Testing Improved Cleaning Logic:');
    console.log('====================================');
    
    // Test the improved cleaning logic
    let cleanSuggestions = suggestions.trim();
    console.log('1. After trim:', cleanSuggestions.substring(0, 80) + '...');
    
    // Remove any markdown formatting
    cleanSuggestions = cleanSuggestions.replace(/```json\s*/gi, '').replace(/```\s*/gi, '');
    console.log('2. After markdown removal:', cleanSuggestions.substring(0, 80) + '...');
    
    // Find the JSON array bounds
    const startIndex = cleanSuggestions.indexOf('[');
    let endIndex = cleanSuggestions.lastIndexOf(']');
    console.log('3. Start index:', startIndex, 'End index:', endIndex);
    
    if (startIndex !== -1) {
      if (endIndex === -1 || endIndex <= startIndex) {
        // JSON is incomplete, try to fix it
        console.log('4. Incomplete JSON detected, attempting to fix...');
        
        // Get everything from [ onwards
        let partialJson = cleanSuggestions.substring(startIndex);
        console.log('5. Partial JSON:', partialJson.substring(0, 100) + '...');
        
        // Clean up any trailing whitespace and incomplete parts
        partialJson = partialJson.replace(/\s+$/, ''); // Remove trailing whitespace
        console.log('6. After whitespace removal:', partialJson.substring(0, 100) + '...');
        
        // Remove any trailing incomplete object or malformed content
        const lastCompleteObjectIndex = partialJson.lastIndexOf('}');
        console.log('7. Last complete object at index:', lastCompleteObjectIndex);
        
        if (lastCompleteObjectIndex !== -1) {
          partialJson = partialJson.substring(0, lastCompleteObjectIndex + 1);
          console.log('8. After trimming to last complete object:', partialJson.substring(0, 100) + '...');
          
          // Remove any trailing comma and close the array
          partialJson = partialJson.replace(/,\s*$/, '') + ']';
          cleanSuggestions = partialJson;
          console.log('9. Final cleaned JSON:', cleanSuggestions.substring(0, 100) + '...');
        }
      } else {
        console.log('4. Complete JSON found, extracting...');
        cleanSuggestions = cleanSuggestions.substring(startIndex, endIndex + 1);
      }
    }

    console.log('\n🔍 Testing Parsing and Validation:');
    console.log('===================================');
    
    try {
      const parsedSuggestions = JSON.parse(cleanSuggestions);
      console.log('✅ JSON parsing successful!');
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
        console.log(`   ${index + 1}. "${suggestion.title}" ${suggestion.label ? `(${suggestion.label})` : ''}`);
        console.log(`      Action: ${suggestion.action.substring(0, 80)}...`);
      });
      
      if (validSuggestions.length >= 3) {
        console.log('\n🎉 SUCCESS: Suggestion generation is working properly!');
        return true;
      } else {
        console.log('\n❌ ISSUE: Not enough valid suggestions generated');
        return false;
      }
      
    } catch (parseError) {
      console.log('❌ JSON parsing failed:', parseError.message);
      console.log('Raw content for debugging:', cleanSuggestions);
      return false;
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
    return false;
  }
}

testImprovedSuggestions().then(success => {
  if (success) {
    console.log('\n💡 The suggestion generation should now work in the chat interface!');
  } else {
    console.log('\n💡 Additional debugging may be needed.');
  }
}).catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
