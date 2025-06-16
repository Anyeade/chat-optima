const fs = require('fs');
const path = require('path');

const VOICE_RSS_API_KEY = '219b11995be34d5d84dd5a87500d2a5e';
const VOICE_RSS_URL = 'https://api.voicerss.org/';

async function testVoiceRSSAPI() {
  console.log('🎤 Testing VoiceRSS API...');
  
  const testScript = "Hello! This is a test of the VoiceRSS API. If you can hear this clearly, the API is working perfectly.";
  
  try {
    // Test parameters for VoiceRSS
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

    console.log('📝 Script:', testScript);
    console.log('🔧 Parameters:', voiceParams);
    
    // Create form data for VoiceRSS API
    const formData = new URLSearchParams(voiceParams);

    console.log('📡 Making API request...');
    const response = await fetch(VOICE_RSS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    console.log('📊 Response status:', response.status);
    console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`VoiceRSS API error: ${response.status} - ${errorText}`);
    }

    // Get the audio data
    const audioBuffer = await response.arrayBuffer();
    console.log('🎵 Audio buffer size:', audioBuffer.byteLength, 'bytes');
    
    // Check if it's actually audio data
    const audioBytes = new Uint8Array(audioBuffer);
    const hasMP3Header = audioBytes[0] === 0xFF && (audioBytes[1] & 0xE0) === 0xE0;
    const hasID3Header = audioBytes[0] === 0x49 && audioBytes[1] === 0x44 && audioBytes[2] === 0x33;
    
    console.log('🔍 Audio validation:');
    console.log('  - Has MP3 header:', hasMP3Header);
    console.log('  - Has ID3 header:', hasID3Header);
    console.log('  - First 16 bytes:', Array.from(audioBytes.slice(0, 16)).map(b => b.toString(16).padStart(2, '0')).join(' '));
    
    if (hasMP3Header || hasID3Header) {
      console.log('✅ Valid MP3 audio detected!');
    } else {
      console.log('⚠️  Audio format may be invalid or response is an error message');
      // Try to decode as text to see if it's an error
      try {
        const textContent = new TextDecoder().decode(audioBytes);
        console.log('📄 Response as text:', textContent.substring(0, 200));
      } catch (e) {
        console.log('❌ Cannot decode as text either');
      }
    }

    // Save to project root
    const outputPath = path.join(__dirname, 'test-voicerss-output.mp3');
    fs.writeFileSync(outputPath, Buffer.from(audioBuffer));
    
    console.log('💾 Audio saved to:', outputPath);
    console.log('✅ VoiceRSS API test completed successfully!');
    
    return {
      success: true,
      filePath: outputPath,
      size: audioBuffer.byteLength,
      hasValidHeaders: hasMP3Header || hasID3Header
    };

  } catch (error) {
    console.error('❌ VoiceRSS API test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testVoiceRSSAPI().then(result => {
  console.log('\n📊 Test Result:', result);
}).catch(error => {
  console.error('💥 Test crashed:', error);
});
