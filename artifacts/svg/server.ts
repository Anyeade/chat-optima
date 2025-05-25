import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { svgPrompt } from '@/lib/ai/prompts';
import { streamObject } from 'ai';
import { z } from 'zod';

export const svgDocumentHandler = createDocumentHandler<'svg'>({
  kind: 'svg',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: svgPrompt,
      prompt: title,
      schema: z.object({
        svg: z.string(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const { svg } = object;

        if (svg) {
          dataStream.writeData({
            type: 'svg-delta',
            content: svg,
          });

          draftContent = svg;
        }
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: `${svgPrompt}

Update the existing SVG graphic based on the user's request. Preserve existing structure where appropriate and maintain the same high-quality standards.

Current SVG:
${document.content}`,
      prompt: description,
      schema: z.object({
        svg: z.string(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const { svg } = object;

        if (svg) {
          dataStream.writeData({
            type: 'svg-delta',
            content: svg,
          });

          draftContent = svg;
        }
      }
    }

    return draftContent;
  },
});
