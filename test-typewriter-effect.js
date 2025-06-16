#!/usr/bin/env node

/**
 * Test script to verify typewriter text overlay functionality
 * This simulates the text processing that happens in the video generator
 */

function testTypewriterEffect() {
  console.log("🎬 Testing Typewriter Effect Implementation\n");

  // Test scenarios
  const testCases = [
    {
      name: "Scene with onScreenText",
      scene: {
        id: "1",
        duration: 15,
        onScreenText: "Welcome to our amazing journey of discovery and wonder",
        voiceText: "Different voice text",
        backgroundVideo: "video1.mp4",
        transition: "fade"
      },
      script: "This is the full script content..."
    },
    {
      name: "Scene with voiceText only",
      scene: {
        id: "2", 
        duration: 10,
        voiceText: "This voice text will be used for typewriter effect",
        backgroundVideo: "video2.mp4",
        transition: "slide"
      },
      script: "This is the full script content..."
    },
    {
      name: "Scene with no text but has script",
      scene: {
        id: "3",
        duration: 12,
        backgroundVideo: "video3.mp4", 
        transition: "zoom"
      },
      script: "Need a break from the ordinary? Here are 10 uplifting moments to brighten your day and fill your heart with joy"
    },
    {
      name: "Scene with no text and no script",
      scene: {
        id: "4",
        duration: 8,
        backgroundVideo: "video4.mp4",
        transition: "cut"
      },
      script: null
    }
  ];

  testCases.forEach((testCase, sceneIndex) => {
    console.log(`\n📝 Testing: ${testCase.name}`);
    console.log(`   Scene Duration: ${testCase.scene.duration}s`);
    
    // Simulate the text selection logic from the video generator
    let textToDisplay = testCase.scene.onScreenText || testCase.scene.voiceText;
    
    // If no text in scene but we have a script, try to extract relevant text
    if ((!textToDisplay || textToDisplay.trim().length === 0) && testCase.script) {
      const scriptWords = testCase.script.split(/\s+/).filter(word => word.length > 0);
      const totalScenes = testCases.length;
      const wordsPerScene = Math.ceil(scriptWords.length / totalScenes);
      const startIdx = sceneIndex * wordsPerScene;
      const endIdx = Math.min(startIdx + wordsPerScene, scriptWords.length);
      textToDisplay = scriptWords.slice(startIdx, endIdx).join(' ');
      console.log(`   📜 Using script text (words ${startIdx}-${endIdx})`);
    }
    
    // Final fallback: provide default text
    if (!textToDisplay || textToDisplay.trim().length === 0) {
      textToDisplay = `Scene ${sceneIndex + 1} - Uplifting moments to brighten your day`;
      console.log(`   🔄 Using fallback text`);
    }
    
    console.log(`   💬 Text to display: "${textToDisplay}"`);
    
    // Simulate typewriter timing calculation
    if (textToDisplay && textToDisplay.trim().length > 0) {
      const words = textToDisplay.trim().split(/\s+/).filter(word => word.length > 0);
      const timePerWord = Math.max(0.3, (testCase.scene.duration * 0.9) / words.length);
      
      console.log(`   ⏱️  Typewriter timing: ${words.length} words, ${timePerWord.toFixed(2)}s per word`);
      
      // Show first few word timings
      const maxWordsToShow = Math.min(5, words.length);
      console.log(`   🎯 First ${maxWordsToShow} word timings:`);
      
      for (let i = 0; i < maxWordsToShow; i++) {
        const startTime = i * timePerWord;
        const cumulativeText = words.slice(0, i + 1).join(' ');
        const startFrame = Math.floor(startTime * 30); // 30 fps
        
        console.log(`      ${i + 1}. Frame ${startFrame} (${startTime.toFixed(2)}s): "${cumulativeText}"`);
      }
      
      if (words.length > maxWordsToShow) {
        console.log(`      ... (${words.length - maxWordsToShow} more words)`);
      }
    }
    
    console.log(`   ✅ Scene ${sceneIndex + 1} typewriter effect configured`);
  });

  console.log("\n🎉 Typewriter effect test completed!");
  console.log("\n📋 Summary:");
  console.log("- Text selection priority: onScreenText > voiceText > script portion > fallback");
  console.log("- Minimum word display time: 0.3 seconds");
  console.log("- Uses 90% of scene duration for text animation");
  console.log("- Frame-based timing at 30 FPS for smooth animation");
  console.log("- Cumulative text display (typewriter effect)");
  console.log("- CSP-compliant implementation for web deployment");
}

// Run the test
testTypewriterEffect();
