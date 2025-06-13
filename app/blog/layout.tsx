import { Metadata } from 'next';

// Get base URL from environment variables
const getBaseUrl = () => {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'https://optima-ai.com';
};

export const metadata: Metadata = {
  title: 'Optima AI Blog - AI Insights, Tutorials & Updates | Optima AI',
  description: 'Stay updated with the latest AI developments, tutorials, best practices, and insights from the Optima AI team. Learn about AI models, development tips, and industry trends.',
  keywords: [
    'AI blog',
    'artificial intelligence',
    'machine learning',
    'chatbot development',
    'AI tutorials',
    'GPT-4',
    'Gemini Pro',
    'Grok',
    'AI best practices',
    'OpenAI',
    'Google AI',
    'xAI',
    'AI development',
    'AI integration',
    'AI models comparison',
    'AI programming',
    'AI applications'
  ].join(', '),
  authors: [{ name: 'Optima AI Team' }],
  openGraph: {
    title: 'Optima AI Blog - AI Insights, Tutorials & Updates',
    description: 'Stay updated with the latest AI developments, tutorials, and insights from the Optima AI team.',
    type: 'website',
    url: `${getBaseUrl()}/blog`,
    siteName: 'Optima AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Optima AI Blog - AI Insights, Tutorials & Updates',
    description: 'Stay updated with the latest AI developments, tutorials, and insights from the Optima AI team.',
    site: '@OptimAI',
    creator: '@OptimAI',
  },
  alternates: {
    canonical: `${getBaseUrl()}/blog`,
    types: {
      'application/rss+xml': `${getBaseUrl()}/blog/rss.xml`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
