import { type DataStreamWriter, tool } from 'ai';
import type { Session } from 'next-auth';
import { z } from 'zod';
import { getDocumentById, } from '@/lib/db/queries';
import { documentHandlersByArtifactKind } from '@/lib/artifacts/server';

interface UpdateDocumentProps {
  session: Session;
  dataStream: DataStreamWriter;
  selectedChatModel?: string;
}

export const updateDocument = ({ session, dataStream, selectedChatModel }: UpdateDocumentProps) =>
  tool({
    description: 'Update a document with the given description.',
    parameters: z.object({
      id: z.string().describe('The ID of the document to update'),
      description: z
        .string()
        .describe('The description of changes that need to be made'),
    }),
    execute: async ({ id, description }) => {
      try {
        const document = await getDocumentById({ id });

        if (!document) {
          return {
            error: 'Document not found',
          };
        }

        dataStream.writeData({
          type: 'clear',
          content: document.title,
        });

        const documentHandler = documentHandlersByArtifactKind.find(
          (documentHandlerByArtifactKind) =>
            documentHandlerByArtifactKind.kind === document.kind,
        );

        if (!documentHandler) {
          throw new Error(`No document handler found for kind: ${document.kind}`);
        }

        console.log(`🔧 Updating ${document.kind} artifact with model: ${selectedChatModel || 'artifact-model'}`);

        await documentHandler.onUpdateDocument({
          document,
          description,
          dataStream,
          session,
          selectedChatModel,
        });

        dataStream.writeData({ type: 'finish', content: '' });

        return {
          id,
          title: document.title,
          kind: document.kind,
          content: 'The document has been updated successfully.',
        };
      } catch (error) {
        console.error(`❌ Failed to update artifact:`, error);
        
        // Send error information to the client
        dataStream.writeData({
          type: 'error',
          content: `Failed to update artifact: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });

        // Still send finish to close the stream properly
        dataStream.writeData({ type: 'finish', content: '' });

        // Return error information instead of throwing
        return {
          id,
          title: 'Update Failed',
          kind: 'text',
          content: `Failed to update the artifact. Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or use a different model.`,
          error: true,
        };
      }
    },
  });
