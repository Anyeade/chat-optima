# Pexels API Setup Guide

## Overview
The Pexels Image Search Tool allows the AI to find high-quality, thematic images from Pexels' vast library of free stock photos and videos when building websites and applications.

## Setup Instructions

### 1. Get Pexels API Key
1. Visit [Pexels API](https://www.pexels.com/api/)
2. Click "Get Started" or "Sign Up"
3. Create a free Pexels account or sign in
4. Go to your API dashboard
5. Copy your API key

### 2. Set Environment Variable
Add the following environment variable to your `.env.local` file:

```bash
PEXELS_API_KEY=your_pexels_api_key_here
```

### 3. API Limits
- **Free Plan**: 200 requests per hour, 20,000 requests per month
- **No attribution required** for Pexels images (but recommended)
- All content is free to use for commercial and personal projects

## How the AI Uses Pexels Search

### Automatic Usage
The AI will automatically use the Pexels search tool when:
- Building websites that need thematic images
- Creating content that requires specific visual themes
- Developing professional applications with targeted imagery

### Search Categories
The AI can search for:
- **Business**: office spaces, meetings, professional environments
- **Technology**: computers, mobile devices, modern tech
- **Food**: restaurant imagery, cooking, dining
- **Nature**: landscapes, plants, outdoor scenes
- **People**: portraits, teams, lifestyle photos
- **Fashion**: clothing, accessories, style photography
- **Architecture**: buildings, interiors, design elements

### Integration with Picsum
The AI uses a smart dual approach:
1. **Pexels**: For thematic, professional, content-specific images
2. **Picsum**: For backgrounds, filler content, and decorative elements

## Example AI Workflow

When you ask the AI to "Create a website for a fitness gym":

1. AI searches Pexels for "gym equipment", "fitness training", "healthy lifestyle"
2. Uses high-quality Pexels images for hero sections and key content areas
3. Uses Picsum for background patterns and secondary visual elements
4. Creates a professional, cohesive design with relevant imagery

## Benefits

- **Professional Quality**: High-resolution, professional photography
- **Thematic Relevance**: Images that actually match the website's purpose
- **Free to Use**: All Pexels content is free for commercial use
- **No Attribution Required**: Though recommended for good practice
- **Variety**: Millions of photos and videos available

## Troubleshooting

### Tool Not Working?
1. Verify `PEXELS_API_KEY` is set in environment variables
2. Check API key is valid on Pexels dashboard
3. Ensure you haven't exceeded rate limits (200/hour, 20,000/month)
4. Restart the development server after adding environment variables

### No Images Found?
- Try more specific search terms
- Use alternative keywords (e.g., "workspace" instead of "office")
- The AI will fallback to Picsum if Pexels search fails

## Cost Considerations

The Pexels API is completely **free** with generous limits:
- Perfect for development and production use
- No upgrade required for most applications
- Monitor usage in Pexels dashboard if needed

---

This enhancement makes the AI significantly more capable of creating professional, visually appealing websites with relevant, high-quality imagery.