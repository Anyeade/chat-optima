import Link from 'next/link';
import AuthAwareNavbar from '@/components/ui/auth-aware-navbar';
import ScrollToTopButton from '@/components/ui/scroll-to-top-button';
import { HeroParticles } from '@/components/particles-background';
import '../landing/landing.css';

export default function AboutPage() {
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
              About Optima, Inc.
            </span>
            <br />
            <span className="text-white">Pioneering the Future of AI</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto">
            We're building the next generation of AI-powered tools to help developers and teams work more efficiently and creatively.
          </p>
        </div></div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-8 text-white">Our Mission</h2>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              To democratize access to powerful AI capabilities and make them accessible to developers, teams, and 
              organizations of all sizes. We believe that AI should augment human creativity and productivity, not replace it.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
                <div className="w-12 h-12 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-white">Innovation</h3>
                <p className="text-gray-400 text-sm">
                  Pushing the boundaries of what's possible with AI technology and user experience.
                </p>
              </div>
              <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
                <div className="w-12 h-12 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-white">Accessibility</h3>
                <p className="text-gray-400 text-sm">
                  Making powerful AI tools accessible to everyone, regardless of technical background.
                </p>
              </div>
              <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
                <div className="w-12 h-12 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-white">Trust</h3>
                <p className="text-gray-400 text-sm">
                  Building secure, reliable, and transparent AI systems that users can trust.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-[#111111]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-white">Our Story</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  Founded in 2024, Optima AI emerged from a simple observation: while AI technology was advancing rapidly, 
                  the tools available to developers and teams were often fragmented, difficult to use, or prohibitively expensive.
                </p>
                <p>
                  Our founding team, with backgrounds in AI research, software engineering, and product design, came together 
                  with a shared vision of creating a unified platform that would make powerful AI capabilities accessible to everyone.
                </p>
                <p>
                  Today, we're proud to serve thousands of developers and teams worldwide, helping them build smarter applications, 
                  automate repetitive tasks, and unlock new possibilities with AI.
                </p>
              </div>
            </div>
            <div className="bg-[#1a1a1b] rounded-lg p-8 border border-[#2f343c]">
              <h3 className="text-xl font-semibold mb-6 text-white">Company Milestones</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-[#58a6ff] rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <div>
                    <p className="text-white font-medium">Q1 2024</p>
                    <p className="text-gray-400 text-sm">Company founded and initial product development</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-[#58a6ff] rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <div>
                    <p className="text-white font-medium">Q2 2024</p>
                    <p className="text-gray-400 text-sm">Private beta launch with select customers</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-[#58a6ff] rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <div>
                    <p className="text-white font-medium">Q3 2024</p>
                    <p className="text-gray-400 text-sm">Public launch and API release</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-[#58a6ff] rounded-full mt-2 mr-4 flex-shrink-0"></div>
                  <div>
                    <p className="text-white font-medium">Q4 2024</p>
                    <p className="text-gray-400 text-sm">Multi-model support and enterprise features</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-8 text-white">Leadership Team</h2>
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto">
              Our leadership team brings together expertise from AI research, product development, and enterprise software.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Team Member 1 */}
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">AJ</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Alex Johnson</h3>
              <p className="text-[#58a6ff] text-sm mb-3">CEO & Co-Founder</p>
              <p className="text-gray-400 text-sm">
                Former AI research lead at Google. PhD in Computer Science from Stanford. Passionate about democratizing AI.
              </p>
            </div>

            {/* Team Member 2 */}
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">SC</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Sarah Chen</h3>
              <p className="text-[#58a6ff] text-sm mb-3">CTO & Co-Founder</p>
              <p className="text-gray-400 text-sm">
                Former principal engineer at OpenAI. Expert in large-scale AI systems and infrastructure.
              </p>
            </div>

            {/* Team Member 3 */}
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">MR</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Michael Rodriguez</h3>
              <p className="text-[#58a6ff] text-sm mb-3">VP of Product</p>
              <p className="text-gray-400 text-sm">
                Former product director at Microsoft. Expert in developer tools and enterprise software.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-[#111111]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-8 text-white">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
              <h3 className="text-xl font-semibold mb-4 text-[#58a6ff]">Developer-First</h3>
              <p className="text-gray-300">
                We build tools by developers, for developers. Our APIs are designed to be intuitive, 
                well-documented, and reliable so you can focus on building great products.
              </p>
            </div>
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
              <h3 className="text-xl font-semibold mb-4 text-[#58a6ff]">Privacy by Design</h3>
              <p className="text-gray-300">
                Your data is yours. We implement privacy controls from the ground up and give you 
                complete control over how your data is used and stored.
              </p>
            </div>
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
              <h3 className="text-xl font-semibold mb-4 text-[#58a6ff]">Continuous Innovation</h3>
              <p className="text-gray-300">
                AI is rapidly evolving, and so are we. We continuously integrate the latest models 
                and capabilities to keep you at the cutting edge.
              </p>
            </div>
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
              <h3 className="text-xl font-semibold mb-4 text-[#58a6ff]">Transparent Communication</h3>
              <p className="text-gray-300">
                We believe in open communication about our capabilities, limitations, and roadmap. 
                No surprises, just honest conversation about what we can do.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Investors & Partners */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8 text-white">Trusted by Industry Leaders</h2>
          <p className="text-gray-400 mb-12">
            We're backed by leading investors and trusted by innovative companies worldwide.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded mx-auto mb-2"></div>
                <p className="text-gray-400 text-sm">Series A Investor</p>
              </div>
            </div>
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded mx-auto mb-2"></div>
                <p className="text-gray-400 text-sm">Technology Partner</p>
              </div>
            </div>
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded mx-auto mb-2"></div>
                <p className="text-gray-400 text-sm">Enterprise Customer</p>
              </div>
            </div>
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded mx-auto mb-2"></div>
                <p className="text-gray-400 text-sm">Strategic Advisor</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-[#2f343c]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">
            Join us in shaping the future of AI
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Whether you're a developer, enterprise customer, or potential team member, we'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/careers"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] text-white text-lg font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              View Careers
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 border border-[#58a6ff] text-[#58a6ff] text-lg font-semibold rounded-lg hover:bg-[#58a6ff] hover:text-white transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
