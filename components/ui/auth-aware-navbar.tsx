'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AuthAwareNavbar() {
  const { data: session, status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  
  // Handle scroll effect and active section
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      
      // Determine active section based on scroll position
      const sections = ['features', 'pricing', 'faq'];
      const scrollPosition = window.scrollY + 100; // Adding offset for better UX
      
      // Find the current section
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section);
            break;
          } else if (scrollPosition < (document.getElementById('features')?.offsetTop ?? 0)) {
            // User is at the top of the page
            setActiveSection('');
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Handle smooth scrolling navigation
  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();

    // Close mobile menu if open
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }

    // Handle home link (smooth scroll to top)
    if (href === "#top") {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      setActiveSection('');
      return;
    }

    // Extract the target element's id from href
    const targetId = href.replace('#', '');
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      // Calculate navbar height for offset
      const navbarHeight = document.querySelector('header')?.offsetHeight || 0;
      
      // Scroll to element with smooth behavior
      window.scrollTo({
        top: targetElement.offsetTop - navbarHeight,
        behavior: 'smooth'
      });

      // Set active section
      setActiveSection(targetId);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/landing' });
  };

  // Render authentication buttons based on session state
  const renderAuthButtons = () => {
    if (status === 'loading') {
      return (
        <div className="flex items-center space-x-4">
          <div className="h-4 w-16 bg-gray-600 animate-pulse rounded"></div>
          <div className="h-9 w-20 bg-gray-600 animate-pulse rounded-lg"></div>
        </div>
      );
    }

    if (session?.user) {
      return (
        <div className="flex items-center space-x-4">
          <Link
            href="/chat"
            className="bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] hover:opacity-90 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-[0_0_10px_rgba(88,166,255,0.3)] hidden sm:block"
          >
            Dashboard
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                {session.user.email || 'Guest'}
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="bg-[#0d1117] border-[#2f343c] text-white"
            >
              <DropdownMenuItem asChild>
                <Link href="/chat" className="cursor-pointer">
                  Chat Dashboard
                </Link>
              </DropdownMenuItem>
              {session.user.type === 'regular' && (
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="cursor-pointer text-red-400 hover:text-red-300"
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }

    // Not logged in - show login/signup buttons
    return (
      <div className="flex items-center space-x-4">
        <Link 
          href="/login" 
          className="text-gray-300 hover:text-white transition-colors"
        >
          Login
        </Link>
        <Link
          href="/chat"
          className="bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] hover:opacity-90 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-[0_0_10px_rgba(88,166,255,0.3)] hidden sm:block"
        >
          Try Optima AI
        </Link>
        <Link
          href="/register"
          className="bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] hover:opacity-90 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-[0_0_10px_rgba(88,166,255,0.3)] sm:ml-2"
        >
          Sign Up
        </Link>
      </div>
    );
  };

  // Render mobile authentication menu
  const renderMobileAuthMenu = () => {
    if (status === 'loading') {
      return (
        <div className="pt-4 flex flex-col space-y-3">
          <div className="h-10 bg-gray-600 animate-pulse rounded-lg"></div>
          <div className="h-10 bg-gray-600 animate-pulse rounded-lg"></div>
        </div>
      );
    }

    if (session?.user) {
      return (
        <div className="pt-4 flex flex-col space-y-3">
          <Link 
            href="/chat"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block py-2 text-center bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] text-white rounded-lg"
          >
            Dashboard
          </Link>
          {session.user.type === 'regular' && (
            <Link 
              href="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-center text-gray-300 hover:text-white transition-colors border border-[#2f343c] rounded-lg"
            >
              Profile
            </Link>
          )}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              handleSignOut();
            }}
            className="block py-2 text-center text-red-400 hover:text-red-300 transition-colors border border-red-400/30 rounded-lg w-full"
          >
            Sign Out
          </button>
        </div>
      );
    }

    // Not logged in - show login/signup buttons
    return (
      <div className="pt-4 flex flex-col space-y-3">
        <Link 
          href="/chat"
          onClick={() => setIsMobileMenuOpen(false)}
          className="block py-2 text-center bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] text-white rounded-lg"
        >
          Try Optima AI
        </Link>
        <Link 
          href="/login"
          onClick={() => setIsMobileMenuOpen(false)}
          className="block py-2 text-center text-gray-300 hover:text-white transition-colors border border-[#2f343c] rounded-lg"
        >
          Login
        </Link>
        <Link
          href="/register"
          onClick={() => setIsMobileMenuOpen(false)}
          className="block py-2 text-center bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] text-white rounded-lg"
        >
          Sign Up
        </Link>
      </div>
    );
  };
  
  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#0d1117]/80 backdrop-blur-md border-b border-[#2f343c] shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link 
              href="#top" 
              className="flex items-center group"
              onClick={(e) => handleNavigation(e, "#top")}
            >
              {/* Logo glowing effect */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#58a6ff] to-[#bf00ff] rounded-full opacity-0 group-hover:opacity-70 blur transition-opacity duration-300"></div>
                <svg 
                  className="w-8 h-8 text-white relative" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M12 2L2 7L12 12L22 7L12 2Z" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M2 17L12 22L22 17" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M2 12L12 17L22 12" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="ml-2">
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#58a6ff] to-[#bf00ff]">
                  Optima AI
                </span>
                <span className="block text-xs text-gray-400 -mt-1">by Optima, Inc.</span>
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {['features', 'pricing', 'faq'].map((item) => (
              <Link
                key={item}
                href={`#${item}`}
                className={`text-gray-300 hover:text-[#58a6ff] transition-colors relative group
                  ${activeSection === item ? 'text-[#58a6ff]' : ''}
                `}
                onClick={(e) => handleNavigation(e, `#${item}`)}
              >
                <span className="capitalize">{item}</span>
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#58a6ff] transition-all duration-300
                  ${activeSection === item ? 'w-full' : 'w-0 group-hover:w-full'}`}>
                </span>
              </Link>
            ))}
            
            {renderAuthButtons()}
          </nav>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              <div className="relative w-6 h-6">
                <span 
                  className={`absolute block w-6 h-0.5 bg-white transform transition-transform duration-300 ${
                    isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : 'translate-y-0'
                  }`}
                  style={{ top: '30%' }}
                ></span>
                <span 
                  className={`absolute block w-6 h-0.5 bg-white transform transition-opacity duration-300 ${
                    isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                  style={{ top: '50%' }}
                ></span>
                <span 
                  className={`absolute block w-6 h-0.5 bg-white transform transition-transform duration-300 ${
                    isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : 'translate-y-0'
                  }`}
                  style={{ top: '70%' }}
                ></span>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div 
        className={`md:hidden bg-[#0d1117]/95 backdrop-blur-md border-b border-[#2f343c] transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-80' : 'max-h-0'
        }`}
      >
        <div className="px-4 py-3 space-y-2">
          {['features', 'pricing', 'faq'].map((item) => (
            <Link
              key={item}
              href={`#${item}`}
              onClick={(e) => handleNavigation(e, `#${item}`)}
              className={`block py-2 transition-colors
                ${activeSection === item 
                  ? 'text-[#58a6ff] border-l-2 border-[#58a6ff] pl-2' 
                  : 'text-gray-300 hover:text-[#58a6ff]'
                }
              `}
            >
              <span className="capitalize">{item}</span>
            </Link>
          ))}
          
          {renderMobileAuthMenu()}
        </div>
      </div>
    </header>
  );
}