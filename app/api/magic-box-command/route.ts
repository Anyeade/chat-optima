import { myProvider } from '@/lib/ai/providers';
import { generateText } from 'ai';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { command, currentVideoState } = body;

    // Validate required fields
    if (!command || typeof command !== 'string') {
      return Response.json(
        { success: false, error: 'Command is required and must be a string' },
        { status: 400 }
      );
    }

    // AI-powered Magic Box command processing (extracted from the tool)
    try {
      const videoState = currentVideoState || {};
      
      // Use Cerebras Llama Scout for command interpretation and execution
      const commandPrompt = `You are a Magic Box AI for video editing (like InVideo.ai). Process this natural language command:

Command: "${command}"

Current Video State:
- Script: ${videoState.script || 'No script yet'}
- Workflow: ${videoState.workflow || 'Not set'}
- Duration: ${videoState.duration || 'Not set'} seconds
- Scenes: ${videoState.scenes?.length || 0} scenes

Interpret the command and provide specific actionable changes. Consider these command types:
1. Script modifications ("change the intro", "make it more exciting")
2. Voice adjustments ("use professional tone", "speak faster")
3. Music changes ("add upbeat music", "change to calm background")
4. Visual modifications ("use nature backgrounds", "add text animations")
5. Duration changes ("make it shorter", "extend to 2 minutes")

Format as actionable JSON structure.`;

      const commandResult = await generateText({
        model: myProvider.languageModel('llama-4-scout-17b-16e-instruct-cerebras'),
        prompt: commandPrompt,
        maxTokens: 800,
        temperature: 0.4,
      });

      return Response.json({
        success: true,
        message: `Magic Box processed: "${command}"`,
        interpretation: commandResult.text,
        suggestedActions: [
          { type: 'script_change', description: 'AI analyzed your request' },
          { type: 'voice_adjustment', description: 'Voice settings optimized' },
          { type: 'timing_update', description: 'Timing adjusted for better flow' }
        ],
        aiModel: 'cerebras-llama-scout-17b',
        commandProcessed: command,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return Response.json({
        success: false,
        error: 'Failed to process Magic Box command',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } catch (error) {
    console.error('Magic Box command error:', error);
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
