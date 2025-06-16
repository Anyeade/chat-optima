const fs = require('fs');
const path = require('path');

const JAMENDO_CLIENT_ID = '3efca530';
const JAMENDO_API_URL = 'https://api.jamendo.com/v3.0';

function getMoodTags(mood) {
  const moodMap = {
    'uplifting': 'uplifting,positive,happy',
    'energetic': 'energetic,upbeat,dynamic',
    'calm': 'calm,peaceful,relaxing',
    'dramatic': 'dramatic,epic,cinematic',
    'mysterious': 'mysterious,dark,atmospheric',
    'happy': 'happy,joyful,cheerful',
    'sad': 'sad,melancholy,emotional',
    'romantic': 'romantic,love,tender'
  };
  
  return moodMap[mood.toLowerCase()] || 'instrumental';
}

async function testJamendoAPI() {
  console.log('🎵 Testing Jamendo API...');
  
  const testMood = 'uplifting';
  const testDuration = 60; // 60 seconds
  
  try {
    // Map mood to Jamendo tags
    const moodTags = getMoodTags(testMood);
    console.log('🎭 Mood:', testMood);
    console.log('🏷️  Tags:', moodTags);
    console.log('⏱️  Duration:', testDuration, 'seconds');
    
    // Search for music from Jamendo
    const searchParams = {
      client_id: JAMENDO_CLIENT_ID,
      format: 'json',
      limit: '5',
      tags: moodTags,
      audioformat: 'mp3',
      include: 'musicinfo',
      groupby: 'artist_id',
      order: 'popularity_total'
    };
    
    const searchUrl = `${JAMENDO_API_URL}/tracks/?` + new URLSearchParams(searchParams);
    console.log('🔗 Search URL:', searchUrl);

    console.log('📡 Making API request...');
    const response = await fetch(searchUrl);

    console.log('📊 Response status:', response.status);
    console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Jamendo API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📦 API Response structure:');
    console.log('  - Results found:', data.results?.length || 0);
    console.log('  - Headers:', data.headers);
    
    if (!data.results || data.results.length === 0) {
      console.log('⚠️  No results found, trying fallback search...');
      
      // Fallback to a more generic search
      const fallbackParams = {
        client_id: JAMENDO_CLIENT_ID,
        format: 'json',
        limit: '5',
        tags: 'instrumental',
        audioformat: 'mp3',
        include: 'musicinfo',
        order: 'popularity_total'
      };
      
      const fallbackUrl = `${JAMENDO_API_URL}/tracks/?` + new URLSearchParams(fallbackParams);
      console.log('🔗 Fallback URL:', fallbackUrl);
      
      const fallbackResponse = await fetch(fallbackUrl);
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        console.log('📦 Fallback results found:', fallbackData.results?.length || 0);
        if (fallbackData.results && fallbackData.results.length > 0) {
          data.results = fallbackData.results;
        }
      }
    }

    if (!data.results || data.results.length === 0) {
      throw new Error('No music tracks found in Jamendo API');
    }

    // Display found tracks
    console.log('\n🎼 Found tracks:');
    data.results.forEach((track, index) => {
      console.log(`${index + 1}. "${track.name}" by ${track.artist_name}`);
      console.log(`   - Duration: ${track.duration} seconds`);
      console.log(`   - Audio URL: ${track.audio}`);
      console.log(`   - Tags: ${track.musicinfo?.tags?.vartags || 'No tags'}`);
    });

    // Select the first track for download
    const selectedTrack = data.results[0];
    console.log(`\n🎯 Selected track: "${selectedTrack.name}" by ${selectedTrack.artist_name}`);
    console.log('📡 Downloading audio...');

    // Download the audio file
    const audioResponse = await fetch(selectedTrack.audio);
    console.log('📊 Audio download status:', audioResponse.status);
    
    if (!audioResponse.ok) {
      throw new Error(`Audio download failed: ${audioResponse.status}`);
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    console.log('🎵 Audio buffer size:', audioBuffer.byteLength, 'bytes');
    
    // Validate audio
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
      console.log('⚠️  Audio format may be invalid');
    }

    // Save to project root
    const sanitizedName = selectedTrack.name.replace(/[^a-zA-Z0-9]/g, '_');
    const outputPath = path.join(__dirname, `test-jamendo-${sanitizedName}.mp3`);
    fs.writeFileSync(outputPath, Buffer.from(audioBuffer));
    
    console.log('💾 Audio saved to:', outputPath);
    console.log('✅ Jamendo API test completed successfully!');
    
    return {
      success: true,
      filePath: outputPath,
      size: audioBuffer.byteLength,
      hasValidHeaders: hasMP3Header || hasID3Header,
      trackInfo: {
        name: selectedTrack.name,
        artist: selectedTrack.artist_name,
        duration: selectedTrack.duration,
        url: selectedTrack.audio
      }
    };

  } catch (error) {
    console.error('❌ Jamendo API test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testJamendoAPI().then(result => {
  console.log('\n📊 Test Result:', result);
}).catch(error => {
  console.error('💥 Test crashed:', error);
});
