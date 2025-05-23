'use client';

import { cn } from '@/lib/utils';
import { ExternalLinkIcon } from './icons';

interface WebpageScreenshotProps {
  screenshotResults: {
    url: string;
    timestamp: string;
    screenshotUrl: string;
    width: number;
    pageType?: string;
    instructionsForAI?: string;
    analysisStructure?: {
      visualElements?: string;
      layout?: string;
      contentSummary?: string;
      userExperience?: string;
      keyFeatures?: string;
    };
  };
}

export function WebpageScreenshot({ screenshotResults }: WebpageScreenshotProps) {
  const { url, timestamp, screenshotUrl, width } = screenshotResults;

  return (
    <div className="flex flex-col gap-4 rounded-2xl p-4 bg-secondary max-w-[700px]">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row gap-2 items-center">
          <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-secondary-foreground/10">
            <ExternalLinkIcon size={16} />
          </div>
          <div className="text-lg font-medium text-secondary-foreground">
            Website Screenshot
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {new Date(timestamp).toLocaleString()}
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
          {url}
        </a>
      </div>

      <div className="overflow-hidden rounded-md border">
        <a href={url} target="_blank" rel="noopener noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={screenshotUrl} 
            alt={`Screenshot of ${url}`} 
            className={cn(
              "w-full object-cover",
              {
                "max-w-[320px]": width === 320,
                "max-w-[640px]": width === 640,
                "max-w-[1024px]": width === 1024,
              }
            )}
          />
        </a>
      </div>
    </div>
  );
}
