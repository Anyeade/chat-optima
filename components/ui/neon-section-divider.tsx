'use client';

import { useEffect, useRef } from 'react';

interface SectionDividerProps {
  direction?: 'left' | 'right';
  className?: string;
}

export default function NeonSectionDivider({ 
  direction = 'left', 
  className = '' 
}: SectionDividerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Create gradient
    const gradient = ctx.createLinearGradient(
      direction === 'left' ? canvas.width : 0, 
      0, 
      direction === 'left' ? 0 : canvas.width, 
      0
    );
    
    gradient.addColorStop(0, '#58a6ff'); // neonBlue
    gradient.addColorStop(0.5, '#bf00ff'); // neonPurple
    gradient.addColorStop(1, '#00ffcc'); // neonTeal
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = gradient;
    ctx.stroke();
    
    // Add glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#58a6ff';
    ctx.stroke();
    
    // Add dots
    const numDots = 5;
    const gap = canvas.width / (numDots - 1);
    
    for (let i = 0; i < numDots; i++) {
      const x = i * gap;
      const y = canvas.height / 2;
      
      // Determine dot color based on position
      let dotColor;
      if (i === 0) dotColor = '#58a6ff';
      else if (i === numDots - 1) dotColor = '#00ffcc';
      else dotColor = '#bf00ff';
      
      // Draw dot
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = dotColor;
      ctx.shadowBlur = 15;
      ctx.shadowColor = dotColor;
      ctx.fill();
    }
  }, [direction]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className={`w-full h-8 ${className}`}
      aria-hidden="true"
    />
  );
}
