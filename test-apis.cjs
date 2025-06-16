const fs = require('fs');
const path = require('path');

// Initialize fetch - will be set in initFetch function
let fetch;

async function initFetch() {
  if (fetch) return fetch;
  
  try {
    // Try to use global fetch first (Node 18+)
    if (typeof globalThis.fetch !== 'undefined') {
      fetch = globalThis.fetch;
      return fetch;
    }
    throw new Error('Native fetch not available');
  } catch (error) {
    // Fallback to dynamic import for node-fetch
    const { default: nodeFetch } = await import('node-fetch');
    fetch = nodeFetch;
    return fetch;
  }
}

console.log('🚀 Starting Audio API Test Suite...\n');

const VOICE_RSS_API_KEY = '219b11995be34d5d84dd5a87500d2a5e';
const VOICE_RSS_URL = 'https://api.voicerss.org/';
const JAMENDO_CLIENT_ID = '3efca530';
const JAMENDO_API_URL = 'https://api.jamendo.com/v3.0';

// VoiceRSS Test Function
async function testVoiceRSS() {
  console.log('🎤 Testing VoiceRSS API...');
  
  // Initialize fetch
  await initFetch();
  
  const testScript = "Testing VoiceRSS API. This audio should be clear and high quality.";
  
  try {
    const voiceParams = {
      key: VOICE_RSS_API_KEY,
      src: testScript,
      hl: 'en-us',
      v: 'Linda',
      c: 'MP3',
      f: '44khz_16bit_stereo',
      ssml: 'false',
      b64: 'false'
    };

    const formData = new URLSearchParams(voiceParams);
    const response = await fetch(VOICE_RSS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    if (!response.ok) {
      throw new Error(`VoiceRSS API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBufferNode = Buffer.from(audioBuffer);
    const audioBytes = new Uint8Array(audioBufferNode);
    const hasValidHeaders = (audioBytes[0] === 0xFF && (audioBytes[1] & 0xE0) === 0xE0) || 
                           (audioBytes[0] === 0x49 && audioBytes[1] === 0x44 && audioBytes[2] === 0x33);
    
    const outputPath = path.join(__dirname, 'test-voicerss-output.mp3');
    fs.writeFileSync(outputPath, audioBufferNode);
    
    console.log('✅ VoiceRSS: Success');
    console.log(`   📁 File: ${outputPath}`);
    console.log(`   📊 Size: ${audioBufferNode.length} bytes`);
    console.log(`   🔍 Valid MP3: ${hasValidHeaders}`);
    
    return { success: true, path: outputPath, size: audioBufferNode.length };
  } catch (error) {
    console.log('❌ VoiceRSS: Failed -', error.message);
    return { success: false, error: error.message };
  }
}

// Jamendo Test Function
function getMoodTags(mood) {
  const moodMap = {
    'uplifting': 'uplifting,positive,happy',
    'energetic': 'energetic,upbeat,dynamic',
    'calm': 'calm,peaceful,relaxing'
  };
  return moodMap[mood.toLowerCase()] || 'instrumental';
}

async function testJamendo() {
  console.log('\n🎵 Testing Jamendo API...');
  
  // Initialize fetch
  await initFetch();
  
  try {
    const searchParams = {
      client_id: JAMENDO_CLIENT_ID,
      format: 'json',
      limit: '3',
      audioformat: 'mp31',
      include: 'musicinfo',
      order: 'popularity_total'
    };
    
    const searchUrl = `${JAMENDO_API_URL}/tracks/?` + new URLSearchParams(searchParams);
    const response = await fetch(searchUrl);

    if (!response.ok) {
      throw new Error(`Jamendo API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      throw new Error('No tracks found');
    }

    const track = data.results[0];
    console.log(`🎼 Selected: "${track.name}" by ${track.artist_name}`);
    
    const audioResponse = await fetch(track.audio);
    if (!audioResponse.ok) {
      throw new Error(`Audio download failed: ${audioResponse.status}`);
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    const audioBufferNode = Buffer.from(audioBuffer);
    const audioBytes = new Uint8Array(audioBufferNode);
    const hasValidHeaders = (audioBytes[0] === 0xFF && (audioBytes[1] & 0xE0) === 0xE0) || 
                           (audioBytes[0] === 0x49 && audioBytes[1] === 0x44 && audioBytes[2] === 0x33);
    
    const sanitizedName = track.name.replace(/[^a-zA-Z0-9]/g, '_');
    const outputPath = path.join(__dirname, `test-jamendo-${sanitizedName}.mp3`);
    fs.writeFileSync(outputPath, audioBufferNode);
    
    console.log('✅ Jamendo: Success');
    console.log(`   📁 File: ${outputPath}`);
    console.log(`   📊 Size: ${audioBufferNode.length} bytes`);
    console.log(`   🔍 Valid MP3: ${hasValidHeaders}`);
    
    return { success: true, path: outputPath, size: audioBufferNode.length, track: track.name };
  } catch (error) {
    console.log('❌ Jamendo: Failed -', error.message);
    return { success: false, error: error.message };
  }
}

// Test both APIs
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
  } else {
    console.log('\n⚠️  Some APIs failed. Check the errors above.');
  }
  
  console.log('\n📁 Generated files:');
  if (results.voiceRSS.success) console.log(`   - ${results.voiceRSS.path}`);
  if (results.jamendo.success) console.log(`   - ${results.jamendo.path}`);
  
  return results;
}

// Run the tests
runTests().catch(error => {
  console.error('💥 Test suite crashed:', error);
}); 