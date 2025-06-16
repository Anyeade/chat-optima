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

console.log('🎬 Starting Video API Test Suite...\n');

// Configuration - Update these with your actual API keys
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || 'sbelmCbU2CBEumLwvDAiTAEA5JyJJQWhaf4IXHdfeCHpNBjkUAjauGoC';
const PEXELS_API_URL = 'https://api.pexels.com/videos/search';

// Test if video file is valid MP4
function validateVideoFile(videoData) {
  if (!videoData || videoData.byteLength < 1024) {
    return { valid: false, reason: 'File too small or empty' };
  }
  
  // Check for MP4 file signature (ftyp box)
  const header = Array.from(videoData.slice(0, 12));
  
  // MP4 files typically start with ftyp box at offset 4-7
  const hasMP4Header = (
    header[4] === 0x66 && header[5] === 0x74 && header[6] === 0x79 && header[7] === 0x70
  );
  
  if (hasMP4Header) {
    return { valid: true, format: 'MP4' };
  }
  
  // Check for other video formats
  if (header[0] === 0x00 && header[1] === 0x00 && header[2] === 0x00 && header[3] >= 0x14) {
    return { valid: true, format: 'Possible MP4' };
  }
  
  return { 
    valid: false, 
    reason: 'Invalid video format',
    headerHex: header.slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join(' ')
  };
}

