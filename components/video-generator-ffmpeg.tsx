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
  textAnimations?: TextAnimation[];
}

interface TextAnimation {
  text: string;
  fontSize: number;
  color: string;
  x: string;
  y: string;
  enable: string;
  start: number;
  end: number;
}

interface DeepgramWord {
  word: string;
  start: number;
  end: number;
}

interface SynchronizedScene extends Scene {
  textAnimations?: TextAnimation[];
  wordTimings?: DeepgramWord[];
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
    }  }, []);

  // Generate voice-over using VoiceRSS API
  const generateVoiceOver = useCallback(async (script: string, voiceSettings?: any): Promise<string> => {
    try {
      const response = await fetch('/api/video-generator/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script, voiceSettings })
      });
      
      if (!response.ok) {
        throw new Error(`Voice generation failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data.voiceUrl;
    } catch (error) {
      console.error('Voice generation error:', error);
      throw error;
    }
  }, []);

  // Generate background music using Jamendo API
  const generateBackgroundMusic = useCallback(async (mood: string, duration: number, volume: number = 40): Promise<string> => {
    try {
      const response = await fetch('/api/video-generator/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, duration, volume })
      });
      
      if (!response.ok) {
        throw new Error(`Music generation failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data.musicUrl;
    } catch (error) {
      console.error('Music generation error:', error);
      throw error;
    }
  }, []);

  // Get word-level timing from Deepgram for synchronization
  const getWordTimings = useCallback(async (audioUrl: string): Promise<DeepgramWord[]> => {
    try {
      // Convert audio URL to buffer for Deepgram
      const audioResponse = await fetch(audioUrl);
      const audioArrayBuffer = await audioResponse.arrayBuffer();
      const audioBuffer = Buffer.from(audioArrayBuffer);
      
      // Call our Deepgram API (we'd need to create this endpoint)
      const response = await fetch('/api/video-generator/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: audioBuffer
      });
      
      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data.words || [];
    } catch (error) {
      console.error('Word timing extraction error:', error);
      return [];
    }
  }, []);

  // Create synchronized text animations based on word timings
  const createSynchronizedAnimations = useCallback((
    text: string, 
    wordTimings: DeepgramWord[], 
    sceneStartTime: number,
    sceneDuration: number
  ): TextAnimation[] => {
    const animations: TextAnimation[] = [];
    const fps = 30; // Video FPS
    
    // Split text into words
    const textWords = text.toLowerCase().split(/\s+/);
    
    // Find matching word timings for each word in the text
    let currentTime = sceneStartTime;
    
    textWords.forEach((textWord, index) => {
      // Clean the word for matching (remove punctuation)
      const cleanTextWord = textWord.replace(/[^\w]/g, '');
      
      // Find the corresponding timing from Deepgram
      const timing = wordTimings.find(w => 
        w.word.toLowerCase().replace(/[^\w]/g, '') === cleanTextWord
      );
      
      if (timing) {
        // Convert timing to frame numbers (relative to scene start)
        const startFrame = Math.floor((timing.start - sceneStartTime) * fps);
        const endFrame = Math.floor((timing.end - sceneStartTime) * fps);
        const maxFrame = Math.floor(sceneDuration * fps);
        
        // Only add animation if it falls within the scene duration
        if (startFrame >= 0 && startFrame < maxFrame) {
          animations.push({
            text: textWord,
            fontSize: 36,
            color: 'white',
            x: `(w-text_w)/2 + ${index * 20}`, // Slight offset for each word
            y: 'h-120',
            enable: `between(n\\,${Math.max(0, startFrame)}\\,${Math.min(endFrame, maxFrame)})`,
            start: timing.start,
            end: timing.end
          });
        }
        
        currentTime = timing.end;
      } else {
        // Fallback timing if no match found
        const estimatedDuration = 0.5; // 500ms per word as fallback
        const startFrame = Math.floor(currentTime * fps);
        const endFrame = Math.floor((currentTime + estimatedDuration) * fps);
        const maxFrame = Math.floor(sceneDuration * fps);
        
        if (startFrame >= 0 && startFrame < maxFrame) {
          animations.push({
            text: textWord,
            fontSize: 36,
            color: 'white',
            x: `(w-text_w)/2 + ${index * 20}`,
            y: 'h-120',
            enable: `between(n\\,${startFrame}\\,${Math.min(endFrame, maxFrame)})`,
            start: currentTime,
            end: currentTime + estimatedDuration
          });
        }
        
        currentTime += estimatedDuration;
      }
    });
    
    return animations;
  }, []);

  // Enhanced audio file validation function
  const validateAudioFile = useCallback((audioData: Uint8Array): boolean => {
    try {
      if (!audioData || audioData.byteLength < 100) {
        console.warn('Audio file too small or empty');
        return false;
      }
      
      // Check for common audio file signatures
      const bytes = audioData;
      
      // MP3 with ID3 tag (most common)
      if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
        console.log('Detected MP3 with ID3 header');
        return true;
      }
      
      // MP3 frame sync (0xFF followed by 0xE0-0xFF or 0xF0-0xFF)
      if (bytes[0] === 0xFF && (bytes[1] & 0xE0) === 0xE0) {
        console.log('Detected MP3 frame sync header');
        return true;
      }
      
      // WAV format
      if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
          bytes[8] === 0x57 && bytes[9] === 0x41 && bytes[10] === 0x56 && bytes[11] === 0x45) {
        console.log('Detected WAV format');
        return true;
      }
      
      // OGG format
      if (bytes[0] === 0x4F && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53) {
        console.log('Detected OGG format');
        return true;
      }
      
      // M4A/AAC format (starts with ftyp)
      if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
        console.log('Detected M4A/AAC format');
        return true;
      }
      
      console.warn('Unknown audio format or corrupted file');
      console.warn('First 16 bytes:', Array.from(bytes.slice(0, 16)).map(b => b.toString(16).padStart(2, '0')).join(' '));
      return false;
    } catch (error) {
      console.error('Error validating audio file:', error);
      return false;
    }
  }, []);

  // Simplified audio preprocessing function
  const preprocessAudio = useCallback(async (ffmpeg: any, inputFile: string, outputFile: string): Promise<boolean> => {
    try {
      console.log(`Pre-processing ${inputFile} to ensure compatibility...`);
      
      // Simple re-encoding to ensure compatibility
      await ffmpeg.exec(['-i', inputFile, '-acodec', 'mp3', '-ar', '44100', '-ac', '2', '-ab', '128k', outputFile]);
      
      console.log(`${inputFile} pre-processing completed`);
      return true;
    } catch (error) {
      console.error(`${inputFile} pre-processing failed:`, error);
      return false;
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

    // Store script for potential regeneration needs
    const currentScript = script || targetScenes.map(s => s.voiceText).join(' ') || 'Default video script';

    try {
      setIsGenerating(true);
      setError("");
      setProgress(0);
      
      const ffmpeg = ffmpegRef.current;      console.log("Starting enhanced video generation with:", {
        scenes: targetScenes.length,
        hasVoiceUrl: !!voiceUrl,
        hasMusicUrl: !!musicUrl,
        script: script?.substring(0, 50) + "...",
        scenesWithText: targetScenes.filter(s => s.onScreenText || s.voiceText).length
      });      // Generate voice-over and music using APIs if not provided OR if existing ones are corrupted
      let finalVoiceUrl = voiceUrl;
      let finalMusicUrl = musicUrl;
      let wordTimings: DeepgramWord[] = [];      // Always try to generate fresh voice-over if we have a script (to avoid corruption)
      if (currentScript && currentScript.trim()) {
        console.log("Generating fresh voice-over using VoiceRSS API to avoid corruption...");
        setLoadingStatus("Generating voice-over...");
        try {
          finalVoiceUrl = await generateVoiceOver(currentScript, { 
            language: 'en-us', 
            voice: 'Linda',
            speed: 0 // Normal speed
          });
          console.log("Fresh voice-over generated successfully");
          setProgress(5);
        } catch (error) {
          console.warn("Voice generation failed, will try existing voice-over:", error);
          // Keep the original voiceUrl as fallback
        }
      }

      // Always try to generate fresh background music (to avoid corruption)
      console.log("Generating fresh background music using Jamendo API to avoid corruption...");
      setLoadingStatus("Selecting background music...");
      try {
        const totalDuration = targetScenes.reduce((sum, scene) => sum + scene.duration, 0);
        finalMusicUrl = await generateBackgroundMusic('uplifting', totalDuration, 30);
        console.log("Fresh background music generated successfully");
        setProgress(8);
      } catch (error) {
        console.warn("Music generation failed, will try existing music:", error);
        // Keep the original musicUrl as fallback
      }

      // Get word-level timing for synchronization
      if (finalVoiceUrl) {
        console.log("Extracting word timings using Deepgram...");
        setLoadingStatus("Analyzing speech timing...");
        try {
          wordTimings = await getWordTimings(finalVoiceUrl);
          console.log(`Extracted ${wordTimings.length} word timings`);
          setProgress(12);
        } catch (error) {
          console.warn("Word timing extraction failed, using fallback timing:", error);
        }
      }

      // Use the generated URLs if available
      const processVoiceUrl = finalVoiceUrl || voiceUrl;
      const processMusicUrl = finalMusicUrl || musicUrl;      // Download and process voice-over and music if provided
      let voiceData: Uint8Array | null = null;
      let musicData: Uint8Array | null = null;

      if (processVoiceUrl) {
        try {          console.log("Downloading and validating voice-over audio...");
          
          // Use the same approach as videos - fetchFile handles all URL types
          voiceData = await fetchFile(processVoiceUrl);
            // Validate the audio data before writing
          if (voiceData && voiceData.byteLength > 0) {
            console.log(`Voice-over data size: ${voiceData.byteLength} bytes`);
            
            // Validate minimum file size (MP3 should be at least a few KB)
            if (voiceData.byteLength < 1000) {
              console.warn(`Voice-over file too small (${voiceData.byteLength} bytes), likely corrupted`);
              voiceData = null;
            } else {
              // Check for valid audio file headers
              const isValidAudio = validateAudioFile(voiceData);
              if (!isValidAudio) {
                console.warn('Voice-over file appears to be corrupted (invalid headers)');
                voiceData = null;
              } else {
                await ffmpeg.writeFile('voice.mp3', voiceData);
                
                // Test if FFmpeg can read the voice file
                try {
                  await ffmpeg.exec(['-i', 'voice.mp3', '-t', '0.1', '-f', 'null', '-']);
                  console.log("Voice-over audio downloaded and validated successfully:", processVoiceUrl.substring(0, 50) + '...');
                  setProgress(15);
                } catch (validationError) {
                  console.error('Voice-over file failed FFmpeg validation:', validationError);
                  voiceData = null;
                }
              }
            }
          } else {
            console.warn("Voice-over data is empty or invalid");
            voiceData = null;
          }
        } catch (err) {
          console.warn("Failed to download voice-over:", err);          console.warn("Voice URL:", processVoiceUrl.substring(0, 100) + '...');
          
          // Fallback: try data URI conversion if it's a data URI
          if (processVoiceUrl.startsWith('data:')) {
            try {
              const convertedData = dataUriToUint8Array(processVoiceUrl);
              if (convertedData && convertedData.byteLength > 0) {
                voiceData = convertedData;
                console.log(`Voice-over data URI size: ${voiceData.byteLength} bytes`);
                await ffmpeg.writeFile('voice.mp3', voiceData);
                console.log("Voice-over processed via data URI fallback");
                setProgress(15);
              } else {
                console.warn("Data URI conversion resulted in empty or invalid data");
                voiceData = null;
              }
            } catch (fallbackErr) {
              console.warn("Data URI fallback also failed:", fallbackErr);
              voiceData = null;
            }
          } else {
            voiceData = null;
          }        }
      }
      
      if (processMusicUrl) {
        try {          console.log("Downloading background music (same approach as videos)...");
          
          // Use the same approach as videos - fetchFile handles all URL types
          musicData = await fetchFile(processMusicUrl);
            // Validate the audio data before writing
          if (musicData && musicData.byteLength > 0) {
            console.log(`Background music data size: ${musicData.byteLength} bytes`);
            
            // Validate minimum file size (MP3 should be at least a few KB)
            if (musicData.byteLength < 1000) {
              console.warn(`Background music file too small (${musicData.byteLength} bytes), likely corrupted - regenerating...`);
              try {
                console.log("Regenerating background music due to corruption...");
                const totalDuration = targetScenes.reduce((sum, scene) => sum + scene.duration, 0);
                const newMusicUrl = await generateBackgroundMusic('uplifting', totalDuration, 30);
                musicData = await fetchFile(newMusicUrl);
                console.log("Background music regenerated successfully");
              } catch (regenError) {
                console.warn("Music regeneration failed:", regenError);
                musicData = null;
              }
            } else {
              // Check for valid audio file headers
              const isValidAudio = validateAudioFile(musicData);
              if (!isValidAudio) {
                console.warn('Background music file appears to be corrupted (invalid headers) - regenerating...');
                try {
                  console.log("Regenerating background music due to invalid headers...");
                  const totalDuration = targetScenes.reduce((sum, scene) => sum + scene.duration, 0);
                  const newMusicUrl = await generateBackgroundMusic('uplifting', totalDuration, 30);
                  musicData = await fetchFile(newMusicUrl);
                  console.log("Background music regenerated successfully");
                } catch (regenError) {
                  console.warn("Music regeneration failed:", regenError);
                  musicData = null;
                }
              } else {
                // Write to FFmpeg filesystem - use .mp3 extension but handle as raw audio data
                await ffmpeg.writeFile('background_music.mp3', musicData);
                
                // Test if FFmpeg can read the music file
                try {
                  await ffmpeg.exec(['-i', 'background_music.mp3', '-t', '0.1', '-f', 'null', '-']);
                  console.log("Background music downloaded and validated successfully:", processMusicUrl.substring(0, 50) + '...');
                  setProgress(25);
                } catch (validationError) {
                  console.error('Background music file failed FFmpeg validation - regenerating...', validationError);
                  try {
                    console.log("Regenerating background music due to FFmpeg validation failure...");
                    const totalDuration = targetScenes.reduce((sum, scene) => sum + scene.duration, 0);
                    const newMusicUrl = await generateBackgroundMusic('uplifting', totalDuration, 30);
                    musicData = await fetchFile(newMusicUrl);
                    await ffmpeg.writeFile('background_music.mp3', musicData);
                    console.log("Background music regenerated and validated successfully");
                  } catch (regenError) {
                    console.warn("Music regeneration failed:", regenError);
                    musicData = null;
                  }
                }
              }
            }
          } else {
            console.warn("Background music data is empty or invalid - regenerating...");
            try {
              console.log("Regenerating background music due to empty data...");
              const totalDuration = targetScenes.reduce((sum, scene) => sum + scene.duration, 0);
              const newMusicUrl = await generateBackgroundMusic('uplifting', totalDuration, 30);
              musicData = await fetchFile(newMusicUrl);
              await ffmpeg.writeFile('background_music.mp3', musicData);
              console.log("Background music regenerated successfully");            } catch (regenError) {
              console.warn("Music regeneration failed:", regenError);
              musicData = null;
            }
          }
        } catch (err) {
          console.warn("Failed to download background music:", err);
          console.warn("Music URL:", processMusicUrl.substring(0, 100) + '...');
          
          // Fallback: try data URI conversion if it's a data URI
          if (processMusicUrl.startsWith('data:')) {
            try {
              const convertedData = dataUriToUint8Array(processMusicUrl);
              if (convertedData && convertedData.byteLength > 0) {
                musicData = convertedData;
                console.log(`Background music data URI size: ${musicData.byteLength} bytes`);
                await ffmpeg.writeFile('background_music.mp3', musicData);
                console.log("Background music processed via data URI fallback");
                setProgress(25);
              } else {
                console.warn("Data URI conversion resulted in empty or invalid data");
                musicData = null;
              }
            } catch (fallbackErr) {
              console.warn("Data URI fallback also failed:", fallbackErr);
              musicData = null;
            }
          } else {
            musicData = null;
          }
        }
      }        // Generate images for each scene with enhanced processing
      setLoadingStatus("Processing scenes with synchronized timing...");
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
            // Calculate scene timing for synchronization
          const sceneStartTime = targetScenes.slice(0, index).reduce((sum, s) => sum + s.duration, 0);
          const synchronizedAnimations = scene.onScreenText && wordTimings.length > 0 
            ? createSynchronizedAnimations(scene.onScreenText, wordTimings, sceneStartTime, scene.duration)
            : scene.onScreenText ? [{
                text: scene.onScreenText,
                fontSize: 36,
                color: 'white',
                x: '(w-text_w)/2',
                y: 'h-120',
                enable: `between(n\\,0\\,${Math.floor(30 * scene.duration)})`,
                start: sceneStartTime,
                end: sceneStartTime + scene.duration
              }] : [];

          return { 
            ...scene, 
            imageData, 
            videoData, 
            index,
            textAnimations: synchronizedAnimations,
            wordTimings: wordTimings.filter(w => 
              w.start >= sceneStartTime && w.start < sceneStartTime + scene.duration
            )
          };
        })
      );

      setProgress(60);

      // Log synchronization results
      console.log("Synchronization summary:");
      processedScenes.forEach((scene, index) => {
        console.log(`Scene ${index + 1}: ${scene.textAnimations?.length || 0} synchronized animations, ${scene.wordTimings?.length || 0} word timings`);
      });

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

      // Load local Roboto font for text overlay
      console.log("Loading local Roboto font for text overlay...");
      try {
        // Try different possible Roboto font filenames
        const possibleFonts = [
          '/roboto/Roboto-Regular.ttf',
          '/roboto/Roboto-Medium.ttf',
          '/roboto/Roboto.ttf',
          '/roboto/roboto-regular.ttf',
          '/roboto/roboto.ttf'
        ];
        
        let fontLoaded = false;
        for (const fontPath of possibleFonts) {
          try {
            console.log(`Trying to load font: ${fontPath}`);
            const fontResponse = await fetch(fontPath);
            if (fontResponse.ok) {
              const fontData = await fontResponse.arrayBuffer();
              await ffmpeg.writeFile('roboto.ttf', new Uint8Array(fontData));
              console.log(`Roboto font loaded successfully from: ${fontPath}`);
              fontLoaded = true;
              break;
            }
          } catch (individualErr) {
            console.log(`Font ${fontPath} not found, trying next...`);
          }
        }
        
        if (!fontLoaded) {
          console.warn("Could not load local Roboto font, text overlay may not work");
        }
      } catch (fontErr) {
        console.warn("Font loading failed:", fontErr);
      }

      // List all files in FFmpeg filesystem for debugging
      try {
        const files = await ffmpeg.listDir('/');
        console.log("Files in FFmpeg filesystem:", files.map(f => f.name).filter(name => name.endsWith('.mp3') || name.endsWith('.mp4') || name.endsWith('.png') || name.endsWith('.ttf')));
      } catch (err) {
        console.log("Could not list FFmpeg filesystem files:", err);
      }

      // Since our audio validation is working, skip the complex preprocessing that might be causing issues
      console.log("Validating voice audio file...");
      if (voiceData) {
        try {
          await ffmpeg.exec(['-i', 'voice.mp3', '-t', '0.1', '-f', 'null', '-']);
          console.log("Voice audio file is valid");
        } catch (err) {
          console.warn('Voice audio validation failed:', err);
          try {
            console.log("Attempting to fix voice audio...");
            await ffmpeg.exec(['-i', 'voice.mp3', '-acodec', 'mp3', '-ar', '44100', '-ac', '2', '-ab', '128k', 'voice_fixed.mp3']);
            await ffmpeg.deleteFile('voice.mp3');
            await ffmpeg.rename('voice_fixed.mp3', 'voice.mp3');
            console.log("Voice audio fixed successfully");
          } catch (fixErr) {
            console.error('Voice audio fix failed:', fixErr);
            voiceData = null;
          }
        }
      }

      console.log("Validating background music file...");
      if (musicData) {
        try {
          await ffmpeg.exec(['-i', 'background_music.mp3', '-t', '0.1', '-f', 'null', '-']);
          console.log("Background music file is valid");
        } catch (err) {
          console.warn('Background music validation failed:', err);
          try {
            console.log("Attempting to fix background music...");
            await ffmpeg.exec(['-i', 'background_music.mp3', '-acodec', 'mp3', '-ar', '44100', '-ac', '2', '-ab', '128k', 'music_fixed.mp3']);
            await ffmpeg.deleteFile('background_music.mp3');
            await ffmpeg.rename('music_fixed.mp3', 'background_music.mp3');
            console.log("Background music fixed successfully");
          } catch (fixErr) {
            console.error('Background music fix failed:', fixErr);
            musicData = null;
          }
        }
      }

      // Build comprehensive FFmpeg command
      const commands: string[] = [];
      let inputIndex = 0;

      // Add voice-over input if available
      if (voiceData) {
        commands.push('-i', 'voice.mp3');
        inputIndex++;
      }      // Add background music input if available  
      if (musicData) {
        commands.push('-i', 'background_music.mp3');
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
        
        // Basic video processing - scale and prepare video input
        filterComplex += `[${inputIdx}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setpts=PTS-STARTPTS,fps=30`;
        
        // Add typewriter text overlay with web font
        let textToDisplay = scene.onScreenText || scene.voiceText;
        
        // If no text in scene but we have a script, try to extract relevant text
        if ((!textToDisplay || textToDisplay.trim().length === 0) && script) {
          // Simple approach: use a portion of the script for each scene
          const scriptWords = script.split(/\s+/).filter(word => word.length > 0);
          const wordsPerScene = Math.ceil(scriptWords.length / targetScenes.length);
          const startIdx = i * wordsPerScene;
          const endIdx = Math.min(startIdx + wordsPerScene, scriptWords.length);
          textToDisplay = scriptWords.slice(startIdx, endIdx).join(' ');
          console.log(`Scene ${i}: Using script text (${startIdx}-${endIdx}):`, textToDisplay.substring(0, 50) + '...');
        }
        
        // Final fallback: provide default text
        if (!textToDisplay || textToDisplay.trim().length === 0) {
          textToDisplay = `Scene ${i + 1} - Uplifting moments to brighten your day`;
          console.log(`Scene ${i}: Using fallback text:`, textToDisplay);
        }
        
        if (textToDisplay && textToDisplay.trim().length > 0) {
          console.log(`Adding typewriter effect for scene ${i}:`, textToDisplay.substring(0, 50) + '...');
          
          // Create typewriter effect with word-by-word reveal
          const words = textToDisplay.trim().split(/\s+/).filter(word => word.length > 0);
          const timePerWord = Math.max(0.3, (scene.duration * 0.9) / words.length); // Min 0.3s per word, use 90% of scene duration
          
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
              .replace(/,/g, "\\,")
              .replace(/"/g, '\\"');
            
            const startFrame = Math.floor(startTime * 30); // 30 fps
            const endFrame = Math.floor(scene.duration * 30);
            
            // Add typewriter text overlay with local Roboto font
            textFilter += `,drawtext=text='${escapedText}':fontfile=roboto.ttf:fontsize=36:fontcolor=white:x=(w-text_w)/2:y=h-80:enable='between(n\\,${startFrame}\\,${endFrame})'`;
          });
          
          filterComplex += textFilter;
          console.log(`Scene ${i}: Added ${words.length} text animation steps with typewriter effect`);
        } else {
          console.log(`Scene ${i}: No text to display`);
        }
        
        filterComplex += `[v${i}];`;
        cumulativeTime += scene.duration;
      }

      // Concatenate video streams
      filterComplex += processedScenes.map((_, i) => `[v${i}]`).join('') + `concat=n=${processedScenes.length}:v=1:a=0[outv]`;      // Handle audio mixing with proper input references
      if (voiceData && musicData) {
        // Mix voice and background music - voice.mp3 is input 0, background_music.mp3 is input 1
        filterComplex += ';[0:a]volume=1.0[voice];[1:a]volume=0.3[music];[voice][music]amix=inputs=2:duration=shortest[audio]';
        commands.push('-filter_complex', filterComplex);
        commands.push('-map', '[outv]', '-map', '[audio]');
      } else if (voiceData) {
        // Voice only - voice.mp3 is input 0
        filterComplex += ';[0:a]apad[audio]';
        commands.push('-filter_complex', filterComplex);
        commands.push('-map', '[outv]', '-map', '[audio]');
      } else if (musicData) {
        // Music only - background_music.mp3 is input 0
        filterComplex += ';[0:a]volume=0.5[audio]';
        commands.push('-filter_complex', filterComplex);
        commands.push('-map', '[outv]', '-map', '[audio]');
      } else {
        // No audio - create silent track
        commands.push('-filter_complex', filterComplex);
        commands.push('-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100');
        commands.push('-map', '[outv]', '-map', `${inputIndex}:a`);
      }      // Encoding settings
      commands.push(
        '-c:v', 'libx264',
        '-preset', 'fast', 
        '-crf', '23',
        '-c:a', 'aac',
        '-shortest',
        'output.mp4'
      );      setProgress(80);

      console.log("Executing enhanced FFmpeg command:", commands.join(' '));
        try {
        await ffmpeg.exec(commands);
        console.log("FFmpeg command executed successfully");
      } catch (mainErr) {
        console.error("Main FFmpeg command failed:", mainErr);
        const errorStr = String(mainErr);        // Check if it's an audio-related error
        if (errorStr.includes('Invalid argument') || 
            errorStr.includes('Failed to read frame size') ||
            errorStr.includes('Could not seek to') ||
            errorStr.includes('background_music.mp3') ||
            errorStr.includes('voice.mp3')) {
          console.error("Audio processing error detected. This is likely due to corrupted audio files.");
          console.error("Voice URL:", processVoiceUrl?.substring(0, 100));
          console.error("Music URL:", processMusicUrl?.substring(0, 100));
            // Try to regenerate audio files on the spot
          try {
            console.log("Attempting to regenerate audio files due to corruption...");
            if (currentScript) {
              const newVoiceUrl = await generateVoiceOver(currentScript, { language: 'en-us', voice: 'Linda', speed: 0 });
              const newVoiceData = await fetchFile(newVoiceUrl);
              await ffmpeg.writeFile('voice.mp3', newVoiceData);
              console.log("Voice-over regenerated successfully");
            }
            
            const totalDuration = targetScenes.reduce((sum, scene) => sum + scene.duration, 0);
            const newMusicUrl = await generateBackgroundMusic('uplifting', totalDuration, 30);
            const newMusicData = await fetchFile(newMusicUrl);
            await ffmpeg.writeFile('background_music.mp3', newMusicData);
            console.log("Background music regenerated successfully");
            
            // Retry the main command with fresh audio
            console.log("Retrying video generation with fresh audio files...");
            await ffmpeg.exec(commands);
            console.log("Video generation successful after audio regeneration");
            
            // Read the output file and continue with normal success path
            const data = await ffmpeg.readFile('output.mp4') as Uint8Array;
            const videoBlob = new Blob([data], { type: 'video/mp4' });
            const url = URL.createObjectURL(videoBlob);
            
            setVideoUrl(url);
            if (videoRef.current) {
              videoRef.current.src = url;
            }
            
            onVideoGenerated?.(videoBlob);
            console.log("Video generated successfully after corruption recovery");
            return; // Exit early on success
          } catch (regenError) {
            console.error("Audio regeneration also failed:", regenError);
            // Continue to fallback strategies
          }
        }
        
        // Fallback strategy: Simpler approach without complex audio mixing
        console.log("Attempting fallback video generation...");
        
        try {
          const fallbackCommands: string[] = [];
          
          // Start with just the video concatenation
          if (processedScenes.length > 1) {
            // Multiple scenes - concatenate them
            const videoInputs = processedScenes.map((_, i) => {
              const inputIdx = (voiceData ? 1 : 0) + (musicData ? 1 : 0) + i;
              return `[${inputIdx}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2[v${i}]`;
            }).join(';');
            
            const concatFilter = processedScenes.map((_, i) => `[v${i}]`).join('') + `concat=n=${processedScenes.length}:v=1:a=0[outv]`;
            
            // Add inputs
            if (voiceData) fallbackCommands.push('-i', 'voice.mp3');
            if (musicData) fallbackCommands.push('-i', 'background_music.mp3');
            
            processedScenes.forEach((scene) => {
              if (scene.videoData) {
                fallbackCommands.push('-i', `video_${scene.index}.mp4`, '-t', scene.duration.toString());
              } else {
                fallbackCommands.push('-loop', '1', '-t', scene.duration.toString(), '-i', `image_${scene.index}.png`);
              }
            });
            
            // Simple audio handling
            if (voiceData) {
              fallbackCommands.push('-filter_complex', `${videoInputs};${concatFilter}`);
              fallbackCommands.push('-map', '[outv]', '-map', '0:a');
            } else if (musicData) {
              fallbackCommands.push('-filter_complex', `${videoInputs};${concatFilter}`);
              fallbackCommands.push('-map', '[outv]', '-map', '0:a');
            } else {
              fallbackCommands.push('-filter_complex', `${videoInputs};${concatFilter}`);
              fallbackCommands.push('-an'); // No audio
            }
          } else {
            // Single scene - simpler approach
            const inputIdx = (voiceData ? 1 : 0) + (musicData ? 1 : 0);
            
            if (voiceData) fallbackCommands.push('-i', 'voice.mp3');
            if (musicData) fallbackCommands.push('-i', 'background_music.mp3');
            
            if (processedScenes[0].videoData) {
              fallbackCommands.push('-i', `video_0.mp4`, '-t', processedScenes[0].duration.toString());
            } else {
              fallbackCommands.push('-loop', '1', '-t', processedScenes[0].duration.toString(), '-i', `image_0.png`);
            }
            
            if (voiceData) {
              fallbackCommands.push('-map', `${inputIdx}:v`, '-map', '0:a');
            } else if (musicData) {
              fallbackCommands.push('-map', `${inputIdx}:v`, '-map', '0:a');
            } else {
              fallbackCommands.push('-map', `${inputIdx}:v`, '-an');
            }
          }
          
          fallbackCommands.push('-c:v', 'libx264', '-preset', 'fast', '-crf', '23');
          if (voiceData || musicData) {
            fallbackCommands.push('-c:a', 'aac');
          }
          fallbackCommands.push('-shortest', 'output_fallback.mp4');
          
          console.log("Executing fallback FFmpeg command:", fallbackCommands.join(' '));
          await ffmpeg.exec(fallbackCommands);
          
          // Try to read the fallback output
          const data = await ffmpeg.readFile('output_fallback.mp4') as Uint8Array;
          const videoBlob = new Blob([data], { type: 'video/mp4' });
          const url = URL.createObjectURL(videoBlob);
          
          setVideoUrl(url);
          if (videoRef.current) {
            videoRef.current.src = url;
          }
          
          console.log("Fallback video generation successful");
            } catch (fallbackErr) {
          console.error("Fallback video generation also failed:", fallbackErr);
          
          // Final fallback: Generate video without any audio
          console.log("Attempting final fallback: video-only generation...");
          try {
            const videoOnlyCommands: string[] = [];
            
            if (processedScenes.length > 1) {
              // Multiple scenes - concatenate them without audio
              const videoInputs = processedScenes.map((_, i) => `-i video_${i}.mp4`).flat();
              videoOnlyCommands.push(...videoInputs);
              
              const filterComplex = processedScenes.map((scene, i) => {
                return `[${i}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setpts=PTS-STARTPTS,fps=30[v${i}]`;
              }).join(';');
              
              const finalFilter = filterComplex + ';' + processedScenes.map((_, i) => `[v${i}]`).join('') + `concat=n=${processedScenes.length}:v=1:a=0[outv]`;
              
              videoOnlyCommands.push('-filter_complex', finalFilter);
              videoOnlyCommands.push('-map', '[outv]');
            } else {
              // Single scene
              videoOnlyCommands.push('-i', 'video_0.mp4');
              const scene = processedScenes[0];
              
              // Remove all text animations to avoid font dependencies
              videoOnlyCommands.push('-vf', 'scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setpts=PTS-STARTPTS,fps=30');
            }
              // Add silent audio track
            videoOnlyCommands.push('-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100');
            if (processedScenes.length > 1) {
              videoOnlyCommands.push('-map', '[outv]', '-map', `${processedScenes.length}:a`);
            } else {
              videoOnlyCommands.push('-map', '0:v', '-map', '1:a');
            }
            videoOnlyCommands.push('-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-c:a', 'aac', '-shortest', 'output.mp4');
            
            console.log("Executing video-only command:", videoOnlyCommands.join(' '));
            await ffmpeg.exec(videoOnlyCommands);
            console.log("Video-only generation successful");
            
          } catch (videoOnlyErr) {
            console.error("Video-only generation also failed:", videoOnlyErr);
            throw new Error(`All video generation attempts failed. Main error: ${mainErr}. Fallback error: ${fallbackErr}. Video-only error: ${videoOnlyErr}`);
          }
        }
        
        setProgress(95);
        return; // Skip the normal success path
      }

      // Read the output file (normal success path)
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
  }, [
    loaded, 
    isGenerating, 
    scenes, 
    onVideoGenerated, 
    generateFallbackImage, 
    generateVoiceOver, 
    generateBackgroundMusic, 
    getWordTimings, 
    createSynchronizedAnimations, 
    validateAudioFile, 
    dataUriToUint8Array,
    preprocessAudio
  ]);
  const downloadVideo = useCallback(() => {
    if (!videoUrl) return;
    
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `${(prompt || 'video').slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}_video.mp4`;
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
        `fontsize=48:` +
        `fontcolor=white:` +
        `x=(w-text_w)/2:` +
        `y=h-150:` +
        `enable='between(n,${startFrame},${endFrame})':`;
    });
    
    return textFilters;
  }, [calculateWordTimings]);

  // Add test functions for APIs
  const testVoiceRSSAPI = async () => {
    try {
      console.log("Testing VoiceRSS API...");
      const testScript = "This is a test of the VoiceRSS API. If you can hear this, the API is working correctly.";
      
      const response = await fetch('/api/video-generator/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: testScript,
          language: 'en-us',
          voice: 'Linda',
          speed: 0
        })
      });
      
      if (!response.ok) {
        throw new Error(`VoiceRSS API test failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("VoiceRSS API test successful:", data);
      return data.voiceUrl;
    } catch (error) {
      console.error("VoiceRSS API test failed:", error);
      throw error;
    }
  };

  const testJamendoAPI = async () => {
    try {
      console.log("Testing Jamendo API...");
      const response = await fetch('/api/video-generator/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mood: 'uplifting',
          duration: 30,
          volume: 40
        })
      });
      
      if (!response.ok) {
        throw new Error(`Jamendo API test failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Jamendo API test successful:", data);
      return data.musicUrl;
    } catch (error) {
      console.error("Jamendo API test failed:", error);
      throw error;
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Existing video player and controls */}
      {videoUrl && (
          <video
            ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
            controls
          playsInline
        />
      )}
      
      {/* Add test buttons */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={async () => {
            try {
              setLoadingStatus("Testing VoiceRSS API...");
              const voiceUrl = await testVoiceRSSAPI();
              console.log("VoiceRSS test completed:", voiceUrl);
              setLoadingStatus("VoiceRSS API test completed");
            } catch (error) {
              console.error("VoiceRSS test failed:", error);
              setLoadingStatus("VoiceRSS API test failed");
            }
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test VoiceRSS
        </button>
        
        <button
          onClick={async () => {
            try {
              setLoadingStatus("Testing Jamendo API...");
              const musicUrl = await testJamendoAPI();
              console.log("Jamendo test completed:", musicUrl);
              setLoadingStatus("Jamendo API test completed");
            } catch (error) {
              console.error("Jamendo test failed:", error);
              setLoadingStatus("Jamendo API test failed");
            }
          }}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Jamendo
        </button>
      </div>
      
      {/* Existing loading and error states */}
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
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-red-500 text-white p-4 rounded">
            {error}
        </div>
          </div>
        )}
    </div>
  );
});

VideoGeneratorFFmpeg.displayName = 'VideoGeneratorFFmpeg';

export default VideoGeneratorFFmpeg;
