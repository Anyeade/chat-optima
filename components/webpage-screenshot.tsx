'use client';

import { cn } from '@/lib/utils';
import { ImageIcon } from './icons';
import { Attachment } from 'ai';

interface WebpageScreenshotProps {
  attachment?: Attachment;
  result?: any; // Can be an Attachment or any other format returned by the tool
}

export function WebpageScreenshot({ attachment, result }: WebpageScreenshotProps) {
  // Handle both direct attachment and result from tool
  // The result might be the attachment itself or might contain the attachment
  let data = attachment || result;
  
  // If result is an object that contains an attachment property, use that
  if (result && typeof result === 'object' && 'attachment' in result) {
    data = result.attachment;
  }
  
  // Extract URL and name, with fallbacks
  const url = data?.url || (typeof data === 'string' ? data : undefined);
  const name = data?.name || 'Screenshot';
  
  // Log for debugging
  console.log("WebpageScreenshot component received:", { attachment, result, data, url, name });
  
  const timestamp = new Date().toLocaleString(); // Using current time as timestamp

  return (
    <div className="flex flex-col gap-4 rounded-2xl p-4 bg-secondary max-w-[700px]">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row gap-2 items-center">
          <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-secondary-foreground/10">
            <ImageIcon size={16} />
          </div>
          <div className="text-lg font-medium text-secondary-foreground">
            Webpage Screenshot
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {timestamp}
        </div>
      </div>      {url ? (
        <div className="overflow-hidden rounded-md border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={url} 
            alt="Webpage Screenshot" 
            className="w-full object-cover"
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-border p-4 text-center text-muted-foreground">
          Screenshot unavailable
        </div>
      )}
      
      <div className="text-sm text-muted-foreground italic">
        {name ? (
          name.startsWith('screenshot-') 
            ? name.replace('screenshot-', '').replace(/\.\w+$/, '') 
            : name
        ) : (
          "Screenshot"
        )}
      </div>
    </div>
  );
}
