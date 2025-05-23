// Alternative implementation using screenshotmachine-nodejs package
import { tool } from 'ai';
import { z } from 'zod';
import screenshotmachine from 'screenshotmachine';

/**
 * Webpage screenshot tool that uses Screenshot Machine API service
 */
export const webpageScreenshotApi = tool({
  description: 'Capture a screenshot of a website to show the user its visual content and layout',
  parameters: z.object({
    url: z.string().url().describe('The URL of the website to capture a screenshot of. Must be a valid URL with http:// or https:// prefix.'),
    width: z.number().int().min(320).max(1920).default(1024)
      .describe('The width of the screenshot in pixels. Defaults to 1024x768.'),
    fullPage: z.boolean().default(true)
      .describe('Whether to capture the full page or just the visible area.')
  }),  execute: async ({ url, width, fullPage }) => {
    try {
      console.log(`Capturing screenshot for: ${url} at width ${width}px`);
      
      // Screenshot Machine API configuration
      const customerKey = 'f82442'; // Your customer key
      const secretPhrase = ''; // Leave empty if not needed
      
      // Configure screenshot options according to the API documentation
      const options = {
        url: url,
        dimension: `${width}x${fullPage ? 'full' : '768'}`, // Width x height (use 'full' for full page)
        device: 'desktop',
        format: 'png',
        cacheLimit: '0', // Don't use cache
        delay: '200', // Wait 200ms after page load before capturing
        zoom: '100'
      };
      
      // Generate the API URL using the library
      const apiUrl = screenshotmachine.generateScreenshotApiUrl(customerKey, secretPhrase, options);
        // Create a FormData object to upload the image
      const formData = new FormData();
      
      // Use the library to get the screenshot and create a blob
      const imageBuffer = await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        
        screenshotmachine.readScreenshot(apiUrl)
          .on('data', (chunk) => chunks.push(Buffer.from(chunk)))
          .on('end', () => resolve(Buffer.concat(chunks)))
          .on('error', (err) => reject(err));
      });
      
      // Create a blob from the buffer
      const imageBlob = new Blob([imageBuffer], { type: 'image/png' });
      
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
        captureMethod: 'screenshot-machine',
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
