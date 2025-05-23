import { tool } from 'ai';
import { z } from 'zod';

// TODO: Move this to environment variables in production
const ANYAPI_KEY = 'qlh3lj31a5onoqdu7arq9opupumimjo8uisbq6f3ga8pumabumj7n';

/**
 * Web scraping tool that uses anyapi.io to extract content from websites
 */
export const webScraper = tool({
  description: 'Scrape content from a website with optional CSS selectors',
  parameters: z.object({
    url: z.string().url().describe('The URL of the website to scrape. Must be a valid URL with http:// or https:// prefix.'),
    selector: z.string().optional().describe('Optional CSS selector to target specific elements on the page (e.g., "h1", ".content", "#main-article").'),
    attribute: z.string().optional().describe('Optional attribute to extract from the selected elements (e.g., "href", "src"). If not provided, will return text content.')
  }),
  execute: async ({ url, selector, attribute }) => {
    try {
      console.log(`Scraping content from: ${url}${selector ? ` using selector: ${selector}` : ' (full page)'}`);
      
      // Construct the API URL with proper encoding
      let apiUrl = `https://anyapi.io/api/v1/scrape?url=${encodeURIComponent(url)}&apiKey=${ANYAPI_KEY}`;
      
      // Add selector and attribute parameters only if provided
      if (selector) {
        apiUrl += `&selector=${encodeURIComponent(selector)}`;
        if (attribute) {
          apiUrl += `&attribute=${encodeURIComponent(attribute)}`;
        }
      }
      // Make the request to the API
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Scraping failed with status: ${response.status}`);
      }
      
      // Parse the response
      const data = await response.json();
      
      // Format the results with detailed structure
      const formattedResults = {
        url,
        timestamp: new Date().toISOString(),
        selector,
        attribute: attribute || 'textContent',
        results: data.results || [],
        count: data.results ? data.results.length : 0,
        instructionsForAI: "The data below was scraped from the specified website using the provided CSS selector. Analyze and summarize this content for the user."
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
