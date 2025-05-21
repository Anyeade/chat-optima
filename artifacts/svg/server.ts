import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { streamObject } from 'ai';
import { z } from 'zod';

export const svgDocumentHandler = createDocumentHandler<'svg'>({
  kind: 'svg',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: 'Create an SVG graphic that matches the user\'s request. Use appropriate viewBox and dimensions.',
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
      system: `Update the existing SVG graphic. Preserve existing structure where appropriate.
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
