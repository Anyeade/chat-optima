import { tool } from 'ai';
import { z } from 'zod';

/**
 * Webpage screenshot tool that uses Thumbnail.ws API to capture screenshots of websites
 * and provides the image as an attachment for the AI to analyze
 */
export const webpageScreenshot = tool({
  description: 'Capture a screenshot of a website to show the user its visual content and layout. The AI will receive the image as an attachment and should analyze it to provide insights about the website\'s design, content, and user experience.',
  parameters: z.object({
    url: z.string().url().describe('The URL of the website to capture a screenshot of. Must be a valid URL with http:// or https:// prefix.'),
    width: z.number().int().min(320).max(1024).default(640)
      .describe('The width of the screenshot in pixels. Defaults to 640px. Valid values are 320, 640, or 1024.')
  }),
  execute: async ({ url, width }) => {
    try {
      console.log(`Capturing screenshot for: ${url} at width ${width}px`);
      
      // Format URL for the Thumbnail.ws API
      const apiKey = "abdb613fc4fe10de2b7c8834c25091729fd068e73399";
      const thumbnailUrl = `https://api.thumbnail.ws/api/${apiKey}/thumbnail/get?url=${encodeURIComponent(url)}&width=${width}`;
      
      // Fetch the screenshot image
      const response = await fetch(thumbnailUrl);
      
      if (!response.ok) {
        throw new Error(`Screenshot capture failed with status: ${response.status}`);
      }
      
      // Get the image as a Blob
      const imageBlob = await response.blob();
      
      // Create a FormData object to upload the image
      const formData = new FormData();
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
        // Format the results with detailed structure to help the AI analyze the screenshot
      const formattedResults = {
        url,
        timestamp: new Date().toISOString(),
        screenshotUrl: uploadData.url,
        width,
        pageType: 'webpage',
        instructionsForAI: "Analyze this screenshot and describe its visual content including layout, color scheme, main elements, text content, images, and overall design. Consider the user experience, branding elements, and overall impression.",
        analysisStructure: {
          visualElements: "Describe the main visual elements visible in the screenshot",
          layout: "Describe the page layout and structure",
          contentSummary: "Summarize the visible text content",
          userExperience: "Evaluate the user interface and experience",
          keyFeatures: "Identify key features or functionality shown"
        }
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
        message: typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error)
      };
    }
  }
});
