'use client';

import { useState } from 'react';

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary';
};

export default function NeonButton({ 
  children, 
  className = '', 
  onClick,
  variant = 'primary'
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);
  
  const baseClasses = 'relative rounded-lg font-medium px-8 py-4 transition-all duration-300 overflow-hidden';
    const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-neonBlue to-neonPurple text-white';
      case 'secondary':
        return 'bg-transparent border border-neonBlue text-neonBlue hover:bg-neonBlue/10';
      case 'tertiary':
        return 'bg-transparent border border-neonTeal text-neonTeal hover:bg-neonTeal/10';
      default:
        return 'bg-gradient-to-r from-neonBlue to-neonPurple text-white';
    }
  };
  
  const variantClasses = getVariantClasses();
  
  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className}`}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >      {/* Animated glow effect on hover */}
      {hovered && (
        <>
          {variant === 'primary' && (
            <>
              <div className="absolute -inset-1 bg-gradient-to-r from-neonBlue via-neonPurple to-neonTeal opacity-50 blur-md rounded-lg animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-neonBlue to-neonPurple"></div>
            </>
          )}
          {variant === 'tertiary' && (
            <>
              <div className="absolute -inset-1 bg-gradient-to-r from-neonTeal to-neonBlue opacity-30 blur-md rounded-lg animate-pulse"></div>
            </>
          )}
        </>
      )}
      
      {/* Content */}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
