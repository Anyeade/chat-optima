'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon, LoaderIcon } from './icons';
import { motion, AnimatePresence } from 'framer-motion';
import { WebpageScreenshot } from './webpage-screenshot';

interface MessageWebpageScreenshotProps {
  isLoading: boolean;
  screenshotResults: any;
  url?: string;
}

export function MessageWebpageScreenshot({
  isLoading,
  screenshotResults,
  url,
}: MessageWebpageScreenshotProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Auto-collapse when screenshot completes
  useEffect(() => {
    if (isLoading === false && isExpanded === true) {
      // Add a small delay to allow users to see the completion
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 1000); // 1 second delay

      return () => clearTimeout(timer);
    }
  }, [isLoading, isExpanded]);

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

  return (
    <div className="flex flex-col">
      {isLoading ? (
        <div className="flex flex-row gap-2 items-center">
          <div className="font-medium">Taking screenshot</div>
          <div className="animate-spin">
            <LoaderIcon />
          </div>
        </div>
      ) : (
        <div className="flex flex-row gap-2 items-center">
          <div className="font-medium">
            Screenshot captured{url ? ` from ${new URL(url).hostname}` : ''}
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
      )}

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
    </div>
  );
}