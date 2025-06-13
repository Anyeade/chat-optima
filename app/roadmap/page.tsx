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
    </div>
  );
}
