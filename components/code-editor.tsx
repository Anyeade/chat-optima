'use client';

import { EditorView } from '@codemirror/view';
import { EditorState, Transaction } from '@codemirror/state';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { markdown } from '@codemirror/lang-markdown';
import { javascript } from '@codemirror/lang-javascript';
import { php } from '@codemirror/lang-php';
import { css } from '@codemirror/lang-css';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
import { basicSetup } from 'codemirror';
import type { LanguageSupport } from '@codemirror/language';
import React, { memo, useEffect, useRef } from 'react';
import type { Suggestion } from '@/lib/db/schema';

type EditorProps = {
  content: string;
  onSaveContent: (updatedContent: string, debounce: boolean) => void;
  status?: 'streaming' | 'idle';
  isCurrentVersion: boolean;
  currentVersionIndex?: number;
  suggestions?: Array<Suggestion>;
  language?: string;
};

const getLanguageExtension = (language?: string): LanguageSupport => {
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
    case 'java':
      return java();
    case 'cpp':
    case 'c++':
      return cpp();
    case 'csharp':
    case 'cs':
    case 'c#':
      // C# uses similar syntax to Java, so we'll use Java highlighting as fallback
      return java();
    case 'ruby':
    case 'rb':
    case 'mermaid':
      // For languages that don't have CodeMirror support, use markdown as fallback
      return markdown();
    case 'python':
    case 'py':
      return python();
    default:
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
    if (code.includes('public class')) return 'java';
    if (code.includes('#include') && code.includes('iostream')) return 'cpp';
    if (code.includes('using System') || code.includes('Console.WriteLine')) return 'csharp';
    
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
