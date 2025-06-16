const https = require('https');
const fs = require('fs');
const path = require('path');
const { URLSearchParams } = require('url');

console.log('🚀 Starting Audio API Test Suite...\n');

const VOICE_RSS_API_KEY = '219b11995be34d5d84dd5a87500d2a5e';
const JAMENDO_CLIENT_ID = '3efca530';

// Helper function to make HTTPS requests
function httpsRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = Buffer.alloc(0);
      
      res.on('data', (chunk) => {
        data = Buffer.concat([data, chunk]);
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test VoiceRSS API
async function testVoiceRSS() {
  console.log('🎤 Testing VoiceRSS API...');
  
  try {
    const testScript = "Testing VoiceRSS API. This audio should be clear and high quality.";
    
    const params = new URLSearchParams({
      key: VOICE_RSS_API_KEY,
      src: testScript,
      hl: 'en-us',
      v: 'Linda',
      c: 'MP3',
      f: '44khz_16bit_stereo',
      ssml: 'false',
      b64: 'false'
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(params.toString())
      },
      body: params.toString()
    };

    const response = await httpsRequest('https://api.voicerss.org/', options);
    
    console.log(`📊 Response status: ${response.statusCode}`);
    
    if (response.statusCode !== 200) {
      const errorText = response.data.toString();
      throw new Error(`VoiceRSS API error: ${response.statusCode} - ${errorText}`);
    }

    const audioBuffer = response.data;
    console.log(`🎵 Audio buffer size: ${audioBuffer.length} bytes`);
    
    // Validate audio
    const hasMP3Header = audioBuffer[0] === 0xFF && (audioBuffer[1] & 0xE0) === 0xE0;
    const hasID3Header = audioBuffer[0] === 0x49 && audioBuffer[1] === 0x44 && audioBuffer[2] === 0x53;
    
    console.log('🔍 Audio validation:');
    console.log(`   - Has MP3 header: ${hasMP3Header}`);
    console.log(`   - Has ID3 header: ${hasID3Header}`);
    console.log(`   - First 16 bytes: ${audioBuffer.slice(0, 16).toString('hex')}`);
    
    if (!hasMP3Header && !hasID3Header) {
      // Might be an error message
      const textContent = audioBuffer.toString('utf8');
      if (textContent.includes('ERROR') || textContent.includes('error')) {
        throw new Error(`VoiceRSS returned error: ${textContent}`);
      }
    }
    
    const outputPath = path.join(__dirname, 'test-voicerss-output.mp3');
    fs.writeFileSync(outputPath, audioBuffer);
    
    console.log('✅ VoiceRSS: Success');
    console.log(`   📁 File: ${outputPath}`);
    console.log(`   📊 Size: ${audioBuffer.length} bytes`);
    console.log(`   🔍 Valid MP3: ${hasMP3Header || hasID3Header}`);
    
    return { 
      success: true, 
      path: outputPath, 
      size: audioBuffer.length,
      validAudio: hasMP3Header || hasID3Header
    };
    
  } catch (error) {
    console.log('❌ VoiceRSS: Failed -', error.message);
    return { success: false, error: error.message };
  }
}

// Test Jamendo API
async function testJamendo() {
  console.log('\n🎵 Testing Jamendo API...');
  
  try {
    const searchParams = new URLSearchParams({
      client_id: JAMENDO_CLIENT_ID,
      format: 'json',
      limit: '3',
      tags: 'uplifting,positive,happy',
      audioformat: 'mp3',
      include: 'musicinfo',
      order: 'popularity_total'
    });
    
    const searchUrl = `https://api.jamendo.com/v3.0/tracks/?${searchParams.toString()}`;
    console.log(`🔗 Search URL: ${searchUrl}`);
    
    const response = await httpsRequest(searchUrl);
    
    console.log(`📊 Response status: ${response.statusCode}`);
    
    if (response.statusCode !== 200) {
      throw new Error(`Jamendo API error: ${response.statusCode}`);
    }

    const data = JSON.parse(response.data.toString());
    console.log(`📦 Found ${data.results?.length || 0} tracks`);
    
    if (!data.results || data.results.length === 0) {
      // Try fallback search
      console.log('⚠️  No results, trying fallback...');
      const fallbackParams = new URLSearchParams({
        client_id: JAMENDO_CLIENT_ID,
        format: 'json',
        limit: '3',
        tags: 'instrumental',
        audioformat: 'mp3',
        order: 'popularity_total'
      });
      
      const fallbackUrl = `https://api.jamendo.com/v3.0/tracks/?${fallbackParams.toString()}`;
      const fallbackResponse = await httpsRequest(fallbackUrl);
      
      if (fallbackResponse.statusCode === 200) {
        const fallbackData = JSON.parse(fallbackResponse.data.toString());
        if (fallbackData.results && fallbackData.results.length > 0) {
          data.results = fallbackData.results;
        }
      }
    }

    if (!data.results || data.results.length === 0) {
      throw new Error('No music tracks found');
    }

    const track = data.results[0];
    console.log(`🎼 Selected: "${track.name}" by ${track.artist_name}`);
    console.log(`🔗 Audio URL: ${track.audio}`);
    
    // Download the audio
    const audioResponse = await httpsRequest(track.audio);
    
    if (audioResponse.statusCode !== 200) {
      throw new Error(`Audio download failed: ${audioResponse.statusCode}`);
    }

    const audioBuffer = audioResponse.data;
    console.log(`🎵 Audio buffer size: ${audioBuffer.length} bytes`);
    
    // Validate audio
    const hasMP3Header = audioBuffer[0] === 0xFF && (audioBuffer[1] & 0xE0) === 0xE0;
    const hasID3Header = audioBuffer[0] === 0x49 && audioBuffer[1] === 0x44 && audioBuffer[2] === 0x53;
    
    const sanitizedName = track.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    const outputPath = path.join(__dirname, `test-jamendo-${sanitizedName}.mp3`);
    fs.writeFileSync(outputPath, audioBuffer);
    
    console.log('✅ Jamendo: Success');
    console.log(`   📁 File: ${outputPath}`);
    console.log(`   📊 Size: ${audioBuffer.length} bytes`);
    console.log(`   🔍 Valid MP3: ${hasMP3Header || hasID3Header}`);
    
    return { 
      success: true, 
      path: outputPath, 
      size: audioBuffer.length, 
      track: track.name,
      validAudio: hasMP3Header || hasID3Header
    };
    
  } catch (error) {
    console.log('❌ Jamendo: Failed -', error.message);
    return { success: false, error: error.message };
  }
}

// Run all tests
async function runTests() {
  const results = {};
  
  results.voiceRSS = await testVoiceRSS();
  results.jamendo = await testJamendo();
  
  console.log('\n📊 TEST SUMMARY:');
  console.log('================');
  console.log(`VoiceRSS API: ${results.voiceRSS.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`Jamendo API:  ${results.jamendo.success ? '✅ WORKING' : '❌ FAILED'}`);
  
  if (results.voiceRSS.success && results.jamendo.success) {
    console.log('\n🎉 ALL APIS WORKING! Your video generator should work perfectly.');
    console.log('🔊 Audio Quality Check:');
    console.log(`   - VoiceRSS valid audio: ${results.voiceRSS.validAudio}`);
    console.log(`   - Jamendo valid audio: ${results.jamendo.validAudio}`);
  } else {
    console.log('\n⚠️  Some APIs failed. Check the errors above.');
  }
  
  console.log('\n📁 Generated files:');
  if (results.voiceRSS.success) console.log(`   - ${results.voiceRSS.path}`);
  if (results.jamendo.success) console.log(`   - ${results.jamendo.path}`);
  
  console.log('\n💡 You can play these files to verify audio quality!');
  
  return results;
}

// Start the tests
runTests().catch(error => {
  console.error('💥 Test suite crashed:', error);
});
