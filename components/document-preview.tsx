'use client';

import {
  memo,
  type MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import type { ArtifactKind, UIArtifact } from './artifact';
import { FileIcon, FullscreenIcon, ImageIcon, LoaderIcon } from './icons';
import { cn, fetcher } from '@/lib/utils';
import type { Document } from '@/lib/db/schema';
import { InlineDocumentSkeleton } from './document-skeleton';
import useSWR from 'swr';
import { Editor } from './text-editor';
import { DocumentToolCall, DocumentToolResult } from './document';
import { CodeEditor } from './code-editor';
import { useArtifact } from '@/hooks/use-artifact';
import equal from 'fast-deep-equal';
import { SpreadsheetEditor } from './sheet-editor';
import { ImageEditor } from './image-editor';

interface DocumentPreviewProps {
  isReadonly: boolean;
  result?: any;
  args?: any;
}

export function DocumentPreview({
  isReadonly,
  result,
  args,
}: DocumentPreviewProps) {
  const { artifact, setArtifact } = useArtifact();

  const { data: documents, isLoading: isDocumentsFetching } = useSWR<
    Array<Document>
  >(result ? `/api/document?id=${result.id}` : null, fetcher);

  const previewDocument = useMemo(() => documents?.[0], [documents]);
  const hitboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const boundingBox = hitboxRef.current?.getBoundingClientRect();

    if (artifact.documentId && boundingBox) {
      setArtifact((artifact) => ({
        ...artifact,
        boundingBox: {
          left: boundingBox.x,
          top: boundingBox.y,
          width: boundingBox.width,
          height: boundingBox.height,
        },
      }));
    }
  }, [artifact.documentId, setArtifact]);

  if (artifact.isVisible) {
    if (result) {
      return (
        <DocumentToolResult
          type="create"
          result={{ id: result.id, title: result.title, kind: result.kind }}
          isReadonly={isReadonly}
        />
      );
    }

    if (args) {
      return (
        <DocumentToolCall
          type="create"
          args={{ title: args.title }}
          isReadonly={isReadonly}
        />
      );
    }
  }

  if (isDocumentsFetching) {
    return <LoadingSkeleton artifactKind={result.kind ?? args.kind} />;
  }

  const document: Document | null = previewDocument
    ? previewDocument
    : artifact.status === 'streaming'
      ? {
          title: artifact.title,
          kind: artifact.kind,
          content: artifact.content,
          id: artifact.documentId,
          createdAt: new Date(),
          userId: 'noop',
        }
      : null;

  if (!document) return <LoadingSkeleton artifactKind={artifact.kind} />;

  return (
    <div className="relative w-full cursor-pointer max-w-full overflow-hidden flex flex-col">
      <HitboxLayer
        hitboxRef={hitboxRef}
        result={result}
        setArtifact={setArtifact}
      />
      <DocumentHeader
        title={document.title}
        kind={document.kind}
        isStreaming={artifact.status === 'streaming'}
      />
      <DocumentContent document={document} />
    </div>
  );
}

const LoadingSkeleton = ({ artifactKind }: { artifactKind: ArtifactKind }) => (
  <div className="w-full">
    <div className="p-3 sm:p-4 border rounded-t-2xl flex flex-row gap-2 items-center justify-between dark:bg-muted h-[53px] sm:h-[57px] dark:border-zinc-700 border-b-0">
      <div className="flex flex-row items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <div className="text-muted-foreground">
          <div className="animate-pulse rounded-md size-4 bg-muted-foreground/20" />
        </div>
        <div className="animate-pulse rounded-lg h-3 sm:h-4 bg-muted-foreground/20 w-20 sm:w-24" />
      </div>
      <div>
        <FullscreenIcon />
      </div>
    </div>
    {artifactKind === 'image' ? (
      <div className="overflow-y-auto overflow-x-hidden border rounded-b-2xl bg-muted border-t-0 dark:border-zinc-700">
        <div className="animate-pulse h-[200px] sm:h-[257px] bg-muted-foreground/20 w-full" />
      </div>
    ) : (
      <div className="overflow-y-auto overflow-x-hidden border rounded-b-2xl p-4 pt-4 bg-muted border-t-0 dark:border-zinc-700">
        <InlineDocumentSkeleton />
      </div>
    )}
  </div>
);

