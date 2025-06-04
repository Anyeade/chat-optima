interface GrokImageResponse {
  base64: string;
}

export async function generateGrokImage(prompt: string): Promise<{ base64: string }> {
  const apiKey = process.env.XAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('XAI_API_KEY environment variable is not set');
  }

  try {
    // Direct API call to X.AI for image generation
    const response = await fetch('https://api.x.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-2-image-1212',
        prompt: prompt,
        n: 1,
        response_format: 'b64_json',
        size: '1024x1024'
      }),
    });

    if (!response.ok) {
      throw new Error(`Grok API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.data || !data.data[0] || !data.data[0].b64_json) {
      throw new Error('No image returned from Grok API');
    }

    return {
      base64: data.data[0].b64_json
    };
  } catch (error) {
    console.error('Grok image generation failed:', error);
    throw error;
  }
}

// Create a custom image model that mimics the AI SDK interface
export const grokImageModel = {
  modelId: 'grok-2-image-1212',
  provider: 'xai',
  generate: async (options: { prompt: string; n?: number }) => {
    const { prompt } = options;
    
    try {
      const result = await generateGrokImage(prompt);
      
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
      };
    } catch (error) {
      throw error;
    }
  },
};

// Export a function to create the image model
export function createGrokImageModel() {
  return grokImageModel;
}
