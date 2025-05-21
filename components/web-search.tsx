'use client';

import { cn } from '@/lib/utils';
import { SearchIcon } from './icons';
import { Markdown } from './markdown';

interface WebSearchProps {
  searchResults: {
    search_query: string;
    timestamp: string;
    search_results: Array<{
      title: string;
      url: string;
      snippet: string;
      published_date: string;
    }>;
    extracted_contents: any[];
  };
}

export function WebSearch({ searchResults }: WebSearchProps) {
  const { search_query, timestamp, search_results } = searchResults;

  return (
    <div className="flex flex-col gap-4 rounded-2xl p-4 bg-secondary max-w-[700px]">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row gap-2 items-center">
          <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-secondary-foreground/10">
            <SearchIcon size={16} />
          </div>
          <div className="text-lg font-medium text-secondary-foreground">
            Web Search Results
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {new Date(timestamp).toLocaleString()}
        </div>
      </div>

      <div className="text-sm text-muted-foreground italic">
        Search query: &ldquo;{search_query}&rdquo;
      </div>
    </div>
  );
}
