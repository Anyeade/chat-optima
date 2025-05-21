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
} from '@/components/icons';
import { useEffect, useRef, useState } from 'react';

// We'll load Mermaid dynamically to avoid SSR issues

function MermaidPreview({ content }: { content: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mermaid, setMermaid] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load Mermaid from CDN
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@11.6.0/dist/mermaid.min.js';
    script.async = true;
    script.onload = () => {
      setTimeout(() => {
        const mermaidApi = (window as any).mermaid;
        if (mermaidApi) {
          mermaidApi.initialize({
            startOnLoad: false,
            theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default',
            securityLevel: 'loose',
            fontFamily: 'inherit',
            logLevel: 'error',
            htmlLabels: true
          });
          setMermaid(mermaidApi);
          setIsLoading(false);
        }
      }, 100); // Small delay to ensure Mermaid is fully loaded
    };
    document.body.appendChild(script);
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || !mermaid || isLoading) return;

    const render = async () => {
      try {
        // Use a random ID to prevent conflicts with multiple diagrams
        const id = 'diagram-' + Math.random().toString(36).substr(2, 9);
        const { svg } = await mermaid.render(id, content);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (error) {
        console.error('Failed to render diagram:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="p-4 text-red-500 dark:text-red-400">
              <p class="font-medium">Failed to render diagram</p>
              <pre class="mt-2 text-sm overflow-auto">${error instanceof Error ? error.message : String(error)}</pre>
            </div>
          `;
        }
      }
    };

    render();
  }, [content]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="animate-pulse text-sm text-gray-500">Loading Mermaid...</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="max-w-full overflow-auto" />
  );
}

interface DiagramArtifactMetadata {
  isPreview: boolean;
}

export const diagramArtifact = new Artifact<'diagram', DiagramArtifactMetadata>({
  kind: 'diagram',
  description: 'Useful for creating Mermaid diagrams (flowcharts, sequence diagrams, etc).',
  initialize: async ({ setMetadata }) => {
    setMetadata((currentMetadata) => ({
      isPreview: false,
    }));
  },
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === 'diagram-delta') {
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
      return <DocumentSkeleton artifactKind="diagram" />;
    }

    if (mode === 'diff') {
      const oldContent = getDocumentContentById(currentVersionIndex - 1);
      const newContent = getDocumentContentById(currentVersionIndex);

      return <DiffView oldContent={oldContent} newContent={newContent} />;
    }

    if (metadata?.isPreview) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-white dark:bg-zinc-900">
          <div className="w-full max-w-3xl">
            <MermaidPreview content={content} />
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 w-full">
        <CodeEditor
          content={content}
          language="mermaid"
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
