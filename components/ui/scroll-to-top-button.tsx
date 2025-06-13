'use client';

import { useState, useEffect } from 'react';

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when scrolling down
  useEffect(() => {
    const toggleVisibility = () => {
      // When user scrolls down 500px from the top, show button
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Scroll to top handler
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-[#1a1f25] border border-[#2f343c] hover:border-neonBlue shadow-lg transition-all duration-300 group"
          aria-label="Scroll to top"
        >
          {/* Button glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-full opacity-0 group-hover:opacity-70 blur transition-opacity duration-300 -z-10"></div>
          
          {/* Arrow icon */}
          <svg 
            className="w-6 h-6 text-white transform rotate-180 group-hover:text-[#58a6ff] transition-colors duration-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 14l-7 7m0 0l-7-7m7 7V3" 
            />
          </svg>
        </button>
      )}
    </>
  );
}
