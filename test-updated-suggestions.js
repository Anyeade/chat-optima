// Simple test for the updated suggestion generation
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testUpdatedSuggestionGeneration() {
  console.log('🧪 Testing Updated Suggestion Generation');
  console.log('========================================');

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.log('❌ GROQ_API_KEY not found');
    return;
  }

  // Test with the new model (llama3-8b-8192)
  const model = groq('llama3-8b-8192');
  
  const systemPrompt = `Generate 5 complete prompt suggestions as a JSON array. Return only valid JSON with no extra text.

Each suggestion must have:
- title: short engaging start (3-6 words)
- label: completion phrase (2-4 words) 
- action: full detailed prompt (8+ words)

Example format:
[
  {"title": "Create a modern website", "label": "for a tech startup", "action": "Create a modern website for a tech startup with hero section, features, and pricing"},
  {"title": "Write Python code", "label": "for data analysis", "action": "Write Python code to analyze sales data and create visualizations"}
]

Return ONLY the JSON array, nothing else.`;

  try {
    console.log('🔄 Testing with new model and prompt...');
    
    const { text: suggestions } = await generateText({
      model,
      system: systemPrompt,
      prompt: 'Generate 5 diverse, complete prompt suggestions as JSON array',
      maxTokens: 1000,
    });

    console.log('\n📝 Raw Response:');
    console.log('================');
    console.log(suggestions);

    // Test the new cleaning logic
    console.log('\n🧹 Testing New Cleaning Logic:');
    console.log('===============================');
    
    let cleanSuggestions = suggestions.trim();
    console.log('1. After trim:', cleanSuggestions.substring(0, 100) + '...');
    
    // Remove any markdown formatting
    cleanSuggestions = cleanSuggestions.replace(/```json\s*/gi, '').replace(/```\s*/gi, '');
    console.log('2. After markdown removal:', cleanSuggestions.substring(0, 100) + '...');
    
    // Find the JSON array bounds
    const startIndex = cleanSuggestions.indexOf('[');
    const endIndex = cleanSuggestions.lastIndexOf(']');
    
    console.log(`3. Start index: ${startIndex}, End index: ${endIndex}`);
    
    if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
      cleanSuggestions = cleanSuggestions.substring(startIndex, endIndex + 1);
      console.log('4. After extraction:', cleanSuggestions.substring(0, 100) + '...');
    }

    // Test parsing and validation
    console.log('\n🔍 Testing Parsing and Validation:');
    console.log('===================================');
    
    try {
      const parsedSuggestions = JSON.parse(cleanSuggestions);
      console.log('✅ JSON parsing successful');
      console.log(`Number of suggestions: ${parsedSuggestions.length}`);
      
      if (Array.isArray(parsedSuggestions) && parsedSuggestions.length > 0) {
        // Test validation logic
        const validSuggestions = parsedSuggestions
          .filter(suggestion => 
            suggestion.title && 
            suggestion.title.length >= 3 && 
            suggestion.action && 
            suggestion.action.length >= 10
          )
          .slice(0, 5);
        
        console.log(`Valid suggestions after filtering: ${validSuggestions.length}`);
        
        console.log('\n📋 Final Processed Suggestions:');
        validSuggestions.forEach((suggestion, index) => {
          const processed = {
            title: suggestion.title.trim(),
            label: (suggestion.label || '').trim(),
            action: suggestion.action.trim(),
          };
          
          console.log(`${index + 1}. Title: "${processed.title}" (${processed.title.length} chars)`);
          console.log(`   Label: "${processed.label}" (${processed.label.length} chars)`);
          console.log(`   Action: "${processed.action}" (${processed.action.length} chars)`);
          
          // Check for quality
          if (processed.title.length < 10) {
            console.log(`   ⚠️ Title might be too short`);
          }
          if (processed.action.length < 20) {
            console.log(`   ⚠️ Action might be too short`);
          }
          if (processed.title.includes('Design a futuristic') || 
              processed.title.includes('Plan a') ||
              processed.title.includes('Tell me more')) {
            console.log(`   ❌ ISSUE: Found problematic incomplete suggestion!`);
          } else {
            console.log(`   ✅ Suggestion looks complete`);
          }
          console.log('');
        });

        if (validSuggestions.length >= 3) {
          console.log('🎉 SUCCESS: Generated sufficient valid suggestions!');
        } else {
          console.log('❌ FAILED: Not enough valid suggestions');
        }
      }
    } catch (parseError) {
      console.log('❌ JSON parsing failed:', parseError.message);
      console.log('Raw content for debugging:', cleanSuggestions);
    }

  } catch (error) {
    console.log(`❌ Generation failed: ${error.message}`);
  }
}

testUpdatedSuggestionGeneration().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
