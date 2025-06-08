// Enhanced HTML artifact system with optimized CDN integration and component libraries

export const ENHANCED_CDN_STACK = `
<!-- Ultra-Fast CDN Stack for Rapid Prototyping -->
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
<link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js"></script>
<script src="https://unpkg.com/typed.js@2.0.16/dist/typed.umd.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
<script src="https://unpkg.com/lottie-web@5.12.2/build/player/lottie.min.js"></script>
`;

export const RAPID_COMPONENT_TEMPLATES = {
  navigation: {
    modern: `
    <nav class="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200" x-data="{ open: false }">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-gray-900">Brand</h1>
            </div>
          </div>
          <div class="hidden md:flex items-center space-x-8">
            <a href="#" class="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">Home</a>
            <a href="#" class="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">About</a>
            <a href="#" class="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">Services</a>
            <a href="#" class="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">Contact</a>
            <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Get Started</button>
          </div>
          <div class="md:hidden flex items-center">
            <button @click="open = !open" class="text-gray-600 hover:text-gray-900">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div x-show="open" @click.away="open = false" class="md:hidden bg-white border-t border-gray-200">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <a href="#" class="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900">Home</a>
          <a href="#" class="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900">About</a>
          <a href="#" class="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900">Services</a>
          <a href="#" class="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900">Contact</a>
        </div>
      </div>
    </nav>`,
    
    glassmorphism: `
    <nav class="fixed w-full z-50 bg-white/10 backdrop-blur-lg border-b border-white/20" x-data="{ open: false }">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-white">Brand</h1>
            </div>
          </div>
          <div class="hidden md:flex items-center space-x-8">
            <a href="#" class="text-white/80 hover:text-white px-3 py-2 text-sm font-medium transition-colors">Home</a>
            <a href="#" class="text-white/80 hover:text-white px-3 py-2 text-sm font-medium transition-colors">About</a>
            <a href="#" class="text-white/80 hover:text-white px-3 py-2 text-sm font-medium transition-colors">Services</a>
            <a href="#" class="text-white/80 hover:text-white px-3 py-2 text-sm font-medium transition-colors">Contact</a>
            <button class="bg-white/20 backdrop-blur-md text-white border border-white/30 px-4 py-2 rounded-lg hover:bg-white/30 transition-all">Get Started</button>
          </div>
        </div>
      </div>
    </nav>`
  },

  hero: {
    gradient: `
    <section class="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 overflow-hidden">
      <div class="absolute inset-0 bg-black/20"></div>
      <div id="particles-js" class="absolute inset-0"></div>
      <div class="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 class="text-5xl md:text-7xl font-bold text-white mb-6 animate__animated animate__fadeInUp">
          <span id="typed-text"></span>
        </h1>
        <p class="text-xl md:text-2xl text-white/90 mb-8 animate__animated animate__fadeInUp animate__delay-1s">
          Transform your ideas into stunning digital experiences
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center animate__animated animate__fadeInUp animate__delay-2s">
          <button class="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105">
            Get Started
          </button>
          <button class="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-purple-600 transition-all">
            Learn More
          </button>
        </div>
      </div>
    </section>`,

    interactive: `
    <section class="relative min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden" x-data="{ mouseX: 0, mouseY: 0 }" @mousemove="mouseX = $event.clientX / window.innerWidth; mouseY = $event.clientY / window.innerHeight">
      <div class="absolute inset-0">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" 
             :style="'transform: translate(' + (mouseX * 20) + 'px, ' + (mouseY * 20) + 'px)'"></div>
        <div class="absolute inset-0 bg-gradient-to-tl from-purple-600/20 to-pink-600/20" 
             :style="'transform: translate(' + (mouseX * -15) + 'px, ' + (mouseY * -15) + 'px)'"></div>
      </div>
      <div class="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div class="mb-8" data-aos="fade-up">
          <h1 class="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-6">
            Innovation
          </h1>
          <p class="text-xl text-gray-300 mb-8">
            Experience the future of web design with interactive elements and stunning visuals
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12" data-aos="fade-up" data-aos-delay="200">
          <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/20 transition-all transform hover:scale-105">
            <i data-lucide="zap" class="w-12 h-12 text-yellow-400 mb-4"></i>
            <h3 class="text-white font-semibold mb-2">Lightning Fast</h3>
            <p class="text-gray-300 text-sm">Built for performance and speed</p>
          </div>
          <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/20 transition-all transform hover:scale-105">
            <i data-lucide="shield" class="w-12 h-12 text-green-400 mb-4"></i>
            <h3 class="text-white font-semibold mb-2">Secure</h3>
            <p class="text-gray-300 text-sm">Enterprise-grade security</p>
          </div>
          <div class="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/20 transition-all transform hover:scale-105">
            <i data-lucide="heart" class="w-12 h-12 text-red-400 mb-4"></i>
            <h3 class="text-white font-semibold mb-2">Loved</h3>
            <p class="text-gray-300 text-sm">Trusted by thousands</p>
          </div>
        </div>
      </div>
    </section>`
  },

  features: {
    cards: `
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Amazing Features</h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover what makes our platform the perfect choice for your needs
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow" data-aos="fade-up">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
              <i data-lucide="rocket" class="w-6 h-6 text-blue-600"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Fast Performance</h3>
            <p class="text-gray-600">Lightning-fast loading times and optimized performance for the best user experience.</p>
          </div>
          <div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow" data-aos="fade-up" data-aos-delay="100">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
              <i data-lucide="shield-check" class="w-6 h-6 text-green-600"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Secure & Reliable</h3>
            <p class="text-gray-600">Enterprise-grade security with 99.9% uptime guarantee for peace of mind.</p>
          </div>
          <div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow" data-aos="fade-up" data-aos-delay="200">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
              <i data-lucide="users" class="w-6 h-6 text-purple-600"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">User Friendly</h3>
            <p class="text-gray-600">Intuitive interface designed with user experience as the top priority.</p>
          </div>
        </div>
      </div>
    </section>`
  },

  contact: {
    modern: `
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div data-aos="fade-right">
            <h2 class="text-4xl font-bold text-gray-900 mb-6">Get in Touch</h2>
            <p class="text-xl text-gray-600 mb-8">
              Ready to start your project? Let's discuss how we can help bring your vision to life.
            </p>
            <div class="space-y-6">
              <div class="flex items-center">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <i data-lucide="mail" class="w-6 h-6 text-blue-600"></i>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">Email</h3>
                  <p class="text-gray-600">hello@example.com</p>
                </div>
              </div>
              <div class="flex items-center">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <i data-lucide="phone" class="w-6 h-6 text-green-600"></i>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">Phone</h3>
                  <p class="text-gray-600">+1 (555) 123-4567</p>
                </div>
              </div>
              <div class="flex items-center">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <i data-lucide="map-pin" class="w-6 h-6 text-purple-600"></i>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">Address</h3>
                  <p class="text-gray-600">123 Business St, City, State 12345</p>
                </div>
              </div>
            </div>
          </div>
          <div data-aos="fade-left">
            <form class="bg-gray-50 rounded-2xl p-8" x-data="{ name: '', email: '', message: '' }">
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input type="text" x-model="name" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Your name">
              </div>
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" x-model="email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="your@email.com">
              </div>
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea x-model="message" rows="4" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Tell us about your project"></textarea>
              </div>
              <button type="submit" class="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>`
  }
};

