import React, { useEffect, useRef, useState } from 'react';
import { Artifact } from '@/components/create-artifact';
import { DocumentSkeleton } from '@/components/document-skeleton';
import { WebContainer, auth } from '@webcontainer/api';

const CLIENT_ID = 'wc_api_hansade2005_b1004f8ae7e02690531ba4f46afb9a52';

// Expecting content to be a JSON string: { files: { 'index.js': '...', ... }, ... }
const SandboxContent = ({ content, isLoading }: { content: string; isLoading: boolean }) => {
  const [output, setOutput] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let webcontainer: WebContainer | null = null;
    let unmounted = false;
    setOutput('');
    setPreviewUrl(null);
    setLoading(true);
    setError(null);

    const run = async () => {
      try {
        await auth.init({ clientId: CLIENT_ID, scope: '' });
        webcontainer = await WebContainer.boot();
        // Parse files from content
        let files: Record<string, string | { content: string }> = {};
        try {
          const parsed = JSON.parse(content);
          files = parsed.files || {};
        } catch (e) {
          setError('Invalid project file format.');
          setLoading(false);
          return;
        }
        // Build FileSystemTree
        const tree: any = {};
        Object.entries(files).forEach(([name, value]) => {
          if (typeof value === 'string') {
            tree[name] = { file: { contents: value } };
          } else if (value && typeof value === 'object' && typeof value.content === 'string') {
            tree[name] = { file: { contents: (value as { content: string }).content } };
          } else {
            // skip invalid file entry
          }
        });
        await webcontainer.mount(tree);
        // Install dependencies
        const install = await webcontainer.spawn('npm', ['install']);
        install.output.pipeTo(new WritableStream({
          write(data) {
            if (!unmounted) setOutput(prev => prev + data);
          }
        }));
        await install.exit;
        // Start dev server
        const server = await webcontainer.spawn('npm', ['run', 'dev']);
        server.output.pipeTo(new WritableStream({
          write(data) {
            if (!unmounted) setOutput(prev => prev + data);
          }
        }));
        webcontainer.on('server-ready', (port, url) => {
          if (!unmounted) {
            setPreviewUrl(url);
            setLoading(false);
          }
        });
      } catch (e: any) {
        setError(e?.message || 'Failed to start WebContainer.');
        setLoading(false);
      }
    };
    run();
    return () => {
      unmounted = true;
      // Optionally: webcontainer?.teardown();
    };
  }, [content]);

  if (isLoading || loading) {
    return <DocumentSkeleton artifactKind="sandbox" />;
  }
  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }
  return (
    <div>
      <pre className="bg-black text-white p-2 h-40 overflow-auto">{output}</pre>
      {previewUrl && (
        <iframe
          ref={iframeRef}
          src={previewUrl}
          style={{ width: '100%', height: 600, border: 'none' }}
          title="WebContainer Preview"
        />
      )}
    </div>
  );
};

export const sandboxArtifact = new Artifact<'sandbox', {}>({
  kind: 'sandbox',
  description: 'Create and run JavaScript web applications using WebContainer.io (in-browser Node.js runtime)',
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
