'use client';

import { useState } from 'react';

type NeonFeatureCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

export default function NeonFeatureCard({
  title,
  description,
  icon
}: NeonFeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className={`p-6 rounded-xl bg-[#1a1f25] border border-[#2f343c] hover:border-neonBlue transition-all duration-300 relative ${isHovered ? 'transform scale-[1.02]' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect on hover */}
      {isHovered && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-neonBlue to-neonPurple rounded-xl opacity-20 blur-sm -z-10"></div>
      )}
      
      <div className={`mb-4 text-neonBlue relative ${isHovered ? 'animate-pulse' : ''}`}>
        {/* Svg icon glow effect on hover */}
        {isHovered && (
          <div className="absolute inset-0 blur-sm text-neonBlue opacity-70">{icon}</div>
        )}
        {icon}
      </div>
      
      <h3 className={`text-xl font-bold mb-2 text-white transition-colors duration-300 ${isHovered ? 'text-neonBlue' : ''}`}>
        {title}
      </h3>
      
      <p className="text-gray-400">
        {description}
      </p>
    </div>
  );
}
