// Comprehensive provider diagnosis script
const https = require('https');

// Test different configurations for OpenRouter and Cerebras
async function testProviderConfig(name, config) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔍 Testing ${name}...`);
    console.log(`URL: https://${config.hostname}${config.path}`);
    console.log(`Headers:`, JSON.stringify(config.headers, null, 2));

    const req = https.request(config, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const success = res.statusCode === 200;
        console.log(`${success ? '✅' : '❌'} ${name}: ${res.statusCode} ${res.statusMessage}`);
        
        if (!success) {
          console.log(`Error Response:`, data.substring(0, 500));
        } else {
          try {
            const parsed = JSON.parse(data);
            console.log(`✅ Success! Found ${parsed.data?.length || 0} models`);
          } catch (e) {
            console.log(`✅ Success! Response length: ${data.length}`);
          }
        }
        
        resolve({ name, success, status: res.statusCode, response: data });
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${name} Connection Error:`, error.message);
      reject(error);
    });

    req.end();
  });
}

async function main() {
  console.log('🔬 Provider Configuration Diagnosis');
  console.log('=====================================');

  // Check environment variables
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const cerebrasKey = process.env.CEREBRAS_API_KEY;
  const vercelUrl = process.env.VERCEL_URL;

  console.log('\n📋 Environment Variables:');
  console.log(`OPENROUTER_API_KEY: ${openrouterKey ? 'Set ✅' : 'Missing ❌'}`);
  console.log(`CEREBRAS_API_KEY: ${cerebrasKey ? 'Set ✅' : 'Missing ❌'}`);
  console.log(`VERCEL_URL: ${vercelUrl || 'Not set (using fallback)'}`);

  const tests = [];

  // Test OpenRouter with different header configurations
  if (openrouterKey) {
    // Configuration 1: Minimal headers (like working providers)
    tests.push(testProviderConfig('OpenRouter (Minimal)', {
      hostname: 'openrouter.ai',
      path: '/api/v1/models',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json'
      }
    }));

    // Configuration 2: With referer (current config)
    tests.push(testProviderConfig('OpenRouter (With Referer)', {
      hostname: 'openrouter.ai',
      path: '/api/v1/models',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
        'HTTP-Referer': vercelUrl || 'https://chat-optima.vercel.app',
        'X-Title': 'Chat Optima',
        'Content-Type': 'application/json'
      }
    }));
  }

  // Test Cerebras with different configurations
  if (cerebrasKey) {
    // Configuration 1: Minimal (like working providers)
    tests.push(testProviderConfig('Cerebras (Minimal)', {
      hostname: 'api.cerebras.ai',
      path: '/v1/models',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cerebrasKey}`,
        'Content-Type': 'application/json'
      }
    }));
  }

  if (tests.length === 0) {
    console.log('\n❌ No API keys found. Set OPENROUTER_API_KEY and/or CEREBRAS_API_KEY');
    return;
  }

  try {
    console.log('\n🚀 Running Tests...');
    const results = await Promise.allSettled(tests);

    console.log('\n📊 Results Summary:');
    console.log('==================');
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const { name, success, status } = result.value;
        console.log(`${success ? '✅' : '❌'} ${name}: ${status}`);
      } else {
        console.log(`❌ Test ${index + 1}: ${result.reason.message}`);
      }
    });

    console.log('\n💡 Recommendations:');
    console.log('===================');
    
    const successfulConfigs = results
      .filter(r => r.status === 'fulfilled' && r.value.success)
      .map(r => r.value.name);

    if (successfulConfigs.length > 0) {
      console.log('✅ Use the configuration that worked:');
      successfulConfigs.forEach(config => console.log(`   - ${config}`));
    } else {
      console.log('❌ All configurations failed. Check:');
      console.log('   1. API keys are correct and active');
      console.log('   2. API keys have proper permissions');
      console.log('   3. No rate limiting or account issues');
      console.log('   4. Firewall/network restrictions');
    }

  } catch (error) {
    console.error('❌ Test execution failed:', error);
  }
}

main().catch(console.error);
