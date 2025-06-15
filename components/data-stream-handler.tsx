'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef } from 'react';
import { artifactDefinitions, type ArtifactKind } from './artifact';
import type { Suggestion } from '@/lib/db/schema';
import { initialArtifactData, useArtifact } from '@/hooks/use-artifact';

export type DataStreamDelta = {
  type:
    | 'text-delta'
    | 'code-delta'
    | 'sheet-delta'
    | 'image-delta'
    | 'html-delta'
    | 'svg-delta'
    | 'diagram-delta'
    | 'sandbox-delta'
    | 'video-generator-delta'
    | 'html-smart-update'
    | 'title'
    | 'id'
    | 'suggestion'
    | 'clear'
    | 'finish'
    | 'kind'
    | 'pexels-search-status'
    | 'pexels-search-results'
    | 'pexels-auto-images'
    | 'web-search-status'
    | 'web-search-results'
    | 'webpage-screenshot-status'
    | 'webpage-screenshot-result'
    | 'web-scraper-status'
    | 'web-scraper-result';
  content: string | Suggestion;
};

export function DataStreamHandler({ id }: { id: string }) {
  const { data: dataStream } = useChat({ id });
  const { artifact, setArtifact, setMetadata } = useArtifact();
  const lastProcessedIndex = useRef(-1);

  useEffect(() => {
    if (!dataStream?.length) return;

    const newDeltas = dataStream.slice(lastProcessedIndex.current + 1);
    lastProcessedIndex.current = dataStream.length - 1;

    (newDeltas as DataStreamDelta[]).forEach((delta: DataStreamDelta) => {
      const artifactDefinition = artifactDefinitions.find(
        (artifactDefinition) => artifactDefinition.kind === artifact.kind,
      );

      if (artifactDefinition?.onStreamPart) {
        artifactDefinition.onStreamPart({
          streamPart: delta,
          setArtifact,
          setMetadata,
        });
      }

      setArtifact((draftArtifact) => {
        if (!draftArtifact) {
          return { ...initialArtifactData, status: 'streaming' };
        }

        switch (delta.type) {
          case 'id':
            return {
              ...draftArtifact,
              documentId: delta.content as string,
              status: 'streaming',
            };

          case 'title':
            return {
              ...draftArtifact,
              title: delta.content as string,
              status: 'streaming',
            };

          case 'kind':
            return {
              ...draftArtifact,
              kind: delta.content as ArtifactKind,
              status: 'streaming',
            };

          case 'clear':
            return {
              ...draftArtifact,
              content: '',
              status: 'streaming',
            };

          case 'finish':
            return {
              ...draftArtifact,
              status: 'idle',
            };

          case 'pexels-search-status':
            return {
              ...draftArtifact,
              pexelsSearchStatus: delta.content as string,
              status: delta.content === 'searching-pexels' ? 'streaming' : draftArtifact.status,
            };

          case 'pexels-search-results':
            return {
              ...draftArtifact,
              pexelsSearchResults: delta.content as string,
            };

          case 'web-search-status':
            return {
              ...draftArtifact,
              webSearchStatus: delta.content as string,
              status: delta.content === 'searching-web' ? 'streaming' : draftArtifact.status,
            };

          case 'web-search-results':
            return {
              ...draftArtifact,
              webSearchResults: delta.content as string,
            };

          case 'webpage-screenshot-status':
            return {
              ...draftArtifact,
              webpageScreenshotStatus: delta.content as string,
              status: delta.content === 'taking-screenshot' ? 'streaming' : draftArtifact.status,
            };

          case 'webpage-screenshot-result':
            return {
              ...draftArtifact,
              webpageScreenshotResult: delta.content as string,
            };

          case 'web-scraper-status':
            return {
              ...draftArtifact,
              webScraperStatus: delta.content as string,
              status: delta.content === 'scraping-webpage' ? 'streaming' : draftArtifact.status,
            };

          case 'web-scraper-result':
            return {
              ...draftArtifact,
              webScraperResult: delta.content as string,
            };

          case 'video-generator-delta':
            return {
              ...draftArtifact,
              content: delta.content as string,
              status: 'streaming',
            };

          default:
            return draftArtifact;
        }
      });
    });
  }, [dataStream, setArtifact, setMetadata, artifact]);

  return null;
}
