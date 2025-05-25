import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { diagramPrompt } from '@/lib/ai/prompts';
import { streamObject } from 'ai';
import { z } from 'zod';

export const diagramDocumentHandler = createDocumentHandler<'diagram'>({
  kind: 'diagram',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: diagramPrompt,
      prompt: title,
      schema: z.object({
        diagram: z.string(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const { diagram } = object;

        if (diagram) {
          dataStream.writeData({
            type: 'diagram-delta',
            content: diagram,
          });

          draftContent = diagram;
        }
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: `${diagramPrompt}

Update the existing Mermaid diagram based on the user's request. Preserve existing structure where appropriate and maintain the same high-quality standards.

Current diagram:
${document.content}`,
      prompt: description,
      schema: z.object({
        diagram: z.string(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const { diagram } = object;

        if (diagram) {
          dataStream.writeData({
            type: 'diagram-delta',
            content: diagram,
          });

          draftContent = diagram;
        }
      }
    }

    return draftContent;
  },
});
