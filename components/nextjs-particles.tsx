'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

export default function NextJSParticles() {
  const [particlesLoaded, setParticlesLoaded] = useState(false);

  const handleScriptLoad = () => {
    console.log('Particles.js script loaded');
    setParticlesLoaded(true);
  };

  useEffect(() => {
    if (particlesLoaded && typeof window !== 'undefined' && window.Particles) {
      console.log('Initializing particles with Next.js Script...');
      
      try {
        window.Particles.init({
          selector: '.particles-bg',
          maxParticles: 80,
          sizeVariations: 3,
          speed: 0.5,
          color: ['#58a6ff', '#bf00ff', '#00ffcc'],
          minDistance: 120,
          connectParticles: true,
          responsive: [
            {
              breakpoint: 768,
              options: {
                maxParticles: 50,
                minDistance: 100,
              }
            },
            {
              breakpoint: 480,
              options: {
                maxParticles: 30,
                minDistance: 80,
              }
            }
          ]
        });
        
        console.log('Particles initialized successfully with Next.js Script');
      } catch (error) {
        console.error('Error initializing particles:', error);
      }
    }
  }, [particlesLoaded]);

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/particlesjs@2.2.3/dist/particles.min.js"
        onLoad={handleScriptLoad}
        strategy="beforeInteractive"
      />
      <div className="fixed inset-0 z-[-1] overflow-hidden">
        {/* Gradient background as fallback */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#21262d]" />
        
        {/* Particles canvas */}
        <canvas className="particles-bg absolute inset-0 w-full h-full block" />
        
        {/* Additional overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117]/20 via-transparent to-[#0d1117]/10 pointer-events-none" />
      </div>
    </>
  );
}