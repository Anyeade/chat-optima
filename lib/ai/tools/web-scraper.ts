import { tool } from 'ai';
import { z } from 'zod';

// TODO: Move this to environment variables in production
const ANYAPI_KEY = 'qlh3lj31a5onoqdu7arq9opupumimjo8uisbq6f3ga8pumabumj7n';

/**
 * Web scraping tool that uses anyapi.io to extract content from websites
 */
export const webScraper = tool({
  description: 'Scrape content from a website',
  parameters: z.object({
    url: z.string().url().describe('The URL of the website to scrape. Must be a valid URL with http:// or https:// prefix.')
  }),
  execute: async ({ url }) => {
    try {
      console.log(`Scraping content from: ${url}`);
      
      // Construct the API URL with proper encoding
      const apiUrl = `https://anyapi.io/api/v1/scrape?url=${encodeURIComponent(url)}&apiKey=${ANYAPI_KEY}`;
      // Make the request to the API
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Scraping failed with status: ${response.status}`);
      }      // Parse the response
      // Based on the curl example, we know the API returns JSON with a content property
      const data = await response.json();
      
      const formattedResults = {
        url,
        timestamp: new Date().toISOString(),
        // Store the full HTML content internally but don't expose in UI
        _html: data.content,
        instructionsForAI: "Full HTML content has been scraped from the website and is available for processing."
      };
      
      return {
        result: formattedResults
      };
    } catch (error) {
      console.error('Web scraper tool error:', error);
      return { 
        error: 'Failed to scrape website content',
        message: typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error),
        timestamp: new Date().toISOString(),
        url
      };
    }
  }
});
