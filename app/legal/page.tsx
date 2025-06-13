import Link from 'next/link';
import AuthAwareNavbar from '@/components/ui/auth-aware-navbar';
import ScrollToTopButton from '@/components/ui/scroll-to-top-button';
import { HeroParticles } from '@/components/particles-background';
import '../landing/landing.css';

export default function LegalPage() {
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
              Legal
            </span>
            <br />
            <span className="text-white">Terms & Policies</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto">
            Our commitment to transparency and legal compliance. Find all our terms, policies, and legal documents here.
          </p>
          </div>
        </div>
      </section>

      {/* Legal Documents */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Terms of Service */}
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Terms of Service</h3>
              <p className="text-gray-400 mb-4">The terms and conditions governing your use of Optima AI services.</p>
              <p className="text-sm text-gray-500 mb-4">Last updated: December 13, 2024</p>
              <Link href="#" className="text-[#58a6ff] text-sm hover:underline">Read Full Document →</Link>
            </div>

            {/* Privacy Policy */}
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Privacy Policy</h3>
              <p className="text-gray-400 mb-4">How we collect, use, and protect your personal information and data.</p>
              <p className="text-sm text-gray-500 mb-4">Last updated: December 13, 2024</p>
              <Link href="#" className="text-[#58a6ff] text-sm hover:underline">Read Full Document →</Link>
            </div>

            {/* Data Processing Agreement */}
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Data Processing Agreement</h3>
              <p className="text-gray-400 mb-4">GDPR-compliant data processing terms for enterprise customers.</p>
              <p className="text-sm text-gray-500 mb-4">Last updated: December 1, 2024</p>
              <Link href="#" className="text-[#58a6ff] text-sm hover:underline">Read Full Document →</Link>
            </div>

            {/* Acceptable Use Policy */}
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Acceptable Use Policy</h3>
              <p className="text-gray-400 mb-4">Guidelines for appropriate use of Optima AI services and prohibited activities.</p>
              <p className="text-sm text-gray-500 mb-4">Last updated: November 15, 2024</p>
              <Link href="#" className="text-[#58a6ff] text-sm hover:underline">Read Full Document →</Link>
            </div>

            {/* Cookie Policy */}
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9V3m0 9l3-3m-3 3l3 3m-3-3l-3-3m3 3l-3 3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Cookie Policy</h3>
              <p className="text-gray-400 mb-4">Information about how we use cookies and similar tracking technologies.</p>
              <p className="text-sm text-gray-500 mb-4">Last updated: October 1, 2024</p>
              <Link href="#" className="text-[#58a6ff] text-sm hover:underline">Read Full Document →</Link>
            </div>

            {/* Security Policy */}
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Security Policy</h3>
              <p className="text-gray-400 mb-4">Our approach to security, compliance, and responsible AI practices.</p>
              <p className="text-sm text-gray-500 mb-4">Last updated: November 1, 2024</p>
              <Link href="#" className="text-[#58a6ff] text-sm hover:underline">Read Full Document →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance & Certifications */}
      <section className="py-16 bg-[#111111]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-8 text-white">Compliance & Certifications</h2>
            <p className="text-xl text-gray-400">We maintain the highest standards of security and compliance.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">GDPR</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">GDPR Compliant</h3>
              <p className="text-gray-400 text-sm">Full compliance with European data protection regulations.</p>
            </div>
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">SOC2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">SOC 2 Type II</h3>
              <p className="text-gray-400 text-sm">Certified for security, availability, and confidentiality.</p>
            </div>
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">ISO</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">ISO 27001</h3>
              <p className="text-gray-400 text-sm">International standard for information security management.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Legal */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#1a1a1b] rounded-lg p-8 border border-[#2f343c]">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4 text-white">Legal Inquiries</h2>
              <p className="text-xl text-gray-400">
                Have questions about our legal documents or need specific compliance information?
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-[#58a6ff]">General Legal Questions</h3>
                <p className="text-gray-300 mb-4">
                  For questions about our terms, policies, or general legal matters.
                </p>
                <p className="text-gray-400">
                  <strong>Email:</strong> legal@optima.ai<br />
                  <strong>Response Time:</strong> 2-3 business days
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-[#58a6ff]">Enterprise & Compliance</h3>
                <p className="text-gray-300 mb-4">
                  For enterprise customers needing compliance documentation or custom agreements.
                </p>
                <p className="text-gray-400">
                  <strong>Email:</strong> compliance@optima.ai<br />
                  <strong>Response Time:</strong> 1-2 business days
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Information */}
      <section className="py-16 bg-[#111111]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-8 text-white">Company Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
              <h3 className="text-xl font-semibold mb-4 text-[#58a6ff]">Corporate Details</h3>
              <div className="space-y-2 text-gray-300">
                <p><strong>Company Name:</strong> Optima AI, Inc.</p>
                <p><strong>Incorporation:</strong> Delaware, USA</p>
                <p><strong>Registration Number:</strong> 7891234</p>
                <p><strong>Tax ID:</strong> 12-3456789</p>
              </div>
            </div>
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
              <h3 className="text-xl font-semibold mb-4 text-[#58a6ff]">Registered Address</h3>
              <div className="text-gray-300">
                <p>Optima AI, Inc.</p>
                <p>123 Innovation Drive</p>
                <p>Suite 456</p>
                <p>San Francisco, CA 94105</p>
                <p>United States</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-[#2f343c]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">
            Need Help with Legal Matters?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Our legal team is here to assist with any questions or concerns you may have.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] text-white text-lg font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Contact Legal Team
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center px-8 py-4 border border-[#58a6ff] text-[#58a6ff] text-lg font-semibold rounded-lg hover:bg-[#58a6ff] hover:text-white transition-colors"
            >
              View Documentation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
