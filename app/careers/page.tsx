import Link from 'next/link';
import AuthAwareNavbar from '@/components/ui/auth-aware-navbar';
import ScrollToTopButton from '@/components/ui/scroll-to-top-button';
import { HeroParticles } from '@/components/particles-background';
import '../landing/landing.css';

export default function CareersPage() {
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
              Join Our Team
            </span>
            <br />
            <span className="text-white">Shape the Future of AI</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto">
            We're building the next generation of AI tools and looking for passionate individuals to join our mission of democratizing AI.
          </p>
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-8 text-white">Why Work at Optima AI?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Cutting-Edge Technology</h3>
              <p className="text-gray-400">Work with the latest AI models and technologies. Push the boundaries of what's possible in artificial intelligence.</p>
            </div>

            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Collaborative Culture</h3>
              <p className="text-gray-400">Work with a diverse team of experts from AI research, engineering, and product design backgrounds.</p>
            </div>

            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Growth & Learning</h3>
              <p className="text-gray-400">Continuous learning opportunities, conference attendance, and professional development support.</p>
            </div>

            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Remote-First</h3>
              <p className="text-gray-400">Work from anywhere with flexible hours. We believe in work-life balance and trust our team to deliver.</p>
            </div>

            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Competitive Benefits</h3>
              <p className="text-gray-400">Competitive salary, equity, health insurance, and generous PTO. We invest in our team's wellbeing.</p>
            </div>

            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V8m8 0V6a2 2 0 00-2-2H10a2 2 0 00-2 2v2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Real Impact</h3>
              <p className="text-gray-400">Your work will directly impact thousands of developers and teams using our platform every day.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 bg-[#111111]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-8 text-white">Open Positions</h2>
            <p className="text-xl text-gray-400">Join our growing team and help shape the future of AI.</p>
          </div>

          <div className="space-y-6">
            {/* Job 1 */}
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-xl font-semibold text-white mr-4">Senior AI Engineer</h3>
                    <span className="px-3 py-1 bg-[#58a6ff] text-white text-sm rounded-full">Engineering</span>
                  </div>
                  <p className="text-gray-400 mb-4">
                    Lead the development of our core AI systems and work on integrating cutting-edge language models. 
                    Experience with transformer architectures and distributed systems required.
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-300">
                    <span>• Remote</span>
                    <span>• Full-time</span>
                    <span>• $180k - $250k</span>
                  </div>
                </div>
                <Link
                  href="#"
                  className="ml-6 px-6 py-2 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Apply
                </Link>
              </div>
            </div>

            {/* Job 2 */}
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-xl font-semibold text-white mr-4">Product Designer</h3>
                    <span className="px-3 py-1 bg-purple-600 text-purple-100 text-sm rounded-full">Design</span>
                  </div>
                  <p className="text-gray-400 mb-4">
                    Design intuitive user experiences for AI-powered tools. Work closely with engineering and product 
                    teams to create delightful interfaces for complex AI capabilities.
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-300">
                    <span>• Remote</span>
                    <span>• Full-time</span>
                    <span>• $140k - $180k</span>
                  </div>
                </div>
                <Link
                  href="#"
                  className="ml-6 px-6 py-2 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Apply
                </Link>
              </div>
            </div>

            {/* Job 3 */}
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-xl font-semibold text-white mr-4">Full Stack Engineer</h3>
                    <span className="px-3 py-1 bg-[#58a6ff] text-white text-sm rounded-full">Engineering</span>
                  </div>
                  <p className="text-gray-400 mb-4">
                    Build and maintain our web platform using React, Node.js, and modern web technologies. 
                    Help create seamless experiences for AI interactions.
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-300">
                    <span>• Remote</span>
                    <span>• Full-time</span>
                    <span>• $150k - $200k</span>
                  </div>
                </div>
                <Link
                  href="#"
                  className="ml-6 px-6 py-2 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Apply
                </Link>
              </div>
            </div>

            {/* Job 4 */}
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-xl font-semibold text-white mr-4">DevOps Engineer</h3>
                    <span className="px-3 py-1 bg-green-600 text-green-100 text-sm rounded-full">Infrastructure</span>
                  </div>
                  <p className="text-gray-400 mb-4">
                    Scale our infrastructure to handle millions of AI requests. Work with Kubernetes, AWS, 
                    and modern observability tools to ensure reliability and performance.
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-300">
                    <span>• Remote</span>
                    <span>• Full-time</span>
                    <span>• $160k - $220k</span>
                  </div>
                </div>
                <Link
                  href="#"
                  className="ml-6 px-6 py-2 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Apply
                </Link>
              </div>
            </div>

            {/* Job 5 */}
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-xl font-semibold text-white mr-4">Customer Success Manager</h3>
                    <span className="px-3 py-1 bg-orange-600 text-orange-100 text-sm rounded-full">Customer Success</span>
                  </div>
                  <p className="text-gray-400 mb-4">
                    Help enterprise customers succeed with Optima AI. Build relationships, drive adoption, 
                    and ensure customers achieve their AI goals.
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-300">
                    <span>• Remote</span>
                    <span>• Full-time</span>
                    <span>• $120k - $160k</span>
                  </div>
                </div>
                <Link
                  href="#"
                  className="ml-6 px-6 py-2 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Apply
                </Link>
              </div>
            </div>

            {/* Job 6 */}
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-xl font-semibold text-white mr-4">Technical Writer</h3>
                    <span className="px-3 py-1 bg-yellow-600 text-yellow-100 text-sm rounded-full">Content</span>
                  </div>
                  <p className="text-gray-400 mb-4">
                    Create clear, comprehensive documentation for our APIs and developer tools. 
                    Help developers understand and adopt our platform through excellent content.
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-300">
                    <span>• Remote</span>
                    <span>• Full-time</span>
                    <span>• $100k - $140k</span>
                  </div>
                </div>
                <Link
                  href="#"
                  className="ml-6 px-6 py-2 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Apply
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-400 mb-4">Don't see a role that fits? We're always looking for exceptional talent.</p>
            <Link
              href="#"
              className="inline-flex items-center px-6 py-3 border border-[#58a6ff] text-[#58a6ff] font-semibold rounded-lg hover:bg-[#58a6ff] hover:text-white transition-colors"
            >
              Send Us Your Resume
            </Link>
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-8 text-white">Our Hiring Process</h2>
            <p className="text-xl text-gray-400">We believe in a fair, transparent, and efficient hiring process.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">Application</h3>
              <p className="text-gray-400 text-sm">Submit your application with resume and cover letter</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">Phone Screen</h3>
              <p className="text-gray-400 text-sm">30-minute conversation with our team</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">Technical Interview</h3>
              <p className="text-gray-400 text-sm">Role-specific technical evaluation</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">4</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">Final Interview</h3>
              <p className="text-gray-400 text-sm">Culture fit and leadership discussion</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-[#2f343c]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">
            Ready to join the team?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Take the next step in your career and help us build the future of AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="#"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] text-white text-lg font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              View Open Positions
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
