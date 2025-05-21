import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { streamObject } from 'ai';
import { z } from 'zod';
import { htmlPrompt } from '@/lib/ai/prompts';

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
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: `Update the existing HTML document. Preserve existing structure and content where appropriate.
Current HTML:
${document.content}`,
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
});
