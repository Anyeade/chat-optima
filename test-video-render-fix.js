#!/usr/bin/env node

/**
 * Test script for video render API fix
 * Tests the /api/video-generator/render endpoint
 */

async function testVideoRenderAPI() {
  console.log('🧪 Testing Video Render API Fix...\n');

  const testData = {
    script: "Welcome to our amazing video! This is a test of the video generation system.",
    scenes: [
      {
        title: "Welcome Scene",
        description: "This is the opening scene of our video",
        duration: 3,
        transition: "fade",
        textPosition: "center"
      },
      {
        title: "Main Content",
        description: "Here we show the main content of the video",
        duration: 4,
        transition: "slide",
        textPosition: "bottom"
      },
      {
        title: "Conclusion",
        description: "Thank you for watching our video",
        duration: 3,
        transition: "fade",
        textPosition: "center"
      }
    ],
    videoType: "youtube-long",
    duration: 10
  };

  try {
    console.log('📡 Sending request to video render API...');
    
    const response = await fetch('http://localhost:3000/api/video-generator/render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log(`📊 Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      return false;
    }

    const result = await response.json();
    
    console.log('\n✅ Video Render API Response:');
    console.log('- Video URL length:', result.videoUrl?.length || 'N/A');
    console.log('- Is Base64:', result.isBase64);
    console.log('- Metadata:', {
      videoType: result.metadata?.videoType,
      duration: result.metadata?.duration,
      resolution: result.metadata?.resolution,
      aspectRatio: result.metadata?.aspectRatio,
      sceneCount: result.metadata?.sceneCount,
      isRealVideo: result.metadata?.isRealVideo,
      fileSize: result.metadata?.fileSize
    });

    if (result.metadata?.renderingSteps) {
      console.log('- Rendering steps:');
      result.metadata.renderingSteps.forEach((step, i) => {
        console.log(`  ${i + 1}. ${step}`);
      });
    }

    if (result.metadata?.fallbackReason) {
      console.log('⚠️ Fallback reason:', result.metadata.fallbackReason);
    }

    // Validate video URL format
    if (result.videoUrl && result.videoUrl.startsWith('data:video/mp4;base64,')) {
      console.log('✅ Video URL format is valid');
      
      // Check if base64 data is reasonable length
      const base64Data = result.videoUrl.split(',')[1];
      if (base64Data && base64Data.length > 100) {
        console.log('✅ Video data appears to contain actual content');
      } else {
        console.log('⚠️ Video data seems too small');
      }
    } else {
      console.log('❌ Invalid video URL format');
    }

    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Test error handling
async function testErrorHandling() {
  console.log('\n🧪 Testing Error Handling...\n');

  try {
    console.log('📡 Sending invalid request (missing required fields)...');
    
    const response = await fetch('http://localhost:3000/api/video-generator/render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}) // Empty request
    });

    console.log(`📊 Response status: ${response.status} ${response.statusText}`);

    if (response.status === 400) {
      const errorResult = await response.json();
      console.log('✅ Error handling works correctly:', errorResult.error);
      return true;
    } else {
      console.log('❌ Expected 400 status for invalid request');
      return false;
    }

  } catch (error) {
    console.error('❌ Error handling test failed:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Video Render API Tests\n');
  console.log('=' * 50);

  const test1 = await testVideoRenderAPI();
  const test2 = await testErrorHandling();

  console.log('\n' + '=' * 50);
  console.log('📋 Test Results:');
  console.log(`✅ Valid request test: ${test1 ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ Error handling test: ${test2 ? 'PASSED' : 'FAILED'}`);
  
  if (test1 && test2) {
    console.log('\n🎉 All tests passed! Video render API is working correctly.');
  } else {
    console.log('\n❌ Some tests failed. Please check the API implementation.');
  }
}

// Check if we can connect to the server first
async function checkServerConnection() {
  try {
    const response = await fetch('http://localhost:3000/ping');
    if (response.ok) {
      console.log('✅ Server is running');
      return true;
    }
  } catch (error) {
    console.log('❌ Server not running. Please start with: npm run dev');
    return false;
  }
  return false;
}

// Main execution
async function main() {
  const serverRunning = await checkServerConnection();
  if (serverRunning) {
    await runTests();
  } else {
    console.log('\n🛑 Cannot run tests without server running.');
    console.log('💡 Start the server with: npm run dev');
  }
}

main().catch(console.error);
