import { tool, DataStreamWriter } from 'ai';
import { z } from 'zod';

interface PexelsSearchProps {
  dataStream: DataStreamWriter;
}

/**
 * Pexels API search tool for finding high-quality images and videos
 * Provides access to Pexels' vast library of free stock photos and videos
 */
export const pexelsSearch = ({ dataStream }: PexelsSearchProps) => tool({
  description: 'Search for high-quality images and videos from Pexels API. Use when you need specific, themed, or professional images for websites, applications, or content creation.',
  parameters: z.object({
    query: z.string().describe('Search query for images/videos (e.g., "business meeting", "nature landscape", "technology", "food photography")'),
    type: z.enum(['photos', 'videos']).optional().default('photos')
      .describe('Type of content to search for - photos or videos'),
    orientation: z.enum(['landscape', 'portrait', 'square']).optional()
      .describe('Image orientation preference'),
    size: z.enum(['large', 'medium', 'small']).optional().default('medium')
      .describe('Preferred image size'),
    color: z.enum(['red', 'orange', 'yellow', 'green', 'turquoise', 'blue', 'violet', 'pink', 'brown', 'black', 'gray', 'white']).optional()
      .describe('Dominant color in the image'),
    per_page: z.number().min(1).max(80).optional().default(15)
      .describe('Number of results to return (1-80)'),
    page: z.number().min(1).optional().default(1)
      .describe('Page number for pagination')
  }),
  execute: async ({ query, type, orientation, size, color, per_page, page }) => {
    try {
      // Signal that Pexels search is starting
      dataStream.writeData({
        type: 'pexels-search-status',
        content: 'searching-pexels'
      });

      console.log(`Starting Pexels ${type} search for: ${query}`);
      
      // Build the API endpoint
      const baseUrl = type === 'photos' 
        ? 'https://api.pexels.com/v1/search'
        : 'https://api.pexels.com/videos/search';
      
      // Build query parameters
      const params = new URLSearchParams({
        query,
        per_page: per_page.toString(),
        page: page.toString()
      });
      
      if (orientation) params.append('orientation', orientation);
      if (size) params.append('size', size);
      if (color) params.append('color', color);
      
      const url = `${baseUrl}?${params.toString()}`;
      
      // Make the API request
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': process.env.PEXELS_API_KEY || '',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Pexels API key is missing or invalid. Please set PEXELS_API_KEY environment variable.');
        }
        throw new Error(`Pexels API request failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Format the results based on content type
      if (type === 'photos') {
        const formattedResults = {
          search_query: query,
          content_type: 'photos',
          total_results: data.total_results,
          page: data.page,
          per_page: data.per_page,
          timestamp: new Date().toISOString(),
          photos: data.photos?.map((photo: any) => ({
            id: photo.id,
            width: photo.width,
            height: photo.height,
            url: photo.url,
            photographer: photo.photographer,
            photographer_url: photo.photographer_url,
            src: {
              original: photo.src.original,
              large2x: photo.src.large2x,
              large: photo.src.large,
              medium: photo.src.medium,
              small: photo.src.small,
              portrait: photo.src.portrait,
              landscape: photo.src.landscape,
              tiny: photo.src.tiny
            },
            alt: photo.alt || `Photo by ${photo.photographer} on Pexels`
          })) || []
        };
        
        return formattedResults;
      } else {
        // Videos
        const formattedResults = {
          search_query: query,
          content_type: 'videos',
          total_results: data.total_results,
          page: data.page,
          per_page: data.per_page,
          timestamp: new Date().toISOString(),
          videos: data.videos?.map((video: any) => ({
            id: video.id,
            width: video.width,
            height: video.height,
            duration: video.duration,
            url: video.url,
            image: video.image,
            user: {
              id: video.user.id,
              name: video.user.name,
              url: video.user.url
            },
            video_files: video.video_files?.map((file: any) => ({
              id: file.id,
              quality: file.quality,
              file_type: file.file_type,
              width: file.width,
              height: file.height,
              link: file.link
            })) || [],
            video_pictures: video.video_pictures?.map((picture: any) => ({
              id: picture.id,
              picture: picture.picture,
              nr: picture.nr
            })) || []
          })) || []
        };
        
        // Signal that Pexels search is complete
        dataStream.writeData({
          type: 'pexels-search-status',
          content: 'searched-pexels'
        });

        // Send results to AI in JSON format
        dataStream.writeData({
          type: 'pexels-search-results',
          content: JSON.stringify(formattedResults)
        });

        return formattedResults;
      }
      
    } catch (error) {
      // Signal search failed
      dataStream.writeData({
        type: 'pexels-search-status',
        content: 'search-failed'
      });
      console.error('Pexels search tool error:', error);
      return {
        error: 'Failed to search Pexels',
        message: typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error),
        note: 'Make sure PEXELS_API_KEY environment variable is set with a valid Pexels API key'
      };
    }
  }
});