const PureHitboxLayer = ({
  hitboxRef,
  result,
  setArtifact,
}: {
  hitboxRef: React.RefObject<HTMLDivElement>;
  result: any;
  setArtifact: (
    updaterFn: UIArtifact | ((currentArtifact: UIArtifact) => UIArtifact),
  ) => void;
}) => {
  const handleClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      const boundingBox = event.currentTarget.getBoundingClientRect();

      setArtifact((artifact) =>
        artifact.status === 'streaming'
          ? { ...artifact, isVisible: !artifact.isVisible }
          : {
              ...artifact,
              title: result.title,
              documentId: result.id,
              kind: result.kind,
              isVisible: !artifact.isVisible,
              boundingBox: {
                left: boundingBox.x,
                top: boundingBox.y,
                width: boundingBox.width,
                height: boundingBox.height,
              },
            },
      );
    },
    [setArtifact, result],
  );

  return (
    <div
      className="size-full absolute top-0 left-0 rounded-xl z-10"
      ref={hitboxRef}
      onClick={handleClick}
      role="presentation"
      aria-hidden="true"
    >
      <div className="w-full p-3 sm:p-4 flex justify-end items-center">
        <div className="absolute right-[7px] sm:right-[9px] top-[11px] sm:top-[13px] p-1.5 sm:p-2 hover:dark:bg-zinc-700 rounded-md hover:bg-zinc-100">
          <FullscreenIcon />
        </div>
      </div>
    </div>
  );
};

const HitboxLayer = memo(PureHitboxLayer, (prevProps, nextProps) => {
  if (!equal(prevProps.result, nextProps.result)) return false;
  return true;
});

const PureDocumentHeader = ({
  title,
  kind,
  isStreaming,
}: {
  title: string;
  kind: ArtifactKind;
  isStreaming: boolean;
}) => (
  <div className="p-3 sm:p-4 border rounded-t-2xl flex flex-row gap-2 items-start sm:items-center justify-between dark:bg-muted border-b-0 dark:border-zinc-700 overflow-hidden">
    <div className="flex flex-row items-start sm:items-center gap-2 sm:gap-3 min-w-0 flex-1 overflow-hidden">
      <div className="text-muted-foreground flex-shrink-0">
        {isStreaming ? (
          <div className="animate-spin">
            <LoaderIcon />
          </div>
        ) : kind === 'image' ? (
          <ImageIcon />
        ) : (
          <FileIcon />
        )}
      </div>
      <div className="font-medium text-sm sm:text-base truncate max-w-[calc(100%-40px)]">{title}</div>
    </div>
    <div className="w-6 sm:w-8 flex-shrink-0" />
  </div>
);

const DocumentHeader = memo(PureDocumentHeader, (prevProps, nextProps) => {
  if (prevProps.title !== nextProps.title) return false;
  if (prevProps.isStreaming !== nextProps.isStreaming) return false;

  return true;
});

const DocumentContent = ({ document }: { document: Document }) => {
  const { artifact } = useArtifact();

  const containerClassName = cn(
    'min-h-[200px] h-[257px] overflow-y-auto overflow-x-hidden border rounded-b-2xl dark:bg-muted border-t-0 dark:border-zinc-700 w-full max-w-full',
    {
      'p-2 sm:p-4 sm:px-8 sm:py-12': document.kind === 'text',
      'p-0': document.kind === 'code',
    },
  );

  const commonProps = {
    content: document.content ?? '',
    isCurrentVersion: true,
    currentVersionIndex: 0,
    status: artifact.status,
    saveContent: () => {},
    suggestions: [],
  };
  return (
    <div className={containerClassName}>
      {document.kind === 'text' ? (
        <div className="w-full max-w-full overflow-hidden">
          <Editor {...commonProps} onSaveContent={() => {}} />
        </div>
      ) : document.kind === 'code' ? (
        <div className="flex flex-1 relative w-full max-w-full overflow-hidden">
          <div className="absolute inset-0 overflow-y-auto overflow-x-hidden">
            <CodeEditor {...commonProps} onSaveContent={() => {}} />
          </div>
        </div>
      ) : document.kind === 'sheet' ? (
        <div className="flex flex-1 relative w-full h-full p-2 sm:p-4 overflow-hidden">
          <div className="absolute inset-2 sm:inset-4 overflow-y-auto overflow-x-hidden">
            <SpreadsheetEditor {...commonProps} />
          </div>
        </div>      ) : document.kind === 'image' ? (
        <div className="w-full h-full flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <div className="max-w-full max-h-full overflow-y-auto overflow-x-hidden">
            <ImageEditor
              title={document.title}
              content={document.content ?? ''}
              isCurrentVersion={true}
              currentVersionIndex={0}
              status={artifact.status}
              isInline={true}
            />
          </div>
        </div>
      ) : document.kind === 'html' ? (
        <div className="w-full h-full">
          <iframe
            srcDoc={`
              <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                  <style>
                    body {
                      margin: 0;
                      padding: 0;
                      width: 100%;
                      height: 100%;
                      overflow-x: hidden;
                    }
                    * {
                      box-sizing: border-box;
                      max-width: 100%;
                    }
                    img, video, iframe, table {
                      max-width: 100%;
                      height: auto;
                    }
                  </style>
                </head>
                <body>${document.content ?? ''}</body>
              </html>
            `}
            className="w-full h-full border-0 min-h-[200px]"
            sandbox="allow-scripts"
          />
        </div>
      ) : null}
    </div>
  );
};
