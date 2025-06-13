import Link from 'next/link';
import AuthAwareNavbar from '@/components/ui/auth-aware-navbar';
import ScrollToTopButton from '@/components/ui/scroll-to-top-button';
import { HeroParticles } from '@/components/particles-background';
import '../landing/landing.css';

export default function APIPage() {
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
              API Reference
            </span>
            <br />
            <span className="text-white">Build with Optima AI</span>
          </h1>          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto">
            Integrate Optima AI&apos;s powerful chat capabilities into your applications with our comprehensive REST API.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="#get-started"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
            <Link
              href="#endpoints"
              className="inline-flex items-center px-6 py-3 border border-[#58a6ff] text-[#58a6ff] font-semibold rounded-lg hover:bg-[#58a6ff] hover:text-white transition-colors"
            >
              View Endpoints
            </Link>
          </div>
        </div></div>
      </section>

      {/* Quick Start */}
      <section id="get-started" className="py-16 bg-[#111111]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-white">Quick Start</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-[#58a6ff]">Authentication</h3>
              <p className="text-gray-400 mb-4">
                All API requests require authentication using an API key. Include your API key in the Authorization header.
              </p>
              <div className="bg-[#1a1a1b] rounded-lg p-4 border border-[#2f343c]">                <code className="text-sm text-green-400">
                  curl -H &quot;Authorization: Bearer YOUR_API_KEY&quot; \\<br />
                  &nbsp;&nbsp;https://api.optima.ai/v1/chat/completions
                </code>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-[#58a6ff]">Base URL</h3>
              <p className="text-gray-400 mb-4">
                All API requests should be made to our base URL:
              </p>
              <div className="bg-[#1a1a1b] rounded-lg p-4 border border-[#2f343c]">
                <code className="text-sm text-blue-400">
                  https://api.optima.ai/v1/
                </code>
              </div>
              <p className="text-gray-400 mt-4 text-sm">
                All responses are returned in JSON format with appropriate HTTP status codes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* API Endpoints */}
      <section id="endpoints" className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-white">API Endpoints</h2>

          {/* Chat Completions */}
          <div className="mb-12">
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-[#58a6ff]">Chat Completions</h3>
                <span className="px-3 py-1 bg-green-600 text-green-100 text-sm rounded-full">POST</span>
              </div>
              <code className="text-gray-300 text-sm">/v1/chat/completions</code>
              <p className="text-gray-400 mt-3 mb-4">
                Create a chat completion with one of our available AI models.
              </p>
              
              <h4 className="text-md font-semibold text-white mb-2">Request Body</h4>
              <div className="bg-githubDark font-poppins rounded p-4 text-sm overflow-x-auto">
                <pre className="text-gray-300">
{`{
  "model": "gpt-4",
  "messages": [
    {
      "role": "user",
      "content": "Hello, how can you help me?"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 1000,
  "stream": false
}`}
                </pre>
              </div>

              <h4 className="text-md font-semibold text-white mb-2 mt-4">Response</h4>
              <div className="bg-githubDark font-poppins rounded p-4 text-sm overflow-x-auto">
                <pre className="text-gray-300">
{`{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "gpt-4",
  "choices": [
    {
      "index": 0,      "message": {
        "role": "assistant",
        "content": "I&apos;m Optima AI, and I can help you with..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 15,
    "total_tokens": 25
  }
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Models */}
          <div className="mb-12">
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-[#58a6ff]">List Models</h3>
                <span className="px-3 py-1 bg-blue-600 text-blue-100 text-sm rounded-full">GET</span>
              </div>
              <code className="text-gray-300 text-sm">/v1/models</code>
              <p className="text-gray-400 mt-3 mb-4">
                Retrieve a list of available AI models and their capabilities.
              </p>

              <h4 className="text-md font-semibold text-white mb-2">Response</h4>
              <div className="bg-githubDark font-poppins rounded p-4 text-sm overflow-x-auto">
                <pre className="text-gray-300">
{`{
  "object": "list",
  "data": [
    {
      "id": "gpt-4",
      "object": "model",
      "created": 1677610602,
      "owned_by": "openai",
      "capabilities": ["text", "code"]
    },
    {
      "id": "gemini-pro",
      "object": "model", 
      "created": 1677610602,
      "owned_by": "google",
      "capabilities": ["text", "multimodal"]
    }
  ]
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Files */}
          <div className="mb-12">
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-[#58a6ff]">Upload File</h3>
                <span className="px-3 py-1 bg-green-600 text-green-100 text-sm rounded-full">POST</span>
              </div>
              <code className="text-gray-300 text-sm">/v1/files</code>
              <p className="text-gray-400 mt-3 mb-4">
                Upload files to use in chat conversations (images, documents, etc.).
              </p>

              <h4 className="text-md font-semibold text-white mb-2">Request</h4>
              <div className="bg-githubDark font-poppins rounded p-4 text-sm">                <code className="text-gray-300">
                  Content-Type: multipart/form-data<br />
                  file: [binary data]<br />
                  purpose: &quot;chat&quot;
                </code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SDKs and Libraries */}
      <section className="py-16 bg-[#111111]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-white">SDKs & Libraries</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
              <h3 className="text-lg font-semibold mb-3 text-[#58a6ff]">JavaScript/Node.js</h3>
              <div className="bg-githubDark font-poppins rounded p-3 text-sm mb-3">
                <code className="text-gray-300">npm install optima-ai</code>
              </div>
              <Link href="#" className="text-[#58a6ff] text-sm hover:underline">View Documentation →</Link>
            </div>
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
              <h3 className="text-lg font-semibold mb-3 text-[#58a6ff]">Python</h3>
              <div className="bg-githubDark font-poppins rounded p-3 text-sm mb-3">
                <code className="text-gray-300">pip install optima-ai</code>
              </div>
              <Link href="#" className="text-[#58a6ff] text-sm hover:underline">View Documentation →</Link>
            </div>
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
              <h3 className="text-lg font-semibold mb-3 text-[#58a6ff]">Go</h3>
              <div className="bg-githubDark font-poppins rounded p-3 text-sm mb-3">
                <code className="text-gray-300">go get github.com/optima-ai/go</code>
              </div>
              <Link href="#" className="text-[#58a6ff] text-sm hover:underline">View Documentation →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Rate Limits */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-white">Rate Limits & Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
              <h3 className="text-xl font-semibold mb-4 text-[#58a6ff]">Rate Limits</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• <strong>Free Tier:</strong> 100 requests/hour</li>
                <li>• <strong>Pro Tier:</strong> 1,000 requests/hour</li>
                <li>• <strong>Enterprise:</strong> Custom limits</li>
              </ul>
              <p className="text-gray-400 text-sm mt-4">
                Rate limits are enforced per API key. Contact us for higher limits.
              </p>
            </div>
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
              <h3 className="text-xl font-semibold mb-4 text-[#58a6ff]">Usage-Based Pricing</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• <strong>Input tokens:</strong> $0.001/1K tokens</li>
                <li>• <strong>Output tokens:</strong> $0.002/1K tokens</li>
                <li>• <strong>File uploads:</strong> $0.01/MB</li>
              </ul>
              <p className="text-gray-400 text-sm mt-4">
                Billing is calculated based on actual usage with no minimum fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-[#2f343c]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">
            Ready to start building?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Get your API key and start integrating Optima AI into your applications today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] text-white text-lg font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Get API Key
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 border border-[#58a6ff] text-[#58a6ff] text-lg font-semibold rounded-lg hover:bg-[#58a6ff] hover:text-white transition-colors"
            >
              Contact Sales
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