export const ANIMATION_SCRIPTS = `
<script>
// Initialize animations and interactions
document.addEventListener('DOMContentLoaded', function() {
  // Initialize AOS (Animate On Scroll)
  AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true,
    offset: 100
  });

  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Typed.js for hero text
  if (document.getElementById('typed-text')) {
    new Typed('#typed-text', {
      strings: ['Innovation', 'Excellence', 'Success', 'Future'],
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000,
      loop: true
    });
  }

  // Particles.js configuration
  if (document.getElementById('particles-js') && typeof particlesJS !== 'undefined') {
    particlesJS('particles-js', {
      particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: '#ffffff' },
        shape: { type: 'circle' },
        opacity: { value: 0.5, random: false },
        size: { value: 3, random: true },
        line_linked: { enable: true, distance: 150, color: '#ffffff', opacity: 0.4, width: 1 },
        move: { enable: true, speed: 6, direction: 'none', random: false, straight: false, out_mode: 'out', bounce: false }
      },
      interactivity: {
        detect_on: 'canvas',
        events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' }, resize: true },
        modes: { grab: { distance: 400, line_linked: { opacity: 1 } }, bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 }, repulse: { distance: 200, duration: 0.4 }, push: { particles_nb: 4 }, remove: { particles_nb: 2 } }
      },
      retina_detect: true
    });
  }

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Add scroll effect to navigation
  window.addEventListener('scroll', function() {
    const nav = document.querySelector('nav');
    if (nav) {
      if (window.scrollY > 50) {
        nav.classList.add('shadow-lg');
      } else {
        nav.classList.remove('shadow-lg');
      }
    }
  });
});
</script>
`;

export const PERFORMANCE_OPTIMIZATIONS = `
<script>
// Performance optimizations
(function() {
  // Lazy load images
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  // Preload critical resources
  const criticalResources = [
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js'
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = 'script';
    document.head.appendChild(link);
  });
})();
</script>
`;