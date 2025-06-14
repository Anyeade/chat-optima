// Test actual Groq model availability
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function testGroqModels() {
  console.log('🔍 Testing Groq Model Availability');
  console.log('==================================');
  
  if (!GROQ_API_KEY) {
    console.log('❌ No Groq API key found');
    return;
  }
  
  console.log('✅ Groq API key found:', GROQ_API_KEY.substring(0, 20) + '...');
  
  // Test fetching available models
  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n📋 Available Groq Models:');
      data.data.forEach(model => {
        console.log(`- ${model.id}`);
      });
      
      // Check if our models exist
      const modelIds = data.data.map(m => m.id);
      const ourModels = [
        'meta-llama/llama-4-scout-17b-16e-instruct',
        'compound-beta'
      ];
      
      console.log('\n🎯 Our Model Status:');
      ourModels.forEach(modelId => {
        const exists = modelIds.includes(modelId);
        console.log(`${exists ? '✅' : '❌'} ${modelId}`);
        if (!exists) {
          // Find similar models
          const similar = modelIds.filter(id => 
            id.includes('llama') || id.includes('scout') || id.includes('compound')
          );
          if (similar.length > 0) {
            console.log(`   📋 Similar models: ${similar.join(', ')}`);
          }
        }
      });
      
    } else {
      console.log('❌ Failed to fetch models:', response.status, response.statusText);
      const text = await response.text();
      console.log('Response:', text);
    }
  } catch (error) {
    console.log('❌ Error fetching models:', error.message);
  }
}

// Test individual model with simple chat completion
async function testSpecificModel(modelId) {
  console.log(`\n🔍 Testing Model: ${modelId}`);
  console.log('=' .repeat(40));
  
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'user', content: 'Hello! Please say hi back.' }
        ],
        max_tokens: 50,
        stream: false
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      const message = data.choices[0]?.message?.content || 'No content';
      console.log(`✅ ${modelId} works:`, message);
    } else {
      console.log(`❌ ${modelId} failed:`, response.status, response.statusText);
      const text = await response.text();
      console.log('Error response:', text.substring(0, 500));
    }
  } catch (error) {
    console.log(`❌ ${modelId} error:`, error.message);
  }
}

async function runGroqTests() {
  await testGroqModels();
  
  // Test the models we're trying to use
  const modelsToTest = [
    'meta-llama/llama-4-scout-17b-16e-instruct',
    'compound-beta',
    'llama-3.3-70b-versatile', // This should exist
    'mixtral-8x7b-32768' // This should exist
  ];
  
  for (const modelId of modelsToTest) {
    await testSpecificModel(modelId);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit
  }
}

runGroqTests();
