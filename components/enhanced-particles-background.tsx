'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    Particles: {
      init: (options: ParticlesOptions) => void;
      pauseAnimation: () => void;
      resumeAnimation: () => void;
      destroy: () => void;
    };
  }
}

interface ParticlesOptions {
  selector: string;
  maxParticles?: number;
  sizeVariations?: number;
  speed?: number;
  color?: string | string[];
  minDistance?: number;
  connectParticles?: boolean;
  responsive?: Array<{
    breakpoint: number;
    options: Partial<ParticlesOptions>;
  }>;
}

export default function EnhancedParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    const loadParticlesScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (scriptLoaded.current || window.Particles) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/particlesjs@2.2.3/dist/particles.min.js';
        script.async = true;
        
        script.onload = () => {
          scriptLoaded.current = true;
          resolve();
        };
        
        script.onerror = () => {
          reject(new Error('Failed to load particles.js'));
        };
        
        document.head.appendChild(script);
      });
    };

    const initializeParticles = async () => {
      try {
        await loadParticlesScript();
        
        if (window.Particles && canvasRef.current) {
          // Initialize particles with spider web effect
          window.Particles.init({
            selector: '.particles-background',
            maxParticles: 100,
            sizeVariations: 3,
            speed: 0.3,
            color: ['#58a6ff', '#bf00ff', '#00ffcc', '#ffffff'],
            minDistance: 150,
            connectParticles: true,
            responsive: [
              {
                breakpoint: 768,
                options: {
                  maxParticles: 60,
                  minDistance: 120,
                }
              },
              {
                breakpoint: 480,
                options: {
                  maxParticles: 40,
                  minDistance: 100,
                }
              }
            ]
          });
        }
      } catch (error) {
        console.error('Error initializing particles:', error);
        // Fallback to a simple background if particles.js fails to load
      }
    };

    initializeParticles();

    // Cleanup function
    return () => {
      if (window.Particles && typeof window.Particles.destroy === 'function') {
        try {
          window.Particles.destroy();
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
        className="particles-background absolute inset-0 w-full h-full"
        style={{
          display: 'block',
          background: 'transparent',
        }}
      />
      
      {/* Additional overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117]/20 via-transparent to-[#0d1117]/10 pointer-events-none" />
    </div>
  );
}