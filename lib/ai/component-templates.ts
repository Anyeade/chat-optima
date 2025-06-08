// Domain-specific component templates for rapid prototyping

export interface ComponentTemplate {
  id: string;
  name: string;
  category: 'navigation' | 'hero' | 'features' | 'contact' | 'footer' | 'pricing' | 'testimonials' | 'gallery';
  domain: 'saas' | 'ecommerce' | 'portfolio' | 'corporate' | 'landing' | 'universal';
  description: string;
  html: string;
  dependencies: string[];
}

export const COMPONENT_TEMPLATES: ComponentTemplate[] = [
  // SaaS Components
  {
    id: 'saas-dashboard-nav',
    name: 'SaaS Dashboard Navigation',
    category: 'navigation',
    domain: 'saas',
    description: 'Modern sidebar navigation with user profile and notifications',
    dependencies: ['alpine.js', 'lucide'],
    html: `
    <nav class="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white p-6" x-data="{ activeMenu: 'dashboard' }">
      <div class="flex items-center mb-8">
        <div class="w-8 h-8 bg-blue-600 rounded-lg mr-3"></div>
        <h1 class="text-xl font-bold">SaaS Platform</h1>
      </div>
      
      <div class="space-y-2">
        <a href="#" @click="activeMenu = 'dashboard'" 
           :class="activeMenu === 'dashboard' ? 'bg-blue-600' : 'hover:bg-gray-800'"
           class="flex items-center px-4 py-3 rounded-lg transition-colors">
          <i data-lucide="layout-dashboard" class="w-5 h-5 mr-3"></i>
          Dashboard
        </a>
        <a href="#" @click="activeMenu = 'analytics'" 
           :class="activeMenu === 'analytics' ? 'bg-blue-600' : 'hover:bg-gray-800'"
           class="flex items-center px-4 py-3 rounded-lg transition-colors">
          <i data-lucide="bar-chart" class="w-5 h-5 mr-3"></i>
          Analytics
        </a>
        <a href="#" @click="activeMenu = 'users'" 
           :class="activeMenu === 'users' ? 'bg-blue-600' : 'hover:bg-gray-800'"
           class="flex items-center px-4 py-3 rounded-lg transition-colors">
          <i data-lucide="users" class="w-5 h-5 mr-3"></i>
          Users
        </a>
        <a href="#" @click="activeMenu = 'settings'" 
           :class="activeMenu === 'settings' ? 'bg-blue-600' : 'hover:bg-gray-800'"
           class="flex items-center px-4 py-3 rounded-lg transition-colors">
          <i data-lucide="settings" class="w-5 h-5 mr-3"></i>
          Settings
        </a>
      </div>
      
      <div class="absolute bottom-6 left-6 right-6">
        <div class="bg-gray-800 rounded-lg p-4">
          <div class="flex items-center">
            <img src="https://api.lorem.space/image/face?w=40&h=40" class="w-10 h-10 rounded-full mr-3" alt="User">
            <div>
              <p class="font-medium">John Doe</p>
              <p class="text-sm text-gray-400">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </nav>`
  },

  {
    id: 'saas-feature-showcase',
    name: 'SaaS Feature Showcase',
    category: 'features',
    domain: 'saas',
    description: 'Interactive feature grid with animations and icons',
    dependencies: ['aos', 'lucide'],
    html: `
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16" data-aos="fade-up">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to scale your business and delight your customers
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow group" data-aos="fade-up" data-aos-delay="100">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <i data-lucide="zap" class="w-6 h-6 text-blue-600 group-hover:text-white"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Lightning Fast</h3>
            <p class="text-gray-600">Optimized for speed with sub-second response times and 99.9% uptime guarantee.</p>
            <div class="mt-6">
              <div class="bg-gray-100 rounded-full h-2 mb-2">
                <div class="bg-blue-600 h-2 rounded-full" style="width: 95%"></div>
              </div>
              <span class="text-sm text-gray-500">95% faster than competitors</span>
            </div>
          </div>
          
          <div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow group" data-aos="fade-up" data-aos-delay="200">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <i data-lucide="shield-check" class="w-6 h-6 text-green-600 group-hover:text-white"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Enterprise Security</h3>
            <p class="text-gray-600">Bank-level encryption with SOC 2 compliance and advanced threat protection.</p>
            <div class="mt-6 flex items-center">
              <i data-lucide="check-circle" class="w-4 h-4 text-green-600 mr-2"></i>
              <span class="text-sm text-gray-600">SOC 2 Type II Certified</span>
            </div>
          </div>
          
          <div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow group" data-aos="fade-up" data-aos-delay="300">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <i data-lucide="trending-up" class="w-6 h-6 text-purple-600 group-hover:text-white"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Advanced Analytics</h3>
            <p class="text-gray-600">Real-time insights with AI-powered recommendations and predictive analytics.</p>
            <div class="mt-6">
              <canvas id="miniChart" width="100" height="40"></canvas>
            </div>
          </div>
        </div>
      </div>
    </section>`
  },

  // E-commerce Components
  {
    id: 'ecommerce-product-grid',
    name: 'E-commerce Product Grid',
    category: 'gallery',
    domain: 'ecommerce',
    description: 'Responsive product grid with filters and hover effects',
    dependencies: ['alpine.js', 'lucide'],
    html: `
    <section class="py-20" x-data="{ 
      filter: 'all',
      products: [
        { id: 1, name: 'Premium Headphones', price: 299, category: 'electronics', image: 'https://api.lorem.space/image/watch?w=300&h=300' },
        { id: 2, name: 'Designer Watch', price: 599, category: 'accessories', image: 'https://api.lorem.space/image/watch?w=300&h=300' },
        { id: 3, name: 'Wireless Speaker', price: 199, category: 'electronics', image: 'https://api.lorem.space/image/laptop?w=300&h=300' },
        { id: 4, name: 'Leather Wallet', price: 89, category: 'accessories', image: 'https://api.lorem.space/image/fashion?w=300&h=300' }
      ]
    }">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
          <p class="text-xl text-gray-600">Discover our curated collection of premium items</p>
        </div>
        
        <div class="flex justify-center mb-8">
          <div class="bg-gray-100 rounded-lg p-1 flex space-x-1">
            <button @click="filter = 'all'" 
                    :class="filter === 'all' ? 'bg-white shadow-sm' : ''"
                    class="px-4 py-2 rounded-md text-sm font-medium transition-all">
              All Products
            </button>
            <button @click="filter = 'electronics'" 
                    :class="filter === 'electronics' ? 'bg-white shadow-sm' : ''"
                    class="px-4 py-2 rounded-md text-sm font-medium transition-all">
              Electronics
            </button>
            <button @click="filter = 'accessories'" 
                    :class="filter === 'accessories' ? 'bg-white shadow-sm' : ''"
                    class="px-4 py-2 rounded-md text-sm font-medium transition-all">
              Accessories
            </button>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <template x-for="product in products.filter(p => filter === 'all' || p.category === filter)" :key="product.id">
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
              <div class="relative overflow-hidden">
                <img :src="product.image" :alt="product.name" class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300">
                <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <i data-lucide="heart" class="w-5 h-5 text-gray-600 hover:text-red-500 cursor-pointer"></i>
                </div>
              </div>
              <div class="p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-2" x-text="product.name"></h3>
                <p class="text-2xl font-bold text-blue-600 mb-4">$<span x-text="product.price"></span></p>
                <button class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                  <i data-lucide="shopping-cart" class="w-5 h-5 mr-2"></i>
                  Add to Cart
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </section>`
  },

  // Portfolio Components
  {
    id: 'portfolio-project-showcase',
    name: 'Portfolio Project Showcase',
    category: 'gallery',
    domain: 'portfolio',
    description: 'Interactive project gallery with case study previews',
    dependencies: ['aos', 'gsap'],
    html: `
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16" data-aos="fade-up">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Featured Projects</h2>
          <p class="text-xl text-gray-600">A showcase of my latest work and creative solutions</p>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500" data-aos="fade-up" data-aos-delay="100">
            <div class="aspect-w-16 aspect-h-9 overflow-hidden">
              <img src="https://api.lorem.space/image/laptop?w=600&h=400" alt="Project 1" class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700">
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div class="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-6 group-hover:translate-y-0 transition-transform duration-300">
              <h3 class="text-2xl font-bold mb-2">E-commerce Platform</h3>
              <p class="text-gray-200 mb-4">Modern React-based platform with advanced filtering and real-time inventory</p>
              <div class="flex space-x-2">
                <span class="px-3 py-1 bg-blue-600 rounded-full text-sm">React</span>
                <span class="px-3 py-1 bg-green-600 rounded-full text-sm">Node.js</span>
                <span class="px-3 py-1 bg-purple-600 rounded-full text-sm">PostgreSQL</span>
              </div>
            </div>
          </div>
          
          <div class="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500" data-aos="fade-up" data-aos-delay="200">
            <div class="aspect-w-16 aspect-h-9 overflow-hidden">
              <img src="https://api.lorem.space/image/furniture?w=600&h=400" alt="Project 2" class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700">
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div class="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-6 group-hover:translate-y-0 transition-transform duration-300">
              <h3 class="text-2xl font-bold mb-2">Mobile Banking App</h3>
              <p class="text-gray-200 mb-4">Secure fintech application with biometric authentication and AI insights</p>
              <div class="flex space-x-2">
                <span class="px-3 py-1 bg-blue-600 rounded-full text-sm">React Native</span>
                <span class="px-3 py-1 bg-yellow-600 rounded-full text-sm">Firebase</span>
                <span class="px-3 py-1 bg-red-600 rounded-full text-sm">Machine Learning</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="text-center mt-12" data-aos="fade-up" data-aos-delay="400">
          <button class="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors inline-flex items-center">
            View All Projects
            <i data-lucide="arrow-right" class="w-5 h-5 ml-2"></i>
          </button>
        </div>
      </div>
    </section>`
  },

  // Landing Page Components
  {
    id: 'landing-hero-cta',
    name: 'Landing Page Hero with CTA',
    category: 'hero',
    domain: 'landing',
    description: 'High-conversion hero section with animated elements',
    dependencies: ['particles.js', 'typed.js', 'aos'],
    html: `
    <section class="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 overflow-hidden">
      <div id="particles-js" class="absolute inset-0"></div>
      <div class="absolute inset-0 bg-black/20"></div>
      
      <div class="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <div data-aos="fade-up">
          <h1 class="text-5xl md:text-7xl font-bold text-white mb-6">
            Transform Your
            <br>
            <span id="typed-text" class="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500"></span>
          </h1>
        </div>
        
        <div data-aos="fade-up" data-aos-delay="200">
          <p class="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Revolutionize your workflow with our cutting-edge platform. Join thousands of satisfied customers who've already made the switch.
          </p>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center mb-12" data-aos="fade-up" data-aos-delay="400">
          <button class="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg">
            Start Free Trial
          </button>
          <button class="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all flex items-center justify-center">
            <i data-lucide="play-circle" class="w-5 h-5 mr-2"></i>
            Watch Demo
          </button>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16" data-aos="fade-up" data-aos-delay="600">
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-bold text-white mb-2">99.9%</div>
            <div class="text-white/70">Uptime</div>
          </div>
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-bold text-white mb-2">50K+</div>
            <div class="text-white/70">Happy Users</div>
          </div>
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-bold text-white mb-2">24/7</div>
            <div class="text-white/70">Support</div>
          </div>
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-bold text-white mb-2">150+</div>
            <div class="text-white/70">Countries</div>
          </div>
        </div>
      </div>
      
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <i data-lucide="chevron-down" class="w-6 h-6 text-white"></i>
      </div>
    </section>`
  },

  // Pricing Components
  {
    id: 'saas-pricing-table',
    name: 'SaaS Pricing Table',
    category: 'pricing',
    domain: 'saas',
    description: 'Modern pricing table with feature comparison',
    dependencies: ['alpine.js', 'lucide'],
    html: `
    <section class="py-20 bg-gray-50" x-data="{ billing: 'monthly' }">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p class="text-xl text-gray-600 mb-8">Choose the perfect plan for your business needs</p>
          
          <div class="inline-flex bg-gray-200 rounded-lg p-1">
            <button @click="billing = 'monthly'" 
                    :class="billing === 'monthly' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'"
                    class="px-4 py-2 rounded-md text-sm font-medium transition-all">
              Monthly
            </button>
            <button @click="billing = 'yearly'" 
                    :class="billing === 'yearly' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'"
                    class="px-4 py-2 rounded-md text-sm font-medium transition-all">
              Yearly <span class="text-green-600 font-semibold">(Save 20%)</span>
            </button>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Starter Plan -->
          <div class="bg-white rounded-2xl shadow-lg p-8 relative">
            <div class="text-center mb-8">
              <h3 class="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
              <p class="text-gray-600 mb-4">Perfect for small teams</p>
              <div class="text-4xl font-bold text-gray-900">
                $<span x-text="billing === 'monthly' ? '29' : '24'"></span>
                <span class="text-lg text-gray-600 font-normal">/month</span>
              </div>
            </div>
            
            <ul class="space-y-4 mb-8">
              <li class="flex items-center">
                <i data-lucide="check" class="w-5 h-5 text-green-600 mr-3"></i>
                <span>Up to 5 team members</span>
              </li>
              <li class="flex items-center">
                <i data-lucide="check" class="w-5 h-5 text-green-600 mr-3"></i>
                <span>10GB storage</span>
              </li>
              <li class="flex items-center">
                <i data-lucide="check" class="w-5 h-5 text-green-600 mr-3"></i>
                <span>Basic analytics</span>
              </li>
              <li class="flex items-center">
                <i data-lucide="check" class="w-5 h-5 text-green-600 mr-3"></i>
                <span>Email support</span>
              </li>
            </ul>
            
            <button class="w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors">
              Get Started
            </button>
          </div>
          
          <!-- Pro Plan -->
          <div class="bg-white rounded-2xl shadow-xl p-8 relative border-2 border-blue-600 transform scale-105">
            <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
              Most Popular
            </div>
            
            <div class="text-center mb-8">
              <h3 class="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
              <p class="text-gray-600 mb-4">For growing businesses</p>
              <div class="text-4xl font-bold text-gray-900">
                $<span x-text="billing === 'monthly' ? '79' : '64'"></span>
                <span class="text-lg text-gray-600 font-normal">/month</span>
              </div>
            </div>
            
            <ul class="space-y-4 mb-8">
              <li class="flex items-center">
                <i data-lucide="check" class="w-5 h-5 text-green-600 mr-3"></i>
                <span>Up to 25 team members</span>
              </li>
              <li class="flex items-center">
                <i data-lucide="check" class="w-5 h-5 text-green-600 mr-3"></i>
                <span>100GB storage</span>
              </li>
              <li class="flex items-center">
                <i data-lucide="check" class="w-5 h-5 text-green-600 mr-3"></i>
                <span>Advanced analytics</span>
              </li>
              <li class="flex items-center">
                <i data-lucide="check" class="w-5 h-5 text-green-600 mr-3"></i>
                <span>Priority support</span>
              </li>
              <li class="flex items-center">
                <i data-lucide="check" class="w-5 h-5 text-green-600 mr-3"></i>
                <span>API access</span>
              </li>
            </ul>
            
            <button class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Start Free Trial
            </button>
          </div>
          
          <!-- Enterprise Plan -->
          <div class="bg-white rounded-2xl shadow-lg p-8 relative">
            <div class="text-center mb-8">
              <h3 class="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <p class="text-gray-600 mb-4">For large organizations</p>
              <div class="text-4xl font-bold text-gray-900">
                $<span x-text="billing === 'monthly' ? '199' : '159'"></span>
                <span class="text-lg text-gray-600 font-normal">/month</span>
              </div>
            </div>
            
            <ul class="space-y-4 mb-8">
              <li class="flex items-center">
                <i data-lucide="check" class="w-5 h-5 text-green-600 mr-3"></i>
                <span>Unlimited team members</span>
              </li>
              <li class="flex items-center">
                <i data-lucide="check" class="w-5 h-5 text-green-600 mr-3"></i>
                <span>1TB storage</span>
              </li>
              <li class="flex items-center">
                <i data-lucide="check" class="w-5 h-5 text-green-600 mr-3"></i>
                <span>Custom analytics</span>
              </li>
              <li class="flex items-center">
                <i data-lucide="check" class="w-5 h-5 text-green-600 mr-3"></i>
                <span>24/7 phone support</span>
              </li>
              <li class="flex items-center">
                <i data-lucide="check" class="w-5 h-5 text-green-600 mr-3"></i>
                <span>Custom integrations</span>
              </li>
            </ul>
            
            <button class="w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </section>`
  }
];

