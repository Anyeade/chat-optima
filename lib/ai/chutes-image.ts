import { experimental_createProviderRegistry } from 'ai';

interface ChutesImageRequest {
  seed?: number | null;
  steps?: number;
  prompt: string;
  id_image_b64?: string;
  guidance_scale?: number;
  control_image_b64?: string | null;
  infusenet_guidance_end?: number;
  infusenet_guidance_start?: number;
  infusenet_conditioning_scale?: number;
}

interface ChutesImageResponse {
  image?: string; // Base64 encoded image
  error?: string;
}

export async function generateChutesImage(prompt: string): Promise<{ base64: string }> {
  const apiToken = process.env.CHUTES_IMAGE_API_TOKEN;
  
  if (!apiToken) {
    throw new Error('CHUTES_IMAGE_API_TOKEN environment variable is not set');
  }

  const requestBody: ChutesImageRequest = {
    seed: null,
    steps: 30,
    prompt: prompt,
    id_image_b64: "example-string",
    guidance_scale: 3.5,
    control_image_b64: null,
    infusenet_guidance_end: 1,
    infusenet_guidance_start: 0,
    infusenet_conditioning_scale: 1
  };

  try {
    const response = await fetch('https://chutes-infiniteyou.chutes.ai/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Chutes AI API error: ${response.status} ${response.statusText}`);
    }

    const data: ChutesImageResponse = await response.json();
    
    if (data.error) {
      throw new Error(`Chutes AI generation error: ${data.error}`);
    }

    if (!data.image) {
      throw new Error('No image returned from Chutes AI API');
    }

    return {
      base64: data.image
    };
  } catch (error) {
    console.error('Chutes AI image generation failed:', error);
    throw error;
  }
}

// Create a custom image model that implements ImageModelV1 interface
export const chutesImageModel = {
  modelId: 'chutes-infiniteyou',
  provider: 'chutes-ai',
  specificationVersion: 'v1' as const,
  maxImagesPerCall: 1,
  doGenerate: async (options: { prompt: string; n?: number }) => {
    const { prompt } = options;
    
    try {
      const result = await generateChutesImage(prompt);
      
      return {
        images: [result.base64], // Array of base64 strings
        warnings: [], // Array of warnings (empty for now)
        response: {
          id: `chutes-${Date.now()}`,
          timestamp: new Date(),
          modelId: 'chutes-infiniteyou',
          headers: undefined,
        },
      };
    } catch (error) {
      throw error;
    }
  },
};

// Export a function to create the image model
export function createChutesImageModel() {
  return chutesImageModel;
} 