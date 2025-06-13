'use client';

import Link from 'next/link';
import { useState } from 'react';
import AuthAwareNavbar from '@/components/ui/auth-aware-navbar';
import ScrollToTopButton from '@/components/ui/scroll-to-top-button';
import { HeroParticles } from '@/components/particles-background';
import '../landing/landing.css';

export default function DocsPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const documentationContent = {
    'quick-start': {
      title: 'Quick Start Guide',
      description: 'Get up and running with Optima AI in under 5 minutes.',
      content: (
        <div className="space-y-4 text-gray-300">
          <h4 className="text-lg font-semibold text-white">1. Create Your Account</h4>
          <p>Sign up for a free Optima AI account at <span className="text-[#58a6ff]">app.optima-ai.com</span></p>
          
          <h4 className="text-lg font-semibold text-white">2. Start Your First Chat</h4>
          <p>Click the "New Chat" button and select your preferred AI model from our extensive collection.</p>
          
          <h4 className="text-lg font-semibold text-white">3. Explore Features</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Upload files and images for analysis</li>
            <li>Generate code in multiple programming languages</li>
            <li>Create artifacts like HTML pages and diagrams</li>
            <li>Save and organize your chat history</li>
          </ul>
          
          <h4 className="text-lg font-semibold text-white">4. Customize Your Experience</h4>
          <p>Adjust settings, manage your profile, and explore integrations to tailor Optima AI to your workflow.</p>
        </div>
      )
    },
    'api-auth': {
      title: 'API Authentication',
      description: 'Learn how to authenticate and secure your API requests.',
      content: (
        <div className="space-y-4 text-gray-300">
          <h4 className="text-lg font-semibold text-white">Authentication Methods</h4>
          <p>Optima AI supports multiple authentication methods to secure your API requests:</p>
          
          <h5 className="font-semibold text-[#58a6ff]">API Key Authentication</h5>
          <div className="bg-[#0f0f0f] p-4 rounded border border-gray-600">
            <code className="text-green-400">
              curl -H "Authorization: Bearer YOUR_API_KEY" \<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;https://api.optima-ai.com/v1/chat/completions
            </code>
          </div>
          
          <h5 className="font-semibold text-[#58a6ff]">OAuth 2.0</h5>
          <p>For enterprise applications, use OAuth 2.0 for secure user authentication and authorization.</p>
          
          <h4 className="text-lg font-semibold text-white">Rate Limits</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Free tier: 100 requests per day</li>
            <li>Pro tier: 10,000 requests per day</li>
            <li>Enterprise: Custom limits available</li>
          </ul>
        </div>
      )
    },
    'model-comparison': {
      title: 'Model Comparison',
      description: 'Compare different AI models and choose the right one for your needs.',
      content: (
        <div className="space-y-4 text-gray-300">
          <h4 className="text-lg font-semibold text-white">Available Models</h4>
          
          <div className="grid gap-4">
            <div className="bg-[#0f0f0f] p-4 rounded border border-gray-600">
              <h5 className="font-semibold text-[#58a6ff]">GPT-4 Turbo</h5>
              <p>Best for: Complex reasoning, code generation, creative writing</p>
              <p>Speed: ⭐⭐⭐ | Quality: ⭐⭐⭐⭐⭐ | Cost: High</p>
            </div>
            
            <div className="bg-[#0f0f0f] p-4 rounded border border-gray-600">
              <h5 className="font-semibold text-[#58a6ff]">Claude 3.5 Sonnet</h5>
              <p>Best for: Analysis, research, detailed explanations</p>
              <p>Speed: ⭐⭐⭐⭐ | Quality: ⭐⭐⭐⭐⭐ | Cost: Medium</p>
            </div>
            
            <div className="bg-[#0f0f0f] p-4 rounded border border-gray-600">
              <h5 className="font-semibold text-[#58a6ff]">Llama 3.1</h5>
              <p>Best for: General tasks, cost-effective solutions</p>
              <p>Speed: ⭐⭐⭐⭐⭐ | Quality: ⭐⭐⭐⭐ | Cost: Low</p>
            </div>
          </div>
          
          <h4 className="text-lg font-semibold text-white">Choosing the Right Model</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>For coding: GPT-4 Turbo or Claude 3.5 Sonnet</li>
            <li>For analysis: Claude 3.5 Sonnet</li>
            <li>For quick tasks: Llama 3.1 or GPT-3.5 Turbo</li>
            <li>For creative writing: GPT-4 Turbo</li>
          </ul>
        </div>
      )
    },
    'code-examples': {
      title: 'Code Examples',
      description: 'Practical examples in multiple programming languages.',
      content: (
        <div className="space-y-4 text-gray-300">
          <h4 className="text-lg font-semibold text-white">JavaScript/Node.js Example</h4>
          <div className="bg-[#0f0f0f] p-4 rounded border border-gray-600">
            <code className="text-green-400 text-sm">
              {`const response = await fetch('https://api.optima-ai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4-turbo',
    messages: [
      { role: 'user', content: 'Hello, world!' }
    ]
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);`}
            </code>
          </div>
          
          <h4 className="text-lg font-semibold text-white">Python Example</h4>
          <div className="bg-[#0f0f0f] p-4 rounded border border-gray-600">
            <code className="text-green-400 text-sm">
              {`import requests

response = requests.post(
    'https://api.optima-ai.com/v1/chat/completions',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    json={
        'model': 'gpt-4-turbo',
        'messages': [
            {'role': 'user', 'content': 'Hello, world!'}
        ]
    }
)

data = response.json()
print(data['choices'][0]['message']['content'])`}
            </code>
          </div>
          
          <h4 className="text-lg font-semibold text-white">cURL Example</h4>
          <div className="bg-[#0f0f0f] p-4 rounded border border-gray-600">
            <code className="text-green-400 text-sm">
              {`curl -X POST https://api.optima-ai.com/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4-turbo",
    "messages": [
      {"role": "user", "content": "Hello, world!"}
    ]
  }'`}
            </code>
          </div>
        </div>
      )
    }
  };

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
      </section>      {/* Quick Links */}
      <section className="py-16 bg-[#111111]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Popular Documentation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(documentationContent).map(([key, doc]) => (
              <div key={key} className="bg-[#1a1a1b] rounded-lg border border-[#2f343c] overflow-hidden">
                <div 
                  className="p-6 hover:border-[#58a6ff]/30 transition-colors cursor-pointer"
                  onClick={() => toggleSection(key)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2 text-[#58a6ff]">{doc.title}</h3>
                      <p className="text-gray-400 text-sm mb-3">{doc.description}</p>
                      <span className="text-[#58a6ff] text-sm hover:underline">
                        {expandedSection === key ? 'Hide Content ↑' : 'View Content →'}
                      </span>
                    </div>
                    <div className="ml-4">
                      <svg 
                        className={`w-5 h-5 text-[#58a6ff] transition-transform duration-200 ${
                          expandedSection === key ? 'rotate-180' : ''
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {expandedSection === key && (
                  <div className="px-6 pb-6 border-t border-[#2f343c]">
                    <div className="pt-4">
                      {doc.content}
                    </div>
                  </div>
                )}
              </div>
            ))}
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
