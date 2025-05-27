import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { experimental_generateImage } from 'ai';
import { generateChutesImage } from '@/lib/ai/chutes-image';

export const imageDocumentHandler = createDocumentHandler<'image'>({
  kind: 'image',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    try {
      const result = await generateChutesImage(title);
      draftContent = result.base64;

      dataStream.writeData({
        type: 'image-delta',
        content: result.base64,
      });
    } catch (error) {
      console.error('Chutes AI image generation failed:', error);
      // Fallback to OpenAI if Chutes AI fails
      const { image } = await experimental_generateImage({
        model: myProvider.imageModel('small-model'),
        prompt: title,
        n: 1,
      });

      draftContent = image.base64;

      dataStream.writeData({
        type: 'image-delta',
        content: image.base64,
      });
    }

    return draftContent;
  },
  onUpdateDocument: async ({ description, dataStream }) => {
    let draftContent = '';

    try {
      const result = await generateChutesImage(description);
      draftContent = result.base64;

      dataStream.writeData({
        type: 'image-delta',
        content: result.base64,
      });
    } catch (error) {
      console.error('Chutes AI image generation failed:', error);
      // Fallback to OpenAI if Chutes AI fails
      const { image } = await experimental_generateImage({
        model: myProvider.imageModel('small-model'),
        prompt: description,
        n: 1,
      });

      draftContent = image.base64;

      dataStream.writeData({
        type: 'image-delta',
        content: image.base64,
      });
    }

    return draftContent;
  },
});
