'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { CopyIcon, CheckIcon } from './icons';
import './code-block-theme.css';

interface CodeBlockProps {
  node: any;
  inline: boolean;
  className: string;
  children: any;
}

export function CodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  const [hljs, setHljs] = useState<any>(null);

  // Theme detection function
  const detectTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    
    // Check for dark class on html element (most common)
    if (document.documentElement.classList.contains('dark')) return 'dark';
    
    // Check for data-theme attribute
    const dataTheme = document.documentElement.getAttribute('data-theme');
    if (dataTheme === 'dark') return 'dark';
    
    // Check system preference as fallback
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  }, []);

  // Load highlight.js once
  useEffect(() => {
    if (!inline) {
      import('./highlight/highlight.min.js').then((hljsModule) => {
        setHljs(hljsModule);
      }).catch((error) => {
        console.warn('Failed to load highlight.js:', error);
      });
    }
  }, [inline]);

  // Apply theme and highlighting
  const applyThemeAndHighlight = useCallback(async (theme: 'light' | 'dark') => {
    if (!hljs || !codeRef.current || inline) return;

    try {
      // Define theme mappings with fallbacks
      const themeMap = {
        dark: [
          '/components/highlight/styles/github-dark.min.css',
          '/components/highlight/styles/atom-one-dark.min.css',
          '/components/highlight/styles/monokai.min.css',
          '/components/highlight/styles/dark.min.css'
        ],
        light: [
          '/components/highlight/styles/github.min.css',
          '/components/highlight/styles/atom-one-light.min.css',
          '/components/highlight/styles/default.min.css',
          '/components/highlight/styles/vs.min.css'
        ]
      };

      const themeUrls = themeMap[theme];
      let themeLoaded = false;

      // Try to load themes in order of preference
      for (const themeUrl of themeUrls) {
        try {
          const existingLink = document.getElementById('hljs-theme');
          if (existingLink) {
            existingLink.setAttribute('href', themeUrl);
          } else {
            const link = document.createElement('link');
            link.id = 'hljs-theme';
            link.rel = 'stylesheet';
            link.href = themeUrl;
            document.head.appendChild(link);
          }
          themeLoaded = true;
          break;
        } catch (error) {
          console.warn(`Failed to load theme ${themeUrl}:`, error);
          continue;
        }
      }

      if (!themeLoaded) {
        console.warn('No highlight.js theme could be loaded');
      }

      // Apply highlighting if content exists
      if (codeRef.current && codeRef.current.textContent) {
        // Clear any existing highlighting
        codeRef.current.removeAttribute('data-highlighted');
        codeRef.current.className = codeRef.current.className
          .replace(/hljs[^\s]*/g, '')
          .trim();
        
        // Apply new highlighting
        hljs.highlightElement(codeRef.current);
      }
    } catch (error) {
      console.error('Error applying theme and highlighting:', error);
    }
  }, [hljs, inline]);

  // Theme observer effect
  useEffect(() => {
    if (typeof window === 'undefined' || inline) return;

    const initialTheme = detectTheme();
    setCurrentTheme(initialTheme);

    // Create observer for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          (mutation.attributeName === 'class' || mutation.attributeName === 'data-theme')
        ) {
          const newTheme = detectTheme();
          if (newTheme !== currentTheme) {
            setCurrentTheme(newTheme);
          }
        }
      });
    });

    // Observe changes to html element
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      const newTheme = detectTheme();
      if (newTheme !== currentTheme) {
        setCurrentTheme(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [detectTheme, currentTheme, inline]);

  // Apply theme when it changes
  useEffect(() => {
    if (hljs && !inline) {
      applyThemeAndHighlight(currentTheme);
    }
  }, [currentTheme, hljs, applyThemeAndHighlight, inline]);

  // Initial highlighting when content changes
  useEffect(() => {
    if (hljs && !inline && children) {
      applyThemeAndHighlight(currentTheme);
    }
  }, [children, hljs, currentTheme, applyThemeAndHighlight, inline]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  if (!inline) {
    return (
      <div className="not-prose code-block-container">
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-2 rounded-md code-copy-button"
          aria-label="Copy code"
        >
          {copied ? (
            <CheckIcon className="text-green-500 size-4" />
          ) : (
            <CopyIcon className="size-4" />
          )}
        </button>

        <pre
          {...props}
          className="text-sm w-full overflow-x-auto p-4 rounded-xl shadow-sm"
        >
          <code
            ref={codeRef}
            className={`whitespace-pre-wrap break-words max-w-full sm:max-w-none mobile-code-break text-inherit ${className}`}
          >
            {children}
          </code>
        </pre>
      </div>
    );
  } else {
    return (
      <code
        className={`${className} code-block-inline text-sm py-0.5 px-1 rounded-md`}
        {...props}
      >
        {children}
      </code>
    );
  }
}
