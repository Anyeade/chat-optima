import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { myProvider } from '@/lib/ai/providers';

const PEXELS_API_KEY = process.env.PEXELS_API_KEY || 'your-pexels-api-key';

export async function POST(request: NextRequest) {
  try {
    const { script, videoType, duration } = await request.json();

    if (!script || !videoType || !duration) {
      return NextResponse.json(
        { error: 'Script, videoType, and duration are required' },
        { status: 400 }
      );
    }

    // Determine scene duration rules based on video type
    const sceneDurations = getSceneDurations(videoType, duration);
    
    // Split script into scenes using AI
    const scenesPrompt = `You are a video editor. Split this voice-over script into ${sceneDurations.length} scenes based on natural breaks and content flow.

Voice-over Script: "${script}"

Scene Durations: ${sceneDurations.map((d, i) => `Scene ${i + 1}: ${d} seconds`).join(', ')}

For each scene, provide:
1. The voice-over text for that scene
2. A short on-screen text overlay (max 5 words)
3. A visual description for background video search

Format as JSON array:
[
  {
    "voiceText": "exact voice-over text for this scene",
    "onScreenText": "short overlay text",
    "visualDescription": "description for video search"
  }
]

Make sure the voice-over text flows naturally and the total content matches the original script.`;

    const scenesResult = await generateText({
      model: myProvider.languageModel('llama-4-scout-17b-16e-instruct-cerebras'),
      prompt: scenesPrompt,
      maxTokens: 1500,
      temperature: 0.5,
    });

    let scenesData;
    try {
      // Try to parse JSON response
      const jsonMatch = scenesResult.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        scenesData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      // Fallback: manually split script
      scenesData = await fallbackSceneSplit(script, sceneDurations.length);
    }

    // Generate scenes with background videos
    const scenes = await Promise.all(
      scenesData.map(async (sceneData: any, index: number) => {
        const backgroundVideo = await findBackgroundVideo(sceneData.visualDescription || script);
        
        return {
          id: `scene-${index + 1}`,
          duration: sceneDurations[index],
          voiceText: sceneData.voiceText || `Scene ${index + 1} content`,
          onScreenText: sceneData.onScreenText || `Scene ${index + 1}`,
          backgroundVideo: backgroundVideo.url,
          transition: getTransition(index, sceneDurations.length),
          metadata: {
            visualDescription: sceneData.visualDescription,
            videoSource: backgroundVideo.source,
            searchQuery: backgroundVideo.query
          }
        };
      })
    );

    return NextResponse.json({
      scenes,
      metadata: {
        videoType,
        totalDuration: duration,
        sceneDurations,
        sceneCount: scenes.length,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Scenes generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate scenes' },
      { status: 500 }
    );
  }
}

function getSceneDurations(videoType: string, totalDuration: number): number[] {
  const maxSceneDuration = videoType === 'youtube-shorts' ? 15 : 30;
  const minSceneDuration = 5;
  
  // Calculate number of scenes needed
  const idealSceneCount = Math.ceil(totalDuration / maxSceneDuration);
  const sceneCount = Math.max(2, Math.min(idealSceneCount, 6)); // 2-6 scenes
  
  // Distribute duration across scenes
  const baseDuration = Math.floor(totalDuration / sceneCount);
  const remainder = totalDuration % sceneCount;
  
  const durations = Array(sceneCount).fill(baseDuration);
  
  // Distribute remainder
  for (let i = 0; i < remainder; i++) {
    durations[i]++;
  }
  
  // Ensure minimum scene duration
  return durations.map(d => Math.max(d, minSceneDuration));
}

async function findBackgroundVideo(visualDescription: string) {
  try {
    // Create search query from visual description
    const searchQuery = extractKeywords(visualDescription);
    
    // Search Pexels for videos
    const response = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(searchQuery)}&per_page=10`, {
      headers: {
        'Authorization': PEXELS_API_KEY
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.videos && data.videos.length > 0) {
        const video = data.videos[0];
        return {
          url: video.video_files[0]?.link || '',
          source: 'Pexels',
          query: searchQuery,
          id: video.id
        };
      }
    }
    
    // Fallback to placeholder
    return {
      url: '/api/placeholder/video/1920/1080',
      source: 'Placeholder',
      query: searchQuery,
      id: 'placeholder'
    };
    
  } catch (error) {
    console.error('Video search error:', error);
    return {
      url: '/api/placeholder/video/1920/1080',
      source: 'Fallback',
      query: visualDescription,
      id: 'fallback'
    };
  }
}

function extractKeywords(description: string): string {
  // Simple keyword extraction
  const words = description.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  return words.slice(0, 3).join(' ') || 'nature background';
}

function getTransition(index: number, totalScenes: number): string {
  const transitions = ['fade', 'slide', 'zoom', 'cut'];
  
  if (index === 0) return 'fade'; // First scene
  if (index === totalScenes - 1) return 'fade'; // Last scene
  
  return transitions[index % transitions.length];
}

async function fallbackSceneSplit(script: string, sceneCount: number) {
  const sentences = script.split(/[.!?]+/).filter(s => s.trim());
  const sentencesPerScene = Math.ceil(sentences.length / sceneCount);
  
  const scenes = [];
  for (let i = 0; i < sceneCount; i++) {
    const start = i * sentencesPerScene;
    const end = Math.min(start + sentencesPerScene, sentences.length);
    const sceneText = sentences.slice(start, end).join('. ').trim();
    
    scenes.push({
      voiceText: sceneText,
      onScreenText: `Scene ${i + 1}`,
      visualDescription: `Scene ${i + 1} visuals`
    });
  }
  
  return scenes;
}
