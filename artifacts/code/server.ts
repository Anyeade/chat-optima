import { streamText, smoothStream } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import { codePrompt, updateDocumentPrompt } from '@/lib/ai/prompts';
import { createDocumentHandler } from '@/lib/artifacts/server';

export const codeDocumentHandler = createDocumentHandler<'code'>({
  kind: 'code',
  onCreateDocument: async ({ title, dataStream, selectedChatModel }) => {
    let draftContent = '';

    // Use selectedChatModel if provided, fallback to artifact-model
    const modelToUse = selectedChatModel || 'artifact-model';

    const { fullStream } = streamText({
      model: myProvider.languageModel(modelToUse),
      system: codePrompt,
      prompt: title,
      experimental_transform: smoothStream({ chunking: 'word' }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'text-delta') {
        const { textDelta } = delta;

        draftContent += textDelta;

        dataStream.writeData({
          type: 'code-delta',
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
      system: updateDocumentPrompt(document.content, 'code'),
      prompt: description,
      experimental_transform: smoothStream({ chunking: 'word' }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'text-delta') {
        const { textDelta } = delta;

        draftContent += textDelta;

        dataStream.writeData({
          type: 'code-delta',
          content: draftContent,
        });
      }
    }

    return draftContent;
  },
});
