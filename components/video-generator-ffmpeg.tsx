"use client";

import React, { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Download, Play } from 'lucide-react';

interface Scene {
  id: string;
  duration: number;
  voiceText: string;
  onScreenText?: string;
  backgroundVideo: string;
  imageUrl?: string; // Add this for backward compatibility
  transition: 'fade' | 'slide' | 'zoom' | 'cut';
}

interface VideoGeneratorFFmpegProps {
  scenes: Scene[];
  prompt?: string;
  onVideoGenerated?: (blob: Blob) => void;
}

export interface VideoGeneratorFFmpegRef {
  generateVideo: (scenes: Scene[], script: string, voiceUrl: string, musicUrl: string) => Promise<void>;
}

export const VideoGeneratorFFmpeg = forwardRef<VideoGeneratorFFmpegRef, VideoGeneratorFFmpegProps>(
  ({ scenes, prompt = "AI Generated Video", onVideoGenerated }, ref) => {  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  
  const ffmpegRef = useRef(new FFmpeg());
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const messageRef = useRef<HTMLParagraphElement | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      setLoadingStatus("Initializing...");
      
      const ffmpeg = ffmpegRef.current;
      
      ffmpeg.on("log", ({ message }) => {
        console.log("FFmpeg log:", message);
        if (messageRef.current) {
          messageRef.current.innerHTML = message;
        }
      });

      ffmpeg.on("progress", ({ progress }) => {
        setProgress(Math.round(progress * 100));
      });

      // Try different loading strategies - ONLY Cloudflare CDN
      const strategies = [
        {
          name: "Cloudflare CDN (Auto - Recommended)",
          load: async () => {
            // This strategy works! Let FFmpeg auto-detect and use default paths
            // It will use the installed @ffmpeg/core package
            await ffmpeg.load();
          }
        },
        {
          name: "Cloudflare CDN (Core Files)",
          load: async () => {
            // Try to use the npm package structure with Cloudflare
            const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";
            await ffmpeg.load({
              coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
              wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
              workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, "text/javascript"),
            });
          }
        },
        {
          name: "Cloudflare CDN (UMD)",
          load: async () => {
            // Use the available Cloudflare UMD files
            const baseURL = "https://cdnjs.cloudflare.com/ajax/libs/ffmpeg/0.12.15/umd";
            await ffmpeg.load({
              coreURL: await toBlobURL(`${baseURL}/ffmpeg.min.js`, "text/javascript"),
              workerURL: await toBlobURL(`${baseURL}/814.ffmpeg.min.js`, "text/javascript"),
            });
          }
        },
        {
          name: "Cloudflare CDN (ESM)",
          load: async () => {
            // Try ESM approach
            const baseURL = "https://cdnjs.cloudflare.com/ajax/libs/ffmpeg/0.12.15/esm";
            await ffmpeg.load({
              coreURL: await toBlobURL(`${baseURL}/index.min.js`, "text/javascript"),
              workerURL: await toBlobURL(`${baseURL}/worker.min.js`, "text/javascript"),
            });
          }
        }
      ];
      
      let loaded = false;
      let lastError = null;
      
      for (const strategy of strategies) {
        try {
          setLoadingStatus(`Trying ${strategy.name}...`);
          console.log(`Trying FFmpeg loading strategy: ${strategy.name}...`);
          await strategy.load();
          loaded = true;
          setLoadingStatus(`Successfully loaded using ${strategy.name}`);
          console.log(`FFmpeg loaded successfully using ${strategy.name}`);
          break;
        } catch (err) {
          lastError = err;
          console.warn(`Strategy ${strategy.name} failed:`, err);
          continue;
        }
      }
      
      if (!loaded) {
        throw lastError || new Error("All FFmpeg loading strategies failed");
      }
      
      setLoaded(true);
    } catch (err) {
      console.error("Failed to load FFmpeg:", err);
      setError(`Failed to load FFmpeg: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setLoadingStatus("");
    }
  }, []);

  // Auto-load FFmpeg on component mount
  useEffect(() => {
    if (!loaded && !isLoading) {
      console.log("Auto-loading FFmpeg...");
      load();
    }
  }, [loaded, isLoading, load]);

  // Expose generateVideo function through ref
  useImperativeHandle(ref, () => ({
    generateVideo: async (scenesData: Scene[], script: string, voiceUrl: string, musicUrl: string) => {
      if (!loaded) {
        await load();
      }
      await generateVideo(scenesData, script, voiceUrl, musicUrl);
    }
  }), [loaded]);

  const generateFallbackImage = useCallback(async (scene: Scene, index: number): Promise<Uint8Array> => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d')!;
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, `hsl(${(index * 60) % 360}, 70%, 60%)`);
    gradient.addColorStop(1, `hsl(${(index * 60 + 30) % 360}, 70%, 40%)`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Word wrap text
    const text = scene.onScreenText || scene.voiceText || `Scene ${index + 1}`;
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > canvas.width - 100 && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    
    // Draw lines
    const lineHeight = 60;
    const startY = canvas.height / 2 - (lines.length - 1) * lineHeight / 2;
    
    lines.forEach((line, lineIndex) => {
      ctx.fillText(line, canvas.width / 2, startY + lineIndex * lineHeight);
    });
    
    // Convert canvas to Uint8Array
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/png');
    });
    
    return new Uint8Array(await blob.arrayBuffer());
  }, []);

  const generateVideo = useCallback(async (scenesData?: Scene[], script?: string, voiceUrl?: string, musicUrl?: string) => {
    if (!loaded || isGenerating) return;

    // Use passed scenes or fallback to component props
    const targetScenes = scenesData || scenes;
    if (!targetScenes || targetScenes.length === 0) {
      setError("No scenes provided for video generation");
      return;
    }

    try {
      setIsGenerating(true);
      setError("");
      setProgress(0);
      
      const ffmpeg = ffmpegRef.current;

      console.log("Starting enhanced video generation with:", {
        scenes: targetScenes.length,
        hasVoiceUrl: !!voiceUrl,
        hasMusicUrl: !!musicUrl,
        script: script?.substring(0, 50) + "..."
      });

      // Download and process voice-over and music if provided
      let voiceData: Uint8Array | null = null;
      let musicData: Uint8Array | null = null;

      if (voiceUrl) {
        try {
          console.log("Downloading voice-over audio...");
          voiceData = await fetchFile(voiceUrl);
          await ffmpeg.writeFile('voice.mp3', voiceData);
          console.log("Voice-over audio downloaded successfully");
          setProgress(15);
        } catch (err) {
          console.warn("Failed to download voice-over:", err);
        }
      }

      if (musicUrl) {
        try {
          console.log("Downloading background music...");
          musicData = await fetchFile(musicUrl);
          await ffmpeg.writeFile('music.mp3', musicData);
          console.log("Background music downloaded successfully");
          setProgress(25);
        } catch (err) {
          console.warn("Failed to download background music:", err);
        }
      }
        // Generate images for each scene with enhanced processing
      const processedScenes = await Promise.all(
        targetScenes.map(async (scene, index) => {
          setProgress(25 + (index / targetScenes.length) * 35); // 25-60% for scene processing

          let imageData: Uint8Array | undefined;
          let videoData: Uint8Array | null = null;

          // Try to download background video first
          if (scene.backgroundVideo) {
            try {
              console.log(`Downloading background video for scene ${index}:`, scene.backgroundVideo);
              videoData = await fetchFile(scene.backgroundVideo);
              console.log(`Background video ${index} downloaded successfully`);
            } catch (err) {
              console.warn(`Failed to download background video for scene ${index}:`, err);
            }
          }
          
          if (scene.imageUrl && !videoData) {
            try {
              // Fetch existing image
              console.log(`Downloading background image for scene ${index}:`, scene.imageUrl);
              imageData = await fetchFile(scene.imageUrl);
            } catch (err) {
              console.warn(`Failed to fetch image for scene ${index}, generating fallback:`, err);
              imageData = await generateFallbackImage(scene, index);
            }
          } else if (!videoData) {
            // Generate fallback image
            imageData = await generateFallbackImage(scene, index);
          }
          
          return { ...scene, imageData, videoData, index };
        })
      );

      setProgress(60);

      // Write media files to FFmpeg filesystem
      for (const scene of processedScenes) {
        if (scene.videoData) {
          await ffmpeg.writeFile(`video_${scene.index}.mp4`, scene.videoData);
          console.log(`Written background video ${scene.index} to FFmpeg filesystem`);
        } else if (scene.imageData) {
          await ffmpeg.writeFile(`image_${scene.index}.png`, scene.imageData);
          console.log(`Written background image ${scene.index} to FFmpeg filesystem`);
        }
      }

      setProgress(70);

      // Build comprehensive FFmpeg command
      const commands: string[] = [];
      let inputIndex = 0;

      // Add voice-over input if available
      if (voiceData) {
        commands.push('-i', 'voice.mp3');
        inputIndex++;
      }

      // Add background music input if available  
      if (musicData) {
        commands.push('-i', 'music.mp3');
        inputIndex++;
      }

      // Add video/image inputs for each scene
      for (const scene of processedScenes) {
        if (scene.videoData) {
          commands.push(
            '-i', `video_${scene.index}.mp4`,
            '-t', scene.duration.toString()
          );
        } else {
          commands.push(
            '-loop', '1',
            '-t', scene.duration.toString(),
            '-i', `image_${scene.index}.png`
          );
        }
        inputIndex++;
      }

      // Create comprehensive filter complex
      let filterComplex = '';
      const videoInputStart = (voiceData ? 1 : 0) + (musicData ? 1 : 0);
      
      // Process video clips/images
      for (let i = 0; i < processedScenes.length; i++) {
        const inputIdx = videoInputStart + i;
        filterComplex += `[${inputIdx}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setpts=PTS-STARTPTS,fps=30[v${i}];`;
      }

      // Concatenate video streams
      filterComplex += processedScenes.map((_, i) => `[v${i}]`).join('') + `concat=n=${processedScenes.length}:v=1:a=0[outv]`;

      // Handle audio mixing
      if (voiceData && musicData) {
        // Mix voice and background music
        filterComplex += ';[0:a]volume=1.0[voice];[1:a]volume=0.3[music];[voice][music]amix=inputs=2:duration=shortest[audio]';
        commands.push('-filter_complex', filterComplex);
        commands.push('-map', '[outv]', '-map', '[audio]');
      } else if (voiceData) {
        // Voice only
        filterComplex += ';[0:a]apad[audio]';
        commands.push('-filter_complex', filterComplex);
        commands.push('-map', '[outv]', '-map', '[audio]');
      } else if (musicData) {
        // Music only
        const musicIdx = 0;
        filterComplex += `;[${musicIdx}:a]volume=0.5[audio]`;
        commands.push('-filter_complex', filterComplex);
        commands.push('-map', '[outv]', '-map', '[audio]');
      } else {
        // No audio - create silent track
        commands.push('-filter_complex', filterComplex);
        commands.push('-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100');
        commands.push('-map', '[outv]', '-map', `${inputIndex}:a`);
      }

      // Encoding settings
      commands.push(
        '-c:v', 'libx264',
        '-preset', 'fast', 
        '-crf', '23',
        '-c:a', 'aac',
        '-shortest',
        'output.mp4'
      );

      setProgress(80);

      console.log("Executing enhanced FFmpeg command:", commands.join(' '));
      await ffmpeg.exec(commands);

      // Read the output file
      const data = await ffmpeg.readFile('output.mp4') as Uint8Array;
      const videoBlob = new Blob([data], { type: 'video/mp4' });
      const url = URL.createObjectURL(videoBlob);
      
      setVideoUrl(url);
      if (videoRef.current) {
        videoRef.current.src = url;
      }
      
      onVideoGenerated?.(videoBlob);
      
      console.log("Video generated successfully");
    } catch (err) {
      console.error("Video generation failed:", err);
      setError(`Video generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  }, [loaded, isGenerating, scenes, onVideoGenerated, generateFallbackImage]);
  const downloadVideo = useCallback(() => {
    if (!videoUrl) return;
    
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `${(prompt || '').slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}_video.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [videoUrl, prompt]);

  const handleGenerateVideo = useCallback(() => {
    generateVideo();
  }, [generateVideo]);
  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">AI Video Generator</h2>
        <p className="text-gray-600 mb-4">Powered by FFmpeg WebAssembly</p>
        
        {!loaded ? (
          <Button
            onClick={load}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-700 text-white"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {loadingStatus || "Loading FFmpeg Core..."}
              </>
            ) : (
              "Load FFmpeg Engine"
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <Button
              onClick={handleGenerateVideo}
              disabled={isGenerating || scenes.length === 0}
              className="bg-green-500 hover:bg-green-700 text-white"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Video...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Generate Video
                </>
              )}
            </Button>
            
            {isGenerating && (
              <div className="w-full max-w-md mx-auto">
                <Progress value={progress} className="mb-2" />
                <p className="text-sm text-gray-600">Progress: {progress}%</p>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 font-medium">Error:</p>
          <p className="text-red-500 text-sm mb-3">{error}</p>
          {!loaded && (
            <Button
              onClick={load}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="border-red-300 text-red-600 hover:bg-red-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Retrying...
                </>
              ) : (
                "Retry Loading FFmpeg"
              )}
            </Button>
          )}
        </div>
      )}

      {videoUrl && (
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Generated Video</h3>
            <Button
              onClick={downloadVideo}
              variant="outline"
              size="sm"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
          
          <video
            ref={videoRef}
            controls
            className="w-full max-h-[400px] object-contain rounded"
            onError={(e) => {
              console.error("Video playback error:", e);
              setError("Failed to play generated video");
            }}
          >
            Your browser does not support the video tag.
          </video>
          
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Prompt:</strong> {prompt || 'AI Generated Video'}</p>
            <p><strong>Scenes:</strong> {scenes.length}</p>
            <p><strong>Total Duration:</strong> {(scenes || []).reduce((acc, scene) => acc + scene.duration, 0)}s</p>
          </div>
        </div>
      )}

      {messageRef.current && (
        <div className="bg-gray-50 border rounded p-3">
          <p className="text-xs text-gray-600 font-mono" ref={messageRef}></p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Enhanced Video Generation Process:</h4>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. Load FFmpeg WebAssembly engine from Cloudflare CDN</li>
          <li>2. Download voice-over audio and background music</li>
          <li>3. Download or generate background videos/images for each scene</li>
          <li>4. Process and write all media files to FFmpeg filesystem</li>
          <li>5. Combine videos/images with comprehensive filter chains</li>
          <li>6. Mix audio tracks (voice + music) with proper volumes</li>
          <li>7. Export as MP4 with full audio-visual composition</li>
        </ol>
        {loadingStatus && (
          <div className="mt-3 p-2 bg-blue-100 rounded text-sm">
            <strong>Status:</strong> {loadingStatus}
          </div>
        )}
      </div>
    </div>
  );
});

VideoGeneratorFFmpeg.displayName = 'VideoGeneratorFFmpeg';
