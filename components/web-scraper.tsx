'use client';

import { ExternalLinkIcon } from './icons';

interface WebScraperProps {
  scrapedResults: {
    url: string;
    timestamp: string;
    selector: string;
    attribute?: string;
    results: string[];
    count: number;
  };
}

export function WebScraper({ scrapedResults }: WebScraperProps) {
  // Add null checks and default values
  const { 
    url = '', 
    timestamp = new Date().toISOString(), 
    selector = '', 
    attribute = 'textContent',
    results = [],
    count = 0
  } = scrapedResults || {};

  return (
    <div className="flex flex-col gap-4 rounded-2xl p-4 bg-secondary max-w-[700px]">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row gap-2 items-center">
          <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-secondary-foreground/10">
            <ExternalLinkIcon size={16} />
          </div>
          <div className="text-lg font-medium text-secondary-foreground">
            Scraped Content
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {timestamp ? new Date(timestamp).toLocaleString() : 'Unknown date'}
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
          {url}
        </a>
      </div>
      
      <div className="text-sm text-muted-foreground">
        <span className="font-medium">Selector:</span> {selector} 
        {attribute !== 'textContent' && <span> (attribute: {attribute})</span>}
      </div>

      <div className="text-sm text-muted-foreground">
        <span className="font-medium">Results found:</span> {count}
      </div>
      
      {results.length > 0 ? (
        <div className="overflow-auto max-h-[400px] rounded-md border p-3 bg-secondary-foreground/5">
          <ul className="list-disc pl-5 space-y-2">
            {results.map((item, index) => (
              <li key={index} className="text-sm">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground italic">
          No results found for the given selector.
        </div>
      )}
    </div>
  );
}
