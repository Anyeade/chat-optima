"use client";

import React, { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { VideoTiming } from '@/lib/video-timing';

interface Scene {
  id: string;
  duration: number;
  voiceText: string;
  onScreenText?: string;
  backgroundVideo: string;
  transition: 'fade' | 'slide' | 'zoom' | 'cut';
}

interface VideoGeneratorOptimizedProps {
  scenes: Scene[];
  prompt?: string;
  onVideoGenerated?: (blob: Blob) => void;
}

export interface VideoGeneratorOptimizedRef {
  generateVideo: (scenes: Scene[], script: string, voiceUrl: string, musicUrl: string) => Promise<void>;
}

export const VideoGeneratorOptimized = forwardRef<VideoGeneratorOptimizedRef, VideoGeneratorOptimizedProps>(
  ({ scenes, prompt = "AI Generated Video", onVideoGenerated }, ref) => {
  const [loaded, setLoaded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  
  const ffmpegRef = useRef(new FFmpeg());
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const load = useCallback(async () => {
    try {
      setLoadingStatus("Loading FFmpeg...");
      const ffmpeg = ffmpegRef.current;
      
      ffmpeg.on("log", ({ message }) => {
        console.log("FFmpeg:", message);
      });

      ffmpeg.on("progress", ({ progress }) => {
        setProgress(Math.round(progress * 100));
      });

      // Use simple auto-loading for better compatibility
      await ffmpeg.load();
      setLoaded(true);
      setLoadingStatus("FFmpeg loaded successfully");
    } catch (err) {
      console.error("Failed to load FFmpeg:", err);
      setError(`Failed to load FFmpeg: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  useEffect(() => {
    if (!loaded) load();
  }, [loaded, load]);

  // Expose generateVideo function through ref
  useImperativeHandle(ref, () => ({
    generateVideo: async (scenesData: Scene[], script: string, voiceUrl: string, musicUrl: string) => {
      if (!loaded) await load();
      await generateVideo(scenesData, script, voiceUrl, musicUrl);
    }
  }), [loaded]);

  const generateVideo = useCallback(async (
    scenesData: Scene[], 
    script: string, 
    voiceUrl: string, 
    musicUrl: string
  ) => {
    if (!loaded || isGenerating) return;

    try {
      setIsGenerating(true);
      setError("");
      setProgress(0);
      
      const ffmpeg = ffmpegRef.current;
      console.log("Starting optimized video generation...");

      // Download audio files
      setLoadingStatus("Downloading audio files...");
      let voiceData: Uint8Array | null = null;
      let musicData: Uint8Array | null = null;

      if (voiceUrl) {
        try {
          voiceData = await fetchFile(voiceUrl);
          await ffmpeg.writeFile('voice.mp3', voiceData);
          console.log("Voice audio loaded");
        } catch (err) {
          console.warn("Voice loading failed:", err);
        }
      }

      if (musicUrl) {
        try {
          musicData = await fetchFile(musicUrl);
          await ffmpeg.writeFile('music.mp3', musicData);
          console.log("Background music loaded");
        } catch (err) {
          console.warn("Music loading failed:", err);
        }
      }

      setProgress(20);

      // Download and process video scenes
      setLoadingStatus("Processing video scenes...");
      const processedScenes = await Promise.all(
        scenesData.map(async (scene, index) => {
          try {
            const videoData = await fetchFile(scene.backgroundVideo);
            await ffmpeg.writeFile(`video_${index}.mp4`, videoData);
            console.log(`Scene ${index} video loaded`);
            return { ...scene, index, hasVideo: true };
          } catch (err) {
            console.warn(`Scene ${index} video failed:`, err);
            return { ...scene, index, hasVideo: false };
          }
        })
      );

      setProgress(50);

      // Load font for text overlay
      setLoadingStatus("Loading font...");
      try {
        const fontResponse = await fetch('/roboto/Roboto-Regular.ttf');
        if (fontResponse.ok) {
          const fontData = await fontResponse.arrayBuffer();
          await ffmpeg.writeFile('roboto.ttf', new Uint8Array(fontData));
          console.log("Font loaded successfully");
        }
      } catch (err) {
        console.warn("Font loading failed:", err);
      }

      setProgress(60);

      // Build optimized FFmpeg command
      setLoadingStatus("Generating video...");
      const commands: string[] = [];
      
      // Add audio inputs
      if (voiceData) commands.push('-i', 'voice.mp3');
      if (musicData) commands.push('-i', 'music.mp3');

      // Add video inputs with duration limits
      processedScenes.forEach((scene) => {
        if (scene.hasVideo) {
          commands.push('-i', `video_${scene.index}.mp4`, '-t', scene.duration.toString());
        } else {
          // Use color background for failed videos
          commands.push('-f', 'lavfi', '-i', `color=c=blue:s=1280x720:d=${scene.duration}`, '-t', scene.duration.toString());
        }
      });

      // Create optimized filter complex
      let filterComplex = '';
      const audioInputs = (voiceData ? 1 : 0) + (musicData ? 1 : 0);
      
      // Process each scene with text overlay
      processedScenes.forEach((scene, i) => {
        const inputIdx = audioInputs + i;
        
        // Basic video processing
        filterComplex += `[${inputIdx}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,fps=30`;
        
        // Add optimized text overlay using new timing system
        if (scene.onScreenText || scene.voiceText) {
          const textToShow = scene.onScreenText || scene.voiceText;
          const textReveals = VideoTiming.calculateWordReveals(textToShow, scene.duration);
          const textFilters = VideoTiming.generateTypewriterFilters(textReveals, 42, 'white@0.95');
          filterComplex += textFilters;
        }
        
        filterComplex += `[v${i}];`;
      });

      // Concatenate videos
      filterComplex += processedScenes.map((_, i) => `[v${i}]`).join('') + 
                      `concat=n=${processedScenes.length}:v=1:a=0[outv]`;

      // Handle audio mixing
      if (voiceData && musicData) {
        filterComplex += ';[0:a]volume=1.0[voice];[1:a]volume=0.25[music];[voice][music]amix=inputs=2:duration=shortest[outa]';
        commands.push('-filter_complex', filterComplex);
        commands.push('-map', '[outv]', '-map', '[outa]');
      } else if (voiceData) {
        filterComplex += ';[0:a]apad[outa]';
        commands.push('-filter_complex', filterComplex);
        commands.push('-map', '[outv]', '-map', '[outa]');
      } else if (musicData) {
        filterComplex += ';[0:a]volume=0.4[outa]';
        commands.push('-filter_complex', filterComplex);
        commands.push('-map', '[outv]', '-map', '[outa]');
      } else {
        commands.push('-filter_complex', filterComplex);
        commands.push('-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100');
        commands.push('-map', '[outv]', '-map', `${audioInputs + processedScenes.length}:a`);
      }

      // Optimized encoding settings
      commands.push(
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '23',
        '-c:a', 'aac',
        '-shortest',
        'output.mp4'
      );

      setProgress(80);

      console.log("Executing optimized FFmpeg command...");
      await ffmpeg.exec(commands);

      // Read and serve the output
      const data = await ffmpeg.readFile('output.mp4') as Uint8Array;
      const videoBlob = new Blob([data], { type: 'video/mp4' });
      const url = URL.createObjectURL(videoBlob);
      
      setVideoUrl(url);
      if (videoRef.current) {
        videoRef.current.src = url;
      }
      
      onVideoGenerated?.(videoBlob);
      setProgress(100);
      console.log("Optimized video generation completed successfully");

    } catch (err) {
      console.error("Video generation failed:", err);
      setError(`Video generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
      setLoadingStatus("");
    }
  }, [loaded, isGenerating, onVideoGenerated]);

  const downloadVideo = useCallback(() => {
    if (!videoUrl) return;
    
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `${(prompt || 'video').slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}_video.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [videoUrl, prompt]);

  return (
    <div className="relative w-full h-full">
      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          controls
          playsInline
        />
      )}
      
      {isGenerating && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="mb-2">{loadingStatus}</div>
            <div className="w-64 h-2 bg-gray-700 rounded-full">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 text-sm">{progress}%</div>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-red-500 text-white p-4 rounded max-w-md">
            <h3 className="font-bold mb-2">Error</h3>
            <p>{error}</p>
          </div>
        </div>
      )}

      {videoUrl && (
        <div className="absolute bottom-4 right-4">
          <button
            onClick={downloadVideo}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Download Video
          </button>
        </div>
      )}
    </div>
  );
});

VideoGeneratorOptimized.displayName = 'VideoGeneratorOptimized';

export default VideoGeneratorOptimized;