import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudioWithDeepgram } from '@/lib/ai/deepgram';

export async function POST(request: NextRequest) {
  try {
    // Get audio buffer from request body
    const audioBuffer = Buffer.from(await request.arrayBuffer());
    
    if (!audioBuffer || audioBuffer.length === 0) {
      return NextResponse.json(
        { error: 'Audio data is required' },
        { status: 400 }
      );
    }

    // Transcribe with Deepgram to get word-level timing
    const words = await transcribeAudioWithDeepgram(audioBuffer);

    return NextResponse.json({
      success: true,
      words: words,
      wordCount: words.length
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Transcription API endpoint. Use POST with audio data.' 
  });
}
