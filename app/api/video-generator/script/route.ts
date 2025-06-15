import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { myProvider } from '@/lib/ai/providers';

export async function POST(request: NextRequest) {
  try {
    const { prompt, videoType, duration } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Create voice-over script prompt based on video type and duration
    const scriptPrompt = `You are an expert video script writer. Create a professional voice-over script for ${videoType} content.

User Prompt: "${prompt}"
Video Type: ${videoType}
Duration: ${duration} seconds

CRITICAL REQUIREMENTS:
1. Write ONLY the voice-over text (what the narrator will say)
2. Make it clean, conversational, and engaging
3. NO stage directions, NO [brackets], NO technical notes
4. Structure it for ${duration} seconds of speaking time
5. Include natural transitions between ideas
6. End with a clear call-to-action

${videoType === 'youtube-shorts' ? 
  'For YouTube Shorts: Start with a hook, deliver quick value, end with engagement request' :
  'For longer content: Include introduction, main content with clear points, and conclusion'
}

Example format (clean voice-over only):
"Feeling a bit down? Need a quick pick‑me‑up? In just 60 seconds, we've got 10 heartwarming moments that'll brighten your day!

From kindness to kindness, let's celebrate the best in people.

A stranger surprises a homeless man with new shoes.
A cancer survivor crosses the marathon finish line.
A teacher treats students to a free lunch.

Which moment lifted your spirits the most? Comment below—we'd love to hear!
Like and subscribe for more feel‑good stories.
Thanks for watching, and see you in the next video!"

Write the voice-over script now:`;

    const result = await generateText({
      model: myProvider.languageModel('llama-4-scout-17b-16e-instruct-cerebras'),
      prompt: scriptPrompt,
      maxTokens: 1000,
      temperature: 0.7,
    });

    const script = result.text.trim();

    return NextResponse.json({
      script,
      metadata: {
        videoType,
        duration,
        wordCount: script.split(' ').length,
        estimatedSpeakingTime: Math.round(script.split(' ').length / 2.5), // ~2.5 words per second
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Script generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate script' },
      { status: 500 }
    );
  }
}