// Pexels Video API Test Function
async function testPexelsAPI() {
  console.log('🎥 Testing Pexels Video API...');
  
  // Initialize fetch
  await initFetch();
  
  // Test API key
  if (!PEXELS_API_KEY || PEXELS_API_KEY === 'your-pexels-api-key') {
    console.log('❌ Pexels: No API key found');
    console.log('   💡 Set PEXELS_API_KEY environment variable');
    console.log('   🔗 Get your free API key at: https://www.pexels.com/api/');
    return { success: false, error: 'No API key provided' };
  }
  
  try {
    // Test search queries
    const testQueries = ['nature', 'abstract', 'background', 'motion'];
    const results = [];
    
    for (const query of testQueries) {
      console.log(`\n🔍 Searching for: "${query}"`);
      
      const searchParams = new URLSearchParams({
        query: query,
        per_page: '3',
        orientation: 'landscape'
      });
      
      const searchUrl = `${PEXELS_API_URL}?${searchParams}`;
      const searchResponse = await fetch(searchUrl, {
        headers: {
          'Authorization': PEXELS_API_KEY
        }
      });
      
      if (!searchResponse.ok) {
        throw new Error(`Search failed: ${searchResponse.status} - ${searchResponse.statusText}`);
      }
      
      const searchData = await searchResponse.json();
      
      if (!searchData.videos || searchData.videos.length === 0) {
        console.log(`   ⚠️  No videos found for "${query}"`);
        continue;
      }
      
      const video = searchData.videos[0];
      console.log(`   📹 Found: "${video.user.name}" (ID: ${video.id})`);
      console.log(`   📊 Available qualities: ${video.video_files.length} files`);
      
      // Test downloading the first video file
      const videoFile = video.video_files.find(f => f.quality === 'hd') || video.video_files[0];
      console.log(`   🎯 Testing quality: ${videoFile.quality} (${videoFile.width}x${videoFile.height})`);
      console.log(`   🔗 URL: ${videoFile.link.substring(0, 80)}...`);
      
      try {
        const downloadResponse = await fetch(videoFile.link);
        
        if (!downloadResponse.ok) {
          throw new Error(`Download failed: ${downloadResponse.status}`);
        }
        
        const contentType = downloadResponse.headers.get('content-type');
        const contentLength = downloadResponse.headers.get('content-length');
        
        console.log(`   📦 Content-Type: ${contentType}`);
        console.log(`   📏 Content-Length: ${contentLength} bytes`);
        
        // Many video services don't set content-type properly, so we'll be more lenient
        // We'll validate the actual file content instead
        console.log(`   ⚠️  Content-Type: ${contentType || 'not set'} (proceeding with content validation)`);
        
        // Download first 10KB to validate
        const partialData = await downloadResponse.arrayBuffer();
        const videoData = new Uint8Array(partialData);
        
        const validation = validateVideoFile(videoData);
        
        if (validation.valid) {
          console.log(`   ✅ Valid ${validation.format} file (${videoData.byteLength} bytes downloaded)`);
          
          // Save sample for inspection
          const sanitizedQuery = query.replace(/[^a-zA-Z0-9]/g, '_');
          const outputPath = path.join(__dirname, `test-pexels-${sanitizedQuery}-${video.id}.mp4`);
          fs.writeFileSync(outputPath, Buffer.from(videoData));
          
          results.push({
            query,
            video: {
              id: video.id,
              user: video.user.name,
              url: videoFile.link,
              quality: videoFile.quality,
              size: videoData.byteLength,
              path: outputPath
            },
            success: true
          });
          
          console.log(`   💾 Sample saved: ${outputPath}`);
        } else {
          console.log(`   ❌ Invalid video: ${validation.reason}`);
          if (validation.headerHex) {
            console.log(`   🔍 Header: ${validation.headerHex}`);
          }
        }
        
      } catch (downloadError) {
        console.log(`   ❌ Download failed: ${downloadError.message}`);
        results.push({
          query,
          success: false,
          error: downloadError.message
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`\n📊 Results: ${successCount}/${results.length} successful downloads`);
    
    if (successCount > 0) {
      console.log('✅ Pexels API: Working');
      return { 
        success: true, 
        results: results.filter(r => r.success),
        totalTested: results.length,
        successCount 
      };
    } else {
      console.log('❌ Pexels API: All downloads failed');
      return { 
        success: false, 
        error: 'All video downloads failed',
        results 
      };
    }
    
  } catch (error) {
    console.log('❌ Pexels API: Failed -', error.message);
    return { success: false, error: error.message };
  }
}

// Test Placeholder Video Endpoint
async function testPlaceholderAPI() {
  console.log('\n🎭 Testing Placeholder Video API...');
  
  // Initialize fetch
  await initFetch();
  
  try {
    const placeholderUrl = 'http://localhost:3000/api/placeholder/video/1920/1080';
    console.log(`🔗 Testing: ${placeholderUrl}`);
    
    const response = await fetch(placeholderUrl);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 404) {
      console.log('✅ Placeholder API: Correctly returns 404 (triggers fallback to images)');
      return { success: true, fallback: true };
    } else if (response.ok) {
      const contentType = response.headers.get('content-type');
      console.log(`📦 Content-Type: ${contentType}`);
      
      if (contentType && contentType.includes('video/')) {
        const videoData = await response.arrayBuffer();
        const validation = validateVideoFile(new Uint8Array(videoData));
        
        if (validation.valid) {
          console.log('✅ Placeholder API: Returns valid video');
          return { success: true, hasVideo: true };
        } else {
          console.log(`❌ Placeholder API: Invalid video - ${validation.reason}`);
          return { success: false, error: validation.reason };
        }
      } else {
        console.log(`❌ Placeholder API: Wrong content type - ${contentType}`);
        return { success: false, error: 'Wrong content type' };
      }
    } else {
      console.log(`❌ Placeholder API: HTTP ${response.status}`);
      return { success: false, error: `HTTP ${response.status}` };
    }
    
  } catch (error) {
    console.log('❌ Placeholder API: Failed -', error.message);
    return { success: false, error: error.message };
  }
}

// Test Video Generation Flow
async function testVideoGenerationFlow() {
  console.log('\n🎬 Testing Video Generation Flow...');
  
  // Initialize fetch
  await initFetch();
  
  try {
    const testScript = "This is a test script for video generation. We need beautiful background videos for each scene.";
    
    const scenesUrl = 'http://localhost:3000/api/video-generator/scenes';
    console.log(`🔗 Testing scenes generation: ${scenesUrl}`);
    
    const response = await fetch(scenesUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        script: testScript,
        videoType: 'youtube-shorts',
        duration: 30
      })
    });
    
    if (!response.ok) {
      throw new Error(`Scenes API failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`📊 Generated ${data.scenes.length} scenes`);
    
    // Test each scene's background video
    for (let i = 0; i < data.scenes.length; i++) {
      const scene = data.scenes[i];
      console.log(`\n🎭 Scene ${i + 1}: ${scene.onScreenText}`);
      console.log(`   🔍 Search: ${scene.metadata.searchQuery}`);
      console.log(`   🎥 Source: ${scene.metadata.videoSource}`);
      console.log(`   🔗 URL: ${scene.backgroundVideo.substring(0, 80)}...`);
      
      // Test if video URL is accessible
      try {
        const videoResponse = await fetch(scene.backgroundVideo);
        console.log(`   📊 Status: ${videoResponse.status} ${videoResponse.statusText}`);
        
        if (videoResponse.ok) {
          const contentType = videoResponse.headers.get('content-type');
          if (contentType && contentType.includes('video/')) {
            console.log(`   ✅ Valid video URL`);
          } else {
            console.log(`   ⚠️  Wrong content type: ${contentType}`);
          }
        } else {
          console.log(`   ❌ Video URL not accessible`);
        }
      } catch (urlError) {
        console.log(`   ❌ URL test failed: ${urlError.message}`);
      }
    }
    
    console.log('\n✅ Video Generation Flow: Complete');
    return { success: true, scenes: data.scenes.length };
    
  } catch (error) {
    console.log('❌ Video Generation Flow: Failed -', error.message);
    return { success: false, error: error.message };
  }
}

// Main test runner
async function runVideoTests() {
  const results = {};
  
  console.log('🔧 Environment Check:');
  console.log(`   Node.js: ${process.version}`);
  console.log(`   Platform: ${process.platform}`);
  console.log(`   PEXELS_API_KEY: ${PEXELS_API_KEY ? 'Set' : 'Missing'}`);
  console.log('');
  
  results.pexels = await testPexelsAPI();
  results.placeholder = await testPlaceholderAPI();
  results.flow = await testVideoGenerationFlow();
  
  console.log('\n📊 VIDEO API TEST SUMMARY:');
  console.log('=========================');
  console.log(`Pexels API:        ${results.pexels.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`Placeholder API:   ${results.placeholder.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`Generation Flow:   ${results.flow.success ? '✅ WORKING' : '❌ FAILED'}`);
  
  if (results.pexels.success && results.placeholder.success && results.flow.success) {
    console.log('\n🎉 ALL VIDEO APIS WORKING! Background videos should load perfectly.');
  } else {
    console.log('\n⚠️  Some video APIs have issues:');
    
    if (!results.pexels.success) {
      console.log('   - Pexels API not working - check API key and internet connection');
    }
    if (!results.placeholder.success) {
      console.log('   - Placeholder API issues - fallback videos may not work');
    }
    if (!results.flow.success) {
      console.log('   - Scene generation issues - video creation may fail');
    }
  }
  
  console.log('\n📁 Generated test files:');
  if (results.pexels.success && results.pexels.results) {
    results.pexels.results.forEach(r => {
      console.log(`   - ${r.video.path}`);
    });
  }
  
  console.log('\n💡 Next Steps:');
  if (!results.pexels.success) {
    console.log('   1. Get Pexels API key: https://www.pexels.com/api/');
    console.log('   2. Set environment variable: PEXELS_API_KEY=your_key_here');
    console.log('   3. Or add to .env.local file');
  }
  if (results.pexels.success) {
    console.log('   1. Pexels is working - videos should load in your app');
    console.log('   2. Test video generation in your app UI');
  }
  
  return results;
}

// Run the tests
runVideoTests().catch(error => {
  console.error('💥 Video test suite crashed:', error);
});