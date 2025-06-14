'use client';

import { useState } from 'react';
import { ChevronDownIcon, LoaderIcon } from './icons';
import { motion, AnimatePresence } from 'framer-motion';
import { WebScraper } from './web-scraper';
import { ErrorBoundary, ToolErrorFallback } from './error-boundary';

interface MessageWebScraperProps {
  isLoading: boolean;
  scrapedResults: any;
  url?: string;
}

// Safe data validation function for web scraper results
function validateScrapedResults(results: any): { isValid: boolean; error?: string } {
  try {
    if (!results) {
      return { isValid: false, error: 'No scraped data provided.' };
    }
    if (results.error) {
      return { isValid: false, error: results.error };
    }
    if (typeof results !== 'object' || (!results.content && !results.result && !results.text)) {
      return { isValid: false, error: 'Malformed scraped data.' };
    }
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Failed to validate scraped results.' };
  }
}

export function MessageWebScraper({
  isLoading,
  scrapedResults,
  url,
}: MessageWebScraperProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const variants = {
    collapsed: {
      height: 0,
      opacity: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    expanded: {
      height: 'auto',
      opacity: 1,
      marginTop: '1rem',
      marginBottom: '0.5rem',
    },
  };

  const validation = validateScrapedResults(scrapedResults);

  return (
    <ErrorBoundary fallback={ToolErrorFallback}>
      <div className="flex flex-col">
        {isLoading ? (
          <div className="flex flex-row gap-2 items-center">
            <div className="font-medium">Scraping webpage</div>
            <div className="animate-spin">
              <LoaderIcon />
            </div>
          </div>
        ) : validation.isValid ? (
          <>
            <div className="flex flex-row gap-2 items-center">
              <div className="font-medium">
                Webpage scraped{url ? ` from ${(() => { try { return new URL(url).hostname } catch { return '' } })()}` : ''}
              </div>
              <button
                data-testid="message-web-scraper-toggle"
                type="button"
                className="cursor-pointer"
                onClick={() => {
                  setIsExpanded(!isExpanded);
                }}
              >
                <ChevronDownIcon />
              </button>
            </div>
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  data-testid="message-web-scraper"
                  key="content"
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  variants={variants}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                  className="pl-4 text-zinc-600 dark:text-zinc-400 border-l flex flex-col gap-4"
                >
                  <WebScraper scrapedResults={scrapedResults} />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="text-red-600 dark:text-red-400 p-4">
            <strong>Scraper error:</strong> {validation.error || 'Unknown error.'}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}