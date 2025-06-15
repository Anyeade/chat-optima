import { Artifact } from '@/components/create-artifact';
import { DiffView } from '@/components/diffview';
import { DocumentSkeleton } from '@/components/document-skeleton';
import { toast } from 'sonner';
import {
  CopyIcon,
  UndoIcon,
  RedoIcon,
  EyeIcon,
  PlayIcon,
  DownloadIcon,
} from '@/components/icons';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Simple Progress component
const Progress = ({ value, className }: { value: number; className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className || ''}`}>
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
      style={{ width: `${value}%` }}
    />
  </div>
);

// Simple Send icon component
const SendIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m22 2-7 20-4-9-9-4Z"/>
    <path d="M22 2 11 13"/>
  </svg>
);

interface VideoGeneratorMetadata {
  // Core video data
  aiPrompt: string;
  videoType: 'youtube-shorts' | 'youtube-long' | 'instagram-reel' | 'tiktok-video' | 'explainer';
  duration: 15 | 30 | 60 | 120 | 300; // seconds
  
  // Generated content
  script: string;
  scenes: Array<{
    id: string;
    duration: number;
    voiceText: string;
    onScreenText?: string;
    backgroundVideo: string;
    transition: 'fade' | 'slide' | 'zoom' | 'cut';
  }>;
  
  // Audio
  voiceOverUrl: string | null;
  backgroundMusicUrl: string | null;
  musicVolume: number; // 0-100, default 40
  
  // Generation state
  isGenerating: boolean;
  generationStep: string;
  generationProgress: number; // 0-100
  
  // Final result
  finalVideoUrl: string | null;
  isComplete: boolean;
}

export const videoGeneratorClient = new Artifact<'video-generator', VideoGeneratorMetadata>({
  kind: 'video-generator',
  description: 'AI-powered video creation with InVideo.ai style workflow',
  initialize: ({ setMetadata }: { setMetadata: React.Dispatch<React.SetStateAction<VideoGeneratorMetadata>> }) => {
    setMetadata({
      aiPrompt: '',
      videoType: 'youtube-shorts',
      duration: 60,
      script: '',
      scenes: [],
      voiceOverUrl: null,
      backgroundMusicUrl: null,
      musicVolume: 40,
      isGenerating: false,
      generationStep: '',
      generationProgress: 0,
      finalVideoUrl: null,
      isComplete: false
    });
  },
  content: ({ metadata, setMetadata, content, mode, isLoading, title, ...props }: {
    metadata: VideoGeneratorMetadata;
    setMetadata: React.Dispatch<React.SetStateAction<VideoGeneratorMetadata>>;
    content: string;
    title: string;
    mode?: string;
    isCurrentVersion?: boolean;
    currentVersionIndex?: number;
    onSaveContent?: any;
    getDocumentContentById?: any;
    isLoading?: boolean;
    [key: string]: any;
  }) => {
    const [aiEditPrompt, setAiEditPrompt] = useState('');

    // Auto-detect prompt from title
    useEffect(() => {
      if (title && title !== metadata.aiPrompt) {
        console.log('🎯 Auto-detected prompt:', title);
        setMetadata(prev => ({
          ...prev,
          aiPrompt: title
        }));
      }
    }, [title, setMetadata]);

    // Generate complete video with all steps
    const generateCompleteVideo = async () => {
      try {
        setMetadata(prev => ({ 
          ...prev, 
          isGenerating: true,
          generationProgress: 0,
          generationStep: 'Initializing...'
        }));

        // Step 1: Generate script (10%)
        setMetadata(prev => ({ 
          ...prev, 
          generationProgress: 10,
          generationStep: 'Creating voice-over script...'
        }));
        
        const scriptResponse = await fetch('/api/video-generator/script', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: metadata.aiPrompt,
            videoType: metadata.videoType,
            duration: metadata.duration
          })
        });

        if (!scriptResponse.ok) throw new Error('Script generation failed');
        const { script } = await scriptResponse.json();
        
        setMetadata(prev => ({ ...prev, script }));

        // Step 2: Generate voice-over (30%)
        setMetadata(prev => ({ 
          ...prev, 
          generationProgress: 30,
          generationStep: 'Generating voice-over audio...'
        }));

        const voiceResponse = await fetch('/api/video-generator/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            script,
            voiceSettings: {
              language: 'en-US',
              gender: 'neutral',
              emotion: 'professional'
            }
          })
        });

        if (!voiceResponse.ok) throw new Error('Voice generation failed');
        const { voiceUrl } = await voiceResponse.json();
        
        setMetadata(prev => ({ ...prev, voiceOverUrl: voiceUrl }));

        // Step 3: Generate background music (50%)
        setMetadata(prev => ({ 
          ...prev, 
          generationProgress: 50,
          generationStep: 'Adding background music...'
        }));

        const musicResponse = await fetch('/api/video-generator/music', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mood: 'uplifting',
            duration: metadata.duration,
            volume: 40
          })
        });

        if (!musicResponse.ok) throw new Error('Music generation failed');
        const { musicUrl } = await musicResponse.json();
        
        setMetadata(prev => ({ ...prev, backgroundMusicUrl: musicUrl }));

        // Step 4: Generate scenes and background videos (70%)
        setMetadata(prev => ({ 
          ...prev, 
          generationProgress: 70,
          generationStep: 'Creating video scenes...'
        }));

        const scenesResponse = await fetch('/api/video-generator/scenes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            script,
            videoType: metadata.videoType,
            duration: metadata.duration
          })
        });

        if (!scenesResponse.ok) throw new Error('Scenes generation failed');
        const { scenes } = await scenesResponse.json();
        
        setMetadata(prev => ({ ...prev, scenes }));

        // Step 5: Apply transitions and sync (85%)
        setMetadata(prev => ({ 
          ...prev, 
          generationProgress: 85,
          generationStep: 'Applying transitions and synchronizing...'
        }));

        // Step 6: Generate final video (100%)
        setMetadata(prev => ({ 
          ...prev, 
          generationProgress: 95,
          generationStep: 'Rendering final video...'
        }));

        const finalResponse = await fetch('/api/video-generator/render', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            script,
            voiceUrl,
            musicUrl,
            scenes,
            videoType: metadata.videoType,
            duration: metadata.duration
          })
        });

        if (!finalResponse.ok) throw new Error('Final video rendering failed');
        const { videoUrl } = await finalResponse.json();

        setMetadata(prev => ({ 
          ...prev, 
          finalVideoUrl: videoUrl,
          isComplete: true,
          isGenerating: false,
          generationProgress: 100,
          generationStep: 'Video complete!'
        }));

        toast.success('🎉 Video generated successfully!');

      } catch (error) {
        console.error('Video generation failed:', error);
        setMetadata(prev => ({ 
          ...prev, 
          isGenerating: false,
          generationProgress: 0,
          generationStep: ''
        }));
        toast.error('Failed to generate video. Please try again.');
      }
    };

    // Handle AI edit requests
    const handleAiEdit = async () => {
      if (!aiEditPrompt.trim()) return;
      
      try {
        setMetadata(prev => ({ 
          ...prev, 
          isGenerating: true,
          generationStep: 'Applying AI changes...'
        }));

        const response = await fetch('/api/video-generator/edit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originalVideo: metadata.finalVideoUrl,
            editPrompt: aiEditPrompt,
            currentScript: metadata.script
          })
        });

        if (!response.ok) throw new Error('Edit failed');
        const { videoUrl, script } = await response.json();

        setMetadata(prev => ({ 
          ...prev, 
          finalVideoUrl: videoUrl,
          script,
          isGenerating: false,
          generationStep: ''
        }));

        setAiEditPrompt('');
        toast.success('Video updated successfully!');

      } catch (error) {
        console.error('Edit failed:', error);
        setMetadata(prev => ({ 
          ...prev, 
          isGenerating: false,
          generationStep: ''
        }));
        toast.error('Failed to edit video. Please try again.');
      }
    };

    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header with detected prompt */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="text-2xl">🎬</span>
              AI Video Generator
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                InVideo.ai Style
              </span>
            </CardTitle>
            <CardDescription>
              Create professional videos with AI-powered voice-over, music, and visuals
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Auto-detected prompt display */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-600">🎯</span>
                <span className="font-medium text-blue-800">Auto-detected Prompt:</span>
              </div>
              <p className="text-blue-700 font-medium text-lg">
                {metadata.aiPrompt || 'No prompt detected'}
              </p>
            </div>

            {/* Video configuration dropdowns */}
            {!metadata.isComplete && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Video Type</Label>
                  <Select 
                    value={metadata.videoType} 
                    onValueChange={(value) => setMetadata(prev => ({ 
                      ...prev, 
                      videoType: value as any 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose video type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youtube-shorts">
                        📱 YouTube Shorts (9:16)
                      </SelectItem>
                      <SelectItem value="youtube-long">
                        🎬 YouTube Video (16:9)
                      </SelectItem>
                      <SelectItem value="instagram-reel">
                        📸 Instagram Reel (9:16)
                      </SelectItem>
                      <SelectItem value="tiktok-video">
                        🎵 TikTok Video (9:16)
                      </SelectItem>
                      <SelectItem value="explainer">
                        🎓 Explainer Video (16:9)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Duration</Label>
                  <Select 
                    value={metadata.duration.toString()} 
                    onValueChange={(value) => setMetadata(prev => ({ 
                      ...prev, 
                      duration: parseInt(value) as any 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">⚡ 15 seconds</SelectItem>
                      <SelectItem value="30">🎯 30 seconds</SelectItem>
                      <SelectItem value="60">📱 1 minute</SelectItem>
                      <SelectItem value="120">🎬 2 minutes</SelectItem>
                      <SelectItem value="300">📺 5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Generate button */}
            {!metadata.isComplete && !metadata.isGenerating && (
              <Button
                onClick={generateCompleteVideo}
                disabled={!metadata.aiPrompt}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                ⚡ Generate Complete Video
              </Button>
            )}

            {/* Progress bar and status */}
            {metadata.isGenerating && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-blue-800">AI Magic in Progress</span>
                    <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                      {metadata.generationProgress}%
                    </span>
                  </div>
                  <Progress value={metadata.generationProgress} className="h-3 mb-3" />
                  <p className="text-blue-700 font-medium">
                    {metadata.generationStep}
                  </p>
                </div>
              </div>
            )}

            {/* Final video preview */}
            {metadata.isComplete && metadata.finalVideoUrl && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-600">✅</span>
                    <span className="font-semibold text-green-800">Video Generated Successfully!</span>
                  </div>
                  <p className="text-green-700">
                    Your professional video is ready with voice-over, background music, and transitions.
                  </p>
                </div>

                {/* Video preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PlayIcon size={20} />
                      Final Video Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <video
                        src={metadata.finalVideoUrl}
                        controls
                        className="w-full max-h-[400px] object-contain"
                        poster="/api/placeholder/800/450"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    
                    <div className="flex gap-3 mt-4">
                      <Button
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = metadata.finalVideoUrl!;
                          a.download = `video-${Date.now()}.mp4`;
                          a.click();
                        }}
                        className="flex-1"                      >
                        <DownloadIcon size={18} />
                        <span className="ml-2">Download MP4</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => window.open(metadata.finalVideoUrl!, '_blank')}                      >
                        <EyeIcon size={18} />
                        <span className="ml-2">Full Screen</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Edit prompt box */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      ✨ Ask AI to Make Changes
                    </CardTitle>
                    <CardDescription>
                      Describe what you'd like to change and AI will regenerate the video
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3">
                      <Input
                        placeholder="e.g., Make it more energetic, change the background music, add more transitions..."
                        value={aiEditPrompt}
                        onChange={(e) => setAiEditPrompt(e.target.value)}
                        className="flex-1"
                        disabled={metadata.isGenerating}
                      />
                      <Button
                        onClick={handleAiEdit}
                        disabled={!aiEditPrompt.trim() || metadata.isGenerating}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        <SendIcon size={18} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  },
  onStreamPart: ({ streamPart, setMetadata }: { 
    streamPart: any; 
    setMetadata: React.Dispatch<React.SetStateAction<VideoGeneratorMetadata>> 
  }) => {
    if (streamPart.type === 'video-generator-delta') {
      setMetadata((prev) => ({
        ...prev,
        ...streamPart.content as Partial<VideoGeneratorMetadata>,
      }));
    }
  },
  actions: [
    {
      icon: <CopyIcon size={18} />,
      description: 'Copy configuration',
      onClick: async ({ content }: { content: string }) => {
        await navigator.clipboard.writeText(content);
        toast.success('Configuration copied to clipboard!');
      },
    },
    {
      icon: <DownloadIcon size={18} />,
      description: 'Export project',
      onClick: async ({ content, metadata }: { content: string; metadata: VideoGeneratorMetadata }) => {
        const projectData = {
          content,
          metadata,
          timestamp: new Date().toISOString(),
        };
        
        const blob = new Blob([JSON.stringify(projectData, null, 2)], {
          type: 'application/json',
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'video-project.json';
        a.click();
        URL.revokeObjectURL(url);
        
        toast.success('Project exported successfully!');
      },
    },
  ],
  toolbar: [],
});
