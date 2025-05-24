'use client';

import { useState, useEffect, useRef } from 'react';
import { CheckIcon, CopyIcon } from './icons';

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
  const [isCopied, setIsCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  useEffect(() => {
    if (codeRef.current && !inline) {
      // Load highlight.js dynamically
      import('./highlight/highlight.min.js').then((hljs) => {
        // Load the theme CSS dynamically based on current theme
        const isDark = document.documentElement.classList.contains('dark');
        const themeUrl = isDark 
          ? '/components/highlight/styles/github-dark.min.css'
          : '/components/highlight/styles/github.min.css';
        
        // Add the CSS if it's not already loaded
        if (!document.querySelector(`link[href="${themeUrl}"]`)) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = themeUrl;
          document.head.appendChild(link);
        }

        // Apply syntax highlighting
        if (codeRef.current) {
          hljs.default.highlightElement(codeRef.current);
        }
      }).catch((error) => {
        console.error('Failed to load highlight.js:', error);
      });
    }
  }, [inline, children]);

  if (!inline) {
    // Extract language from className (e.g., "language-javascript" -> "javascript")
    const language = className?.replace('language-', '') || '';

    return (
      <div className="not-prose flex flex-col group">
        <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-t-xl border border-b-0 border-zinc-200 dark:border-zinc-700">
          {language && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium uppercase">
              {language}
            </span>
          )}
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-2 py-1 text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors code-block-copy-button"
            aria-label="Copy code"
          >
            {isCopied ? (
              <>
                <CheckIcon size={12} />
                Copied
              </>
            ) : (
              <>
                <CopyIcon size={12} />
                Copy
              </>
            )}
          </button>
        </div>
        <pre
          {...props}
          className={`text-sm w-full overflow-x-auto dark:bg-zinc-900 bg-zinc-50 p-4 border border-t-0 border-zinc-200 dark:border-zinc-700 rounded-b-xl dark:text-zinc-50 text-zinc-900`}
        >
          <code 
            ref={codeRef}
            className={`${className} whitespace-pre-wrap break-words`}
          >
            {children}
          </code>
        </pre>
      </div>
    );
  } else {
    return (
      <code
        className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
        {...props}
      >
        {children}
      </code>
    );
  }
}