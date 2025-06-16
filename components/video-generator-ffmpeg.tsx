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
    
    // Add a subtle pattern overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let x = 0; x < canvas.width; x += 50) {
      for (let y = 0; y < canvas.height; y += 50) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
      // Add centered title text (will be overlaid with typewriter effect by FFmpeg)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = 'bold 64px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const sceneTitle = `Scene ${index + 1}`;
    ctx.fillText(sceneTitle, canvas.width / 2, canvas.height / 2);
    
    // Note: The actual text overlay with typewriter effect will be added by FFmpeg
    // This fallback image provides a clean background for the text overlay
    
    // Convert canvas to Uint8Array
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/png');
    });
    
    return new Uint8Array(await blob.arrayBuffer());
  }, []);
  const dataUriToUint8Array = useCallback((dataUri: string): Uint8Array | null => {
    try {
      if (!dataUri || !dataUri.startsWith('data:')) {
        console.warn('Invalid or empty data URI');
        return null;
      }
      
      const [header, data] = dataUri.split(',');
      if (!header || !data) {
        console.warn('Invalid data URI format');
        return null;
      }
      
      const isBase64 = header.includes('base64');
      
      if (isBase64) {
        const binaryString = atob(data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
      } else {
        const decodedData = decodeURIComponent(data);
        return new TextEncoder().encode(decodedData);
      }
    } catch (err) {
      console.warn('Failed to convert data URI:', err);
      return null;
    }
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
      });      // Download and process voice-over and music if provided
      let voiceData: Uint8Array | null = null;
      let musicData: Uint8Array | null = null;

      if (voiceUrl) {
        try {
          console.log("Processing voice-over audio...");
          
          // For data URIs, convert directly without fetch (CSP-friendly)
          if (voiceUrl.startsWith('data:')) {
            voiceData = dataUriToUint8Array(voiceUrl);
            if (voiceData) {
              await ffmpeg.writeFile('voice.mp3', voiceData);
              console.log("Voice-over audio processed successfully from data URI");
            } else {
              console.warn("Failed to process voice-over data URI");
            }
          } else {
            // For HTTP URLs, use fetch
            voiceData = await fetchFile(voiceUrl);
            await ffmpeg.writeFile('voice.mp3', voiceData);
            console.log("Voice-over audio downloaded successfully from URL");
          }
          setProgress(15);
        } catch (err) {
          console.warn("Failed to process voice-over:", err);
        }
      }

      if (musicUrl) {
        try {
          console.log("Processing background music...");
          
          // For data URIs, convert directly without fetch (CSP-friendly)
          if (musicUrl.startsWith('data:')) {
            musicData = dataUriToUint8Array(musicUrl);
            if (musicData) {
              await ffmpeg.writeFile('music.mp3', musicData);
              console.log("Background music processed successfully from data URI");
            } else {
              console.warn("Failed to process background music data URI");
            }
          } else {
            // For HTTP URLs, use fetch
            musicData = await fetchFile(musicUrl);
            await ffmpeg.writeFile('music.mp3', musicData);
            console.log("Background music downloaded successfully from URL");
          }
          setProgress(25);
        } catch (err) {
          console.warn("Failed to process background music:", err);
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
      }      // Create comprehensive filter complex with typewriter text overlay
      let filterComplex = '';
      const videoInputStart = (voiceData ? 1 : 0) + (musicData ? 1 : 0);
      
      // Process video clips/images with text overlay
      let cumulativeTime = 0;
      for (let i = 0; i < processedScenes.length; i++) {
        const scene = processedScenes[i];
        const inputIdx = videoInputStart + i;
        
        // Basic video processing
        filterComplex += `[${inputIdx}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setpts=PTS-STARTPTS,fps=30`;
          // Add typewriter text overlay if scene has text
        const textToDisplay = scene.onScreenText || scene.voiceText;
        if (textToDisplay && textToDisplay.trim().length > 0) {
          console.log(`Adding typewriter effect for scene ${i}:`, textToDisplay.substring(0, 50) + '...');
          
          // Create typewriter effect with word-by-word reveal
          const words = textToDisplay.trim().split(/\s+/).filter(word => word.length > 0);
          const timePerWord = (scene.duration * 0.9) / words.length; // Use 90% of scene duration
          
          console.log(`Scene ${i}: ${words.length} words, ${timePerWord.toFixed(2)}s per word`);
          
          let textFilter = '';
          words.forEach((word, wordIndex) => {
            const startTime = wordIndex * timePerWord;
            const cumulativeText = words.slice(0, wordIndex + 1).join(' ');
            
            // Escape text for FFmpeg
            const escapedText = cumulativeText
              .replace(/'/g, "\\'")
              .replace(/:/g, "\\:")
              .replace(/\[/g, "\\[")
              .replace(/\]/g, "\\]")
              .replace(/,/g, "\\,");
            
            const startFrame = Math.floor(startTime * 30); // 30 fps
            const endFrame = Math.floor(scene.duration * 30);
            
            textFilter += `,drawtext=text='${escapedText}':fontsize=48:fontcolor=white:shadowcolor=black:shadowx=2:shadowy=2:box=1:boxcolor=black@0.5:boxborderw=10:x=(w-text_w)/2:y=h-150:enable='between(n\\,${startFrame}\\,${endFrame})'`;
          });
          
          filterComplex += textFilter;
          console.log(`Scene ${i}: Added ${words.length} text animation steps`);
        }
        
        filterComplex += `[v${i}];`;
        cumulativeTime += scene.duration;
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

  // Helper function to calculate word timing for typewriter effect
  const calculateWordTimings = useCallback((text: string, duration: number, startTime: number = 0) => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    if (words.length === 0) return [];

    // Calculate timing per word (leaving some buffer time)
    const availableTime = duration * 0.9; // Use 90% of duration for text
    const timePerWord = availableTime / words.length;
    
    return words.map((word, index) => ({
      word,
      startTime: startTime + (index * timePerWord),
      endTime: startTime + ((index + 1) * timePerWord),
      cumulativeText: words.slice(0, index + 1).join(' ')
    }));
  }, []);

  // Helper function to create typewriter text overlay filters
  const createTypewriterTextFilter = useCallback((text: string, duration: number, sceneIndex: number, fps: number = 30) => {
    if (!text || text.trim().length === 0) return '';

    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    if (words.length === 0) return '';

    // Calculate word timings
    const wordTimings = calculateWordTimings(text, duration);
    
    // Create progressive text reveals using FFmpeg's drawtext filter
    let textFilters = '';
    
    wordTimings.forEach((timing, index) => {
      const startFrame = Math.floor(timing.startTime * fps);
      const endFrame = Math.floor((timing.startTime + duration) * fps);
      
      // Escape text for FFmpeg
      const escapedText = timing.cumulativeText
        .replace(/'/g, "\\'")
        .replace(/:/g, "\\:")
        .replace(/\[/g, "\\[")
        .replace(/\]/g, "\\]")
        .replace(/,/g, "\\,");
      
      textFilters += `drawtext=text='${escapedText}':` +
        `fontfile=/System/Library/Fonts/Helvetica.ttc:` + // Fallback font path
        `fontsize=48:` +
        `fontcolor=white:` +
        `shadowcolor=black:` +
        `shadowx=2:` +
        `shadowy=2:` +
        `box=1:` +
        `boxcolor=black@0.5:` +
        `boxborderw=10:` +
        `x=(w-text_w)/2:` +
        `y=h-150:` +
        `enable='between(n,${startFrame},${endFrame})':`;
    });
    
    return textFilters;
  }, [calculateWordTimings]);

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
      )}      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Enhanced Video Generation Process:</h4>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. Load FFmpeg WebAssembly engine from Cloudflare CDN</li>
          <li>2. Convert audio data URIs directly to binary data (CSP-compliant)</li>
          <li>3. Process voice-over audio and background music without network fetch</li>
          <li>4. Download or generate background videos/images for each scene</li>
          <li>5. Calculate word-by-word timing for typewriter text animation</li>
          <li>6. Process and write all media files to FFmpeg filesystem</li>
          <li>7. Combine videos/images with typewriter text overlays synced to voice</li>
          <li>8. Mix audio tracks (voice + music) with proper volumes</li>
          <li>9. Export as MP4 with full audio-visual composition and animated text</li>
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
