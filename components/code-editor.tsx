'use client';

import { EditorView, ViewPlugin, Decoration, type DecorationSet } from '@codemirror/view';
import { EditorState, Transaction } from '@codemirror/state';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { markdown } from '@codemirror/lang-markdown';
import { javascript } from '@codemirror/lang-javascript';
import { php } from '@codemirror/lang-php';
import { css } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';
import { basicSetup } from 'codemirror';
import { LanguageSupport } from '@codemirror/language';
import React, { memo, useEffect, useRef } from 'react';
import type { Suggestion } from '@/lib/db/schema';
import { languages, tokenize } from 'prismjs';
// Import only the language components that actually exist in Prism.js
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-ruby';
// Note: prism-mermaid doesn't exist, we define it manually

type EditorProps = {
  content: string;
  onSaveContent: (updatedContent: string, debounce: boolean) => void;
  status?: 'streaming' | 'idle';
  isCurrentVersion: boolean;
  currentVersionIndex?: number;
  suggestions?: Array<Suggestion>;
  language?: string;
};

const createPrismHighlighter = (language: string) => {
  return ViewPlugin.fromClass(class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.highlight(view);
    }

    update(update: any) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = this.highlight(update.view);
      }
    }    highlight(view: EditorView) {
      const code = view.state.doc.toString();
      
      // Ensure languages object exists and the specific language is defined
      if (!languages || typeof languages !== 'object') {
        console.warn('Prism languages object is not available. Skipping syntax highlighting.');
        return Decoration.set([]);
      }
      
      if (!languages[language] || typeof languages[language] !== 'object') {
        console.warn(`Prism language '${language}' is not defined. Skipping syntax highlighting.`);
        return Decoration.set([]);
      }
      
      try {
        // Additional safety check for the language definition
        const langDef = languages[language];
        if (!langDef || typeof langDef !== 'object') {
          console.warn(`Invalid language definition for '${language}'. Skipping syntax highlighting.`);
          return Decoration.set([]);
        }

        const tokens = tokenize(code, langDef);
        let pos = 0;
        const decorations: any[] = [];

        const processToken = (token: any) => {
          if (typeof token === 'string') {
            pos += token.length;
            return;
          }

          if (token && typeof token === 'object' && token.type && token.content !== undefined) {
            const tokenContent = typeof token.content === 'string' ? token.content : 
                                 Array.isArray(token.content) ? token.content.join('') : String(token.content);
            const className = `token ${token.type}`;
            decorations.push(Decoration.mark({
              class: className
            }).range(pos, pos + tokenContent.length));
            pos += tokenContent.length;
          } else {
            // Fallback for unexpected token structure
            const tokenStr = String(token);
            pos += tokenStr.length;
          }
        };

        if (Array.isArray(tokens)) {
          tokens.forEach(token => processToken(token));
        }
        
        return Decoration.set(decorations);
      } catch (error) {
        console.error(`Error during syntax highlighting for language '${language}':`, error);
        return Decoration.set([]);
      }
    }
  }, {
    decorations: v => v.decorations
  });
};

// Safely define language grammars with comprehensive error handling
const ensureLanguageDefinition = (languageName: string) => {
  // First, ensure Prism languages object exists and is properly initialized
  if (!languages || typeof languages !== 'object') {
    console.error('Prism languages object is not available');
    return false;
  }
  
  try {
    switch (languageName) {
      case 'mermaid':
        if (!languages.mermaid) {
          // Create a completely isolated language definition to avoid prototype pollution
          const mermaidDef = Object.create(null);
          mermaidDef.keyword = /\b(?:graph|subgraph|end|sequenceDiagram|participant|loop|alt|else|opt|par|class|classDef|flowchart|gantt|pie|stateDiagram|journey)\b/;
          mermaidDef.operator = /[->]/;
          mermaidDef.punctuation = /[[\]{}():;,]/;
          mermaidDef.string = /{[^}]+}|"[^"]*"|'[^']*'/;
          mermaidDef.function = /\b\w+\(/;
          mermaidDef.arrow = /--?>|==?>|-.->|==>>/;
          mermaidDef.entity = /&[a-z0-9]+;|\([^)]*\)/i;
          // Use bracket notation to safely set the class-name property
          mermaidDef['class-name'] = /\b[A-Z][a-zA-Z0-9_]*\b/;
          
          // Safely assign to languages object
          Object.defineProperty(languages, 'mermaid', {
            value: mermaidDef,
            writable: true,
            enumerable: true,
            configurable: true
          });
          
          console.log('Mermaid language definition created successfully');
        }
        break;
      case 'ruby':
        if (!languages.ruby) {
          console.warn('Ruby language not found in Prism.js. Ruby syntax highlighting may not work properly.');
          return false;
        }
        break;
    }
    
    return languages[languageName] !== undefined;
  } catch (error) {
    console.error(`Failed to ensure language definition for '${languageName}':`, error);
    return false;
  }
};

