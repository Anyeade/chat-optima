import { NextRequest, NextResponse } from 'next/server';

const JAMENDO_CLIENT_ID = '3efca530';
const JAMENDO_API_URL = 'https://api.jamendo.com/v3.0';

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
      audioformat: 'mp3',
      include: 'musicinfo',
      groupby: 'artist_id',
      order: 'popularity_total'
    });

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
        tags: 'instrumental',
        audioformat: 'mp3',
        include: 'musicinfo'
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

    return NextResponse.json({
      musicUrl: audioUrl,
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
      // Return a fallback music URL or generate a silent track
    return NextResponse.json({
      musicUrl: 'data:audio/mp3;base64,', // Empty audio data
      metadata: {
        provider: 'Fallback',
        mood: mood,
        volume: volume,
        error: 'Music API failed, using silent track',
        generatedAt: new Date().toISOString()
      }
    });
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
