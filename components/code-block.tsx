'use client';

import { useState, useEffect } from 'react';
import { CopyIcon } from './icons';
import { toast } from 'sonner';
import Prism from 'prismjs';

// Import common language definitions
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-scala';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-sass';
import 'prismjs/components/prism-less';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-xml-doc';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-powershell';
import 'prismjs/components/prism-docker';
import 'prismjs/themes/prism.css';
import 'prismjs/themes/prism-dark.css';

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
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const code = String(children).replace(/\n$/, '');
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  const getLanguage = (className: string): string => {
    const match = className?.match(/language-(\w+)/);
    return match ? match[1] : '';
  };

  const getHighlightedCode = (code: string, language: string): string => {
    // Map common language aliases to Prism language identifiers
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'rb': 'ruby',
      'sh': 'bash',
      'shell': 'bash',
      'yml': 'yaml',
      'html': 'markup',
      'xml': 'markup',
      'cs': 'csharp',
      'cpp': 'cpp',
      'c++': 'cpp',
    };

    const prismLanguage = languageMap[language] || language;

    if (prismLanguage && Prism.languages[prismLanguage]) {
      try {
        return Prism.highlight(code, Prism.languages[prismLanguage], prismLanguage);
      } catch (err) {
        console.warn(`Failed to highlight code for language: ${prismLanguage}`, err);
        return code;
      }
    }
    return code;
  };

  if (!inline) {
    const language = getLanguage(className);
    const code = String(children).replace(/\n$/, '');
    const highlightedCode = getHighlightedCode(code, language);

    return (
      <div className="not-prose flex flex-col relative group">
        <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800 px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-t-xl">
          {language && (
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase">
              {language}
            </span>
          )}
          <button
            onClick={handleCopy}
            className={`transition-all duration-200 p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 ${
              copied ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100'
            }`}
            title={copied ? 'Copied!' : 'Copy code'}
          >
            <CopyIcon size={14} />
          </button>
        </div>
        <pre
          {...props}
          className={`text-sm w-full overflow-x-auto dark:bg-zinc-900 bg-white p-4 border-x border-b border-zinc-200 dark:border-zinc-700 ${
            language ? 'rounded-b-xl' : 'rounded-xl'
          } dark:text-zinc-50 text-zinc-900 prism-theme-dark`}
        >
          <code 
            className={`${className} whitespace-pre-wrap break-words language-${language}`}
            dangerouslySetInnerHTML={language ? { __html: highlightedCode } : undefined}
          >
            {!language && children}
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