// Create highlighter factory with better error handling
const createSafeHighlighter = (language: string) => {
  if (!ensureLanguageDefinition(language)) {
    console.warn(`Cannot create highlighter for language '${language}' - language definition failed`);
    return null;
  }
  
  return createPrismHighlighter(language);
};

const getLanguageExtension = (language?: string): LanguageSupport | [LanguageSupport, ViewPlugin<any>] => {
  switch (language?.toLowerCase()) {
    case 'html':
    case 'svg':
      return html();
    case 'javascript':
    case 'js':
      return javascript();
    case 'typescript':
    case 'ts':
      return javascript({ typescript: true });
    case 'jsx':
      return javascript({ jsx: true });
    case 'tsx':
      return javascript({ jsx: true, typescript: true });
    case 'php':
      return php();
    case 'css':
      return css();
    case 'ruby':
    case 'rb': {
      // For Ruby, we use Prism.js highlighting via custom highlighter
      const rubyHighlighter = createSafeHighlighter('ruby');
      if (rubyHighlighter) {
        return new LanguageSupport(markdown().language, [rubyHighlighter]);
      }
      // Fallback to Python if Ruby highlighter creation fails
      return python();
    }
    case 'mermaid': {
      const mermaidHighlighter = createSafeHighlighter('mermaid');
      if (mermaidHighlighter) {
        return new LanguageSupport(markdown().language, [mermaidHighlighter]);
      }
      // Fallback to markdown if mermaid highlighter creation fails
      return markdown();
    }
    case 'python':
      return python();
    default:
      // Attempt to determine language from content or fallback to Python
      return python();
  }
};

function PureCodeEditor({ content, onSaveContent, status, language }: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorView | null>(null);
  
  // Detect language from code content if not specified
  const detectLanguage = (code: string): string | undefined => {
    if (language) return language;
    
    // Check for common language identifiers in the code
    if (code.includes('<?php')) return 'php';
    if (code.includes('def ') && code.includes(':') && !code.includes('{')) return 'python';
    if (code.includes('function') && code.includes('{')) return 'javascript';
    if (code.includes('interface') || code.includes('class') && code.includes('extends')) return 'typescript';
    if (code.includes('body {') || code.includes('@media')) return 'css';
    if (code.includes('<!DOCTYPE html>') || code.includes('<html>')) return 'html';
    if (code.includes('require ') && code.includes('end')) return 'ruby';
    
    // Default to python if can't detect
    return 'python';
  };

  useEffect(() => {
    if (containerRef.current && !editorRef.current) {
      const detectedLang = detectLanguage(content);
      const startState = EditorState.create({
        doc: content,
        extensions: [basicSetup, getLanguageExtension(detectedLang), oneDark],
      });

      editorRef.current = new EditorView({
        state: startState,
        parent: containerRef.current,
      });
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
    // NOTE: we only want to run this effect once
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      const updateListener = EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const transaction = update.transactions.find(
            (tr) => !tr.annotation(Transaction.remote),
          );

          if (transaction) {
            const newContent = update.state.doc.toString();
            onSaveContent(newContent, true);
          }
        }
      });

      const currentSelection = editorRef.current.state.selection;

      const newState = EditorState.create({
        doc: editorRef.current.state.doc,
        extensions: [basicSetup, getLanguageExtension(language), oneDark, updateListener],
        selection: currentSelection,
      });

      editorRef.current.setState(newState);
    }
  }, [onSaveContent, language]);

  useEffect(() => {
    if (editorRef.current && content) {
      const currentContent = editorRef.current.state.doc.toString();

      if (status === 'streaming' || currentContent !== content) {
        const transaction = editorRef.current.state.update({
          changes: {
            from: 0,
            to: currentContent.length,
            insert: content,
          },
          annotations: [Transaction.remote.of(true)],
        });

        editorRef.current.dispatch(transaction);
      }
    }
  }, [content, status]);

  return (
    <div
      className="relative not-prose w-full pb-[calc(80dvh)] text-sm"
      ref={containerRef}
    />
  );
}

function areEqual(prevProps: EditorProps, nextProps: EditorProps) {
  if (prevProps.suggestions !== nextProps.suggestions) return false;
  if (prevProps.currentVersionIndex !== nextProps.currentVersionIndex)
    return false;
  if (prevProps.isCurrentVersion !== nextProps.isCurrentVersion) return false;
  if (prevProps.status === 'streaming' && nextProps.status === 'streaming')
    return false;
  if (prevProps.content !== nextProps.content) return false;

  return true;
}

export const CodeEditor = memo(PureCodeEditor, areEqual);
