import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import { VideoTiming } from '@/lib/video-timing';

// Pexels API Types
interface PexelsVideoFile {
  id: number;
  quality: string;
  file_type: string;
  width: number;
  height: number;
  link: string;
}

interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  url: string;
  image: string;
  duration: number;
  user: {
    id: number;
    name: string;
    url: string;
  };
  video_files: PexelsVideoFile[];
  video_pictures: any[];
}

interface PexelsResponse {
  page: number;
  per_page: number;
  videos: PexelsVideo[];
  total_results: number;
  next_page?: string;
}

const PEXELS_API_KEY = process.env.PEXELS_API_KEY || 'sbelmCbU2CBEumLwvDAiTAEA5JyJJQWhaf4IXHdfeCHpNBjkUAjauGoC';

export async function POST(request: NextRequest) {
  try {
    const { script, videoType, duration } = await request.json();

    if (!script || !videoType || !duration) {
      return NextResponse.json(
        { error: 'Script, videoType, and duration are required' },
        { status: 400 }
      );
    }

    // Use improved timing system for better scene breaks
    const sceneBreaks = VideoTiming.calculateSceneBreaks(script, duration);
    
    // Split script into scenes using AI with proper timing
    const scenesPrompt = `You are a video editor. Split this voice-over script into ${sceneBreaks.length} scenes based on natural breaks and optimal timing.

Voice-over Script: "${script}"

Scene Information: ${sceneBreaks.map((s, i) =>
  `Scene ${i + 1}: ${s.duration.toFixed(1)}s (${s.estimatedWords} words)`
).join(', ')}

For each scene, provide:
1. The voice-over text for that scene (should match estimated word count)
2. A short on-screen text overlay (max 4 words, punchy and relevant)
3. A visual description for background video search (specific and searchable)

Format as JSON array:
[
  {
    "voiceText": "exact voice-over text for this scene",
    "onScreenText": "short overlay",
    "visualDescription": "specific video search description"
  }
]

IMPORTANT: Ensure the voice-over text flows naturally and matches the estimated speaking time. Each scene should have roughly the right amount of content for its duration.`;

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
      // Fallback: use calculated scene breaks
      scenesData = sceneBreaks.map((sceneBreak, index) => ({
        voiceText: sceneBreak.text,
        onScreenText: `Scene ${index + 1}`,
        visualDescription: `Scene ${index + 1} visuals`
      }));
    }

    // Generate scenes with background videos using proper timing
    const scenes = await Promise.all(
      scenesData.map(async (sceneData: any, index: number) => {
        const backgroundVideo = await findBackgroundVideo(sceneData.visualDescription || script);
        const sceneDuration = sceneBreaks[index]?.duration || 10; // Use calculated duration
        
        return {
          id: `scene-${index + 1}`,
          duration: Math.round(sceneDuration * 10) / 10, // Round to 1 decimal place
          voiceText: sceneData.voiceText || sceneBreaks[index]?.text || `Scene ${index + 1} content`,
          onScreenText: sceneData.onScreenText || `Scene ${index + 1}`,
          backgroundVideo: backgroundVideo.url,
          transition: getTransition(index, sceneBreaks.length),
          metadata: {
            visualDescription: sceneData.visualDescription,
            videoSource: backgroundVideo.source,
            searchQuery: backgroundVideo.query,
            estimatedWords: sceneBreaks[index]?.estimatedWords,
            calculatedDuration: sceneDuration
          }
        };
      })
    );

    const actualTotalDuration = scenes.reduce((sum, scene) => sum + scene.duration, 0);
    
    return NextResponse.json({
      scenes,
      metadata: {
        videoType,
        requestedDuration: duration,
        actualTotalDuration: Math.round(actualTotalDuration * 10) / 10,
        sceneCount: scenes.length,
        averageSceneDuration: Math.round((actualTotalDuration / scenes.length) * 10) / 10,
        timingMethod: 'speech-rate-optimized',
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
  // More flexible scene duration based on content length
  const maxSceneDuration = videoType === 'youtube-shorts' ?
    Math.min(30, totalDuration / 2) : // YouTube Shorts can have longer scenes if content is longer
    Math.min(45, totalDuration / 2);  // Regular videos can have even longer scenes
  
  const minSceneDuration = Math.min(8, totalDuration / 4); // Minimum scene length scales with total duration
  
  // Calculate optimal number of scenes based on content length
  let idealSceneCount;
  if (totalDuration <= 30) {
    idealSceneCount = 2; // Short videos: 2 scenes max
  } else if (totalDuration <= 60) {
    idealSceneCount = 3; // Medium videos: 3 scenes max
  } else if (totalDuration <= 120) {
    idealSceneCount = 4; // Longer videos: 4 scenes max
  } else {
    idealSceneCount = Math.min(6, Math.ceil(totalDuration / 30)); // Very long videos: up to 6 scenes
  }
  
  const sceneCount = Math.max(2, idealSceneCount);
  
  // Distribute duration more intelligently
  const baseDuration = Math.floor(totalDuration / sceneCount);
  const remainder = totalDuration % sceneCount;
  
  const durations = Array(sceneCount).fill(baseDuration);
  
  // Distribute remainder to middle scenes (they often have the main content)
  const middleStart = Math.floor(sceneCount / 3);
  for (let i = 0; i < remainder; i++) {
    const targetIndex = (middleStart + i) % sceneCount;
    durations[targetIndex]++;
  }
  
  // Ensure minimum scene duration but don't artificially limit
  return durations.map(d => Math.max(d, minSceneDuration));
}

async function findBackgroundVideo(visualDescription: string) {
  try {
    // Create search query from visual description
    const searchQuery = extractKeywords(visualDescription);
    
    // Search Pexels for videos
    const response = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(searchQuery)}&per_page=10&orientation=landscape`, {
      headers: {
        'Authorization': PEXELS_API_KEY
      }
    });
    
    if (response.ok) {
      const data: PexelsResponse = await response.json();
      if (data.videos && data.videos.length > 0) {
        const video = data.videos[0];
        
        // Try to get the best quality video file
        let videoFile = video.video_files.find((f: PexelsVideoFile) => f.quality === 'hd') ||
                       video.video_files.find((f: PexelsVideoFile) => f.quality === 'sd') ||
                       video.video_files[0];
        
        if (videoFile && videoFile.link) {
          console.log(`Found Pexels video: ${video.id} - ${videoFile.quality} (${videoFile.width}x${videoFile.height})`);
          return {
            url: videoFile.link,
            source: 'Pexels',
            query: searchQuery,
            id: video.id,
            quality: videoFile.quality,
            dimensions: `${videoFile.width}x${videoFile.height}`
          };
        }
      }
    } else {
      console.warn(`Pexels API error: ${response.status} - ${response.statusText}`);
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
