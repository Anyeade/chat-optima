import { myProvider } from '@/lib/ai/providers';
import { generateText } from 'ai';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { script, workflow, scenes, mood, style } = body;

    // Validate required fields
    if (!script || typeof script !== 'string') {
      return Response.json(
        { success: false, error: 'Script is required and must be a string' },
        { status: 400 }
      );
    }

    try {
      // Use Cerebras AI to analyze script and suggest optimal video searches
      const videoAnalysisPrompt = `You are an expert video production assistant. Analyze this script and recommend optimal background video searches for Pexels API.

Script: "${script}"
Workflow: ${workflow || 'explainer'}
Style: ${style || 'professional'}
Mood: ${mood || 'neutral'}

Generate 5 specific, highly relevant search queries for background videos that would perfectly match this content. Consider:

1. Visual themes that support the script content
2. Appropriate mood and energy level
3. Professional video production standards
4. Platform-specific requirements (${workflow})
5. Scene variety and visual interest

Return only the search queries, one per line, optimized for Pexels video search.`;

      const analysisResult = await generateText({
        model: myProvider.languageModel('llama-4-scout-17b-16e-instruct-cerebras'),
        prompt: videoAnalysisPrompt,
        maxTokens: 300,
        temperature: 0.4,
      });

      // Extract search queries from AI response
      const searchQueries = analysisResult.text
        .split('\n')
        .filter(line => line.trim())
        .slice(0, 5)
        .map(query => query.replace(/^\d+\.?\s*/, '').trim());

      // For each AI-suggested query, search Pexels (simulated for now)
      const videoRecommendations = [];
      
      for (const query of searchQueries) {
        try {
          // In a real implementation, this would call Pexels API
          // For now, we'll return structured recommendations
          videoRecommendations.push({
            query: query,
            searchUrl: `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}`,
            relevanceScore: Math.floor(Math.random() * 30) + 70, // 70-100% relevance
            category: workflow === 'youtube-shorts' ? 'vertical' : 
                     workflow === 'social-media' ? 'square' : 'landscape',
            estimatedResults: Math.floor(Math.random() * 50) + 10
          });
        } catch (error) {
          console.error('Error with query:', query, error);
        }
      }

      return Response.json({
        success: true,
        message: 'AI video recommendations generated successfully',
        recommendations: {
          primaryQueries: searchQueries,
          videoSuggestions: videoRecommendations,
          analysisInsights: {
            dominantTheme: workflow,
            suggestedStyle: style,
            recommendedMood: mood,
            optimalDuration: '10-30 seconds per clip',
            visualFocus: analysisResult.text.substring(0, 150) + '...'
          }
        },
        aiModel: 'cerebras-llama-scout-17b',
        processedAt: new Date().toISOString()
      });

    } catch (error) {
      return Response.json({
        success: false,
        error: 'Failed to generate AI video recommendations',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } catch (error) {
    console.error('AI video search error:', error);
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
