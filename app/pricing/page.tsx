import Link from 'next/link';
import AuthAwareNavbar from '@/components/ui/auth-aware-navbar';
import ScrollToTopButton from '@/components/ui/scroll-to-top-button';
import { HeroParticles } from '@/components/particles-background';
import '../landing/landing.css';

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started with AI chat",
      features: [
        "20 messages per day",
        "Access to basic AI models",
        "Basic chat features",
        "Community support"
      ],
      cta: "Start Free",
      href: "/chat",
      popular: false
    },
    {
      name: "Pro",
      price: "$19",
      period: "per month",
      description: "Best for individual developers and power users",
      features: [
        "Unlimited messages",
        "Access to all AI models",
        "Advanced tools & features",
        "Priority support",
        "Custom integrations",
        "Export conversations"
      ],
      cta: "Start Pro Trial",
      href: "/chat",
      popular: true
    },
    {
      name: "Team",
      price: "$49",
      period: "per month",
      description: "Perfect for teams and small organizations",
      features: [
        "Everything in Pro",
        "Team collaboration",
        "Shared workspaces",
        "Admin controls",
        "Team analytics",
        "Custom branding",
        "SSO integration"
      ],
      cta: "Contact Sales",
      href: "/contact",
      popular: false
    }
  ];
  return (
    <div className="min-h-screen bg-githubDark font-poppins text-white overflow-hidden">
      {/* Particles Background */}
      <HeroParticles />
        {/* Header/Navigation */}
      <AuthAwareNavbar />
      
      {/* Scroll to top button */}
      <ScrollToTopButton />

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">
            <span className="text-white">Simple, </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#58a6ff] to-[#bf00ff]">
              Transparent Pricing
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Choose the perfect plan for your needs. Start free and upgrade as you grow.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-[#1a1a1b] rounded-lg p-8 border transition-all duration-300 hover:transform hover:scale-105 ${
                  plan.popular
                    ? 'border-[#58a6ff] shadow-[0_0_30px_rgba(88,166,255,0.3)]'
                    : 'border-[#2f343c] hover:border-[#58a6ff]/30'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-400 ml-2">/{plan.period}</span>
                  </div>
                  <p className="text-gray-400">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <svg className="w-5 h-5 text-[#58a6ff] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] text-white hover:opacity-90'
                      : 'bg-[#2f343c] text-white hover:bg-[#3a3f4a]'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 border-t border-[#2f343c]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-8">            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
              <h3 className="text-xl font-semibold mb-3">Can I change plans at any time?</h3>
              <p className="text-gray-400">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we&apos;ll prorate the billing accordingly.</p>
            </div>

            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
              <h3 className="text-xl font-semibold mb-3">What AI models are included?</h3>
              <p className="text-gray-400">Free users get access to basic models. Pro and Team users get access to all models including GPT-4, Claude, Gemini, and more advanced AI systems.</p>
            </div>

            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
              <h3 className="text-xl font-semibold mb-3">Is there a free trial?</h3>
              <p className="text-gray-400">Yes! All paid plans come with a 14-day free trial. No credit card required to start.</p>
            </div>

            <div className="bg-[#1a1a1b] rounded-lg p-6 border border-[#2f343c]">
              <h3 className="text-xl font-semibold mb-3">How does billing work?</h3>
              <p className="text-gray-400">We bill monthly or annually. Annual plans get a 20% discount. All plans include secure payment processing and detailed invoices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of developers and teams already using Optima AI.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] text-white text-lg font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Start Free Today
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
