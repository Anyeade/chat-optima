'use client';

import { useEffect } from 'react';

export default function SimpleParticlesTest() {
  useEffect(() => {
    const initParticles = () => {
      console.log('Checking for Particles...', typeof window !== 'undefined' ? window.Particles : 'undefined');
      
      if (typeof window !== 'undefined' && window.Particles) {
        console.log('Particles found, initializing...');
        
        window.Particles.init({
          selector: '.background',
          maxParticles: 50,
          sizeVariations: 3,
          speed: 0.5,
          color: '#58a6ff',
          minDistance: 120,
          connectParticles: true
        });
        
        console.log('Particles initialized');
      } else {
        console.log('Particles not found, retrying...');
      }
    };

    // Try multiple times with delays
    const delays = [0, 100, 500, 1000, 2000];
    const timeouts = delays.map(delay => 
      setTimeout(initParticles, delay)
    );

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-[-1] bg-[#0d1117]" />
      <canvas className="background fixed inset-0 z-[-1] w-full h-full block" />
    </>
  );
}