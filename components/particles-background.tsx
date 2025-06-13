'use client';

import { useEffect, useRef } from 'react';

// Custom particle implementation without external dependencies
export default function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationFrameId = useRef<number | null>(null);

  // Define particle class
  class Particle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    color: string;

    constructor(canvas: HTMLCanvasElement) {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 1;
      this.speedX = Math.random() * 1 - 0.5;
      this.speedY = Math.random() * 1 - 0.5;
      
      // Neon colors
      const colors = ['#58a6ff', '#bf00ff', '#00ffcc'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update(canvas: HTMLCanvasElement) {
      // Bounce off edges
      if (this.x > canvas.width || this.x < 0) {
        this.speedX = -this.speedX;
      }
      if (this.y > canvas.height || this.y < 0) {
        this.speedY = -this.speedY;
      }

      this.x += this.speedX;
      this.y += this.speedY;
    }    draw(ctx: CanvasRenderingContext2D) {
      // Add glow effect
      const glow = 10;
      ctx.shadowBlur = glow;
      ctx.shadowColor = this.color;
      
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Reset shadow to prevent affecting other elements
      ctx.shadowBlur = 0;
    }
  }

  // Initialize particles
  const initParticles = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    particles.current = [];
    
    // Create particles
    const particleCount = 80;
    for (let i = 0; i < particleCount; i++) {
      particles.current.push(new Particle(canvas));
    }
  };
  // Connect particles with lines if they are close enough
  const connectParticles = (ctx: CanvasRenderingContext2D) => {
    const maxDistance = 150;
    for (let i = 0; i < particles.current.length; i++) {
      for (let j = i; j < particles.current.length; j++) {
        const dx = particles.current[i].x - particles.current[j].x;
        const dy = particles.current[i].y - particles.current[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxDistance) {
          // Set opacity based on distance
          const opacity = 1 - distance / maxDistance;
          
          // Create gradient for the line based on particle colors
          const gradient = ctx.createLinearGradient(
            particles.current[i].x,
            particles.current[i].y,
            particles.current[j].x,
            particles.current[j].y
          );
          gradient.addColorStop(0, particles.current[i].color.replace(')', `, ${opacity * 0.3})`).replace('rgb', 'rgba'));
          gradient.addColorStop(1, particles.current[j].color.replace(')', `, ${opacity * 0.3})`).replace('rgb', 'rgba'));
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles.current[i].x, particles.current[i].y);
          ctx.lineTo(particles.current[j].x, particles.current[j].y);
          ctx.stroke();
        }
      }
    }
  };

  // Animation loop
  const animate = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    for (let i = 0; i < particles.current.length; i++) {
      particles.current[i].update(canvas);
      particles.current[i].draw(ctx);
    }

    // Connect particles with lines
    connectParticles(ctx);

    // Continue animation loop
    animationFrameId.current = requestAnimationFrame(animate);
  };

  // Handle resize
  const handleResize = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Initialize and start animation
    initParticles();
    animate();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup on component unmount
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-[-1] bg-[#0d1117]" // GitHub dark theme background
    />
  );
}
