'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-invert prose-lg max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Customize heading styles
          h1: ({ children }) => (
            <h1 className="text-4xl font-bold mb-6 text-white border-b border-gray-600 pb-4">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-3xl font-semibold mb-4 mt-8 text-white">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-2xl font-semibold mb-3 mt-6 text-white">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xl font-semibold mb-2 mt-4 text-white">
              {children}
            </h4>
          ),
          // Customize paragraph styles
          p: ({ children }) => (
            <p className="mb-4 text-gray-300 leading-relaxed">
              {children}
            </p>
          ),
          // Customize list styles
          ul: ({ children }) => (
            <ul className="mb-4 pl-6 text-gray-300 space-y-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 pl-6 text-gray-300 space-y-2">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-300">
              {children}
            </li>
          ),
          // Customize code blocks
          pre: ({ children }) => (
            <pre className="bg-[#0f0f0f] border border-gray-600 rounded-lg p-4 mb-6 overflow-x-auto">
              {children}
            </pre>
          ),
          code: ({ children, className }) => {
            const isBlock = className?.includes('language-');
            if (isBlock) {
              return <code className={className}>{children}</code>;
            }
            return (
              <code className="bg-[#0f0f0f] border border-gray-600 rounded px-2 py-1 text-sm text-green-400">
                {children}
              </code>
            );
          },
          // Customize blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-[#58a6ff] pl-4 mb-6 italic text-gray-400 bg-[#0f0f0f] py-2 rounded-r">
              {children}
            </blockquote>
          ),
          // Customize links
          a: ({ children, href }) => (
            <a 
              href={href} 
              className="text-[#58a6ff] hover:text-[#bf00ff] transition-colors underline"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {children}
            </a>
          ),
          // Customize tables
          table: ({ children }) => (
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full border border-gray-600 rounded-lg">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-gray-600 px-4 py-2 bg-[#1a1a1b] text-white font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-600 px-4 py-2 text-gray-300">
              {children}
            </td>
          ),
          // Customize horizontal rules
          hr: () => (
            <hr className="border-gray-600 my-8" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
