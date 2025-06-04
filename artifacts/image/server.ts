import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { experimental_generateImage } from 'ai';
import { generateFallbackImage } from '@/lib/ai/fallback-image';

export const imageDocumentHandler = createDocumentHandler<'image'>({
  kind: 'image',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    try {
      // Use fallback image generation (Chutes first, then Grok)
      const result = await generateFallbackImage(title);
      draftContent = result.base64;

      dataStream.writeData({
        type: 'image-delta',
        content: result.base64,
      });
    } catch (error) {
      console.error('Fallback image generation failed, using OpenAI DALL-E as final fallback:', error);
      
      // Final fallback to OpenAI DALL-E
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
      // Use fallback image generation (Chutes first, then Grok)
      const result = await generateFallbackImage(description);
      draftContent = result.base64;

      dataStream.writeData({
        type: 'image-delta',
        content: result.base64,
      });
    } catch (error) {
      console.error('Fallback image generation failed, using OpenAI DALL-E as final fallback:', error);
      
      // Final fallback to OpenAI DALL-E
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
