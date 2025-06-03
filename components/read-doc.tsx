import { memo } from 'react';
import { FileIcon, LoaderIcon, PencilEditIcon } from './icons';
import { toast } from 'sonner';
import { useArtifact } from '@/hooks/use-artifact';
import type { ArtifactKind } from './artifact';

const getReadDocActionText = (
  action: 'read' | 'modify',
  tense: 'present' | 'past',
) => {
  switch (action) {
    case 'read':
      return tense === 'present' ? 'Reading' : 'Read';
    case 'modify':
      return tense === 'present' ? 'Modifying' : 'Modified';
    default:
      return null;
  }
};

interface ReadDocToolResultProps {
  action: 'read' | 'modify';
  result: { 
    id: string; 
    title: string; 
    kind: ArtifactKind;
    content?: string;
    analysis?: any;
    changes?: string;
  };
  isReadonly: boolean;
}

function PureReadDocToolResult({
  action,
  result,
  isReadonly,
}: ReadDocToolResultProps) {
  const { setArtifact } = useArtifact();

  const handleClick = (event: React.MouseEvent) => {
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

    setArtifact({
      documentId: result.id,
      kind: result.kind,
      content: result.content || '',
      title: result.title,
      isVisible: true,
      status: 'idle',
      boundingBox,
    });
  };

  return (
    <div className="w-full">
      <button
        type="button"
        className="bg-background cursor-pointer border py-2 px-3 rounded-xl w-fit flex flex-row gap-3 items-start"
        onClick={handleClick}
      >
        <div className="text-muted-foreground mt-1">
          {action === 'read' ? <FileIcon /> : <PencilEditIcon />}
        </div>
        <div className="text-left">
          <div className="font-medium">
            {`${getReadDocActionText(action, 'past')} "${result.title}"`}
          </div>
          {result.analysis && (
            <div className="text-sm text-muted-foreground mt-1">
              {result.analysis.lineCount} lines • {result.analysis.wordCount} words
            </div>
          )}
          {result.changes && (
            <div className="text-sm text-green-600 dark:text-green-400 mt-1">
              {result.changes}
            </div>
          )}
        </div>
      </button>
    </div>
  );
}

export const ReadDocToolResult = memo(PureReadDocToolResult, () => true);

interface ReadDocToolCallProps {
  action: 'read' | 'modify';
  args: { 
    id: string;
    instructions?: string;
  };
  isReadonly: boolean;
}

function PureReadDocToolCall({
  action,
  args,
  isReadonly,
}: ReadDocToolCallProps) {
  const { setArtifact } = useArtifact();

  const handleClick = (event: React.MouseEvent) => {
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
  };

  return (
    <div className="w-full">
      <button
        type="button"
        className="cursor-pointer w-fit border py-2 px-3 rounded-xl flex flex-row items-start justify-between gap-3"
        onClick={handleClick}
      >
        <div className="flex flex-row gap-3 items-start">
          <div className="text-zinc-500 mt-1">
            {action === 'read' ? <FileIcon /> : <PencilEditIcon />}
          </div>

          <div className="text-left">
            <div className="font-medium">
              {`${getReadDocActionText(action, 'present')} document`}
            </div>
            {args.instructions && (
              <div className="text-sm text-muted-foreground mt-1">
                {args.instructions.length > 50 
                  ? `${args.instructions.substring(0, 50)}...` 
                  : args.instructions}
              </div>
            )}
          </div>
        </div>

        <div className="animate-spin mt-1">
          <LoaderIcon />
        </div>
      </button>
    </div>
  );
}

export const ReadDocToolCall = memo(PureReadDocToolCall, () => true);

// Document analysis display component
interface DocumentAnalysisProps {
  analysis: {
    title: string;
    kind: string;
    lineCount: number;
    wordCount: number;
    preview: string;
  };
}

export function DocumentAnalysis({ analysis }: DocumentAnalysisProps) {
  return (
    <div className="bg-muted border rounded-lg p-4 my-2">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-muted-foreground">
          <FileIcon />
        </div>
        <span className="font-medium">Document Analysis</span>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Title:</span>
          <span className="font-medium">{analysis.title}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Type:</span>
          <span className="font-medium capitalize">{analysis.kind}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Lines:</span>
          <span className="font-medium">{analysis.lineCount}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Words:</span>
          <span className="font-medium">{analysis.wordCount}</span>
        </div>
        
        {analysis.preview && (
          <div className="mt-3 pt-2 border-t">
            <div className="text-muted-foreground text-xs mb-1">Preview:</div>
            <div className="text-xs bg-background p-2 rounded border font-mono">
              {analysis.preview}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
