import { NextResponse } from 'next/server';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  publishDate: string;
  slug: string;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Introducing xAI Grok Integration: Real-Time AI with Attitude',
    excerpt: 'We\'re excited to announce our latest integration with xAI\'s Grok model, bringing real-time information and a unique conversational style to Optima AI.',
    category: 'Product Updates',
    tags: ['AI Models', 'Integration', 'Grok', 'Real-time'],
    author: 'Optima AI Team',
    publishDate: 'December 13, 2024',
    slug: 'introducing-xai-grok-integration'
  },
  {
    id: '2',
    title: 'Comparing GPT-4, Gemini Pro, and Grok: Which AI Model is Right for You?',
    excerpt: 'A comprehensive comparison of the latest AI models available in Optima AI, including performance benchmarks and use case recommendations.',
    category: 'AI Models',
    tags: ['GPT-4', 'Gemini Pro', 'Grok', 'Comparison', 'Performance'],
    author: 'Dr. Sarah Chen',
    publishDate: 'December 10, 2024',
    slug: 'comparing-gpt4-gemini-grok'
  },
  {
    id: '3',
    title: 'Building Your First AI-Powered Application with Optima AI\'s API',
    excerpt: 'Step-by-step guide to integrating Optima AI into your applications, from authentication to your first API call.',
    category: 'Tutorials',
    tags: ['API', 'Getting Started', 'Authentication', 'Integration'],
    author: 'Mark Rodriguez',
    publishDate: 'December 8, 2024',
    slug: 'building-first-ai-app-api'
  },
  // Add more posts as needed
];

export async function GET() {
  // Get base URL from environment variables
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL || 'https://optima-ai.com';
  
  const rssItems = blogPosts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.excerpt}]]></description>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.publishDate).toUTCString()}</pubDate>
      <author>noreply@optima-ai.com (${post.author})</author>
      <category>${post.category}</category>
      ${post.tags.map(tag => `<category>${tag}</category>`).join('\n      ')}
    </item>
  `).join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Optima AI Blog</title>
    <description>Stay updated with the latest AI developments, tutorials, and insights from the Optima AI team.</description>
    <link>${baseUrl}/blog</link>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <managingEditor>noreply@optima-ai.com (Optima AI Team)</managingEditor>
    <webMaster>noreply@optima-ai.com (Optima AI Team)</webMaster>
    <atom:link href="${baseUrl}/blog/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/favicon.ico</url>
      <title>Optima AI Blog</title>
      <link>${baseUrl}/blog</link>
    </image>
    ${rssItems}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
