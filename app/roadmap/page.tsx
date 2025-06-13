import Link from 'next/link';
import AuthAwareNavbar from '@/components/ui/auth-aware-navbar';
import ScrollToTopButton from '@/components/ui/scroll-to-top-button';
import { HeroParticles } from '@/components/particles-background';
import '../landing/landing.css';

export default function RoadmapPage() {
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
              Product Roadmap
            </span>
            <br />            <span className="text-white">What&apos;s Coming Next</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto">
            See what we&apos;re building for the future of AI-powered development and collaboration.
          </p>
          </div>
        </div>
      </section>

      {/* Roadmap Timeline */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {/* Q1 2025 */}
            <div className="relative">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-full w-4 h-4 mr-4"></div>
                <h2 className="text-2xl font-bold text-white">Q1 2025 - Enhanced AI Models</h2>
                <span className="ml-4 px-3 py-1 bg-green-600 text-green-100 text-sm rounded-full">Current</span>
              </div>
              <div className="ml-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
                  <h3 className="text-lg font-semibold mb-3 text-[#58a6ff]">GPT-4 Turbo Integration</h3>
                  <p className="text-gray-400">Latest OpenAI models with improved performance and lower latency.</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-green-600 text-green-100 text-xs rounded">✓ Completed</span>
                </div>
                <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
                  <h3 className="text-lg font-semibold mb-3 text-[#58a6ff]">Google Gemini Pro</h3>
                  <p className="text-gray-400">Advanced multimodal capabilities with Gemini Pro integration.</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-green-600 text-green-100 text-xs rounded">✓ Completed</span>
                </div>
                <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
                  <h3 className="text-lg font-semibold mb-3 text-[#58a6ff]">xAI Grok Integration</h3>
                  <p className="text-gray-400">Real-time information and unique perspective with Grok.</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-yellow-600 text-yellow-100 text-xs rounded">In Progress</span>
                </div>
                <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
                  <h3 className="text-lg font-semibold mb-3 text-[#58a6ff]">Enhanced Code Generation</h3>
                  <p className="text-gray-400">Improved code understanding and generation capabilities.</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-yellow-600 text-yellow-100 text-xs rounded">In Progress</span>
                </div>
              </div>
            </div>

            {/* Q2 2025 */}
            <div className="relative">
              <div className="flex items-center mb-6">
                <div className="bg-gray-400 rounded-full w-4 h-4 mr-4"></div>
                <h2 className="text-2xl font-bold text-white">Q2 2025 - Collaboration Features</h2>
                <span className="ml-4 px-3 py-1 bg-blue-600 text-blue-100 text-sm rounded-full">Planned</span>
              </div>
              <div className="ml-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
                  <h3 className="text-lg font-semibold mb-3 text-[#58a6ff]">Team Workspaces</h3>
                  <p className="text-gray-400">Shared spaces for team collaboration and knowledge sharing.</p>
                </div>
                <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
                  <h3 className="text-lg font-semibold mb-3 text-[#58a6ff]">Real-time Collaboration</h3>
                  <p className="text-gray-400">Live editing and commenting on conversations and artifacts.</p>
                </div>
                <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
                  <h3 className="text-lg font-semibold mb-3 text-[#58a6ff]">Advanced Permissions</h3>
                  <p className="text-gray-400">Fine-grained access control and role-based permissions.</p>
                </div>
                <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
                  <h3 className="text-lg font-semibold mb-3 text-[#58a6ff]">Project Templates</h3>
                  <p className="text-gray-400">Pre-built templates for common development workflows.</p>
                </div>
              </div>
            </div>

            {/* Q3 2025 */}
            <div className="relative">
              <div className="flex items-center mb-6">
                <div className="bg-gray-400 rounded-full w-4 h-4 mr-4"></div>
                <h2 className="text-2xl font-bold text-white">Q3 2025 - Advanced Integrations</h2>
                <span className="ml-4 px-3 py-1 bg-blue-600 text-blue-100 text-sm rounded-full">Planned</span>
              </div>
              <div className="ml-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
                  <h3 className="text-lg font-semibold mb-3 text-[#58a6ff]">VS Code Extension</h3>
                  <p className="text-gray-400">Native integration with Visual Studio Code for seamless development.</p>
                </div>
                <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
                  <h3 className="text-lg font-semibold mb-3 text-[#58a6ff]">GitHub Actions</h3>
                  <p className="text-gray-400">Automated code review and assistance in your CI/CD pipeline.</p>
                </div>
                <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
                  <h3 className="text-lg font-semibold mb-3 text-[#58a6ff]">Slack/Discord Bots</h3>
                  <p className="text-gray-400">Bring AI assistance directly to your team communication platforms.</p>
                </div>
                <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
                  <h3 className="text-lg font-semibold mb-3 text-[#58a6ff]">API Expansions</h3>
                  <p className="text-gray-400">More comprehensive APIs for custom integrations and automation.</p>
                </div>
              </div>
            </div>

            {/* Q4 2025 */}
            <div className="relative">
              <div className="flex items-center mb-6">
                <div className="bg-gray-400 rounded-full w-4 h-4 mr-4"></div>
                <h2 className="text-2xl font-bold text-white">Q4 2025 - Enterprise Features</h2>
                <span className="ml-4 px-3 py-1 bg-purple-600 text-purple-100 text-sm rounded-full">Future</span>
              </div>
              <div className="ml-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
                  <h3 className="text-lg font-semibold mb-3 text-[#58a6ff]">Enterprise SSO</h3>
                  <p className="text-gray-400">Single sign-on integration with enterprise identity providers.</p>
                </div>
                <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
                  <h3 className="text-lg font-semibold mb-3 text-[#58a6ff]">Advanced Analytics</h3>
                  <p className="text-gray-400">Detailed usage analytics and insights for teams and organizations.</p>
                </div>
                <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
                  <h3 className="text-lg font-semibold mb-3 text-[#58a6ff]">Audit Logs</h3>
                  <p className="text-gray-400">Comprehensive audit trails for compliance and security.</p>
                </div>
                <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
                  <h3 className="text-lg font-semibold mb-3 text-[#58a6ff]">On-Premise Deployment</h3>
                  <p className="text-gray-400">Self-hosted solutions for maximum security and control.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-20 border-t border-[#2f343c]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">
            Have a Feature Request?
          </h2>          <p className="text-xl text-gray-400 mb-8">
            We&apos;d love to hear from you! Share your ideas and help shape the future of Optima AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] text-white text-lg font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Submit Feedback
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
