import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // Get base URL from environment variables
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL || 'https://optima-ai.com';
  
  // Static pages
  const staticPages = [
    '',
    '/about',
    '/features',
    '/pricing',
    '/docs',
    '/tutorials',
    '/blog',
    '/contact',
    '/legal',
    '/careers',
    '/roadmap',
    '/integrations'
  ];

  // Blog posts
  const blogPosts = [
    'introducing-xai-grok-integration',
    'comparing-gpt4-gemini-grok',
    'building-first-ai-app-api',
    'advanced-prompting-techniques',
    'future-ai-development-2025',
    'enterprise-security-ai-apps',
    'techcorp-productivity-case-study',
    'mastering-code-generation',
    'ai-model-context-memory',
    'building-conversational-ai',
    'ai-ethics-responsible-development',
    'optimizing-ai-performance',
    'multi-modal-ai-applications',
    'scaling-ai-applications',
    'rise-of-ai-agents'
  ];

  const staticRoutes = staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const blogRoutes = blogPosts.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes];
}
