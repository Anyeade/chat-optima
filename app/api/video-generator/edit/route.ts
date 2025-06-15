import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { myProvider } from '@/lib/ai/providers';

export async function POST(request: NextRequest) {
  try {
    const { originalVideo, editPrompt, currentScript } = await request.json();

    if (!originalVideo || !editPrompt || !currentScript) {
      return NextResponse.json(
        { error: 'Original video, edit prompt, and current script are required' },
        { status: 400 }
      );
    }

    // Use AI to understand the edit request and modify the script
    const editAnalysisPrompt = `You are a professional video editor AI. Analyze this edit request and modify the script accordingly.

Current Script: "${currentScript}"

Edit Request: "${editPrompt}"

TASK: Modify the script based on the edit request. Consider these types of edits:
1. Content changes (add/remove information)
2. Tone changes (more energetic, calmer, professional, etc.)
3. Structure changes (reorder content, change flow)
4. Style changes (more engaging, shorter, longer, etc.)

Provide:
1. The updated script (clean voice-over format only)
2. A brief explanation of changes made
3. Whether video regeneration is needed

Format as JSON:
{
  "updatedScript": "the modified voice-over script",
  "changesExplanation": "brief explanation of what was changed",
  "regenerationNeeded": true/false,
  "changesType": "content/tone/structure/style"
}`;

    const editResult = await generateText({
      model: myProvider.languageModel('llama-4-scout-17b-16e-instruct-cerebras'),
      prompt: editAnalysisPrompt,
      maxTokens: 1200,
      temperature: 0.6,
    });

    let editData;
    try {
      const jsonMatch = editResult.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        editData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseError) {
      // Fallback response
      editData = {
        updatedScript: currentScript,
        changesExplanation: 'Unable to process edit request automatically',
        regenerationNeeded: false,
        changesType: 'none'
      };
    }

    // Determine if we need to regenerate the entire video or just apply simple edits
    if (editData.regenerationNeeded) {
      // For major changes, we would trigger a full regeneration
      // This would involve calling the other APIs in sequence
      
      // Simulate regeneration process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate new video URL (in production, this would be actual regeneration)
      const newVideoUrl = generateUpdatedVideoUrl(originalVideo, editData.changesType);
      
      return NextResponse.json({
        videoUrl: newVideoUrl,
        script: editData.updatedScript,
        metadata: {
          editType: 'regeneration',
          changesType: editData.changesType,
          changesExplanation: editData.changesExplanation,
          originalVideo,
          editPrompt,
          processedAt: new Date().toISOString()
        }
      });
      
    } else {
      // For minor changes, we can potentially modify the existing video
      // or just update the script without full regeneration
      
      return NextResponse.json({
        videoUrl: originalVideo, // Keep same video
        script: editData.updatedScript,
        metadata: {
          editType: 'script-only',
          changesType: editData.changesType,
          changesExplanation: editData.changesExplanation,
          originalVideo,
          editPrompt,
          processedAt: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    console.error('Video edit error:', error);
    return NextResponse.json(
      { error: 'Failed to process edit request' },
      { status: 500 }
    );
  }
}

function generateUpdatedVideoUrl(originalUrl: string, changesType: string): string {
  // In production, this would be the actual regenerated video URL
  const timestamp = Date.now();
  const baseUrl = originalUrl.split('?')[0];
  return `${baseUrl}?edited=${timestamp}&type=${changesType}`;
}

// Utility function to determine edit complexity
function analyzeEditComplexity(editPrompt: string): 'simple' | 'moderate' | 'complex' {
  const simpleKeywords = ['volume', 'louder', 'quieter', 'faster', 'slower'];
  const moderateKeywords = ['tone', 'style', 'mood', 'energy'];
  const complexKeywords = ['rewrite', 'change', 'add', 'remove', 'different'];
  
  const prompt = editPrompt.toLowerCase();
  
  if (complexKeywords.some(keyword => prompt.includes(keyword))) {
    return 'complex';
  } else if (moderateKeywords.some(keyword => prompt.includes(keyword))) {
    return 'moderate';
  } else {
    return 'simple';
  }
}

// Future enhancement: Real-time edit preview
/*
async function generateEditPreview(editPrompt: string, currentVideo: string) {
  // This could generate a quick preview of the changes
  // before committing to a full regeneration
  
  const complexity = analyzeEditComplexity(editPrompt);
  
  switch (complexity) {
    case 'simple':
      // Apply simple audio/speed adjustments
      break;
    case 'moderate':
      // Apply tone/style modifications
      break;
    case 'complex':
      // Require full regeneration
      break;
  }
}
*/
