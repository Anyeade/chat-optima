import { NextRequest, NextResponse } from 'next/server';

const VOICE_RSS_API_KEY = '219b11995be34d5d84dd5a87500d2a5e';
const VOICE_RSS_URL = 'https://api.voicerss.org/';

export async function POST(request: NextRequest) {
  try {
    const { script, voiceSettings } = await request.json();

    if (!script) {
      return NextResponse.json(
        { error: 'Script is required' },
        { status: 400 }
      );
    }    // Map our voice settings to VoiceRSS parameters
    const voiceParams = {
      key: VOICE_RSS_API_KEY,
      src: script,
      hl: voiceSettings?.language || 'en-us',
      v: getVoiceRSSVoice(voiceSettings),
      c: 'MP3',
      f: '44khz_16bit_stereo',
      ssml: 'false',
      b64: 'false'
    };

    // Create form data for VoiceRSS API
    const formData = new URLSearchParams(voiceParams);

    const response = await fetch(VOICE_RSS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    if (!response.ok) {
      throw new Error(`VoiceRSS API error: ${response.status}`);
    }

    // Get the audio data
    const audioBuffer = await response.arrayBuffer();
    
    // In a real implementation, you'd save this to a file storage service
    // For now, we'll create a data URL (not recommended for production)
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    const voiceUrl = `data:audio/mp3;base64,${base64Audio}`;

    return NextResponse.json({
      voiceUrl,
      metadata: {
        provider: 'VoiceRSS',
        voice: voiceParams.v,
        language: voiceParams.hl,
        format: 'MP3',
        quality: '44khz_16bit_stereo',
        generatedAt: new Date().toISOString(),
        scriptLength: script.length,
        estimatedDuration: Math.round(script.split(' ').length / 2.5) // seconds
      }
    });

  } catch (error) {
    console.error('Voice generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate voice-over' },
      { status: 500 }
    );
  }
}

function getVoiceRSSVoice(voiceSettings: any) {
  const language = voiceSettings?.language || 'en-us';
  const gender = voiceSettings?.gender || 'neutral';
  const emotion = voiceSettings?.emotion || 'professional';

  // Map to VoiceRSS voice names
  const voiceMap: Record<string, string> = {
    'en-us-male-professional': 'John',
    'en-us-female-professional': 'Mary',
    'en-us-male-friendly': 'Mike',
    'en-us-female-friendly': 'Linda',
    'en-us-neutral-professional': 'John',
    'en-gb-male-professional': 'Harry',
    'en-gb-female-professional': 'Kate',
  };

  const voiceKey = `${language}-${gender}-${emotion}`;
  return voiceMap[voiceKey] || 'John';
}