export function getComponentsByDomain(domain: ComponentTemplate['domain']): ComponentTemplate[] {
  return COMPONENT_TEMPLATES.filter(template => 
    template.domain === domain || template.domain === 'universal'
  );
}

export function getComponentsByCategory(category: ComponentTemplate['category']): ComponentTemplate[] {
  return COMPONENT_TEMPLATES.filter(template => template.category === category);
}

export function suggestComponentsForPrompt(prompt: string): ComponentTemplate[] {
  const lowerPrompt = prompt.toLowerCase();
  const suggestions: ComponentTemplate[] = [];

  // Domain detection
  let detectedDomain: ComponentTemplate['domain'] = 'universal';
  if (lowerPrompt.includes('saas') || lowerPrompt.includes('dashboard')) detectedDomain = 'saas';
  else if (lowerPrompt.includes('ecommerce') || lowerPrompt.includes('shop') || lowerPrompt.includes('store')) detectedDomain = 'ecommerce';
  else if (lowerPrompt.includes('portfolio') || lowerPrompt.includes('projects')) detectedDomain = 'portfolio';
  else if (lowerPrompt.includes('landing') || lowerPrompt.includes('marketing')) detectedDomain = 'landing';
  else if (lowerPrompt.includes('corporate') || lowerPrompt.includes('business')) detectedDomain = 'corporate';

  // Get domain-specific components
  const domainComponents = getComponentsByDomain(detectedDomain);

  // Category detection and suggestions
  if (lowerPrompt.includes('nav') || lowerPrompt.includes('menu')) {
    suggestions.push(...domainComponents.filter(c => c.category === 'navigation'));
  }
  if (lowerPrompt.includes('hero') || lowerPrompt.includes('landing')) {
    suggestions.push(...domainComponents.filter(c => c.category === 'hero'));
  }
  if (lowerPrompt.includes('features') || lowerPrompt.includes('benefits')) {
    suggestions.push(...domainComponents.filter(c => c.category === 'features'));
  }
  if (lowerPrompt.includes('pricing') || lowerPrompt.includes('plans')) {
    suggestions.push(...domainComponents.filter(c => c.category === 'pricing'));
  }
  if (lowerPrompt.includes('gallery') || lowerPrompt.includes('projects') || lowerPrompt.includes('products')) {
    suggestions.push(...domainComponents.filter(c => c.category === 'gallery'));
  }
  if (lowerPrompt.includes('contact') || lowerPrompt.includes('form')) {
    suggestions.push(...domainComponents.filter(c => c.category === 'contact'));
  }

  // Remove duplicates
  return suggestions.filter((component, index, self) => 
    index === self.findIndex(c => c.id === component.id)
  );
}