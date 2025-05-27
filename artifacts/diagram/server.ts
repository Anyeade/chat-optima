import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { diagramPrompt } from '@/lib/ai/prompts';
import { streamText, smoothStream } from 'ai';

export const diagramDocumentHandler = createDocumentHandler<'diagram'>({
  kind: 'diagram',
  onCreateDocument: async ({ title, dataStream, selectedChatModel }) => {
    let draftContent = '';

    // Use selectedChatModel if provided, fallback to artifact-model
    const modelToUse = selectedChatModel || 'artifact-model';

    const { fullStream } = streamText({
      model: myProvider.languageModel(modelToUse),
      system: diagramPrompt,
      prompt: title,
      experimental_transform: smoothStream({ chunking: 'word' }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'text-delta') {
        const { textDelta } = delta;

        draftContent += textDelta;

        dataStream.writeData({
          type: 'diagram-delta',
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
      system: `${diagramPrompt}

Update the existing Mermaid diagram based on the user's request. Preserve existing structure where appropriate and maintain the same high-quality standards.

Current diagram:
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
          type: 'diagram-delta',
          content: draftContent,
        });
      }
    }

    return draftContent;
  },
});
