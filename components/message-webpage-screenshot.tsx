'use client';

import { useState } from 'react';
import { ChevronDownIcon, LoaderIcon } from './icons';
import { motion, AnimatePresence } from 'framer-motion';
import { WebpageScreenshot } from './webpage-screenshot';
import { ErrorBoundary, ToolErrorFallback } from './error-boundary';

interface MessageWebpageScreenshotProps {
  isLoading: boolean;
  screenshotResults: any;
  url?: string;
}

function validateScreenshotResults(results: any): { isValid: boolean; error?: string } {
  if (!results) return { isValid: false, error: 'No screenshot data provided.' };
  if (results.error) return { isValid: false, error: results.error };
  if (typeof results !== 'object' || !results.screenshotUrl) return { isValid: false, error: 'Malformed screenshot data.' };
  return { isValid: true };
}

export function MessageWebpageScreenshot({
  isLoading,
  screenshotResults,
  url,
}: MessageWebpageScreenshotProps) {
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

  const validation = validateScreenshotResults(screenshotResults);

  return (
    <ErrorBoundary fallback={ToolErrorFallback}>
      <div className="flex flex-col">
        {isLoading ? (
          <div className="flex flex-row gap-2 items-center">
            <div className="font-medium">Taking screenshot</div>
            <div className="animate-spin">
              <LoaderIcon />
            </div>
          </div>
        ) : validation.isValid ? (
          <>
            <div className="flex flex-row gap-2 items-center">
              <div className="font-medium">
                Screenshot captured{url ? ` from ${(() => { try { return new URL(url).hostname } catch { return '' } })()}` : ''}
              </div>
              <button
                data-testid="message-webpage-screenshot-toggle"
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
                  data-testid="message-webpage-screenshot"
                  key="content"
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  variants={variants}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                  className="pl-4 text-zinc-600 dark:text-zinc-400 border-l flex flex-col gap-4"
                >
                  <WebpageScreenshot screenshotResults={screenshotResults} />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="text-red-600 dark:text-red-400 p-4">
            <strong>Screenshot error:</strong> {validation.error || 'Unknown error.'}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}