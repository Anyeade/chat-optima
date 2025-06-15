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
  const messageRef = useRef<HTMLParagraphElement | null>(null);  const load = useCallback(async () => {    try {
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
      });      // Try different loading strategies - ONLY Cloudflare CDN
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
      setError(`Failed to load FFmpeg: ${err instanceof Error ? err.message : 'Unknown error'}`);    } finally {
      setIsLoading(false);
      setLoadingStatus("");
    }}, []);
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
      
      // Generate images for each scene if not provided
      const processedScenes = await Promise.all(
        targetScenes.map(async (scene, index) => {
          let imageData: Uint8Array;
          
          if (scene.imageUrl) {
            // Fetch existing image
            imageData = await fetchFile(scene.imageUrl);
          } else {
            // Generate a simple colored frame with text
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
            const words = scene.voiceText.split(' ');
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
            
            // Convert canvas to blob and then to Uint8Array
            const blob = await new Promise<Blob>((resolve) => {
              canvas.toBlob((blob) => resolve(blob!), 'image/png');
            });
            
            imageData = new Uint8Array(await blob.arrayBuffer());
          }
          
          return { ...scene, imageData, index };
        })
      );

      // Write images to FFmpeg filesystem
      for (const scene of processedScenes) {
        await ffmpeg.writeFile(`image_${scene.index}.png`, scene.imageData);
      }

      // Create video from images
      const commands = [
        '-f', 'lavfi',
        '-i', 'color=c=black:s=1280x720:d=0.1',
        '-f', 'lavfi',
        '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
      ];

      // Add each image as input with duration
      for (let i = 0; i < processedScenes.length; i++) {
        commands.push(
          '-loop', '1',
          '-t', processedScenes[i].duration.toString(),
          '-i', `image_${i}.png`
        );
      }

      // Create filter complex for concatenation
      let filterComplex = '';
      for (let i = 0; i < processedScenes.length; i++) {
        filterComplex += `[${i + 2}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setpts=PTS-STARTPTS,fps=30[v${i}];`;
      }

      // Concatenate all video streams
      filterComplex += processedScenes.map((_, i) => `[v${i}]`).join('') + `concat=n=${processedScenes.length}:v=1:a=0[outv]`;

      commands.push(
        '-filter_complex', filterComplex,
        '-map', '[outv]',
        '-map', '1:a',
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '23',
        '-c:a', 'aac',
        '-shortest',
        'output.mp4'
      );

      console.log("Executing FFmpeg command:", commands.join(' '));
      await ffmpeg.exec(commands);      // Read the output file
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
  }, [loaded, isGenerating, scenes, onVideoGenerated]);

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
          >            {isLoading ? (
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
      </div>      {error && (
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
      )}      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Video Generation Process:</h4>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. Load FFmpeg WebAssembly engine</li>
          <li>2. Generate or fetch images for each scene</li>
          <li>3. Process images with text overlays</li>
          <li>4. Combine images into video using FFmpeg</li>
          <li>5. Export as MP4 with audio track</li>
        </ol>
        {loadingStatus && (
          <div className="mt-3 p-2 bg-blue-100 rounded text-sm">
            <strong>Status:</strong> {loadingStatus}
          </div>
        )}
      </div></div>
  );
});

VideoGeneratorFFmpeg.displayName = 'VideoGeneratorFFmpeg';
