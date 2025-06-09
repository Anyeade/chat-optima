'use client';

import { defaultMarkdownSerializer, MarkdownSerializer } from 'prosemirror-markdown';
import { DOMParser, type Node } from 'prosemirror-model';
import { Decoration, DecorationSet, type EditorView } from 'prosemirror-view';
import { renderToString } from 'react-dom/server';

import { Markdown } from '@/components/markdown';

import { documentSchema } from './config';
import { createSuggestionWidget, type UISuggestion } from './suggestions';

// Create a table-aware markdown serializer
const customMarkdownSerializer = new MarkdownSerializer(
  {
    ...defaultMarkdownSerializer.nodes,
    table(state, node) {
      state.write("\n");
      state.renderContent(node);
      state.write("\n");
    },
    table_row(state, node, parent, index) {
      state.write("|");
      for (let i = 0; i < node.childCount; i++) {
        if (i) state.write("|");
        state.render(node.child(i), node, i);
      }
      state.write("|\n");
      // Add header separator after first row
      if (index === 0 && parent && parent.type.name === 'table') {
        state.write("|");
        for (let i = 0; i < node.childCount; i++) {
          if (i) state.write("|");
          state.write("---");
        }
        state.write("|\n");
      }
    },
    table_cell(state, node) {
      state.write(" ");
      state.renderInline(node);
      state.write(" ");
    },
    table_header(state, node) {
      state.write(" ");
      state.renderInline(node);
      state.write(" ");
    }
  },
  defaultMarkdownSerializer.marks
);

export const buildDocumentFromContent = (content: string) => {
  const parser = DOMParser.fromSchema(documentSchema);
  const stringFromMarkdown = renderToString(<Markdown>{content}</Markdown>);
  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = stringFromMarkdown;
  return parser.parse(tempContainer);
};

export const buildContentFromDocument = (document: Node) => {
  return customMarkdownSerializer.serialize(document);
};

export const createDecorations = (
  suggestions: Array<UISuggestion>,
  view: EditorView,
) => {
  const decorations: Array<Decoration> = [];

  for (const suggestion of suggestions) {
    decorations.push(
      Decoration.inline(
        suggestion.selectionStart,
        suggestion.selectionEnd,
        {
          class: 'suggestion-highlight',
        },
        {
          suggestionId: suggestion.id,
          type: 'highlight',
        },
      ),
    );

    decorations.push(
      Decoration.widget(
        suggestion.selectionStart,
        (view) => {
          const { dom } = createSuggestionWidget(suggestion, view);
          return dom;
        },
        {
          suggestionId: suggestion.id,
          type: 'widget',
        },
      ),
    );
  }

  return DecorationSet.create(view.state.doc, decorations);
};
