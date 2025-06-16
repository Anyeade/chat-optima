#!/usr/bin/env node

const testCompleteVideoFlow = async () => {
  console.log('🎬 Testing Complete Video Generation Flow...\n');

  const baseUrl = 'http://localhost:3000';
  
  // Test 1: Scene Generation API
  console.log('🎭 Testing Scene Generation...');
  try {
    const scenesResponse = await fetch(`${baseUrl}/api/video-generator/scenes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        script: '10 Uplifting Moments to Brighten Your Day',
        videoType: 'youtube-shorts',
        duration: 30
      })
    });
    
    if (scenesResponse.ok) {
      const scenesData = await scenesResponse.json();
      console.log(`✅ Scenes API working - ${scenesData.scenes?.length || 0} scenes generated`);
      
      if (scenesData.scenes && scenesData.scenes.length > 0) {
        const firstScene = scenesData.scenes[0];
        console.log(`📋 First scene details:`);
        console.log(`   Video URL: ${firstScene.backgroundVideo}`);
        console.log(`   Image URL: ${firstScene.imageUrl || 'Not provided'}`);
        console.log(`   Duration: ${firstScene.duration}s`);
        console.log(`   Text: ${firstScene.onScreenText}`);
        
        // Test 2: Video Proxy with actual scene video
        if (firstScene.backgroundVideo) {
          console.log('\n🔄 Testing Video Proxy with scene video...');
          const proxyUrl = `${baseUrl}/api/video-proxy?url=${encodeURIComponent(firstScene.backgroundVideo)}`;
          
          const proxyResponse = await fetch(proxyUrl, { method: 'HEAD' });
          console.log(`   Proxy status: ${proxyResponse.status} ${proxyResponse.statusText}`);
          console.log(`   Content-Type: ${proxyResponse.headers.get('content-type')}`);
          console.log(`   CORS: ${proxyResponse.headers.get('access-control-allow-origin')}`);
          
          if (proxyResponse.ok) {
            console.log('✅ Video proxy working for scene videos');
          } else {
            console.log('❌ Video proxy failed for scene videos');
          }
        }
        
        // Return scene data for browser testing
        return scenesData.scenes;
      }
    } else {
      console.log('❌ Scenes API failed');
      const error = await scenesResponse.text();
      console.log(`Error: ${error}`);
    }
  } catch (error) {
    console.log('❌ Scenes API test failed');
    console.error('Error:', error.message);
  }
  
  // Test 3: Music Generation API
  console.log('\n🎵 Testing Music Generation...');
  try {
    const musicResponse = await fetch(`${baseUrl}/api/video-generator/music`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mood: 'uplifting',
        duration: 30,
        volume: 40
      })
    });
    
    if (musicResponse.ok) {
      const musicData = await musicResponse.json();
      console.log(`✅ Music API working - URL: ${musicData.musicUrl || 'No URL returned'}`);
    } else {
      console.log('❌ Music API failed');
      const error = await musicResponse.text();
      console.log(`Error: ${error}`);
    }
  } catch (error) {
    console.log('❌ Music API test failed');
    console.error('Error:', error.message);
  }

  return null;
};

// Test browser compatibility
const generateBrowserTest = (scenes) => {
  if (!scenes || scenes.length === 0) {
    console.log('\n⚠️  No scenes data to generate browser test');
    return;
  }

  const browserTestCode = `
// 🧪 Browser Video Loading Test
// Copy and paste this into your browser console

console.log('🎬 Testing video loading in browser...');

const testScenes = ${JSON.stringify(scenes, null, 2)};

async function testVideoLoading() {
  for (let i = 0; i < testScenes.length; i++) {
    const scene = testScenes[i];
    console.log(\`\\n🎯 Testing scene \${i + 1}: \${scene.backgroundVideo}\`);
    
    try {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.playsInline = true;
      
      // Use proxy URL
      const proxyUrl = \`/api/video-proxy?url=\${encodeURIComponent(scene.backgroundVideo)}\`;
      console.log(\`🔄 Using proxy: \${proxyUrl}\`);
      
      const loadPromise = new Promise((resolve, reject) => {
        video.onloadedmetadata = () => {
          console.log(\`✅ Video \${i + 1} loaded: \${video.videoWidth}x\${video.videoHeight}, \${video.duration}s\`);
          resolve(video);
        };
        video.onerror = (e) => {
          console.error(\`❌ Video \${i + 1} failed:\`, e);
          reject(e);
        };
      });
      
      video.src = proxyUrl;
      await loadPromise;
      
    } catch (error) {
      console.error(\`❌ Video \${i + 1} loading failed:\`, error);
      
      // Test fallback image
      if (scene.imageUrl) {
        console.log(\`🖼️ Testing fallback image: \${scene.imageUrl}\`);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        const imgPromise = new Promise((resolve, reject) => {
          img.onload = () => {
            console.log(\`✅ Fallback image \${i + 1} loaded: \${img.width}x\${img.height}\`);
            resolve(img);
          };
          img.onerror = reject;
        });
        img.src = scene.imageUrl;
        await imgPromise;
      }
    }
  }
  
  console.log('\\n🎬 Browser test complete!');
}

testVideoLoading();
`;

  console.log('\n🌐 Browser Test Code:');
  console.log('===============================================');
  console.log(browserTestCode);
  console.log('===============================================');
  console.log('\n💡 Instructions:');
  console.log('1. Open your browser to http://localhost:3000');
  console.log('2. Open Developer Tools (F12)');
  console.log('3. Go to Console tab');
  console.log('4. Copy and paste the code above');
  console.log('5. Press Enter to run the test');
};

// Run the complete test
(async () => {
  const scenes = await testCompleteVideoFlow();
  generateBrowserTest(scenes);
  
  console.log('\n📊 Test Summary:');
  console.log('================');
  console.log('✅ = Working correctly');
  console.log('❌ = Needs fixing');
  console.log('⚠️  = Warning/partial issue');
  console.log('\nIf all tests pass, video generation should work in your app!');
})();
