import { tool } from 'ai';
import { z } from 'zod';

const API_KEY = 'abdb613fc4fe10de2b7c8834c25091729fd068e73399';

/**
 * Webpage screenshot tool that uses thumbnail.ws API to capture webpage screenshots
 */
export const webpageScreenshot = tool({
  description: 'Capture a screenshot of any webpage using the thumbnail.ws API',
  parameters: z.object({
    url: z.string().url().describe('The URL of the webpage to capture'),
    width: z.number().min(100).max(2000).default(800)
      .describe('Width of the screenshot in pixels (between 100 and 2000)'),
  }),
  execute: async ({ url, width }) => {
    try {
      console.log(`Starting webpage screenshot capture for: ${url}`);
      
      // Construct the API URL
      const fetchUrl = `https://api.thumbnail.ws/api/${API_KEY}/thumbnail/get?url=${encodeURIComponent(url)}&width=${width}`;

      // Fetch the image
      const response = await fetch(fetchUrl);
      if (!response.ok) {
        throw new Error(`Screenshot capture failed with status: ${response.status}`);
      }

      // Get image data as ArrayBuffer
      const imageData = await response.arrayBuffer();

      // Convert ArrayBuffer to base64 string
      const uint8Array = new Uint8Array(imageData);
      let binary = '';
      for (let i = 0; i < uint8Array.length; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      const base64Data = btoa(binary);

      // Return as an image attachment
      return {
        type: 'image',
        src: `data:image/jpeg;base64,${base64Data}`,
        title: `Screenshot of ${url}`,
        metadata: {
          width: width,
          url: url,
          timestamp: new Date().toISOString(),
          mimeType: 'image/jpeg',
          size: imageData.byteLength
        }
      };
    } catch (error) {
      console.error('Webpage screenshot tool error:', error);
      return {
        success: false,
        error: 'Failed to capture webpage screenshot',
        message: typeof error === 'object' && error !== null && 'message' in error 
          ? (error as any).message 
          : String(error)
      };
    }
  }
});