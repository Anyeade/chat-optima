import { Artifact } from '@/components/create-artifact';
import { ReactNode } from 'react';
import { DiffView } from '@/components/diffview';
import { DocumentSkeleton } from '@/components/document-skeleton';
import { CodeEditor } from '@/components/code-editor';
import { toast } from 'sonner';
import {
  CopyIcon,
  UndoIcon,
  RedoIcon,
  EyeIcon,
  CodeIcon,
} from '@/components/icons';

interface HTMLArtifactMetadata {
  showPreview: boolean;
}

export const htmlArtifact = new Artifact<'html', HTMLArtifactMetadata>({
  kind: 'html',
  description: 'Useful for creating HTML documents with CSS and JavaScript.',
  initialize: async ({ setMetadata }) => {
    setMetadata((currentMetadata) => ({
      showPreview: false
    }));
  },
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === 'html-delta') {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.content as string,
        isVisible: true,
        status: 'streaming',
      }));
    }
  },
  content: ({
    mode,
    content,
    isCurrentVersion,
    currentVersionIndex,
    onSaveContent,
    getDocumentContentById,
    isLoading,
    metadata,
    setMetadata,
  }) => {
    if (isLoading) {
      return <DocumentSkeleton artifactKind="html" />;
    }

    if (mode === 'diff') {
      const oldContent = getDocumentContentById(currentVersionIndex - 1);
      const newContent = getDocumentContentById(currentVersionIndex);

      return <DiffView oldContent={oldContent} newContent={newContent} />;
    }

    if (metadata?.showPreview) {
      return (
        <div className="w-full h-full">
          <iframe
            srcDoc={content}
            className="w-full h-full border-0"
            sandbox="allow-scripts"
          />
        </div>
      );
    }

    return (
      <div className="p-4 w-full">
        <CodeEditor
          content={content}
          language="html"
          onSaveContent={onSaveContent}
          isCurrentVersion={isCurrentVersion}
        />
      </div>
    );
  },
  actions: [
    {
      icon: <CodeIcon size={18} />,
      description: 'View Code',
      onClick: ({ setMetadata }) => {
        setMetadata(metadata => ({
          ...metadata,
          showPreview: false
        }));
      },
      isDisabled: ({ metadata }) => {
        return !metadata?.showPreview;
      }
    },
    {
      icon: <EyeIcon size={18} />,
      description: 'View Preview',
      onClick: ({ setMetadata }) => {
        setMetadata(metadata => ({
          ...metadata,
          showPreview: true
        }));
      },
      isDisabled: ({ metadata }) => {
        return metadata?.showPreview;
      }
    },
    {
      icon: <UndoIcon size={18} />,
      description: 'View Previous version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('prev');
      },
      isDisabled: ({ currentVersionIndex }) => currentVersionIndex === 0,
    },
    {
      icon: <RedoIcon size={18} />,
      description: 'View Next version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('next');
      },
      isDisabled: ({ isCurrentVersion }) => isCurrentVersion,
    },
    {
      icon: <CopyIcon size={18} />,
      description: 'Copy to clipboard',
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success('Copied to clipboard!');
      },
    },
  ],
  toolbar: [],
});
