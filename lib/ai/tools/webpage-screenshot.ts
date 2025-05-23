import { tool } from 'ai';
import { z } from 'zod';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import os from 'os';

// TODO: Move this to environment variables in production
const GEMINI_API_KEY = 'AIzaSyDSt3zLmaZtmJWnq8z21VFOPUpCYe_A6qA';

/**
 * Sends an image buffer to Gemini API for analysis
 * @param imageBuffer The image buffer to analyze
 * @returns A structured analysis of the image from Gemini
 */
async function sendImageToGemini(imageBuffer: Buffer) {
  // Convert buffer to base64
  const base64 = imageBuffer.toString('base64');
  
  const payload = {
    contents: [
      {
        parts: [          { 
            text: "Analyze this screenshot and describe its visual content in exceptional detail. Include comprehensive information about:\n\n1. LAYOUT: Describe the exact page structure, sections positioning, grids, columns, and spacing\n2. UI ELEMENTS: Identify all buttons, forms, navigation bars, cards, modals, and interactive elements\n3. COLORS: Detail the color palette, primary/secondary colors, background colors, and color contrasts\n4. TYPOGRAPHY: Describe fonts, sizes, heading styles, paragraph text, and text hierarchies\n5. IMAGERY: Analyze all images, icons, logos, and visual media with their purpose and positioning\n6. CONTENT: Summarize the actual text content visible on the page\n7. BRANDING: Identify logo, brand colors, taglines, and brand identity elements\n8. USER EXPERIENCE: Evaluate navigation flow, call-to-actions, and user journey\n9. RESPONSIVENESS: Note any mobile-specific design elements if visible\n\nStructure your response with clear sections and be extremely specific about the exact visual presentation of the webpage."
          },
          {
            inline_data: {
              mime_type: 'image/png',
              data: base64
            }
          }
        ]
      }
    ]
  };

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-thinking-exp-01-21:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    const data = await res.json();
    console.log('Gemini Response Received');
    
    // Extract the analysis from Gemini response
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const analysisText = data.candidates[0].content.parts[0].text;
      return analysisText;
    }
    
    return "Failed to analyze the image content.";
  } catch (error) {
    console.error('Gemini API error:', error);
    return "Error analyzing the image content.";
  }
}
/**
 * Webpage screenshot tool that uses Puppeteer to capture screenshots and Gemini for analysis
 */
export const webpageScreenshot = tool({
  description: 'Capture a screenshot of a website to show the user its visual content and layout',
  parameters: z.object({
    url: z.string().url().describe('The URL of the website to capture a screenshot of. Must be a valid URL with http:// or https:// prefix.'),
    width: z.number().int().min(320).max(1920).default(640)
      .describe('The width of the screenshot in pixels. Defaults to 640px.'),
    height: z.number().int().min(320).max(1080).optional()
      .describe('The height of the screenshot in pixels. If not provided, full page will be captured.'),
    fullPage: z.boolean().default(true)
      .describe('Whether to capture the full page or just the visible area.')
  }),
  execute: async ({ url, width, height, fullPage }) => {
    try {
      console.log(`Capturing screenshot for: ${url} at width ${width}px`);
      
      // Create a temporary directory for the screenshot
      const tempDir = path.join(os.tmpdir(), 'chat-optima-screenshots');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const screenshotPath = path.join(tempDir, `screenshot-${Date.now()}.png`);
        // Launch browser and navigate to URL
      const browser = await puppeteer.launch({
        headless: true, // Use headless mode
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      try {
        const page = await browser.newPage();
        
        // Set viewport
        await page.setViewport({
          width: width,
          height: height || 800, // Default height if not specified
          deviceScaleFactor: 1
        });
        
        // Add user agent to avoid blocking
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        // Navigate to the URL with timeout and wait until network is idle
        await page.goto(url, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });
          // Wait a bit for any dynamic content to load
        await new Promise(resolve => setTimeout(resolve, 2000));
          // Take screenshot
        const screenshot = await page.screenshot({
          fullPage: fullPage
        });
        
        // Save screenshot to file
        fs.writeFileSync(screenshotPath, screenshot);
          // Read the screenshot file
        const imageBuffer = fs.readFileSync(screenshotPath);
        
        // Send the screenshot to Gemini for analysis
        console.log('Sending screenshot to Gemini for analysis...');
        const analysisText = await sendImageToGemini(imageBuffer);
        console.log('Received analysis from Gemini');
        
        // Create a FormData object to upload the image
        const formData = new FormData();
        const blob = new Blob([imageBuffer], { type: 'image/png' });
        formData.append('file', blob, path.basename(screenshotPath));
        
        // Upload the image to the server
        const uploadResponse = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData, 
        });
        
        if (!uploadResponse.ok) {
          throw new Error(`Image upload failed with status: ${uploadResponse.status}`);
        }
        
        const uploadData = await uploadResponse.json();
        
        // Clean up the temporary file
        fs.unlinkSync(screenshotPath);
        
        // Close the browser
        await browser.close();
          // Format the results with detailed structure to help the AI analyze the screenshot
        const formattedResults = {
          url,
          timestamp: new Date().toISOString(),
          screenshotUrl: uploadData.url,
          width,
          height: height || 'full-page',
          pageType: 'webpage',
          captureMethod: 'puppeteer',
          analysis: analysisText,
          instructionsForAI: "The screenshot has been analyzed by Gemini Vision API. Use the analysis provided to describe the webpage to the user.",
          analysisStructure: {
            visualElements: "Described in the Gemini analysis",
            layout: "Described in the Gemini analysis",
            contentSummary: "Described in the Gemini analysis",
            userExperience: "Described in the Gemini analysis",
            keyFeatures: "Described in the Gemini analysis"
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
      } finally {
        // Ensure browser is closed even if there's an error
        if (browser) {
          await browser.close();
        }
      }
    } catch (error) {
      console.error('Webpage screenshot tool error:', error);
      return { 
        error: 'Failed to capture website screenshot',
        message: typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error)
      };
    }
  }
});
