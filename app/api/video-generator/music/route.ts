import { NextRequest, NextResponse } from 'next/server';

const JAMENDO_CLIENT_ID = '3efca530';
const JAMENDO_API_URL = 'https://api.jamendo.com/v3.0';

// Initialize fetch for Node.js compatibility
let fetch: any;
async function initFetch() {
  if (fetch) return fetch;
  
  try {
    // Try to use global fetch first (Node 18+)
    if (typeof globalThis.fetch !== 'undefined') {
      fetch = globalThis.fetch;
      return fetch;
    }
    throw new Error('Native fetch not available');
  } catch (error) {
    // Fallback to dynamic import for node-fetch
    const { default: nodeFetch } = await import('node-fetch');
    fetch = nodeFetch;
    return fetch;
  }
}

export async function POST(request: NextRequest) {
  let mood = '';
  let volume = 40;
  
  try {
    const requestData = await request.json();
    mood = requestData.mood;
    const duration = requestData.duration;
    volume = requestData.volume || 40;

    if (!mood || !duration) {
      return NextResponse.json(
        { error: 'Mood and duration are required' },
        { status: 400 }
      );
    }    // Map mood to Jamendo tags
    const moodTags = getMoodTags(mood);
    
    // Search for music from Jamendo
    const searchUrl = `${JAMENDO_API_URL}/tracks/?` + new URLSearchParams({
      client_id: JAMENDO_CLIENT_ID,
      format: 'json',
      limit: '10',
      tags: moodTags,
      audioformat: 'mp31',
      include: 'musicinfo',
      groupby: 'artist_id',
      order: 'popularity_total'
    });

    // Initialize fetch
    await initFetch();
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`Jamendo API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      // Fallback to a more generic search
      const fallbackUrl = `${JAMENDO_API_URL}/tracks/?` + new URLSearchParams({
        client_id: JAMENDO_CLIENT_ID,
        format: 'json',
        limit: '5',
        audioformat: 'mp31',
        include: 'musicinfo',
        order: 'popularity_total'
      });

      const fallbackResponse = await fetch(fallbackUrl);
      const fallbackData = await fallbackResponse.json();
      
      if (!fallbackData.results || fallbackData.results.length === 0) {
        throw new Error('No suitable music found');
      }
      
      data.results = fallbackData.results;
    }

    // Select the best matching track
    const selectedTrack = data.results[0];
    
    // Get the audio URL
    const audioUrl = selectedTrack.audio || selectedTrack.audiodownload;
    
    if (!audioUrl) {
      throw new Error('No audio URL found for selected track');
    }

    console.log(`🎼 Selected: "${selectedTrack.name}" by ${selectedTrack.artist_name}`);
    
    // Download the audio file - handle exactly like our working test script
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error(`Audio download failed: ${audioResponse.status}`);
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    const audioBufferNode = Buffer.from(audioBuffer);
    
    // Validate audio data
    if (!audioBufferNode || audioBufferNode.length < 1000) {
      throw new Error('Downloaded audio file is too small or empty');
    }
    
    // Check for valid MP3 headers
    const audioBytes = new Uint8Array(audioBufferNode);
    const hasValidHeaders = (audioBytes[0] === 0xFF && (audioBytes[1] & 0xE0) === 0xE0) ||
                           (audioBytes[0] === 0x49 && audioBytes[1] === 0x44 && audioBytes[2] === 0x33);
    
    if (!hasValidHeaders) {
      console.error('Invalid MP3 headers detected in music:', {
        firstByte: audioBytes[0].toString(16),
        secondByte: audioBytes[1].toString(16),
        thirdByte: audioBytes[2].toString(16),
        size: audioBufferNode.length
      });
      throw new Error('Downloaded audio file has invalid MP3 headers');
    }

    console.log('✅ Jamendo Audio Downloaded:', {
      size: audioBufferNode.length,
      validHeaders: hasValidHeaders,
      trackName: selectedTrack.name,
      firstBytes: Array.from(audioBytes.slice(0, 4)).map(b => b.toString(16)).join(' ')
    });

    // Convert to base64 for data URL
    const base64Audio = audioBufferNode.toString('base64');
    const musicUrl = `data:audio/mp3;base64,${base64Audio}`;

    return NextResponse.json({
      musicUrl,
      metadata: {
        provider: 'Jamendo',
        trackName: selectedTrack.name,
        artistName: selectedTrack.artist_name,
        duration: selectedTrack.duration,
        mood: mood,
        volume: volume,
        license: 'Creative Commons',
        tags: moodTags,
        trackId: selectedTrack.id,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Music generation error:', error);
    // Don't return invalid empty audio data - instead throw an error
    return NextResponse.json(
      { error: 'Failed to generate background music', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function getMoodTags(mood: string): string {
  const moodMap: Record<string, string> = {
    'uplifting': 'happy,uplifting,positive',
    'calm': 'calm,peaceful,ambient',
    'energetic': 'energetic,upbeat,driving',
    'inspiring': 'inspiring,motivational,hopeful',
    'dramatic': 'dramatic,cinematic,epic',
    'happy': 'happy,cheerful,upbeat'
  };

  return moodMap[mood] || 'instrumental,background';
}
