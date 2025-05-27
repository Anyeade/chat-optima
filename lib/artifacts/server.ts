import { codeDocumentHandler } from '@/artifacts/code/server';
import { imageDocumentHandler } from '@/artifacts/image/server';
import { sheetDocumentHandler } from '@/artifacts/sheet/server';
import { textDocumentHandler } from '@/artifacts/text/server';
import { htmlDocumentHandler } from '@/artifacts/html/server';
import { svgDocumentHandler } from '@/artifacts/svg/server';
import { diagramDocumentHandler } from '@/artifacts/diagram/server';
import { sandboxDocumentHandler } from '@/artifacts/sandbox/server';
import type { ArtifactKind } from '@/components/artifact';
import type { DataStreamWriter } from 'ai';
import type { Document } from '../db/schema';
import { saveDocument } from '../db/queries';
import type { Session } from 'next-auth';

export interface SaveDocumentProps {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}

export interface CreateDocumentCallbackProps {
  id: string;
  title: string;
  dataStream: DataStreamWriter;
  session: Session;
  selectedChatModel?: string;
}

export interface UpdateDocumentCallbackProps {
  document: Document;
  description: string;
  dataStream: DataStreamWriter;
  session: Session;
  selectedChatModel?: string;
}

export interface DocumentHandler<T = ArtifactKind> {
  kind: T;
  onCreateDocument: (args: CreateDocumentCallbackProps) => Promise<void>;
  onUpdateDocument: (args: UpdateDocumentCallbackProps) => Promise<void>;
}

export function createDocumentHandler<T extends ArtifactKind>(config: {
  kind: T;
  onCreateDocument: (params: CreateDocumentCallbackProps) => Promise<string>;
  onUpdateDocument: (params: UpdateDocumentCallbackProps) => Promise<string>;
}): DocumentHandler<T> {
  return {
    kind: config.kind,
    onCreateDocument: async (args: CreateDocumentCallbackProps) => {
      try {
        const draftContent = await config.onCreateDocument({
          id: args.id,
          title: args.title,
          dataStream: args.dataStream,
          session: args.session,
          selectedChatModel: args.selectedChatModel,
        });

        if (args.session?.user?.id) {
          await saveDocument({
            id: args.id,
            title: args.title,
            content: draftContent,
            kind: config.kind,
            userId: args.session.user.id,
          });
        }

        return;
      } catch (error) {
        console.error(`❌ Error in ${config.kind} document handler (create):`, error);
        
        // Send error to client
        args.dataStream.writeData({
          type: 'error',
          content: `Failed to create ${config.kind} document: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });

        // Re-throw to be handled by the tool
        throw error;
      }
    },
    onUpdateDocument: async (args: UpdateDocumentCallbackProps) => {
      try {
        const draftContent = await config.onUpdateDocument({
          document: args.document,
          description: args.description,
          dataStream: args.dataStream,
          session: args.session,
          selectedChatModel: args.selectedChatModel,
        });

        if (args.session?.user?.id) {
          await saveDocument({
            id: args.document.id,
            title: args.document.title,
            content: draftContent,
            kind: config.kind,
            userId: args.session.user.id,
          });
        }

        return;
      } catch (error) {
        console.error(`❌ Error in ${config.kind} document handler (update):`, error);
        
        // Send error to client
        args.dataStream.writeData({
          type: 'error',
          content: `Failed to update ${config.kind} document: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });

        // Re-throw to be handled by the tool
        throw error;
      }
    },
  };
}

/*
 * Use this array to define the document handlers for each artifact kind.
 */
export const documentHandlersByArtifactKind: Array<DocumentHandler> = [
  textDocumentHandler,
  codeDocumentHandler,
  imageDocumentHandler,
  sheetDocumentHandler,
  htmlDocumentHandler,
  svgDocumentHandler,
  diagramDocumentHandler,
  sandboxDocumentHandler,
];

export const artifactKinds = ['text', 'code', 'image', 'sheet', 'html', 'svg', 'diagram', 'sandbox'] as const;
