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
  SparklesIcon,
  MessageIcon
} from '@/components/icons';
import type { Suggestion } from '@/lib/db/schema';

interface HTMLArtifactMetadata {
  showPreview: boolean;
  showSmartUpdateInfo: boolean;
  suggestions: Array<Suggestion>;
}

export const htmlArtifact = new Artifact<'html', HTMLArtifactMetadata>({
  kind: 'html',
  description: 'Useful for creating HTML documents with CSS and JavaScript.',  initialize: async ({ setMetadata }) => {
    setMetadata((currentMetadata) => ({
      showPreview: false,
      showSmartUpdateInfo: false,
      suggestions: []
    }));
  },  onStreamPart: ({ streamPart, setArtifact, setMetadata }) => {
    if (streamPart.type === 'html-delta') {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.content as string,
        isVisible: true,
        status: 'streaming',
      }));
    }
    
    if (streamPart.type === 'suggestion') {
      // Add the suggestion to metadata when it comes through the stream
      setMetadata((metadata) => ({
        ...metadata,
        suggestions: [
          ...metadata.suggestions,
          streamPart.content as Suggestion
        ],
        showSmartUpdateInfo: true
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
        <div className="w-full h-full flex flex-col">          {metadata?.showSmartUpdateInfo && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-3 m-3 flex items-center">
              <span className="mr-2"><MessageIcon size={18} /></span>
              <div>
                <p className="font-medium">Code Updates Available</p>
                <p className="text-sm">Interactive code updates have been added to the code view. Switch to code view to see and apply them.</p>
              </div>
            </div>
          )}          <iframe
            srcDoc={`
              <!DOCTYPE html>
              <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
                  <style>
                    body { max-width: 100%; overflow-x: hidden; }
                    img { max-width: 100%; height: auto; }
                    pre { overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; }
                    table { width: 100%; overflow-x: auto; display: block; }
                  </style>
                  ${content.includes('<head>') ? 
                    content.replace('<head>', '<head><meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">') : 
                    content}
                </head>
              </html>
            `.replace('<!DOCTYPE html>', '').replace('<html>', '').replace('</html>', '')}
            className="w-full h-full border-0 max-w-full"
            style={{ width: '100%', maxWidth: '100vw' }}
            sandbox="allow-scripts"
          />
        </div>
      );
    }

    return (
      <div className="p-2 sm:p-4 w-full flex flex-col max-w-[100vw] overflow-x-hidden">      {metadata?.showSmartUpdateInfo && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-3 mb-3 flex items-center">
          <span className="mr-2"><MessageIcon size={18} /></span>
          <div>
            <p className="font-medium">Code Updates Available ({metadata?.suggestions?.length || 0})</p>
            <p className="text-sm">Review and apply proposed changes by clicking on the message icons in the editor. Each suggestion can be applied independently.</p>
            {metadata?.suggestions && metadata?.suggestions.length > 0 && (              <div className="mt-1 flex flex-wrap gap-1">
                {(Array.from(new Set(metadata.suggestions.map(s => (s as any).type || 'general')))).map(type => (
                  <span key={type} className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    {(type as string).replace('-', ' ')}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}<CodeEditor
          content={content}
          language="html"
          onSaveContent={onSaveContent}
          isCurrentVersion={isCurrentVersion}
          suggestions={metadata?.suggestions || []}
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
  ],  toolbar: [
    {
      icon: <MessageIcon size={18} />,
      description: 'HTML Smart Mode',
      onClick: ({ appendMessage, setMetadata }) => {
        setMetadata((metadata: any) => ({
          ...metadata,
          showSmartUpdateInfo: true,
          suggestions: []
        }));
        
        appendMessage({
          role: 'user',
          content: "HTML Smart Mode activated! This enables AI-powered intelligent HTML editing through targeted updates and suggestions.\n\nYou can:\n\n• Request targeted additions: \"Add a sticky navigation bar with 5 menu items\"\n• Update specific elements: \"Change the hero section background to a gradient\"\n• Apply focused enhancements: \"Add ARIA labels to all interactive elements\"\n• Request general improvements: \"Make this page more responsive on mobile devices\"\n• Ask for specialized fixes: \"Fix any accessibility issues in this form\"\n\nHow it works:\n1. The AI analyzes your request and current HTML document\n2. It determines the most appropriate approach based on context\n3. It generates targeted suggestions you can review and apply selectively\n4. You keep full control of which changes to accept\n\nThis approach preserves your document structure while enabling precise updates to exactly where they're needed.\n\nWhat improvements would you like to make to your HTML?"
        });
      }
    }
  ],
});
