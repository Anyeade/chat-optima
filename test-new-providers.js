// Test script for the newly added providers (OpenRouter and Cerebras)
const https = require('https');

// Test function to check API connectivity
async function testProvider(name, options) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`\n📡 ${name} Test Results:`);
        console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
        console.log(`Headers:`, res.headers);
        
        if (res.statusCode === 200) {
          console.log(`✅ ${name} API is working!`);
          console.log(`Response preview:`, JSON.stringify(JSON.parse(data), null, 2).substring(0, 500));
        } else {
          console.log(`❌ ${name} API failed:`);
          console.log(`Response:`, data);
        }
        
        resolve({
          name,
          status: res.statusCode,
          success: res.statusCode === 200,
          response: data
        });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${name} Connection Error:`, error.message);
      reject(error);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function main() {
  console.log('🔬 Testing New Providers (OpenRouter & Cerebras)');
  console.log('='.repeat(60));
  
  // Check environment variables
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const cerebrasKey = process.env.CEREBRAS_API_KEY;
  
  console.log('Environment Variables:');
  console.log(`OPENROUTER_API_KEY: ${openrouterKey ? `${openrouterKey.substring(0, 8)}...` : '❌ Not set'}`);
  console.log(`CEREBRAS_API_KEY: ${cerebrasKey ? `${cerebrasKey.substring(0, 8)}...` : '❌ Not set'}`);
  
  const tests = [];
  
  // Test OpenRouter
  if (openrouterKey) {
    tests.push(testProvider('OpenRouter', {
      hostname: 'openrouter.ai',
      port: 443,
      path: '/api/v1/models',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
        'HTTP-Referer': 'https://localhost:3000',
        'X-Title': 'Chat Optima Test',
        'Content-Type': 'application/json'
      }
    }));
  } else {
    console.log('⚠️ Skipping OpenRouter test - API key not found');
  }
  
  // Test Cerebras
  if (cerebrasKey) {
    tests.push(testProvider('Cerebras', {
      hostname: 'api.cerebras.ai',
      port: 443,
      path: '/v1/models',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cerebrasKey}`,
        'User-Agent': 'Chat-Optima/1.0',
        'Content-Type': 'application/json'
      }
    }));
  } else {
    console.log('⚠️ Skipping Cerebras test - API key not found');
  }
  
  if (tests.length === 0) {
    console.log('❌ No API keys found. Please set OPENROUTER_API_KEY and/or CEREBRAS_API_KEY environment variables.');
    return;
  }
  
  try {
    const results = await Promise.allSettled(tests);
    
    console.log('\n📊 Summary:');
    console.log('='.repeat(30));
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const { name, success } = result.value;
        console.log(`${name}: ${success ? '✅ Working' : '❌ Failed'}`);
      } else {
        console.log(`Test ${index + 1}: ❌ Error - ${result.reason.message}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
main().catch(console.error);
