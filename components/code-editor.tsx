'use client';

import { EditorView, ViewPlugin, Decoration, DecorationSet } from '@codemirror/view';
import { EditorState, Transaction } from '@codemirror/state';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { basicSetup } from 'codemirror';
import { LanguageSupport } from '@codemirror/language';
import React, { memo, useEffect, useRef } from 'react';
import { Suggestion } from '@/lib/db/schema';
import { languages, tokenize } from 'prismjs';
import 'prismjs/components/prism-mermaid';

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
    }

    highlight(view: EditorView) {
      const code = view.state.doc.toString();
      const tokens = tokenize(code, languages[language]);
      let pos = 0;
      const decorations: any[] = [];

      const processToken = (token: any) => {
        if (typeof token === 'string') {
          pos += token.length;
          return;
        }

        const tokenContent = typeof token.content === 'string' ? token.content : token.content.join('');
        const className = `token ${token.type}`;
        decorations.push(Decoration.mark({
          class: className
        }).range(pos, pos + tokenContent.length));
        pos += tokenContent.length;
      };

      tokens.forEach(token => processToken(token));
      return Decoration.set(decorations);
    }
  }, {
    decorations: v => v.decorations
  });
};

const mermaidHighlighter = createPrismHighlighter('mermaid');
const mermaidLanguageSupport = new LanguageSupport(markdown().language, [mermaidHighlighter]);

const getLanguageExtension = (language?: string): LanguageSupport | [LanguageSupport, ViewPlugin<any>] => {
  switch (language?.toLowerCase()) {
    case 'html':
    case 'svg':
      return html();
    case 'mermaid':
      if (!languages.mermaid) {
        // If Mermaid grammar is not loaded, define a simple one
        languages.mermaid = {
          'keyword': /\b(?:graph|subgraph|end|sequenceDiagram|participant|loop|alt|else|opt|par|class|classDef|flowchart|gantt|pie|stateDiagram|journey)\b/,
          'operator': /[->]/,
          'punctuation': /[[\]{}():;,]/,
          'class-name': /\b[A-Z][a-zA-Z0-9_]*\b/,
          'string': /{[^}]+}|"[^"]*"|'[^']*'/,
          'function': /\b\w+\(/,
          'arrow': /--?>|==?>|-.->|==>>/,
          'entity': /&[a-z0-9]+;|\([^)]*\)/i
        };
      }
      return [mermaidLanguageSupport, mermaidHighlighter];
    case 'python':
      return python();
    default:
      return python(); // Default to Python
  }
};

function PureCodeEditor({ content, onSaveContent, status, language }: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (containerRef.current && !editorRef.current) {
      const startState = EditorState.create({
        doc: content,
        extensions: [basicSetup, getLanguageExtension(language), oneDark],
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
