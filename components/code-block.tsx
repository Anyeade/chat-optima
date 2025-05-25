'use client';

import { useEffect, useRef, useState } from 'react';
import { CopyIcon, CheckIcon } from './icons'; // ✅ Imported here

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

  // ✅ Dynamically load highlight.js and theme CSS
  useEffect(() => {
    if (!inline && codeRef.current) {
      import('./highlight/highlight.min.js').then((hljs) => {
        const isDark = document.documentElement.classList.contains('dark');
        const themeUrl = isDark
          ? '/components/highlight/styles/github-dark.min.css'
          : '/components/highlight/styles/github.min.css';

        const existingLink = document.getElementById('hljs-theme');
        if (!existingLink) {
          const link = document.createElement('link');
          link.id = 'hljs-theme';
          link.rel = 'stylesheet';
          link.href = themeUrl;
          document.head.appendChild(link);
        } else {
          existingLink.setAttribute('href', themeUrl);
        }

        hljs.highlightElement(codeRef.current!);
      });
    }
  }, [children, inline]);

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
      <div className="not-prose relative flex flex-col">
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
          aria-label="Copy code"
        >
          {copied ? (
            <CheckIcon className="text-green-500" />
          ) : (
            <span className="text-gray-600 dark:text-gray-300">
              <CopyIcon />
            </span>
          )}
        </button>

        <pre
          {...props}
          className="text-sm w-full overflow-x-auto dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl dark:text-zinc-50 text-zinc-900"
        >
          <code
            ref={codeRef}
            className={`whitespace-pre-wrap break-words max-w-full sm:max-w-none mobile-code-break ${className}`}
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
