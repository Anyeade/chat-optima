import { generateUUID } from '@/lib/utils';
import { type DataStreamWriter, tool } from 'ai';
import { z } from 'zod';
import type { Session } from 'next-auth';
import {
  artifactKinds,
  documentHandlersByArtifactKind,
} from '@/lib/artifacts/server';

interface CreateDocumentProps {
  session: Session;
  dataStream: DataStreamWriter;
  selectedChatModel?: string;
}

export const createDocument = ({ session, dataStream, selectedChatModel }: CreateDocumentProps) =>
  tool({
    description:
      'Create a document for a writing or content creation activities. This tool will call other functions that will generate the contents of the document based on the title and kind.',
    parameters: z.object({
      title: z.string(),
      kind: z.enum(artifactKinds),
    }),
    execute: async ({ title, kind }) => {
      const id = generateUUID();

      try {
        dataStream.writeData({
          type: 'kind',
          content: kind,
        });

        dataStream.writeData({
          type: 'id',
          content: id,
        });

        dataStream.writeData({
          type: 'title',
          content: title,
        });

        dataStream.writeData({
          type: 'clear',
          content: '',
        });

        const documentHandler = documentHandlersByArtifactKind.find(
          (documentHandlerByArtifactKind) =>
            documentHandlerByArtifactKind.kind === kind,
        );

        if (!documentHandler) {
          throw new Error(`No document handler found for kind: ${kind}`);
        }

        console.log(`🔧 Creating ${kind} artifact with model: ${selectedChatModel || 'artifact-model'}`);

        await documentHandler.onCreateDocument({
          id,
          title,
          dataStream,
          session,
          selectedChatModel,
        });

        dataStream.writeData({ type: 'finish', content: '' });

        return {
          id,
          title,
          kind,
          content: 'A document was created and is now visible to the user.',
        };
      } catch (error) {
        console.error(`❌ Failed to create ${kind} artifact:`, error);
        
        // Send error information to the client
        dataStream.writeData({
          type: 'error',
          content: `Failed to create ${kind} artifact: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });

        // Still send finish to close the stream properly
        dataStream.writeData({ type: 'finish', content: '' });

        // Return error information instead of throwing
        return {
          id,
          title,
          kind,
          content: `Failed to create the ${kind} artifact. Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or use a different model.`,
          error: true,
        };
      }
    },
  });
