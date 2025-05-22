import React, { useEffect, useRef, useState } from 'react';
import { Artifact } from '@/components/create-artifact';
import { DocumentSkeleton } from '@/components/document-skeleton';
import { WebContainer, auth } from '@webcontainer/api';
import { extractFirstJsonObject } from '@/lib/utils';

const CLIENT_ID = 'wc_api_hansade2005_b1004f8ae7e02690531ba4f46afb9a52';

let authInitialized = false;
let webcontainerInstance: WebContainer | null = null;

// Expecting content to be a JSON string: { files: { 'index.js': '...', ... }, ... }
const SandboxContent = ({ content, isLoading }: { content: string; isLoading: boolean }) => {
  const [output, setOutput] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let unmounted = false;
    setOutput('');
    setPreviewUrl(null);
    setLoading(true);
    setError(null);

    const run = async () => {
      try {
        console.log('Sandbox: Starting run()');
        if (!authInitialized) {
          await auth.init({ clientId: CLIENT_ID, scope: '' });
          authInitialized = true;
          console.log('Sandbox: Auth initialized');
        }
        // Only boot if not already booted
        if (!webcontainerInstance) {
          webcontainerInstance = await WebContainer.boot();
          console.log('Sandbox: WebContainer booted');
        }
        // Parse files from content
        let files: Record<string, string | { content: string }> = {};
        try {
          // Debug log
          console.log('Sandbox: Raw AI content:', content);
          // Remove code block markers if present
          let cleanContent = content.trim();
          if (cleanContent.startsWith('```json')) {
            cleanContent = cleanContent.replace(/^```json/, '').replace(/```$/, '').trim();
          } else if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/^```/, '').replace(/```$/, '').trim();
          }
          // Use robust JSON extraction
          const parsed = extractFirstJsonObject(cleanContent);
          console.log('Sandbox: Parsed AI content:', parsed);
          if (!parsed.files || typeof parsed.files !== 'object') {
            throw new Error('Missing or invalid files property');
          }
          files = parsed.files;
          console.log('Sandbox: Files object:', files);
        } catch (e) {
          setError('Invalid project file format.');
          setLoading(false);
          console.log('Sandbox: Error parsing AI content', e);
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
        console.log('Sandbox: FileSystemTree:', tree);
        // Mount files
        console.log('Sandbox: Mounting files...');
        await webcontainerInstance.mount(tree);
        console.log('Sandbox: Files mounted');
        // Install dependencies
        console.log('Sandbox: Installing dependencies...');
        const install = await webcontainerInstance.spawn('npm', ['install']);
        install.output.pipeTo(new WritableStream({
          write(data) {
            if (!unmounted) setOutput(prev => prev + data);
          }
        }));
        await install.exit;
        console.log('Sandbox: Dependencies installed');
        // Start dev server
        console.log('Sandbox: Starting dev server...');
        const server = await webcontainerInstance.spawn('npm', ['run', 'dev']);
        server.output.pipeTo(new WritableStream({
          write(data) {
            if (!unmounted) setOutput(prev => prev + data);
          }
        }));
        webcontainerInstance.on('server-ready', (port, url) => {
          if (!unmounted) {
            setPreviewUrl(url);
            setLoading(false);
            console.log('Sandbox: Dev server ready at', url);
          }
        });
      } catch (e: any) {
        setError(e?.message || 'Failed to start WebContainer.');
        setLoading(false);
        console.log('Sandbox: Error in run()', e);
      }
    };
    run();
    return () => {
      unmounted = true;
      // Optionally: webcontainerInstance?.teardown();
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
