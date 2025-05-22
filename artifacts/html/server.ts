import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { streamObject } from 'ai';
import { z } from 'zod';
import { htmlPrompt, updateDocumentPrompt } from '@/lib/ai/prompts';

export const htmlDocumentHandler = createDocumentHandler<'html'>({
  kind: 'html',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: htmlPrompt,
      prompt: title,
      schema: z.object({
        html: z.string(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const { html } = object;

        if (html) {
          dataStream.writeData({
            type: 'html-delta',
            content: html,
          });

          draftContent = html;
        }
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    // Initialize with existing content or empty string to ensure we always have valid HTML
    let draftContent = document.content || '';

    const { fullStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: updateDocumentPrompt(document.content, 'html'),
      prompt: description,
      schema: z.object({
        html: z.string(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const { html } = object;

        if (html) {
          const formattedHtml = html.trim();
          dataStream.writeData({
            type: 'html-delta',
            content: formattedHtml,
          });

          draftContent = formattedHtml;
        }
      }
    }

    return draftContent;
  },
});
