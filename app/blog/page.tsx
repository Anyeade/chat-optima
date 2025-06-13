'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import AuthAwareNavbar from '@/components/ui/auth-aware-navbar';
import ScrollToTopButton from '@/components/ui/scroll-to-top-button';
import { HeroParticles } from '@/components/particles-background';
import '../landing/landing.css';

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
    excerpt: 'We&apos;re excited to announce our latest integration with xAI&apos;s Grok model, bringing real-time information and a unique conversational style to Optima AI.',
    content: 'Full article content here...',
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
    content: 'Full article content here...',
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
    title: 'Building Your First AI-Powered Application with Optima AI&apos;s API',
    excerpt: 'Step-by-step guide to integrating Optima AI into your applications, from authentication to your first API call.',
    content: 'Full article content here...',
    category: 'Tutorials',
    tags: ['API', 'Getting Started', 'Authentication', 'Integration'],
    author: 'Mark Rodriguez',
    authorRole: 'Developer Relations',
    publishDate: 'December 8, 2024',
    readTime: '12 min read',
    featured: false,
    slug: 'building-first-ai-app-api'
  },
  {
    id: '4',
    title: 'Advanced Prompting Techniques for Better AI Responses',
    excerpt: 'Learn how to craft better prompts to get more accurate, useful, and creative responses from AI models.',
    content: 'Full article content here...',
    category: 'Best Practices',
    tags: ['Prompting', 'AI Optimization', 'Best Practices', 'Techniques'],
    author: 'Elena Vasquez',
    authorRole: 'AI Trainer',
    publishDate: 'December 5, 2024',
    readTime: '10 min read',
    featured: false,
    slug: 'advanced-prompting-techniques'
  },
  {
    id: '5',
    title: 'The Future of AI-Assisted Development: Our 2025 Vision',
    excerpt: 'Insights into where we see AI-powered development heading and how Optima AI is positioning for the future.',
    content: 'Full article content here...',
    category: 'Company News',
    tags: ['Future', 'Vision', 'Development', 'AI Trends'],
    author: 'Alex Kim',
    authorRole: 'CEO & Co-founder',
    publishDate: 'December 1, 2024',
    readTime: '6 min read',
    featured: false,
    slug: 'future-ai-development-2025'
  },
  {
    id: '6',
    title: 'Enterprise Security in AI Applications: Best Practices and Guidelines',
    excerpt: 'Comprehensive guide to securing AI applications and protecting sensitive data when using AI services.',
    content: 'Full article content here...',
    category: 'Security',
    tags: ['Security', 'Enterprise', 'Privacy', 'Compliance'],
    author: 'Michael Thompson',
    authorRole: 'Security Lead',
    publishDate: 'November 28, 2024',
    readTime: '15 min read',
    featured: false,
    slug: 'enterprise-security-ai-apps'
  },
  {
    id: '7',
    title: 'How TechCorp Increased Developer Productivity by 40% with Optima AI',
    excerpt: 'Real-world case study showing how a Fortune 500 company integrated Optima AI into their development workflow.',
    content: 'Full article content here...',
    category: 'Case Studies',
    tags: ['Case Study', 'Productivity', 'Enterprise', 'ROI'],
    author: 'Jennifer Walsh',
    authorRole: 'Customer Success',
    publishDate: 'November 25, 2024',
    readTime: '7 min read',
    featured: false,
    slug: 'techcorp-productivity-case-study'
  },
  {
    id: '8',
    title: 'Mastering Code Generation: From Idea to Implementation',
    excerpt: 'Learn how to leverage AI for code generation effectively, including best practices, common pitfalls, and optimization techniques.',
    content: 'Full article content here...',
    category: 'Development',
    tags: ['Code Generation', 'Development', 'Best Practices', 'AI Coding'],
    author: 'David Park',
    authorRole: 'Senior Developer',
    publishDate: 'November 22, 2024',
    readTime: '11 min read',
    featured: false,
    slug: 'mastering-code-generation'
  },
  {
    id: '9',
    title: 'Understanding AI Model Context Windows and Memory Management',
    excerpt: 'Deep dive into how AI models handle context and memory, and how to optimize your interactions for better results.',
    content: 'Full article content here...',
    category: 'Technical Deep Dive',
    tags: ['Context Windows', 'Memory', 'AI Architecture', 'Optimization'],
    author: 'Dr. Lisa Zhang',
    authorRole: 'ML Engineer',
    publishDate: 'November 18, 2024',
    readTime: '14 min read',
    featured: false,
    slug: 'ai-model-context-memory'
  },  {
    id: '10',
    title: 'Building Conversational AI: From Chatbots to Virtual Assistants',
    excerpt: 'Complete guide to building sophisticated conversational AI applications using Optima AI&apos;s advanced models.',
    content: 'Full article content here...',
    category: 'Tutorials',
    tags: ['Conversational AI', 'Chatbots', 'Virtual Assistants', 'NLP'],
    author: 'Robert Chen',
    authorRole: 'AI Architect',
    publishDate: 'November 15, 2024',
    readTime: '16 min read',
    featured: false,
    slug: 'building-conversational-ai'
  },
  {
    id: '11',
    title: 'AI Ethics and Responsible Development: A Framework for 2025',
    excerpt: 'Exploring the ethical considerations and best practices for responsible AI development in modern applications.',
    content: 'Full article content here...',
    category: 'Best Practices',
    tags: ['AI Ethics', 'Responsible AI', 'Best Practices', 'Governance'],
    author: 'Dr. Amanda Foster',
    authorRole: 'AI Ethics Lead',
    publishDate: 'November 12, 2024',
    readTime: '13 min read',
    featured: false,
    slug: 'ai-ethics-responsible-development'
  },
  {
    id: '12',
    title: 'Optimizing AI Performance: Latency, Throughput, and Cost Management',
    excerpt: 'Learn advanced techniques for optimizing AI model performance, reducing latency, and managing costs effectively.',
    content: 'Full article content here...',
    category: 'Technical Deep Dive',
    tags: ['Performance', 'Optimization', 'Cost Management', 'Latency'],
    author: 'Kevin Zhang',
    authorRole: 'Performance Engineer',
    publishDate: 'November 8, 2024',
    readTime: '18 min read',
    featured: false,
    slug: 'optimizing-ai-performance'
  },
  {
    id: '13',
    title: 'Multi-Modal AI: Combining Text, Images, and Audio in Applications',
    excerpt: 'Discover how to build applications that leverage multiple AI modalities for richer user experiences.',
    content: 'Full article content here...',
    category: 'Development',
    tags: ['Multi-Modal', 'Computer Vision', 'Audio Processing', 'Integration'],
    author: 'Sophia Martinez',
    authorRole: 'ML Engineer',
    publishDate: 'November 5, 2024',
    readTime: '14 min read',
    featured: false,
    slug: 'multi-modal-ai-applications'
  },
  {
    id: '14',
    title: 'Scaling AI Applications: From Prototype to Production',
    excerpt: 'Best practices and strategies for scaling AI applications from proof-of-concept to enterprise production.',
    content: 'Full article content here...',
    category: 'Case Studies',
    tags: ['Scaling', 'Production', 'DevOps', 'Enterprise'],
    author: 'Thomas Wilson',
    authorRole: 'Solutions Architect',
    publishDate: 'November 1, 2024',
    readTime: '20 min read',
    featured: false,
    slug: 'scaling-ai-applications'
  },
  {
    id: '15',
    title: 'The Rise of AI Agents: Building Autonomous AI Systems',
    excerpt: 'Explore the cutting-edge world of AI agents and learn how to build autonomous systems that can act on behalf of users.',
    content: 'Full article content here...',
    category: 'Technical Deep Dive',
    tags: ['AI Agents', 'Autonomous Systems', 'LangChain', 'Tool Use'],
    author: 'Dr. Rachel Kim',
    authorRole: 'Research Scientist',
    publishDate: 'October 28, 2024',
    readTime: '22 min read',
    featured: false,
    slug: 'rise-of-ai-agents'
  }
];

