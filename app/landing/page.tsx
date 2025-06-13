'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import SimpleParticlesTest from '@/components/simple-particles-test';
import NeonButton from '@/components/ui/neon-button';
import NeonSectionDivider from '@/components/ui/neon-section-divider';
import NeonPricingCard from '@/components/ui/neon-pricing-card';
import NeonFAQItem from '@/components/ui/neon-faq-item';
import NeonFeatureCard from '@/components/ui/neon-feature-card';
import AuthAwareNavbar from '@/components/ui/auth-aware-navbar';
import ScrollToTopButton from '@/components/ui/scroll-to-top-button';
import { HeroParticles } from '@/components/particles-background';
import './landing.css';

// Hero section with typing animation
const TypedText = () => {
  const [displayText, setDisplayText] = useState('');
  const fullText = 'AI-Powered Chat Solutions';
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + fullText[index]);
        setIndex(index + 1);
      }, 100);
      
      return () => clearTimeout(timeout);
    }
  }, [index, fullText]);

  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
};



// Pricing plan component


// FAQ item component


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-githubDark font-poppins text-white overflow-hidden">
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
              Next-Generation <TypedText />
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto">
              Experience the future of communication with our cutting-edge AI chat platform
              powered by advanced machine learning models.
            </p>            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/chat" passHref>
                <NeonButton variant="primary">
                  Chat with Optima AI
                </NeonButton>
              </Link>
              <Link href="#demo" passHref>
                <NeonButton variant="secondary">
                  See Demo
                </NeonButton>
              </Link>
            </div>
          </div>
            {/* Hero Graphic */}
          <div className="mt-20 relative mx-auto max-w-4xl">
            <div className="rounded-2xl overflow-hidden border border-githubBorder shadow-[0_0_30px_rgba(88,166,255,0.15)]">
              <div className="dashboard-placeholder">
                <div className="flex flex-col items-center justify-center space-y-6 p-10 size-full z-10">
                  <div className="flex items-center space-x-3">
                    <div className="size-3 rounded-full bg-neonBlue animate-pulse"></div>
                    <div className="size-3 rounded-full bg-neonPurple animate-pulse delay-150"></div>
                    <div className="size-3 rounded-full bg-neonTeal animate-pulse delay-300"></div>
                  </div>
                  <div className="text-2xl font-bold text-white">AI Dashboard Preview</div>
                  <div className="w-full max-w-md h-12 rounded-md bg-githubBorder flex items-center px-4">
                    <div className="size-6 rounded-full bg-neonBlue/20 mr-3"></div>
                    <div className="flex-1 h-3 bg-neonBlue/20 rounded"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                    <div className="h-20 rounded-md bg-[#2f343c] p-4">
                      <div className="w-full h-3 bg-[#58a6ff]/20 rounded mb-2"></div>
                      <div className="w-2/3 h-3 bg-[#58a6ff]/20 rounded"></div>
                    </div>
                    <div className="h-20 rounded-md bg-[#2f343c] p-4">
                      <div className="w-full h-3 bg-[#58a6ff]/20 rounded mb-2"></div>
                      <div className="w-2/3 h-3 bg-[#58a6ff]/20 rounded"></div>
                    </div>
                  </div>
                  <div className="w-full max-w-md h-32 rounded-md bg-[#2f343c] p-4">
                    <div className="w-full h-3 bg-[#58a6ff]/20 rounded mb-2"></div>
                    <div className="w-3/4 h-3 bg-[#58a6ff]/20 rounded mb-2"></div>
                    <div className="w-1/2 h-3 bg-[#58a6ff]/20 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-2xl blur opacity-20 -z-10"></div>
          </div>
        </div>      </section>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <NeonSectionDivider direction="left" className="my-8" />
      </div>
      
      {/* Features Section */}
      <section id="features" className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#58a6ff] to-[#bf00ff]">
                Powerful Features
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Our platform combines cutting-edge technology with user-friendly design to deliver an exceptional AI chat experience.
            </p>
          </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <NeonFeatureCard 
              title="Advanced AI Models"
              description="Access the latest AI models for human-like conversations and complex problem-solving capabilities."
              icon={
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              }
            />
            
            <NeonFeatureCard 
              title="Code Generation"
              description="Generate, analyze, and debug code across multiple programming languages with intelligent suggestions."
              icon={
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                </svg>
              }
            />
            
            <NeonFeatureCard 
              title="Multi-modal Capabilities"
              description="Interact with text, images, and code simultaneously for a comprehensive AI assistance experience."
              icon={
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              }
            />
            
            <NeonFeatureCard 
              title="Real-time Collaboration"
              description="Share AI sessions with team members for collaborative problem-solving and knowledge sharing."
              icon={
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              }
            />
            
            <NeonFeatureCard 
              title="Enterprise Security"
              description="End-to-end encryption and advanced security protocols ensure your data remains private and protected."
              icon={
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              }
            />
            
            <NeonFeatureCard 
              title="Custom Integration"
              description="Seamlessly integrate our AI chat solution with your existing tools and workflows via our robust API."
              icon={
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 001 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"></path>
                </svg>
              }
            />
          </div>
        </div>      </section>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <NeonSectionDivider direction="right" className="my-8" />
      </div>
      
      {/* Pricing Section */}
      <section id="pricing" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#58a6ff] to-[#bf00ff]">
                Plans & Pricing
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Choose the perfect plan for your needs. All plans include our core features with different usage limits.
            </p>
          </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <NeonPricingCard 
              title="Basic"
              price="$19"
              description="Perfect for individuals and small projects."
              features={[
                "Access to primary AI models",
                "5,000 messages per month",
                "Basic code generation",
                "24-hour chat history",
                "Email support"
              ]}
              onClick={() => window.location.href = '/register?plan=basic'}
            />
            
            <NeonPricingCard 
              title="Professional"
              price="$49"
              description="Ideal for professional developers and small teams."
              features={[
                "Access to all AI models",
                "25,000 messages per month",
                "Advanced code generation",
                "Unlimited chat history",
                "Priority support",
                "API access"
              ]}
              highlighted={true}
              onClick={() => window.location.href = '/register?plan=pro'}
            />
            
            <NeonPricingCard 
              title="Enterprise"
              price="Custom"
              description="For organizations with advanced needs and larger teams."
              features={[
                "Custom message volume",
                "Dedicated AI resources",
                "Custom model fine-tuning",
                "SSO integration",
                "24/7 dedicated support",
                "Custom contracts & SLAs"
              ]}
              onClick={() => window.location.href = '/contact?inquiry=enterprise'}
            />
          </div>
        </div>      </section>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <NeonSectionDivider direction="left" className="my-8" />
      </div>
      
      {/* FAQ Section */}
      <section id="faq" className="py-20 relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#58a6ff] to-[#bf00ff]">
                Frequently Asked Questions
              </span>
            </h2>
          </div>
            <div className="space-y-2">
            <NeonFAQItem 
              question="What AI models does your platform support?"
              answer="We support a wide range of state-of-the-art AI models including OpenAI GPT models, Anthropic Claude, Google Gemini, and more. Our platform is designed to integrate new models as they become available."
            />
            
            <NeonFAQItem 
              question="How secure is the data I share with the AI?"
              answer="We take security very seriously. All communications with our AI are encrypted end-to-end, and we don't store your conversations longer than necessary. Enterprise plans offer additional security features like SSO and custom data retention policies."
            />
            
            <NeonFAQItem 
              question="Can I integrate your AI chat with my existing tools?"
              answer="Yes! Our API allows for seamless integration with a wide range of tools and platforms. Professional and Enterprise plans include API access with comprehensive documentation and support for custom integrations."
            />
            
            <NeonFAQItem 
              question="Do you offer custom AI solutions for specific industries?"
              answer="Our Enterprise plan includes options for custom AI model fine-tuning for specific industries or use cases. This allows the AI to be optimized for your particular terminology, workflows, and requirements."
            />
            
            <NeonFAQItem 
              question="What kind of support do you offer?"
              answer="Basic plans include email support with 48-hour response time. Professional plans include priority support with 24-hour response time. Enterprise plans include dedicated support with custom SLAs and direct access to our engineering team."
            />
          </div>
        </div>      </section>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <NeonSectionDivider direction="right" className="my-8" />
      </div>
      
      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl overflow-hidden bg-[#1a1f25] p-12 border border-[#2f343c]">
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#58a6ff]/20 to-[#bf00ff]/20 opacity-50"></div>
            
            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to transform your AI experience?
              </h2>
              <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                Join thousands of developers, teams, and enterprises using our advanced AI chat platform.
              </p>              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/chat" passHref>
                  <NeonButton variant="primary">
                    Chat with Optima AI
                  </NeonButton>
                </Link>
                <Link href="/register" passHref>
                  <NeonButton variant="secondary">
                    Sign Up Free
                  </NeonButton>
                </Link>
                <Link href="/contact" passHref>
                  <NeonButton variant="tertiary">
                    Contact Sales
                  </NeonButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-[#2f343c] py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">            <div>
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
