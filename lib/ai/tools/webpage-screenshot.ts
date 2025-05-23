import { tool } from 'ai';
import { z } from 'zod';
import { type Attachment } from 'ai';

const API_KEY = 'abdb613fc4fe10de2b7c8834c25091729fd068e73399';

/**
 * Webpage screenshot tool that uses thumbnail.ws API to capture webpage screenshots
 * Returns the result as an Attachment object compatible with the AI chat
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

      // Create a blob from the image data
      const blob = new Blob([imageData], { type: 'image/jpeg' });
      
      // Create form data for upload
      const formData = new FormData();
      const fileName = `screenshot-${new Date().getTime()}.jpg`;
      formData.append('file', blob, fileName);

      // Upload the image to the server
      const uploadResponse = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload screenshot: ${uploadResponse.statusText}`);
      }

      const uploadData = await uploadResponse.json();
      
      // Return as an Attachment object compatible with AI chat
      const attachment: Attachment = {
        url: uploadData.url,
        name: fileName,
        contentType: 'image/jpeg',
      };      return attachment;
    } catch (error) {
      console.error('Webpage screenshot tool error:', error);
      throw new Error(typeof error === 'object' && error !== null && 'message' in error 
        ? (error as any).message 
        : 'Failed to capture webpage screenshot');
    }
  }
});