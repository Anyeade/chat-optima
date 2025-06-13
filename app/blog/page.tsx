import Link from 'next/link';
import AuthAwareNavbar from '@/components/ui/auth-aware-navbar';
import ScrollToTopButton from '@/components/ui/scroll-to-top-button';
import { HeroParticles } from '@/components/particles-background';
import '../landing/landing.css';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-githubDark font-poppins text-white">
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
      </section>

      {/* Featured Post */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#1a1a1b] rounded-lg border border-[#2f343c] overflow-hidden hover:border-[#58a6ff]/30 transition-colors">
            <div className="p-8">
              <div className="flex items-center mb-4">
                <span className="px-3 py-1 bg-[#58a6ff] text-white text-sm rounded-full">Featured</span>
                <span className="ml-4 text-gray-400 text-sm">December 13, 2024</span>
              </div>
              <h2 className="text-3xl font-bold mb-4 text-white">
                Introducing xAI Grok Integration: Real-Time AI with Attitude
              </h2>              <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                We&apos;re excited to announce our latest integration with xAI&apos;s Grok model, bringing real-time information 
                and a unique conversational style to Optima AI. Learn how Grok&apos;s distinctive approach to AI can enhance 
                your development workflow with up-to-date information and creative problem-solving.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold text-sm">OT</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Optima AI Team</p>
                    <p className="text-gray-400 text-sm">Product Updates</p>
                  </div>
                </div>
                <Link
                  href="#"
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

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-white">Latest Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Post 1 */}
            <article className="bg-[#1a1a1b] rounded-lg border border-[#2f343c] overflow-hidden hover:border-[#58a6ff]/30 transition-colors">
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span className="px-2 py-1 bg-blue-600 text-blue-100 text-xs rounded">AI Models</span>
                  <span className="ml-2 text-gray-400 text-sm">Dec 10, 2024</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">
                  Comparing GPT-4, Gemini Pro, and Grok: Which AI Model is Right for You?
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  A comprehensive comparison of the latest AI models available in Optima AI, including performance benchmarks and use case recommendations.
                </p>
                <Link href="#" className="text-[#58a6ff] text-sm hover:underline">Read More →</Link>
              </div>
            </article>

            {/* Post 2 */}
            <article className="bg-[#1a1a1b] rounded-lg border border-[#2f343c] overflow-hidden hover:border-[#58a6ff]/30 transition-colors">
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span className="px-2 py-1 bg-green-600 text-green-100 text-xs rounded">Tutorial</span>
                  <span className="ml-2 text-gray-400 text-sm">Dec 8, 2024</span>
                </div>                <h3 className="text-xl font-semibold mb-3 text-white">
                  Building Your First AI-Powered Application with Optima AI&apos;s API
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Step-by-step guide to integrating Optima AI into your applications, from authentication to your first API call.
                </p>
                <Link href="#" className="text-[#58a6ff] text-sm hover:underline">Read More →</Link>
              </div>
            </article>

            {/* Post 3 */}
            <article className="bg-[#1a1a1b] rounded-lg border border-[#2f343c] overflow-hidden hover:border-[#58a6ff]/30 transition-colors">
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span className="px-2 py-1 bg-purple-600 text-purple-100 text-xs rounded">Best Practices</span>
                  <span className="ml-2 text-gray-400 text-sm">Dec 5, 2024</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">
                  Advanced Prompting Techniques for Better AI Responses
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Learn how to craft better prompts to get more accurate, useful, and creative responses from AI models.
                </p>
                <Link href="#" className="text-[#58a6ff] text-sm hover:underline">Read More →</Link>
              </div>
            </article>

            {/* Post 4 */}
            <article className="bg-[#1a1a1b] rounded-lg border border-[#2f343c] overflow-hidden hover:border-[#58a6ff]/30 transition-colors">
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span className="px-2 py-1 bg-orange-600 text-orange-100 text-xs rounded">Company</span>
                  <span className="ml-2 text-gray-400 text-sm">Dec 1, 2024</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">
                  The Future of AI-Assisted Development: Our 2025 Vision
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Insights into where we see AI-powered development heading and how Optima AI is positioning for the future.
                </p>
                <Link href="#" className="text-[#58a6ff] text-sm hover:underline">Read More →</Link>
              </div>
            </article>

            {/* Post 5 */}
            <article className="bg-[#1a1a1b] rounded-lg border border-[#2f343c] overflow-hidden hover:border-[#58a6ff]/30 transition-colors">
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span className="px-2 py-1 bg-red-600 text-red-100 text-xs rounded">Security</span>
                  <span className="ml-2 text-gray-400 text-sm">Nov 28, 2024</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">
                  Enterprise Security in AI Applications: Best Practices and Guidelines
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Comprehensive guide to securing AI applications and protecting sensitive data when using AI services.
                </p>
                <Link href="#" className="text-[#58a6ff] text-sm hover:underline">Read More →</Link>
              </div>
            </article>

            {/* Post 6 */}
            <article className="bg-[#1a1a1b] rounded-lg border border-[#2f343c] overflow-hidden hover:border-[#58a6ff]/30 transition-colors">
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span className="px-2 py-1 bg-yellow-600 text-yellow-100 text-xs rounded">Case Study</span>
                  <span className="ml-2 text-gray-400 text-sm">Nov 25, 2024</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">
                  How TechCorp Increased Developer Productivity by 40% with Optima AI
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Real-world case study showing how a Fortune 500 company integrated Optima AI into their development workflow.
                </p>
                <Link href="#" className="text-[#58a6ff] text-sm hover:underline">Read More →</Link>
              </div>
            </article>
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="inline-flex items-center px-6 py-3 border border-[#58a6ff] text-[#58a6ff] font-semibold rounded-lg hover:bg-[#58a6ff] hover:text-white transition-colors">
              Load More Posts
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-[#111111]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-white">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="#" className="bg-[#1a1a1b] rounded-lg p-4 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors text-center">
              <span className="text-[#58a6ff] font-semibold">AI Models</span>
              <p className="text-gray-400 text-sm mt-1">12 posts</p>
            </Link>
            <Link href="#" className="bg-[#1a1a1b] rounded-lg p-4 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors text-center">
              <span className="text-[#58a6ff] font-semibold">Tutorials</span>
              <p className="text-gray-400 text-sm mt-1">8 posts</p>
            </Link>
            <Link href="#" className="bg-[#1a1a1b] rounded-lg p-4 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors text-center">
              <span className="text-[#58a6ff] font-semibold">Best Practices</span>
              <p className="text-gray-400 text-sm mt-1">6 posts</p>
            </Link>
            <Link href="#" className="bg-[#1a1a1b] rounded-lg p-4 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors text-center">
              <span className="text-[#58a6ff] font-semibold">Company News</span>
              <p className="text-gray-400 text-sm mt-1">4 posts</p>
            </Link>
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
    </div>
  );
}
