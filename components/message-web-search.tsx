'use client';

import { useState } from 'react';
import { ChevronDownIcon, LoaderIcon } from './icons';
import { motion, AnimatePresence } from 'framer-motion';
import { WebSearch } from './web-search';
import { ErrorBoundary, ToolErrorFallback } from './error-boundary';

interface MessageWebSearchProps {
  isLoading: boolean;
  searchResults: any;
  searchQuery?: string;
}

// Safe data validation function
function validateSearchResults(results: any): { isValid: boolean; resultCount: number; error?: string } {
  try {
    if (!results) {
      return { isValid: false, resultCount: 0, error: 'No search results provided' };
    }

    if (results.error) {
      return { isValid: false, resultCount: 0, error: results.error };
    }

    // Check if it has the expected structure
    if (results.search_results && Array.isArray(results.search_results)) {
      return { isValid: true, resultCount: results.search_results.length };
    }

    // Handle alternative response structures
    if (typeof results === 'object') {
      return { isValid: true, resultCount: 0 };
    }

    return { isValid: false, resultCount: 0, error: 'Invalid search results format' };
  } catch (error) {
    return { isValid: false, resultCount: 0, error: 'Failed to validate search results' };
  }
}

export function MessageWebSearch({
  isLoading,
  searchResults,
  searchQuery,
}: MessageWebSearchProps) {
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

  // Safely validate results
  const validation = validateSearchResults(searchResults);
  const resultCount = validation.resultCount;
  return (
    <ErrorBoundary fallback={ToolErrorFallback}>
      <div className="flex flex-col">
        {isLoading ? (
          <div className="flex flex-row gap-2 items-center">
            <div className="font-medium">Searching web</div>
            <div className="animate-spin">
              <LoaderIcon />
            </div>
          </div>
        ) : (
          <>
            {validation.error ? (
              <div className="flex flex-col p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="text-red-600 dark:text-red-400 font-medium text-sm">
                  Web Search Error
                </div>
                <div className="text-red-500 dark:text-red-300 text-xs mt-1">
                  {validation.error}
                </div>
              </div>
            ) : (
              <div className="flex flex-row gap-2 items-center">
                <div className="font-medium">
                  Found {resultCount} results{searchQuery ? ` for "${searchQuery}"` : ''}
                </div>
                <button
                  data-testid="message-web-search-toggle"
                  type="button"
                  className="cursor-pointer"
                  onClick={() => {
                    setIsExpanded(!isExpanded);
                  }}
                >
                  <ChevronDownIcon />
                </button>
              </div>
            )}
          </>
        )}

        <AnimatePresence initial={false}>
          {isExpanded && !validation.error && validation.isValid && (
            <motion.div
              data-testid="message-web-search"
              key="content"
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              variants={variants}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
              className="pl-4 text-zinc-600 dark:text-zinc-400 border-l flex flex-col gap-4"
            >
              <WebSearch searchResults={searchResults} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}