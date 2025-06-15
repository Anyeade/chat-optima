import { myProvider } from '@/lib/ai/providers';
import { generateText } from 'ai';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sceneScript, visualStyle, duration, mood, previousScene } = body;

    // Validate required fields
    if (!sceneScript || typeof sceneScript !== 'string') {
      return Response.json(
        { success: false, error: 'Scene script is required and must be a string' },
        { status: 400 }
      );
    }

    // AI-powered scene generation logic (extracted from the tool)
    try {
      const style = visualStyle || 'realistic';
      const sceneMood = mood || 'upbeat';
      const sceneDuration = duration || 10;

      // Use Cerebras Llama Scout for scene enhancement and visual prompts
      const scenePrompt = `You are a professional video scene director. Enhance this scene for a ${style} ${sceneMood} video.

Scene Script: "${sceneScript}"
Duration: ${sceneDuration} seconds
Visual Style: ${style}
Mood: ${sceneMood}
${previousScene ? `Previous Scene Context: ${previousScene}` : ''}

Create:
1. Enhanced scene description with visual details
2. Specific camera angles and movements
3. Lighting and color scheme suggestions
4. Text overlay recommendations
5. Transition suggestions

Format as detailed scene direction.`;

      const sceneResult = await generateText({
        model: myProvider.languageModel('llama-4-scout-17b-16e-instruct-cerebras'),
        prompt: scenePrompt,
        maxTokens: 800,
        temperature: 0.6,
      });

      return Response.json({
        success: true,
        message: 'AI scene generated successfully',
        scene: {
          originalScript: sceneScript,
          enhancedDescription: sceneResult.text,
          visualStyle: style,
          duration: sceneDuration,
          mood: sceneMood,
          recommendations: {
            camera: 'Medium shot with slow zoom',
            lighting: `${sceneMood} lighting setup`,
            colorScheme: style === 'cinematic' ? 'Warm tones' : 'Natural colors',
            textOverlay: 'Dynamic text animations',
            transition: 'Smooth fade transition'
          },
          aiGenerated: true,
          metadata: {
            generatedAt: new Date().toISOString(),
            aiModel: 'cerebras-llama-scout-17b',
            styleApplied: style,
            moodApplied: sceneMood
          }
        }
      });
    } catch (error) {
      return Response.json({
        success: false,
        error: 'Failed to generate AI scene',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } catch (error) {
    console.error('AI scene generation error:', error);
    return Response.json(
      { 
        success: false, 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
