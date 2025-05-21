import { Artifact } from '@/components/create-artifact';
import { DiffView } from '@/components/diffview';
import { DocumentSkeleton } from '@/components/document-skeleton';
import { CodeEditor } from '@/components/code-editor';
import { toast } from 'sonner';
import {
  CopyIcon,
  UndoIcon,
  RedoIcon,
  EyeIcon,
  DownloadIcon,
} from '@/components/icons';

interface SVGArtifactMetadata {
  isPreview: boolean;
}

export const svgArtifact = new Artifact<'svg', SVGArtifactMetadata>({
  kind: 'svg',
  description: 'Useful for creating SVG graphics and illustrations.',
  initialize: async ({ setMetadata }) => {
    setMetadata((currentMetadata) => ({
      isPreview: false,
    }));
  },
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === 'svg-delta') {
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
      return <DocumentSkeleton artifactKind="svg" />;
    }

    if (mode === 'diff') {
      const oldContent = getDocumentContentById(currentVersionIndex - 1);
      const newContent = getDocumentContentById(currentVersionIndex);

      return <DiffView oldContent={oldContent} newContent={newContent} />;
    }

    if (metadata?.isPreview) {
      return (
        <div className="w-full h-full flex items-center justify-center p-4 bg-white dark:bg-zinc-900">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      );
    }

    return (
      <div className="p-4 w-full">
        <CodeEditor
          content={content}
          language="xml"
          onSaveContent={onSaveContent}
          isCurrentVersion={isCurrentVersion}
        />
      </div>
    );
  },
  actions: [
    {
      icon: <EyeIcon size={18} />,
      description: 'Toggle Preview',
      onClick: ({ metadata, setMetadata }) => {
        const newIsPreview = !(metadata?.isPreview ?? false);
        setMetadata({
          isPreview: newIsPreview,
        });
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
      icon: <DownloadIcon size={18} />,
      description: 'Download as SVG',
      onClick: ({ content }) => {
        try {
          // Create blob from SVG content
          const blob = new Blob([content], { type: 'image/svg+xml' });
          
          // Create download link
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `diagram-${new Date().getTime()}.svg`;
          document.body.appendChild(a);
          a.click();
          
          // Cleanup
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 100);
          
          toast.success('SVG downloaded successfully!');
        } catch (error) {
          console.error('Error downloading SVG:', error);
          toast.error('Failed to download SVG');
        }
      },
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
