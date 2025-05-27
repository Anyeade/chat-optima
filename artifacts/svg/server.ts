import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { svgPrompt } from '@/lib/ai/prompts';
import { streamText, smoothStream } from 'ai';

export const svgDocumentHandler = createDocumentHandler<'svg'>({
  kind: 'svg',
  onCreateDocument: async ({ title, dataStream, selectedChatModel }) => {
    let draftContent = '';

    // Use selectedChatModel if provided, fallback to artifact-model
    const modelToUse = selectedChatModel || 'artifact-model';

    const { fullStream } = streamText({
      model: myProvider.languageModel(modelToUse),
      system: svgPrompt,
      prompt: title,
      experimental_transform: smoothStream({ chunking: 'word' }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'text-delta') {
        const { textDelta } = delta;

        draftContent += textDelta;

        dataStream.writeData({
          type: 'svg-delta',
          content: draftContent,
        });
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream, selectedChatModel }) => {
    let draftContent = '';

    // Use selectedChatModel if provided, fallback to artifact-model
    const modelToUse = selectedChatModel || 'artifact-model';

    const { fullStream } = streamText({
      model: myProvider.languageModel(modelToUse),
      system: `${svgPrompt}

Update the existing SVG based on the user's request. Preserve existing structure where appropriate and maintain the same high-quality standards.

Current SVG:
${document.content}`,
      prompt: description,
      experimental_transform: smoothStream({ chunking: 'word' }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'text-delta') {
        const { textDelta } = delta;

        draftContent += textDelta;

        dataStream.writeData({
          type: 'svg-delta',
          content: draftContent,
        });
      }
    }

    return draftContent;
  },
});
