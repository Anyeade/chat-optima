'use client';

import { cn } from '@/lib/utils';
import { ExternalLinkIcon } from './icons';

interface WebpageScreenshotProps {
  screenshotResults: {
    url: string;
    originalUrl?: string;
    timestamp: string;
    screenshotUrl: string;
    width: number;
    analysis?: string;
  };
}

export function WebpageScreenshot({ screenshotResults }: WebpageScreenshotProps) {
  // Add null checks and default values
  const { 
    url = '', 
    originalUrl,
    timestamp = new Date().toISOString(), 
    screenshotUrl = '', 
    width = 640, 
    analysis = '' 
  } = screenshotResults || {};

  // Use original URL for display if available, otherwise use the cleaned URL
  const displayUrl = originalUrl || url;

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
        </div>        <div className="text-xs text-muted-foreground">
          {timestamp ? new Date(timestamp).toLocaleString() : 'Unknown date'}
        </div>
      </div>      <div className="text-sm text-muted-foreground">
        <a href={displayUrl} target="_blank" rel="noopener noreferrer" className="underline">
          {displayUrl}
        </a>
      </div>

      <div className="overflow-hidden rounded-md border">
        <a href={displayUrl} target="_blank" rel="noopener noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={screenshotUrl} 
            alt={`Screenshot of ${displayUrl}`}className={cn(
              "w-full object-cover",
              {
                "max-w-[320px]": width === 320,
                "max-w-[640px]": width === 640 || (width > 320 && width < 1024),
                "max-w-[1024px]": width === 1024 || width > 1024,
                "max-w-full": !width
              }
            )}/>
        </a>
      </div>
      
      {analysis && (
        <div className="text-sm text-secondary-foreground mt-2 p-3 bg-secondary-foreground/5 rounded-md">
          <div className="font-medium mb-1">AI Analysis:</div>
          <div className="whitespace-pre-wrap">{analysis}</div>
        </div>
      )}
    </div>
  );
}
