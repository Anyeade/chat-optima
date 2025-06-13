import Link from 'next/link';
import AuthAwareNavbar from '@/components/ui/auth-aware-navbar';
import ScrollToTopButton from '@/components/ui/scroll-to-top-button';
import { HeroParticles } from '@/components/particles-background';
import '../landing/landing.css';

export default function DocsPage() {
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
              Documentation
            </span>
            <br />
            <span className="text-white">Learn, Build, Succeed</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto">
            Everything you need to get started with Optima AI and build amazing AI-powered applications.
          </p>
        </div></div>
      </section>

      {/* Documentation Sections */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Getting Started */}
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Getting Started</h3>
              <p className="text-gray-400 mb-4">Quick start guide to get you up and running with Optima AI in minutes.</p>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• Account Setup</li>
                <li>• First Chat Session</li>
                <li>• Basic Features</li>
                <li>• Model Selection</li>
              </ul>
            </div>

            {/* API Reference */}
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">API Reference</h3>
              <p className="text-gray-400 mb-4">Complete API documentation for integrating Optima AI into your applications.</p>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• REST API Endpoints</li>
                <li>• Authentication</li>
                <li>• Rate Limits</li>
                <li>• Response Formats</li>
              </ul>
            </div>

            {/* Chat Features */}
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Chat Features</h3>
              <p className="text-gray-400 mb-4">Master all the powerful features available in Optima AI chat interface.</p>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• Multi-Model Selection</li>
                <li>• File Uploads</li>
                <li>• Code Generation</li>
                <li>• Artifacts</li>
              </ul>
            </div>

            {/* Integrations */}
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V4a1 1 0 011-1h3a1 1 0 001-1v-1a2 2 0 114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Integrations</h3>
              <p className="text-gray-400 mb-4">Connect Optima AI with your favorite development tools and services.</p>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• VS Code Extension</li>
                <li>• GitHub Integration</li>
                <li>• Slack Bot</li>
                <li>• Webhooks</li>
              </ul>
            </div>

            {/* Best Practices */}
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Best Practices</h3>
              <p className="text-gray-400 mb-4">Learn how to get the most out of Optima AI with proven strategies and tips.</p>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• Effective Prompting</li>
                <li>• Model Selection</li>
                <li>• Team Collaboration</li>
                <li>• Security Guidelines</li>
              </ul>
            </div>

            {/* Troubleshooting */}
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Troubleshooting</h3>
              <p className="text-gray-400 mb-4">Common issues and solutions to help you resolve problems quickly.</p>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• Common Errors</li>
                <li>• Performance Issues</li>
                <li>• API Debugging</li>
                <li>• Support Resources</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 bg-[#111111]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Popular Documentation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <h3 className="text-lg font-semibold mb-2 text-[#58a6ff]">Quick Start Guide</h3>
              <p className="text-gray-400 text-sm mb-3">Get up and running with Optima AI in under 5 minutes.</p>
              <Link href="#" className="text-[#58a6ff] text-sm hover:underline">Read Guide →</Link>
            </div>
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <h3 className="text-lg font-semibold mb-2 text-[#58a6ff]">API Authentication</h3>
              <p className="text-gray-400 text-sm mb-3">Learn how to authenticate and secure your API requests.</p>
              <Link href="#" className="text-[#58a6ff] text-sm hover:underline">View Docs →</Link>
            </div>
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <h3 className="text-lg font-semibold mb-2 text-[#58a6ff]">Model Comparison</h3>
              <p className="text-gray-400 text-sm mb-3">Compare different AI models and choose the right one for your needs.</p>
              <Link href="#" className="text-[#58a6ff] text-sm hover:underline">Compare Models →</Link>
            </div>
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <h3 className="text-lg font-semibold mb-2 text-[#58a6ff]">Code Examples</h3>
              <p className="text-gray-400 text-sm mb-3">Practical examples in multiple programming languages.</p>
              <Link href="#" className="text-[#58a6ff] text-sm hover:underline">Browse Examples →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-[#2f343c]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">
            Still have questions?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Our support team is here to help you succeed with Optima AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] text-white text-lg font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Contact Support
            </Link>
            <Link
              href="/chat"
              className="inline-flex items-center px-8 py-4 border border-[#58a6ff] text-[#58a6ff] text-lg font-semibold rounded-lg hover:bg-[#58a6ff] hover:text-white transition-colors"
            >
              Try Optima AI
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
