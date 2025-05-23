// Alternative implementation using only fetch-based approach
import { tool } from 'ai';
import { z } from 'zod';

/**
 * Webpage screenshot tool that uses a reliable public API service
 */
export const webpageScreenshotApi = tool({
  description: 'Capture a screenshot of a website to show the user its visual content and layout',
  parameters: z.object({
    url: z.string().url().describe('The URL of the website to capture a screenshot of. Must be a valid URL with http:// or https:// prefix.'),
    width: z.number().int().min(320).max(1920).default(1024)
      .describe('The width of the screenshot in pixels. Defaults to 1024x768.'),
    fullPage: z.boolean().default(true)
      .describe('Whether to capture the full page or just the visible area.')
  }),
  execute: async ({ url, width, fullPage }) => {
    try {
      console.log(`Capturing screenshot for: ${url} at width ${width}px`);
      
      // Use a reliable public screenshot API
      // Note: For production, consider using a paid service with better reliability
      const screenshotUrl = `https://api.screenshotmachine.com/?key=f82442&url=${encodeURIComponent(url)}&dimension=${width}x0&device=desktop&format=png&cacheLimit=0${fullPage ? '&fullpage=1' : ''}`;
      
      // Create a FormData object to upload the image
      const formData = new FormData();
      
      // Fetch the screenshot image
      const imageResponse = await fetch(screenshotUrl);
      
      if (!imageResponse.ok) {
        throw new Error(`Screenshot capture failed with status: ${imageResponse.status}`);
      }
      
      // Get the image as a Blob
      const imageBlob = await imageResponse.blob();
      formData.append('file', imageBlob, `screenshot-${Date.now()}.png`);
      
      // Upload the image to the server
      const uploadResponse = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`Image upload failed with status: ${uploadResponse.status}`);
      }
      
      const uploadData = await uploadResponse.json();
      
      // Format the results
      const formattedResults = {
        url,
        timestamp: new Date().toISOString(),
        screenshotUrl: uploadData.url,
        width,
        pageType: 'webpage',
        captureMethod: 'api-service',
        instructionsForAI: "This screenshot shows the visual layout and content of the webpage. Describe what you see to the user including layout, design elements, content, and overall structure."
      };
      
      // Return an attachment for the AI to display and analyze
      return {
        result: formattedResults,
        experimental_attachments: [
          {
            name: `Screenshot of ${url}`,
            url: uploadData.url,
            contentType: 'image/png',
          },
        ],
      };
    } catch (error) {
      console.error('Webpage screenshot tool error:', error);
      return { 
        error: 'Failed to capture website screenshot',
        message: typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error),
        timestamp: new Date().toISOString(),
        url
      };
    }
  }
});
