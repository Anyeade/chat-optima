// Clean Video Generator Content Component
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
  // Set the aiPrompt from the title when component mounts (prompt detection)
  useEffect(() => {
    if (title && !metadata.aiPrompt) {
      console.log('🎯 Video Generator: Setting aiPrompt from title:', title);
      setMetadata(prev => ({
        ...prev,
        aiPrompt: title
      }));
    }
  }, [title, metadata.aiPrompt, setMetadata]);

  // Video generation function
  const generateVideo = async () => {
    if (!metadata.aiPrompt) {
      toast.error('No prompt detected');
      return;
    }

    try {
      setMetadata(prev => ({
        ...prev,
        isGenerating: true,
        generationProgress: 0,
        generationStep: 'Initializing...'
      }));

      // Step 1: Generate script
      setMetadata(prev => ({ ...prev, generationStep: 'Generating script...', generationProgress: 10 }));
      const scriptResponse = await fetch('/api/prompt-to-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: metadata.aiPrompt,
          videoType: metadata.videoType,
          duration: metadata.duration
        }),
      });

      if (!scriptResponse.ok) throw new Error('Script generation failed');
      const scriptResult = await scriptResponse.json();
      
      setMetadata(prev => ({
        ...prev,
        script: scriptResult.script,
        scenes: scriptResult.scenes,
        generationStep: 'Generating voice-over...',
        generationProgress: 30
      }));

      // Step 2: Generate voice-over
      const voiceResponse = await fetch('/api/advanced-voice-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: scriptResult.script,
          voice: 'professional-female',
          emotion: 'inspiring'
        }),
      });

      if (!voiceResponse.ok) throw new Error('Voice generation failed');
      const voiceResult = await voiceResponse.json();
      
      setMetadata(prev => ({
        ...prev,
        voiceOverUrl: voiceResult.audioUrl,
        generationStep: 'Selecting background music...',
        generationProgress: 50
      }));

      // Step 3: Get background music
      setMetadata(prev => ({
        ...prev,
        backgroundMusicUrl: 'https://example.com/background-music.mp3',
        generationStep: 'Processing background videos...',
        generationProgress: 70
      }));

      // Step 4: Process scenes and transitions
      setMetadata(prev => ({
        ...prev,
        generationStep: 'Applying transitions and effects...',
        generationProgress: 85
      }));

      // Step 5: Final video composition
      setMetadata(prev => ({
        ...prev,
        generationStep: 'Composing final video...',
        generationProgress: 95
      }));

      // Simulate final video generation
      setTimeout(() => {
        setMetadata(prev => ({
          ...prev,
          finalVideoUrl: 'https://example.com/final-video.mp4',
          isComplete: true,
          isGenerating: false,
          generationStep: 'Complete!',
          generationProgress: 100
        }));
        toast.success('🎬 Video generated successfully!');
      }, 2000);

    } catch (error) {
      setMetadata(prev => ({
        ...prev,
        isGenerating: false,
        generationStep: 'Error occurred',
        generationProgress: 0
      }));
      toast.error('Video generation failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // AI edit function
  const handleAIEdit = async (editPrompt: string) => {
    try {
      setMetadata(prev => ({ ...prev, isGenerating: true, generationStep: 'Processing edit request...' }));
      
      const response = await fetch('/api/magic-box-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: editPrompt,
          currentVideo: {
            script: metadata.script,
            scenes: metadata.scenes,
            videoType: metadata.videoType
          }
        }),
      });

      if (response.ok) {
        // Simulate regeneration
        setTimeout(() => {
          setMetadata(prev => ({
            ...prev,
            finalVideoUrl: `https://example.com/edited-video-${Date.now()}.mp4`,
            isGenerating: false,
            generationStep: 'Edit complete!'
          }));
          toast.success('✨ Video updated with AI edits!');
        }, 3000);
      }
    } catch (error) {
      setMetadata(prev => ({ ...prev, isGenerating: false }));
      toast.error('Edit failed');
    }
  };

  if (isLoading) {
    return <DocumentSkeleton artifactKind="video-generator" />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          AI Video Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Turn your ideas into professional videos with AI
        </p>
      </div>

      {/* Prompt Detection & Configuration */}
      {!metadata.isComplete && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              Prompt Detected
              {metadata.aiPrompt && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">AUTO-DETECTED</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Detected Prompt */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <Label className="text-sm font-medium text-blue-800 dark:text-blue-300">Your Prompt:</Label>
              <div className="mt-2 p-3 bg-white dark:bg-gray-800 border rounded-lg">
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  {metadata.aiPrompt || 'Waiting for prompt...'}
                </p>
              </div>
            </div>

            {/* Video Configuration */}
            {metadata.aiPrompt && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Video Type</Label>
                  <Select 
                    value={metadata.videoType} 
                    onValueChange={(value: VideoGeneratorMetadata['videoType']) => 
                      setMetadata(prev => ({ ...prev, videoType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youtube-shorts">📱 YouTube Shorts</SelectItem>
                      <SelectItem value="youtube-long">📺 YouTube Long-form</SelectItem>
                      <SelectItem value="instagram-reel">📸 Instagram Reel</SelectItem>
                      <SelectItem value="tiktok-video">🎵 TikTok Video</SelectItem>
                      <SelectItem value="explainer">📊 Explainer Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Duration</Label>
                  <Select 
                    value={metadata.duration.toString()} 
                    onValueChange={(value) => 
                      setMetadata(prev => ({ ...prev, duration: parseInt(value) as VideoGeneratorMetadata['duration'] }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="120">2 minutes</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Generate Button */}
            {metadata.aiPrompt && !metadata.isGenerating && !metadata.isComplete && (
              <Button 
                onClick={generateVideo}
                className="w-full h-12 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                disabled={metadata.isGenerating}
              >
                <span className="mr-2">🚀</span>
                Generate Video
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Generation Progress */}
      {metadata.isGenerating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl animate-spin">⚡</span>
              AI is working its magic...
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{metadata.generationStep}</span>
                <span>{metadata.generationProgress}%</span>
              </div>
              <Progress value={metadata.generationProgress} className="h-3" />
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm">
              <div className="space-y-1">
                <div className={`flex items-center gap-2 ${metadata.generationProgress > 10 ? 'text-green-600' : 'text-gray-400'}`}>
                  <span>{metadata.generationProgress > 10 ? '✅' : '⏳'}</span>
                  Script Generation
                </div>
                <div className={`flex items-center gap-2 ${metadata.generationProgress > 30 ? 'text-green-600' : 'text-gray-400'}`}>
                  <span>{metadata.generationProgress > 30 ? '✅' : '⏳'}</span>
                  Voice-over Creation
                </div>
                <div className={`flex items-center gap-2 ${metadata.generationProgress > 50 ? 'text-green-600' : 'text-gray-400'}`}>
                  <span>{metadata.generationProgress > 50 ? '✅' : '⏳'}</span>
                  Background Music Selection
                </div>
                <div className={`flex items-center gap-2 ${metadata.generationProgress > 70 ? 'text-green-600' : 'text-gray-400'}`}>
                  <span>{metadata.generationProgress > 70 ? '✅' : '⏳'}</span>
                  Background Video Processing
                </div>
                <div className={`flex items-center gap-2 ${metadata.generationProgress > 85 ? 'text-green-600' : 'text-gray-400'}`}>
                  <span>{metadata.generationProgress > 85 ? '✅' : '⏳'}</span>
                  Transitions & Effects
                </div>
                <div className={`flex items-center gap-2 ${metadata.generationProgress >= 100 ? 'text-green-600' : 'text-gray-400'}`}>
                  <span>{metadata.generationProgress >= 100 ? '✅' : '⏳'}</span>
                  Final Video Composition
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Final Video Preview */}
      {metadata.isComplete && metadata.finalVideoUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🎬</span>
              Your Video is Ready!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Video Player */}
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">📹</div>
                <p className="text-xl">Video Preview</p>
                <p className="text-sm opacity-75">Click to play your generated video</p>
                <Button variant="secondary" className="mt-4">
                  <PlayIcon className="mr-2 h-4 w-4" />
                  Play Video
                </Button>
              </div>
            </div>

            {/* Download Button */}
            <Button className="w-full h-12 bg-green-600 hover:bg-green-700">
              <DownloadIcon className="mr-2 h-4 w-4" />
              Download Video (MP4)
            </Button>

            {/* AI Edit Prompt */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4">
              <Label className="text-sm font-medium mb-2 block">Ask AI to make changes:</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="e.g., Make it more energetic, Add upbeat music, Change voice tone..."
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.currentTarget;
                      if (input.value.trim()) {
                        handleAIEdit(input.value);
                        input.value = '';
                      }
                    }
                  }}
                />
                <Button 
                  size="icon"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  onClick={(e) => {
                    const input = e.currentTarget.parentElement?.querySelector('input');
                    if (input?.value.trim()) {
                      handleAIEdit(input.value);
                      input.value = '';
                    }
                  }}
                >
                  <SendIcon className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                ✨ AI will regenerate your video with the requested changes
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Script Preview (if generated) */}
      {metadata.script && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Generated Script</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 whitespace-pre-wrap text-sm">
              {metadata.script}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
},
