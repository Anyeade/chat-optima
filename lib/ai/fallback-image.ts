import { generateChutesImage } from './chutes-image';
import { generateGrokImage } from './grok-image';

interface FallbackImageResponse {
  base64: string;
  provider: 'chutes' | 'grok';
}

export async function generateFallbackImage(prompt: string): Promise<FallbackImageResponse> {
  // Try Chutes first
  try {
    console.log('🎨 Trying Chutes AI image generation...');
    const result = await generateChutesImage(prompt);
    console.log('✅ Chutes AI image generation successful');
    return {
      base64: result.base64,
      provider: 'chutes'
    };
  } catch (chutesError) {
    const chutesErrorMessage = chutesError instanceof Error ? chutesError.message : String(chutesError);
    console.warn('⚠️ Chutes AI image generation failed, trying Grok...', chutesErrorMessage);
    
    // If Chutes fails, try Grok
    try {
      const result = await generateGrokImage(prompt);
      console.log('✅ Grok image generation successful');
      return {
        base64: result.base64,
        provider: 'grok'
      };
    } catch (grokError) {
      console.error('❌ Both Chutes and Grok image generation failed');
      const grokErrorMessage = grokError instanceof Error ? grokError.message : String(grokError);
      console.error('Chutes error:', chutesErrorMessage);
      console.error('Grok error:', grokErrorMessage);
      throw new Error(`Image generation failed. Chutes: ${chutesErrorMessage}, Grok: ${grokErrorMessage}`);
    }
  }
}

// Create a fallback image model that tries Chutes first, then Grok
export const fallbackImageModel = {
  modelId: 'fallback-image',
  provider: 'fallback',
  generate: async (options: { prompt: string; n?: number }) => {
    const { prompt } = options;
    
    try {
      const result = await generateFallbackImage(prompt);
      
      return {
        image: {
          base64: result.base64,
          url: `data:image/png;base64,${result.base64}`,
        },
        finishReason: 'stop' as const,
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
        provider: result.provider, // Include which provider was used
      };
    } catch (error) {
      throw error;
    }
  },
};

// Export a function to create the fallback image model
export function createFallbackImageModel() {
  return fallbackImageModel;
}
