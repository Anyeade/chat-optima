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
  CodeIcon,
  SparklesIcon
} from '@/components/icons';

interface HTMLArtifactMetadata {
  showPreview: boolean;
  showSmartUpdateInfo: boolean;
}

export const htmlArtifact = new Artifact<'html', HTMLArtifactMetadata>({
  kind: 'html',
  description: 'Useful for creating HTML documents with CSS and JavaScript.',
  initialize: async ({ setMetadata }) => {
    setMetadata((currentMetadata) => ({
      showPreview: false,
      showSmartUpdateInfo: false
    }));
  },
  onStreamPart: ({ streamPart, setArtifact, setMetadata }) => {
    if (streamPart.type === 'html-delta') {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.content as string,
        isVisible: true,
        status: 'streaming',
      }));
    }
    
    if (streamPart.type === 'html-smart-update') {
      // Show info when smart updates are happening
      setMetadata((metadata) => ({
        ...metadata,
        showSmartUpdateInfo: true
      }));
    }
    
    if (streamPart.type === 'finish') {
      // Reset the smart update info flag when streaming is complete
      // This ensures it doesn't persist for future non-smart updates
      setMetadata((metadata) => ({
        ...metadata,
        showSmartUpdateInfo: false
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
        <div className="w-full h-full flex flex-col">
          {metadata?.showSmartUpdateInfo && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-3 m-3 flex items-center">
              <span className="mr-2"><SparklesIcon size={18} /></span>
              <div>
                <p className="font-medium">Smart Update Active</p>
                <p className="text-sm">Making targeted changes without rewriting the entire document for better performance and efficiency.</p>
              </div>
            </div>
          )}
          <iframe
            srcDoc={content}
            className="w-full h-full border-0"
            sandbox="allow-scripts"
          />
        </div>
      );
    }

    return (
      <div className="p-4 w-full flex flex-col">
        {metadata?.showSmartUpdateInfo && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-3 mb-3 flex items-center">
          <span className="mr-2"><SparklesIcon size={18} /></span>
          <div>
            <p className="font-medium">Smart Update Active</p>
            <p className="text-sm">Making targeted changes without rewriting the entire document for better performance and efficiency.</p>
          </div>
        </div>
      )}
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
  toolbar: [
    {
      icon: <SparklesIcon size={18} />,
      description: 'Use Smart Update',
      onClick: ({ appendMessage, setMetadata }) => {
        setMetadata((metadata: any) => ({
          ...metadata,
          showSmartUpdateInfo: true
        }));
        
        appendMessage({
          role: 'user',
          content: "When updating HTML documents, you can use the smart update feature by adding 'smart update' to your instruction. This feature makes targeted changes to specific parts of the HTML without rewriting the entire document.\n\nExamples:\n- 'Smart update: change the navigation bar background color to blue'\n- 'Smart update: add a new list item to the features section'\n- 'Smart update: remove the contact form'\n\nSmart updates are faster and more efficient, especially for large HTML documents or when making small changes."
        });
      }
    }
  ],
});
