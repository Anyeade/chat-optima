'use client';

import { useState } from 'react';

type NeonFAQItemProps = {
  question: string;
  answer: string;
};

export default function NeonFAQItem({ question, answer }: NeonFAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-[#2f343c] py-4 hover:border-[#58a6ff] transition-colors duration-300">
      <button 
        className="flex justify-between items-center w-full text-left font-medium text-white"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="hover:text-[#58a6ff] transition-colors duration-300">{question}</span>
        <div className="relative">
          {/* Small glow effect on hover */}
          <div className={`absolute inset-0 bg-[#58a6ff] rounded-full blur opacity-${isOpen ? '30' : '0'} transition-opacity duration-300`}></div>
          
          <svg 
            className={`w-5 h-5 relative transition-transform duration-300 ${isOpen ? 'transform rotate-180 text-[#58a6ff]' : 'text-white'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </button>
      
      <div className={`mt-2 text-gray-400 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="pb-2">{answer}</p>
      </div>
    </div>
  );
}
