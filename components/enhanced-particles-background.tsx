'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    Particles: {
      init: (options: any) => void;
      pauseAnimation: () => void;
      resumeAnimation: () => void;
      destroy: () => void;
    };
  }
}

export default function EnhancedParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    const initializeParticles = () => {
      // Wait for particles.js to load
      if (typeof window !== 'undefined' && window.Particles && !initialized.current) {
        console.log('Initializing particles...');
        
        try {
          window.Particles.init({
            selector: '.particles-background',
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
          
          initialized.current = true;
          console.log('Particles initialized successfully');
        } catch (error) {
          console.error('Error initializing particles:', error);
        }
      }
    };

    // Try to initialize immediately
    initializeParticles();

    // Also try after a delay in case script is still loading
    const timeouts = [100, 500, 1000, 2000].map(delay =>
      setTimeout(initializeParticles, delay)
    );

    // Cleanup function
    return () => {
      timeouts.forEach(clearTimeout);
      if (window.Particles && typeof window.Particles.destroy === 'function' && initialized.current) {
        try {
          window.Particles.destroy();
          initialized.current = false;
        } catch (error) {
          console.error('Error destroying particles:', error);
        }
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden">
      {/* Gradient background as fallback */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#21262d]" />
      
      {/* Particles canvas */}
      <canvas
        ref={canvasRef}
        className="particles-background absolute inset-0 w-full h-full block"
      />
      
      {/* Additional overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117]/20 via-transparent to-[#0d1117]/10 pointer-events-none" />
    </div>
  );
}