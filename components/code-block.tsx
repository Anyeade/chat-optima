'use client';

import { useState, useEffect } from 'react';
import { CheckIcon, CopyIcon } from './icons';
import { toast } from 'sonner';
import { useMediaQuery } from '@/hooks/use-mobile';

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
  const isMobile = useMediaQuery('(max-width: 768px)');

  const copyToClipboard = () => {
    const codeText = typeof children === 'string' 
      ? children 
      : Array.isArray(children) 
        ? children.join('') 
        : '';
        
    navigator.clipboard.writeText(codeText).then(() => {
      setIsCopied(true);
      toast.success('Code copied to clipboard');
      
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    });
  };

  if (!inline) {
    return (
      <div className="not-prose flex flex-col relative group">
        <div 
          className={`absolute right-2 top-2 cursor-pointer p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
            isMobile 
              ? 'opacity-70' 
              : 'code-block-copy-button'
          }`}
          onClick={copyToClipboard}
          aria-label="Copy code"
          role="button"
          tabIndex={0}
        >
          {isCopied ? (
            <CheckIcon size={isMobile ? 18 : 16} className="text-green-500" />
          ) : (
            <CopyIcon size={isMobile ? 18 : 16} />
          )}
        </div>
        <pre
          {...props}
          className={`text-sm w-full overflow-x-auto dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl dark:text-zinc-50 text-zinc-900`}
        >
          <code className="whitespace-pre-wrap break-words">{children}</code>
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