#!/usr/bin/env node

const http = require('http');

const testVideoProxy = async () => {
  console.log('🧪 Testing Video Proxy API...\n');

  // Test video URL from your Pexels API
  const testVideoUrl = 'https://videos.pexels.com/video-files/3571264/3571264-hd_1280_720_30fps.mp4';
  const proxyUrl = `http://localhost:3000/api/video-proxy?url=${encodeURIComponent(testVideoUrl)}`;

  console.log(`🔗 Testing proxy URL: ${proxyUrl}`);
  console.log(`🎬 Original video: ${testVideoUrl}\n`);

  try {
    // Make request to proxy
    const response = await fetch(proxyUrl);
    
    console.log(`📊 Proxy Response:`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Content-Type: ${response.headers.get('content-type')}`);
    console.log(`   Content-Length: ${response.headers.get('content-length')} bytes`);
    console.log(`   Accept-Ranges: ${response.headers.get('accept-ranges')}`);
    console.log(`   CORS Origin: ${response.headers.get('access-control-allow-origin')}`);
    console.log(`   Cache-Control: ${response.headers.get('cache-control')}`);
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('video')) {
        console.log('\n✅ Video proxy is working correctly!');
        console.log('🎯 Videos should now load in the browser');
      } else {
        console.log('\n⚠️  Proxy returned non-video content');
      }
    } else {
      console.log('\n❌ Proxy failed');
      const errorText = await response.text();
      console.log(`Error: ${errorText}`);
    }

  } catch (error) {
    console.log('\n❌ Failed to test proxy');
    console.error('Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure your Next.js dev server is running:');
      console.log('   npm run dev');
    }
  }
};

// Test the direct API call also
const testDirectAPI = async () => {
  console.log('\n🔧 Testing direct Pexels API...');
  
  const testVideoUrl = 'https://videos.pexels.com/video-files/3571264/3571264-hd_1280_720_30fps.mp4';
  
  try {
    const response = await fetch(testVideoUrl, {
      method: 'HEAD', // Just check headers
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log(`📊 Direct API Response:`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Content-Type: ${response.headers.get('content-type')}`);
    console.log(`   Content-Length: ${response.headers.get('content-length')} bytes`);
    console.log(`   Accept-Ranges: ${response.headers.get('accept-ranges')}`);
    console.log(`   CORS Origin: ${response.headers.get('access-control-allow-origin') || 'NOT SET'}`);
    
    if (response.ok) {
      console.log('\n✅ Direct API access works');
      if (!response.headers.get('access-control-allow-origin')) {
        console.log('🔒 CORS headers missing - proxy is needed');
      }
    }
    
  } catch (error) {
    console.log('\n❌ Direct API test failed');
    console.error('Error:', error.message);
  }
};

// Run tests
(async () => {
  await testVideoProxy();
  await testDirectAPI();
  
  console.log('\n📝 Summary:');
  console.log('1. If proxy works: Video loading should be fixed');
  console.log('2. If direct API has no CORS: Proxy is necessary');
  console.log('3. Check browser console for video loading logs');
})();
