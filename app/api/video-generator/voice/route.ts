import { NextRequest, NextResponse } from 'next/server';

const VOICE_RSS_API_KEY = '219b11995be34d5d84dd5a87500d2a5e';
const VOICE_RSS_URL = 'https://api.voicerss.org/';

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

    // Initialize fetch
    await initFetch();
    
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

    // Get the audio data - handle exactly like our working test script
    const audioBuffer = await response.arrayBuffer();
    const audioBufferNode = Buffer.from(audioBuffer);
    
    // Validate the audio data
    if (!audioBufferNode || audioBufferNode.length < 1000) {
      throw new Error('VoiceRSS returned invalid or empty audio data');
    }
    
    // Check for valid MP3 headers
    const audioBytes = new Uint8Array(audioBufferNode);
    const hasValidHeaders = (audioBytes[0] === 0xFF && (audioBytes[1] & 0xE0) === 0xE0) ||
                           (audioBytes[0] === 0x49 && audioBytes[1] === 0x44 && audioBytes[2] === 0x33);
    
    if (!hasValidHeaders) {
      console.error('Invalid MP3 headers detected:', {
        firstByte: audioBytes[0].toString(16),
        secondByte: audioBytes[1].toString(16),
        thirdByte: audioBytes[2].toString(16),
        size: audioBufferNode.length
      });
      throw new Error('VoiceRSS returned corrupted audio data (invalid MP3 headers)');
    }
    
    console.log('✅ VoiceRSS Audio Generated:', {
      size: audioBufferNode.length,
      validHeaders: hasValidHeaders,
      firstBytes: Array.from(audioBytes.slice(0, 4)).map(b => b.toString(16)).join(' ')
    });
    
    // In a real implementation, you'd save this to a file storage service
    // For now, we'll create a data URL (not recommended for production)
    const base64Audio = audioBufferNode.toString('base64');
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
