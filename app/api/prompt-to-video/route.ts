import { myProvider } from '@/lib/ai/providers';
import { generateText } from 'ai';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, workflow, targetAudience, duration } = body;

    // Validate required fields
    if (!prompt || typeof prompt !== 'string') {
      return Response.json(
        { success: false, error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // AI-powered prompt-to-video logic (extracted from the tool)
    try {
      const workflowType = workflow || 'explainer';
      const audience = targetAudience || {
        demographic: 'general',
        tone: 'professional',
        platform: 'youtube'
      };
      const videoDuration = duration || 60;

      // Use Cerebras Llama Scout for ultra-fast script generation
      const scriptPrompt = `You are an expert video script writer specializing in ${workflowType} content for ${audience.platform}.

Create a compelling ${videoDuration}-second video script based on this prompt: "${prompt}"

Target Audience: ${audience.demographic} (${audience.tone} tone)
Video Type: ${workflowType}
Platform: ${audience.platform}
Duration: ${videoDuration} seconds

Requirements:
- Write engaging, platform-optimized content
- Include hook, main content, and call-to-action
- Break into 3 scenes with timing
- Consider ${audience.tone} tone throughout
- Make it suitable for ${audience.platform}

Format as complete video script with scene breaks and timing cues.`;

      const scriptResult = await generateText({
        model: myProvider.languageModel('llama-4-scout-17b-16e-instruct-cerebras'),
        prompt: scriptPrompt,
        maxTokens: 1500,
        temperature: 0.7,
      });

      const fullScript = scriptResult.text;
      const sceneDuration = Math.floor(videoDuration / 3);
      
      // AI-generate individual scenes with proper script content
      const scenes = [];
      const scriptSections = fullScript.split(/Scene \d+:|SCENE \d+:/i).filter(s => s.trim());
      
      for (let i = 0; i < 3; i++) {
        const sceneScript = scriptSections[i] || `Scene ${i + 1}: ${fullScript.slice(i * 100, (i + 1) * 100)}...`;
        
        scenes.push({
          id: `scene-${i + 1}`,
          duration: sceneDuration,
          script: sceneScript.trim(),
          visualPrompt: `${workflowType} style visual for scene ${i + 1}: ${prompt}`,
          musicMood: i === 0 ? 'intro' : i === 1 ? 'main' : 'outro',
          transitions: i < 2 ? 'fade' : 'none',
          aiGenerated: true
        });
      }
      
      return Response.json({
        success: true,
        message: 'AI video script generated successfully using Cerebras Llama Scout',
        concept: {
          title: `AI Generated: ${prompt.substring(0, 50)}...`,
          script: fullScript,
          scenes,
          recommendedVoice: audience.tone === 'professional' ? 'John' : 'Alice',
          recommendedMusic: workflowType === 'youtube-shorts' ? 'upbeat' : 'ambient',
          estimatedDuration: videoDuration,
          workflow: workflowType,
          targetAudience: audience,
          aiModel: 'cerebras-llama-scout-17b'
        }
      });
    } catch (error) {
      return Response.json({
        success: false,
        error: 'Failed to generate video concept',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } catch (error) {
    console.error('Prompt-to-video generation error:', error);
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
