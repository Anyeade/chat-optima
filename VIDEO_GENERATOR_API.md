# Video Generator API Documentation

This document outlines the clean, streamlined API implementation for the video generator that matches the InVideo.ai-style workflow.

## API Endpoints

### 1. Script Generation
**POST** `/api/video-generator/script`

Generates a clean voice-over script from user prompt.

**Request Body:**
```json
{
  "prompt": "10 Uplifting Moments to Brighten Your Day",
  "videoType": "youtube-shorts",
  "duration": 60
}
```

**Response:**
```json
{
  "script": "Feeling a bit down? Need a quick pick‑me‑up? In just 60 seconds...",
  "metadata": {
    "videoType": "youtube-shorts",
    "duration": 60,
    "wordCount": 150,
    "estimatedSpeakingTime": 60,
    "generatedAt": "2025-06-15T10:30:00Z"
  }
}
```

### 2. Voice Generation
**POST** `/api/video-generator/voice`

Generates voice-over audio using VoiceRSS API.

**Request Body:**
```json
{
  "script": "Your clean voice-over script here",
  "voiceSettings": {
    "language": "en-US",
    "gender": "neutral",
    "emotion": "professional"
  }
}
```

**Response:**
```json
{
  "voiceUrl": "data:audio/mp3;base64,....." or "https://storage.com/voice.mp3",
  "metadata": {
    "provider": "VoiceRSS",
    "voice": "John",
    "language": "en-us",
    "format": "MP3",
    "quality": "44khz_16bit_stereo",
    "estimatedDuration": 60
  }
}
```

### 3. Background Music
**POST** `/api/video-generator/music`

Fetches background music from Jamendo at specified volume.

**Request Body:**
```json
{
  "mood": "uplifting",
  "duration": 60,
  "volume": 40
}
```

**Response:**
```json
{
  "musicUrl": "https://api.jamendo.com/v3.0/tracks/download/...",
  "metadata": {
    "provider": "Jamendo",
    "trackName": "Uplifting Background",
    "artistName": "Artist Name",
    "duration": 180,
    "volume": 40,
    "license": "Creative Commons"
  }
}
```

### 4. Scene Generation
**POST** `/api/video-generator/scenes`

Generates scenes with background videos following duration rules.

**Request Body:**
```json
{
  "script": "Your voice-over script",
  "videoType": "youtube-shorts",
  "duration": 60
}
```

**Response:**
```json
{
  "scenes": [
    {
      "id": "scene-1",
      "duration": 15,
      "voiceText": "Feeling a bit down? Need a quick pick‑me‑up?",
      "onScreenText": "10 Uplifting Moments",
      "backgroundVideo": "https://api.pexels.com/videos/...",
      "transition": "fade",
      "metadata": {
        "visualDescription": "Happy people smiling",
        "videoSource": "Pexels",
        "searchQuery": "happy moments"
      }
    }
  ],
  "metadata": {
    "videoType": "youtube-shorts",
    "totalDuration": 60,
    "sceneDurations": [15, 15, 15, 15],
    "sceneCount": 4
  }
}
```

### 5. Video Rendering
**POST** `/api/video-generator/render`

Combines all elements into final MP4 video.

**Request Body:**
```json
{
  "script": "Full script",
  "voiceUrl": "voice-over.mp3",
  "musicUrl": "background-music.mp3",
  "scenes": [...],
  "videoType": "youtube-shorts",
  "duration": 60
}
```

**Response:**
```json
{
  "videoUrl": "https://storage.com/final-video.mp4",
  "metadata": {
    "videoType": "youtube-shorts",
    "duration": 60,
    "aspectRatio": "9:16",
    "resolution": "1080x1920",
    "musicVolume": 40,
    "fileSize": "25 MB",
    "format": "MP4"
  }
}
```

### 6. Video Editing
**POST** `/api/video-generator/edit`

Handles AI edit requests and regenerates video.

**Request Body:**
```json
{
  "originalVideo": "current-video.mp4",
  "editPrompt": "Make it more energetic",
  "currentScript": "Current script"
}
```

**Response:**
```json
{
  "videoUrl": "https://storage.com/updated-video.mp4",
  "script": "Updated script if changed",
  "metadata": {
    "editType": "regeneration",
    "changesType": "tone",
    "changesExplanation": "Increased energy and pace"
  }
}
```

## Key Features Implemented

### ✅ Scene Duration Rules
- **YouTube Shorts**: Max 15 seconds per scene
- **Long-form videos**: Min 30 seconds per scene
- Automatic scene splitting based on content

### ✅ Background Music at 40% Volume
- Integrated with Jamendo API
- Automatic mood matching
- Volume mixing at specified level

### ✅ Clean Voice-over Scripts
- No stage directions or technical notes
- Natural conversational flow
- Proper voice-over format

### ✅ Professional Video Composition
- Automatic aspect ratio selection
- Transition effects (fade, slide, zoom, cut)
- Text overlay synchronization
- Background video matching

### ✅ Real-time Progress Tracking
- Step-by-step progress updates
- Error handling and fallbacks
- Metadata for each generation step

### ✅ AI-powered Editing
- Natural language edit requests
- Intelligent change analysis
- Selective regeneration based on complexity

## API Integration Notes

### External Services Used:
1. **VoiceRSS** - Voice generation (API key included)
2. **Jamendo** - Background music (Client ID included)
3. **Pexels** - Background videos (requires API key)
4. **Cerebras Llama Scout** - AI text generation
5. **FFmpeg** - Video composition (future implementation)

### Error Handling:
- Graceful fallbacks for API failures
- Detailed error messages
- Automatic retries where appropriate

### Performance Optimizations:
- Parallel API calls where possible
- Efficient scene duration calculation
- Smart caching for repeated requests

## Future Enhancements

1. **Real FFmpeg Integration** for actual video rendering
2. **File Storage Integration** (AWS S3, Vercel Blob, etc.)
3. **Video Quality Options** (HD, 4K, etc.)
4. **Advanced Transitions** and effects
5. **Multi-language Support** expansion
6. **Real-time Preview** generation
7. **Batch Processing** for multiple videos
