'use client';

import { useState } from 'react';

type PricingCardProps = {
  title: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  onClick?: () => void;
};

export default function NeonPricingCard({
  title,
  price,
  description,
  features,
  highlighted = false,
  onClick
}: PricingCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className={`p-6 rounded-xl border transition-all duration-300 relative ${
        highlighted 
          ? 'bg-gradient-to-b from-[#2f3542] to-[#1a1f25] border-neonBlue' 
          : 'bg-[#1a1f25] border-[#2f343c] hover:border-neonBlue'
      } ${isHovered ? 'transform scale-[1.02]' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Highlight glow */}
      {(highlighted || isHovered) && (
        <div className={`absolute -inset-0.5 bg-gradient-to-r from-neonBlue to-neonPurple rounded-xl opacity-${highlighted ? '40' : '20'} blur-sm -z-10`}></div>
      )}
      
      <h3 className="text-xl font-bold mb-1 text-white">{title}</h3>
      <div className="flex items-baseline mb-4">
        <span className="text-3xl font-extrabold text-white">{price}</span>
        {price !== 'Custom' && <span className="ml-1 text-gray-400">/month</span>}
      </div>
      <p className="text-gray-400 mb-6">{description}</p>
      <ul className="space-y-2 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg className={`w-5 h-5 mr-2 ${highlighted ? 'text-neonBlue' : 'text-[#58a6ff]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span className="text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>
      <button 
        onClick={onClick}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
          highlighted
            ? 'bg-gradient-to-r from-neonBlue to-neonPurple text-white'
            : 'bg-[#2f343c] text-white hover:bg-[#3b414d]'
        }`}
      >
        Get Started
      </button>
    </div>
  );
}
