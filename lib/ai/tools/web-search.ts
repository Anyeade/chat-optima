import { tool, DataStreamWriter } from 'ai';
import { z } from 'zod';

interface WebSearchProps {
  dataStream: DataStreamWriter;
}

/**
 * We've removed the reformulateQuery function because we'll let the AI model
 * generate the optimal search query. The AI has better context of the conversation
 * and can formulate more effective search queries directly.
 */

/**
 * Web search tool that uses Tavily API to search the web for current information
 */
export const webSearch = ({ dataStream }: WebSearchProps) => tool({
  description: 'Search the web for current information when the AI needs real-time data or facts it may not know',
  parameters: z.object({
    query: z.string().describe('Generate a concise search query based on what information you need. DO NOT search with the user\'s full question; instead create a focused, keyword-rich search query.'),
    search_depth: z.enum(['basic', 'advanced']).optional().default('basic')
      .describe('Use "basic" for simple searches and "advanced" for more in-depth research'),
  }),
  execute: async ({ query, search_depth }) => {
    try {
      // Signal that web search is starting
      dataStream.writeData({
        type: 'web-search-status',
        content: 'searching-web'
      });

      // The AI model is now responsible for generating an effective search query
      console.log(`Starting web search for: ${query}`);
      
      // First, perform a web search
      const searchResponse = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TAVILY_API_KEY}`
        },
        body: JSON.stringify({
          query: query, // Using the AI-generated search query
          search_depth,
          include_answer: false,
          include_raw_content: true,
          max_results: 5
        })
      });

      if (!searchResponse.ok) {
        throw new Error(`Web search failed with status: ${searchResponse.status}`);
      }      const searchData = await searchResponse.json();
      
      // Get top result URLs for content extraction
      const topUrls = searchData.results.slice(0, 2).map((result: { url: string }) => result.url);
        // Extract detailed content from top results if available
      let extractedContents = [];
      if (topUrls.length > 0) {
        try {
          const extractResponse = await fetch('https://api.tavily.com/extract', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.TAVILY_API_KEY}`
            },
            body: JSON.stringify({
              urls: topUrls,
              include_images: false,
              extract_depth: search_depth
            })
          });
          
          if (extractResponse.ok) {
            const extractData = await extractResponse.json();
            extractedContents = extractData.results || [];
          }
        } catch (extractError) {
          console.error('Content extraction error:', extractError);
          // Continue without extracted content
        }
      }      // Format the results in a structured way
      const formattedResults = {
        search_query: query, // The AI-generated search query
        timestamp: new Date().toISOString(),
        search_results: searchData.results.map((result: {
          title: string;
          url: string;
          snippet: string;
          published_date: string;
        }) => ({
          title: result.title,
          url: result.url,
          snippet: result.snippet,
          published_date: result.published_date
        })),
        extracted_contents: extractedContents
      };

      // Signal that web search is complete
      dataStream.writeData({
        type: 'web-search-status',
        content: 'searched-web'
      });

      // Send results to AI in JSON format
      dataStream.writeData({
        type: 'web-search-results',
        content: JSON.stringify(formattedResults)
      });
      
      return formattedResults;
    } catch (error) {
      // Signal search failed
      dataStream.writeData({
        type: 'web-search-status',
        content: 'search-failed'
      });
      console.error('Web search tool error:', error);
      return { 
        error: 'Failed to search the web',
        message: typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error)
      };
    }
  }
});

