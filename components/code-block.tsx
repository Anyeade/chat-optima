'use client';

import React, { useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-php';
import { CopyIcon, CheckIcon } from './icons';

interface CodeBlockProps {
  node: any;
  inline: boolean;
  className?: string;
  children: any;
}

export function CodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  
  if (inline) {
    return (
      <code
        className={`${className || ''} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
        {...props}
      >
        {children}
      </code>
    );
  }
  
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeString = String(children).replace(/\n$/, '');
  
  // Apply Prism syntax highlighting
  let highlightedCode = codeString;
  if (language && Prism.languages[language]) {
    try {
      highlightedCode = Prism.highlight(
        codeString,
        Prism.languages[language],
        language
      );
    } catch (error) {
      console.error("Error highlighting code:", error);
    }
  }
  
  const copyCode = () => {
    navigator.clipboard.writeText(codeString).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };
  
  return (
    <div className="not-prose flex flex-col relative group">
      {language && (
        <div className="absolute right-12 top-2 px-2 py-1 text-xs font-mono code-block-language-label">
          {language}
        </div>
      )}
      <button
        onClick={copyCode}
        className="absolute right-2 top-2 p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors opacity-0 group-hover:opacity-100"
        aria-label="Copy code to clipboard"
        title={copied ? "Copied!" : "Copy to clipboard"}
      >
        {copied ? (
          <CheckIcon size={16} className="text-green-500" />
        ) : (
          <CopyIcon size={16} />
        )}
      </button>
      <pre
        {...props}
        className={`text-sm w-full overflow-x-auto dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl dark:text-zinc-50 text-zinc-900 ${language ? `language-${language}` : ''}`}
      >
        {language ? (
          <code 
            className={`language-${language}`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        ) : (
          <code className="whitespace-pre-wrap break-words">{children}</code>
        )}
      </pre>
    </div>
  );
}
