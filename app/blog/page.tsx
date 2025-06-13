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
      </footer></div>
  );
}
