import Link from 'next/link';

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Header */}
      <header className="border-b border-[#2f343c] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/landing" className="flex items-center">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#58a6ff] to-[#bf00ff]">
                Optima AI
              </span>
            </Link>
            <Link
              href="/chat"
              className="bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] hover:opacity-90 text-white px-4 py-2 rounded-lg transition-opacity"
            >
              Try Optima AI
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#58a6ff] to-[#bf00ff]">
              Seamless Integrations
            </span>
            <br />
            <span className="text-white">Connect Your Workflow</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Integrate Optima AI with your favorite tools and services to create a unified, powerful workflow.
          </p>
        </div>
      </section>

      {/* Integrations Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Development Tools */}
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">VS Code Extension</h3>
              <p className="text-gray-400 mb-4">Code directly in your favorite editor with our VS Code extension.</p>
              <span className="text-sm text-[#58a6ff]">Coming Soon</span>
            </div>

            {/* Git Integration */}
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">GitHub Integration</h3>
              <p className="text-gray-400 mb-4">Connect your repositories for enhanced code understanding and suggestions.</p>
              <span className="text-sm text-[#58a6ff]">Available</span>
            </div>

            {/* Slack Integration */}
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Slack Bot</h3>
              <p className="text-gray-400 mb-4">Bring AI assistance directly to your team's Slack workspace.</p>
              <span className="text-sm text-[#58a6ff]">Available</span>
            </div>

            {/* API Integration */}
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">REST API</h3>
              <p className="text-gray-400 mb-4">Integrate Optima AI into your applications with our powerful REST API.</p>
              <span className="text-sm text-[#58a6ff]">Available</span>
            </div>

            {/* Webhooks */}
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Webhooks</h3>
              <p className="text-gray-400 mb-4">Real-time notifications and data syncing with webhook support.</p>
              <span className="text-sm text-[#58a6ff]">Available</span>
            </div>

            {/* Custom Integrations */}
            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c] hover:border-[#58a6ff]/30 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V4a1 1 0 011-1h3a1 1 0 001-1v-1a2 2 0 114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Custom Solutions</h3>
              <p className="text-gray-400 mb-4">Need something specific? We can build custom integrations for your workflow.</p>
              <span className="text-sm text-[#58a6ff]">Contact Us</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-[#2f343c]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">
            Ready to integrate Optima AI?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Get started with our integrations and streamline your development workflow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/api"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] text-white text-lg font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              View API Docs
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
    </div>
  );
}
