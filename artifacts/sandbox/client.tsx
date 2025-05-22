import React, { useEffect, useRef, useState } from 'react';
import { Artifact } from '@/components/create-artifact';
import { DocumentSkeleton } from '@/components/document-skeleton';

const SandboxContent = ({ content, isLoading }: { content: string; isLoading: boolean }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isStackblitz, setIsStackblitz] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsStackblitz(false);
    setLoading(true);
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const form = doc.querySelector('form[action="https://stackblitz.com/run"]');
    if (!form) {
      setIsStackblitz(false);
      setLoading(false);
      return;
    }
    setIsStackblitz(true);
    // Create a new form to submit to the iframe
    const newForm = document.createElement('form');
    newForm.method = 'POST';
    newForm.action = 'https://stackblitz.com/run';
    newForm.target = 'stackblitz-embed';
    // Copy all input fields from the AI's form
    form.querySelectorAll('input').forEach(input => {
      const clone = (input.cloneNode() as HTMLInputElement);
      clone.value = (input as HTMLInputElement).value;
      newForm.appendChild(clone);
    });
    document.body.appendChild(newForm);
    newForm.submit();
    document.body.removeChild(newForm);
    // Show loading until iframe loads
    const handleLoad = () => setLoading(false);
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleLoad);
      return () => iframe.removeEventListener('load', handleLoad);
    }
  }, [content]);

  if (isLoading) {
    return <DocumentSkeleton artifactKind="sandbox" />;
  }

  if (isStackblitz) {
    return (
      <div className="w-full h-full">
        {loading && (
          <div className="flex items-center justify-center h-32 text-muted-foreground">Loading StackBlitz project...</div>
        )}
        <iframe
          ref={iframeRef}
          name="stackblitz-embed"
          style={{ width: '100%', height: '600px', border: 'none', display: loading ? 'none' : 'block' }}
          title="StackBlitz Project"
        />
      </div>
    );
  }

  // Fallback: render raw HTML if not a StackBlitz form
  return (
    <div className="p-4 w-full">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export const sandboxArtifact = new Artifact<'sandbox', {}>({
  kind: 'sandbox',
  description: 'Create and run JavaScript web applications using StackBlitz POST API (embedded)',
  initialize: async () => {},
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === 'sandbox-delta' as any) {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.content as string,
        isVisible: true,
        status: 'streaming',
      }));
    }
  },
  content: ({ content, isLoading }) => <SandboxContent content={content} isLoading={isLoading} />,
  actions: [],
  toolbar: [],
});