const categories = [
  'All Categories',
  'Product Updates',
  'AI Models',
  'Tutorials',
  'Best Practices',
  'Company News',
  'Security',
  'Case Studies',
  'Development',
  'Technical Deep Dive'
];

export default function BlogPage() {  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [postsToShow, setPostsToShow] = useState(6);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Generate search suggestions based on all available tags and titles
  const allSearchTerms = useMemo(() => {
    const terms = new Set<string>();
    blogPosts.forEach(post => {
      // Add tags
      post.tags.forEach(tag => terms.add(tag.toLowerCase()));
      // Add title words (longer than 3 characters)
      post.title.toLowerCase().split(' ').forEach(word => {
        if (word.length > 3) terms.add(word);
      });
      // Add category
      terms.add(post.category.toLowerCase());
      // Add author names
      terms.add(post.author.toLowerCase());
    });
    return Array.from(terms);
  }, []);

  // Update search suggestions based on current query
  const updateSearchSuggestions = (query: string) => {
    if (query.length > 1) {
      const suggestions = allSearchTerms
        .filter(term => term.includes(query.toLowerCase()))
        .slice(0, 5);
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, readTime

  const filteredPosts = useMemo(() => {
    let filtered = blogPosts.filter(post => {
      const matchesSearch = 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === 'All Categories' || 
        post.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort posts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime();
        case 'readTime':
          const aTime = parseInt(a.readTime.split(' ')[0]);
          const bTime = parseInt(b.readTime.split(' ')[0]);
          return aTime - bTime;
        case 'newest':
        default:
          return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, sortBy]);

  const displayedPosts = filteredPosts.slice(0, postsToShow);
  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = displayedPosts.filter(post => !post.featured);

  const getCategoryCount = (category: string) => {
    if (category === 'All Categories') return blogPosts.length;
    return blogPosts.filter(post => post.category === category).length;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Product Updates': 'bg-blue-600 text-blue-100',
      'AI Models': 'bg-purple-600 text-purple-100',
      'Tutorials': 'bg-green-600 text-green-100',
      'Best Practices': 'bg-orange-600 text-orange-100',
      'Company News': 'bg-red-600 text-red-100',
      'Security': 'bg-yellow-600 text-yellow-100',
      'Case Studies': 'bg-pink-600 text-pink-100',
      'Development': 'bg-indigo-600 text-indigo-100',
      'Technical Deep Dive': 'bg-teal-600 text-teal-100'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-600 text-gray-100';
  };

  // Clear search function
  const clearSearch = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setSortBy('newest');
  };return (
    <div className="min-h-screen bg-githubDark font-poppins text-white">
      {/* SEO Meta Tags */}
      <head>
        <title>Optima AI Blog - AI Insights, Tutorials & Updates | Optima AI</title>
        <meta name="description" content="Stay updated with the latest AI developments, tutorials, best practices, and insights from the Optima AI team. Learn about AI models, development tips, and industry trends." />
        <meta name="keywords" content="AI blog, artificial intelligence, machine learning, chatbot development, AI tutorials, GPT-4, Gemini Pro, Grok, AI best practices" />
        <meta property="og:title" content="Optima AI Blog - AI Insights, Tutorials & Updates" />
        <meta property="og:description" content="Stay updated with the latest AI developments, tutorials, and insights from the Optima AI team." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://optima-ai.com/blog" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Optima AI Blog - AI Insights, Tutorials & Updates" />
        <meta name="twitter:description" content="Stay updated with the latest AI developments, tutorials, and insights from the Optima AI team." />
        <link rel="canonical" href="https://optima-ai.com/blog" />
      </head>

      {/* Particles Background */}
      <HeroParticles />
      
      {/* Header/Navigation */}
      <AuthAwareNavbar />
      
      {/* Scroll to top button */}
      <ScrollToTopButton />

      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#58a6ff] to-[#bf00ff]">
                Optima AI Blog
              </span>
              <br />
              <span className="text-white">Insights & Updates</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto">
              Stay up to date with the latest AI developments, product updates, and insights from the Optima AI team.
            </p>
          </div>
        </div>
      </section>      {/* Search and Filter Section */}
      <section className="py-8 bg-[#111111]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6">
            {/* Search Bar and Sort */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-[#2f343c] rounded-lg bg-[#1a1a1b] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#58a6ff] focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-gray-400 text-sm whitespace-nowrap">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-[#1a1a1b] border border-[#2f343c] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#58a6ff]"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="readTime">Reading Time</option>
                </select>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] text-white'
                      : 'bg-[#1a1a1b] text-gray-300 border border-[#2f343c] hover:border-[#58a6ff]/30'
                  }`}
                >
                  {category} ({getCategoryCount(category)})
                </button>
              ))}
            </div>

            {/* Search Results Info */}
            <div className="flex items-center justify-between">
              {(searchQuery || selectedCategory !== 'All Categories' || sortBy !== 'newest') && (
                <div className="text-gray-400 text-sm">
                  Found {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
                  {searchQuery && ` matching "${searchQuery}"`}
                  {selectedCategory !== 'All Categories' && ` in ${selectedCategory}`}
                  {(searchQuery || selectedCategory !== 'All Categories' || sortBy !== 'newest') && (
                    <button
                      onClick={clearSearch}
                      className="ml-2 text-[#58a6ff] hover:underline"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              )}
              
              {!searchQuery && selectedCategory === 'All Categories' && sortBy === 'newest' && (
                <div className="text-gray-400 text-sm">
                  Showing all {blogPosts.length} articles
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && selectedCategory === 'All Categories' && !searchQuery && (
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#1a1a1b] rounded-lg border border-[#2f343c] overflow-hidden hover:border-[#58a6ff]/30 transition-colors">
              <div className="p-8">
                <div className="flex items-center mb-4">
                  <span className="px-3 py-1 bg-[#58a6ff] text-white text-sm rounded-full">Featured</span>
                  <span className="ml-4 text-gray-400 text-sm">{featuredPost.publishDate}</span>
                  <span className="ml-2 text-gray-400 text-sm">• {featuredPost.readTime}</span>
                </div>
                <h2 className="text-3xl font-bold mb-4 text-white">
                  {featuredPost.title}
                </h2>
                <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {featuredPost.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-[#2f343c] text-gray-300 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-semibold text-sm">
                        {featuredPost.author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{featuredPost.author}</p>
                      <p className="text-gray-400 text-sm">{featuredPost.authorRole}</p>
                    </div>
                  </div>
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Read More
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-white">
            {selectedCategory === 'All Categories' ? 'Latest Posts' : `${selectedCategory} Posts`}
          </h2>
          
          {displayedPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-[#1a1a1b] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.007-5.824-2.709M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No articles found</h3>
              <p className="text-gray-400 mb-4">
                Try adjusting your search or browse a different category.
              </p>              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Categories');
                  setSortBy('newest');
                }}
                className="text-[#58a6ff] hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedPosts.filter(post => !post.featured).map((post) => (
                <article key={post.id} className="bg-[#1a1a1b] rounded-lg border border-[#2f343c] overflow-hidden hover:border-[#58a6ff]/30 transition-colors group">
                  <div className="p-6">
                    <div className="flex items-center mb-3">
                      <span className={`px-2 py-1 text-xs rounded ${getCategoryColor(post.category)}`}>
                        {post.category}
                      </span>
                      <span className="ml-2 text-gray-400 text-sm">{post.publishDate}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-[#58a6ff] transition-colors">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-[#2f343c] text-gray-300 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="px-2 py-1 bg-[#2f343c] text-gray-300 text-xs rounded">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-full flex items-center justify-center mr-2">
                          <span className="text-white font-semibold text-xs">
                            {post.author.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{post.author}</p>
                          <p className="text-gray-400 text-xs">{post.readTime}</p>
                        </div>
                      </div>
                      <Link href={`/blog/${post.slug}`} className="text-[#58a6ff] text-sm hover:underline">
                        Read More →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Load More */}
          {filteredPosts.length > postsToShow && (
            <div className="text-center mt-12">
              <button 
                onClick={() => setPostsToShow(prev => prev + 6)}
                className="inline-flex items-center px-6 py-3 border border-[#58a6ff] text-[#58a6ff] font-semibold rounded-lg hover:bg-[#58a6ff] hover:text-white transition-colors"
              >
                Load More Posts ({filteredPosts.length - postsToShow} remaining)
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-[#111111]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-white">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.slice(1).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`bg-[#1a1a1b] rounded-lg p-4 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors text-center group ${
                  selectedCategory === category ? 'border-[#58a6ff] bg-[#58a6ff]/10' : ''
                }`}
              >
                <span className={`font-semibold group-hover:text-[#58a6ff] transition-colors ${
                  selectedCategory === category ? 'text-[#58a6ff]' : 'text-white'
                }`}>
                  {category}
                </span>
                <p className="text-gray-400 text-sm mt-1">{getCategoryCount(category)} posts</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 border-t border-[#2f343c]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">
            Stay Updated
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Subscribe to our newsletter for the latest AI insights, product updates, and development tips.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-[#1a1a1b] border border-[#2f343c] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#58a6ff]"
            />
            <button className="px-6 py-3 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity">
              Subscribe
            </button>
          </div>
        </div>
      </section>    
      {/* Footer */}
      <footer className="border-t border-[#2f343c] py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#58a6ff] to-[#bf00ff]">Optima AI</span>
              </Link>
              <p className="mt-2 text-xs text-gray-400">
                by Optima, Inc.
              </p>
              <p className="mt-4 text-gray-400">
                Next-generation AI chat platform for developers and teams.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-gray-400 hover:text-[#58a6ff] transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-[#58a6ff] transition-colors">Pricing</Link></li>
                <li><Link href="/integrations" className="text-gray-400 hover:text-[#58a6ff] transition-colors">Integrations</Link></li>
                <li><Link href="/roadmap" className="text-gray-400 hover:text-[#58a6ff] transition-colors">Roadmap</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="/docs" className="text-gray-400 hover:text-[#58a6ff] transition-colors">Documentation</Link></li>
                <li><Link href="/api" className="text-gray-400 hover:text-[#58a6ff] transition-colors">API Reference</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-[#58a6ff] transition-colors">Blog</Link></li>
                <li><Link href="/tutorials" className="text-gray-400 hover:text-[#58a6ff] transition-colors">Tutorials</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-[#58a6ff] transition-colors">About Optima, Inc.</Link></li>
                <li><Link href="/careers" className="text-gray-400 hover:text-[#58a6ff] transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-[#58a6ff] transition-colors">Contact</Link></li>
                <li><Link href="/legal" className="text-gray-400 hover:text-[#58a6ff] transition-colors">Legal</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-[#2f343c] flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Optima, Inc. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-[#58a6ff] transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-[#58a6ff] transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-[#58a6ff] transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
