import { memo } from 'react';

import type { ArtifactKind } from './artifact';
import { FileIcon, LoaderIcon, MessageIcon, PencilEditIcon, EyeIcon } from './icons';
import { toast } from 'sonner';
import { useArtifact } from '@/hooks/use-artifact';

const getActionText = (
  type: 'create' | 'update' | 'request-suggestions' | 'read' | 'apply-diff',
  tense: 'present' | 'past',
) => {
  switch (type) {
    case 'create':
      return tense === 'present' ? 'Creating' : 'Created';
    case 'update':
      return tense === 'present' ? 'Updating' : 'Updated';
    case 'request-suggestions':
      return tense === 'present'
        ? 'Adding suggestions'
        : 'Added suggestions to';
    case 'read':
      return tense === 'present' ? 'Reading' : 'Read';
    case 'apply-diff':
      return tense === 'present' ? 'Applying diff to' : 'Applied diff to';
    default:
      return null;
  }
};

interface DocumentToolResultProps {
  type: 'create' | 'update' | 'request-suggestions' | 'read' | 'apply-diff';
  result: {
    id: string;
    title: string;
    kind: ArtifactKind;
    analysis?: string;
    focus?: string;
    summary?: string;
    error?: string;
  };
  isError?: boolean;
  isReadonly: boolean;
}

function PureDocumentToolResult({
  type,
  result,
  isError,
  isReadonly,
}: DocumentToolResultProps) {
  const { setArtifact } = useArtifact();

  return (
    <div className="w-full">
      <button
        type="button"
        className="bg-background cursor-pointer border py-2 px-3 rounded-xl w-fit flex flex-row gap-3 items-start"
        onClick={(event) => {
          if (isReadonly) {
            toast.error(
              'Viewing files in shared chats is currently not supported.',
            );
            return;
          }

          if (isError || result.error) {
            return; // Don't open artifact for errors
          }

          const rect = event.currentTarget.getBoundingClientRect();

          const boundingBox = {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          };

          setArtifact({
            documentId: result.id,
            kind: result.kind,
            content: '',
            title: result.title,
            isVisible: true,
            status: 'idle',
            boundingBox,
          });
        }}
      >
        <div className="text-muted-foreground mt-1">
          {type === 'create' ? (
            <FileIcon />
          ) : type === 'update' ? (
            <PencilEditIcon />
          ) : type === 'request-suggestions' ? (
            <MessageIcon />
          ) : type === 'read' ? (
            <EyeIcon />
          ) : type === 'apply-diff' ? (
            <PencilEditIcon />
          ) : null}
        </div>
        <div className="text-left">
          {isError || result.error ? (
            <span className="text-red-600">
              Error: {result.error || 'Unknown error'}
            </span>
          ) : (
            `${getActionText(type, 'past')} "${result.title}"`
          )}
        </div>
      </button>

      {/* Additional content for specific tool types */}
      {!isError && !result.error && (
        <>
          {type === 'read' && result.analysis && (
            <div className="mt-3 ml-6 text-sm text-gray-600">
              <div className="bg-gray-50 rounded-lg p-4 border max-w-2xl">
                <h4 className="text-sm font-medium text-gray-800 mb-3">📋 Document Analysis</h4>
                {result.focus && (
                  <div className="mb-3 text-xs text-blue-600 bg-blue-50 rounded px-2 py-1 inline-block">
                    Focus: {result.focus}
                  </div>
                )}
                <div className="text-xs whitespace-pre-wrap text-gray-700 leading-relaxed max-h-60 overflow-y-auto">
                  {result.analysis}
                </div>
              </div>
            </div>
          )}
          
          {type === 'apply-diff' && result.summary && (
            <div className="mt-3 ml-6 text-sm text-gray-600">
              <div className="bg-green-50 rounded-lg p-3 border border-green-200 max-w-2xl">
                <div className="text-xs text-green-700">
                  ✅ {result.summary}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export const DocumentToolResult = memo(PureDocumentToolResult, () => true);

interface DocumentToolCallProps {
  type: 'create' | 'update' | 'request-suggestions' | 'read' | 'apply-diff';
  args: { title: string };
  isReadonly: boolean;
}

function PureDocumentToolCall({
  type,
  args,
  isReadonly,
}: DocumentToolCallProps) {
  const { setArtifact } = useArtifact();

  return (
    <button
      type="button"
      className="cursor pointer w-fit border py-2 px-3 rounded-xl flex flex-row items-start justify-between gap-3"
      onClick={(event) => {
        if (isReadonly) {
          toast.error(
            'Viewing files in shared chats is currently not supported.',
          );
          return;
        }

        const rect = event.currentTarget.getBoundingClientRect();

        const boundingBox = {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        };

        setArtifact((currentArtifact) => ({
          ...currentArtifact,
          isVisible: true,
          boundingBox,
        }));
      }}
    >
      <div className="flex flex-row gap-3 items-start">
        <div className="text-zinc-500 mt-1">
          {type === 'create' ? (
            <FileIcon />
          ) : type === 'update' ? (
            <PencilEditIcon />
          ) : type === 'request-suggestions' ? (
            <MessageIcon />
          ) : type === 'read' ? (
            <EyeIcon />
          ) : type === 'apply-diff' ? (
            <PencilEditIcon />
          ) : null}
        </div>

        <div className="text-left">
          {`${getActionText(type, 'present')} ${args.title ? `"${args.title}"` : ''}`}
        </div>
      </div>

      <div className="animate-spin mt-1">{<LoaderIcon />}</div>
    </button>
  );
}

export const DocumentToolCall = memo(PureDocumentToolCall, () => true);
