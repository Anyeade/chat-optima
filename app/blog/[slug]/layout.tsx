import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  authorRole: string;
  publishDate: string;
  readTime: string;
  featured: boolean;
  slug: string;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Introducing xAI Grok Integration: Real-Time AI with Attitude',
    excerpt: 'We\'re excited to announce our latest integration with xAI\'s Grok model, bringing real-time information and a unique conversational style to Optima AI.',
    content: '',
    category: 'Product Updates',
    tags: ['AI Models', 'Integration', 'Grok', 'Real-time'],
    author: 'Optima AI Team',
    authorRole: 'Product Updates',
    publishDate: 'December 13, 2024',
    readTime: '5 min read',
    featured: true,
    slug: 'introducing-xai-grok-integration'
  },
  {
    id: '2',
    title: 'Comparing GPT-4, Gemini Pro, and Grok: Which AI Model is Right for You?',
    excerpt: 'A comprehensive comparison of the latest AI models available in Optima AI, including performance benchmarks and use case recommendations.',
    content: '',
    category: 'AI Models',
    tags: ['GPT-4', 'Gemini Pro', 'Grok', 'Comparison', 'Performance'],
    author: 'Dr. Sarah Chen',
    authorRole: 'AI Research Lead',
    publishDate: 'December 10, 2024',
    readTime: '8 min read',
    featured: false,
    slug: 'comparing-gpt4-gemini-grok'
  },
  {
    id: '3',
    title: 'Building Your First AI-Powered Application with Optima AI\'s API',
    excerpt: 'Step-by-step guide to integrating Optima AI into your applications, from authentication to your first API call.',
    content: '',
    category: 'Tutorials',
    tags: ['API', 'Getting Started', 'Authentication', 'Integration'],
    author: 'Mark Rodriguez',
    authorRole: 'Developer Relations',
    publishDate: 'December 8, 2024',
    readTime: '12 min read',
    featured: false,
    slug: 'building-first-ai-app-api'
  }
];

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const { slug } = params;
  const post = blogPosts.find(p => p.slug === slug);

  // Get base URL from environment variables
  const getBaseUrl = () => {
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    return process.env.NEXT_PUBLIC_APP_URL || 'https://optima-ai.com';
  };

  if (!post) {
    return {
      title: 'Post Not Found | Optima AI Blog',
      description: 'The requested blog post could not be found.'
    };
  }

  const baseUrl = getBaseUrl();

  return {
    title: `${post.title} | Optima AI Blog`,
    description: post.excerpt,
    keywords: post.tags.join(', '),
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: `${baseUrl}/blog/${post.slug}`,
      publishedTime: post.publishDate,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
    alternates: {
      canonical: `${baseUrl}/blog/${post.slug}`,
    },
  };
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
