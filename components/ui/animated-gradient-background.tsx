'use client';

import { useEffect, useRef } from 'react';

export default function AnimatedGradientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Create gradient animation
    let gradientAngle = 0;    // Using theme colors defined in tailwind config
    const colors = [
      { r: 88, g: 166, b: 255 },   // neonBlue
      { r: 191, g: 0, b: 255 },    // neonPurple
      { r: 0, g: 255, b: 204 },    // neonTeal
    ];
    
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create gradient
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.max(canvas.width, canvas.height);
      
      // Update angle for animation
      gradientAngle = (gradientAngle + 0.002) % (Math.PI * 2);
      
      const x1 = centerX + Math.cos(gradientAngle) * radius;
      const y1 = centerY + Math.sin(gradientAngle) * radius;
      const x2 = centerX + Math.cos(gradientAngle + Math.PI) * radius;
      const y2 = centerY + Math.sin(gradientAngle + Math.PI) * radius;
      
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, `rgba(${colors[0].r}, ${colors[0].g}, ${colors[0].b}, 0.15)`);
      gradient.addColorStop(0.5, `rgba(${colors[1].r}, ${colors[1].g}, ${colors[1].b}, 0.1)`);
      gradient.addColorStop(1, `rgba(${colors[2].r}, ${colors[2].g}, ${colors[2].b}, 0.15)`);
      
      // Draw radial gradient background
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-[-2] bg-transparent" 
      aria-hidden="true"
    />
  );
}
