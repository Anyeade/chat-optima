'use client';

import { useState } from 'react';
import { ChevronDownIcon, LoaderIcon } from './icons';
import { motion, AnimatePresence } from 'framer-motion';

interface MessagePexelsSearchProps {
  isLoading: boolean;
  searchResults: any;
  searchQuery?: string;
}

export function MessagePexelsSearch({
  isLoading,
  searchResults,
  searchQuery,
}: MessagePexelsSearchProps) {
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

  const resultCount = searchResults?.total_results || 0;
  const contentType = searchResults?.content_type || 'items';

  return (
    <div className="flex flex-col">
      {isLoading ? (
        <div className="flex flex-row gap-2 items-center">
          <div className="font-medium">Searching Pexels</div>
          <div className="animate-spin">
            <LoaderIcon />
          </div>
        </div>
      ) : (
        <div className="flex flex-row gap-2 items-center">
          <div className="font-medium">
            Found {resultCount} {contentType}{searchQuery ? ` for "${searchQuery}"` : ''}
          </div>
          <button
            data-testid="message-pexels-search-toggle"
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
            data-testid="message-pexels-search"
            key="content"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={variants}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
            className="pl-4 text-zinc-600 dark:text-zinc-400 border-l flex flex-col gap-4"
          >
            {searchResults?.photos && searchResults.photos.length > 0 ? (
              <div className="space-y-4">
                <div className="text-sm font-medium">Selected Images for Project</div>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Preview</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Details</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Photographer</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Resolution</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                      {searchResults.photos.slice(0, 5).map((photo: any, index: number) => (
                        <tr key={photo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-2">
                            <img
                              src={photo.src?.small || photo.src?.tiny}
                              alt={photo.alt || `Image ${index + 1}`}
                              className="w-16 h-12 object-cover rounded"
                              loading="lazy"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                              {photo.alt || `Professional Image ${index + 1}`}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              ID: {photo.id}
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              {photo.photographer}
                            </div>
                            <a
                              href={photo.photographer_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              View Profile
                            </a>
                          </td>
                          <td className="px-4 py-2">
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              {photo.width} × {photo.height}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {photo.src?.large ? 'HD Available' : 'Standard'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {searchResults.photos.length > 5 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Showing 5 of {searchResults.photos.length} selected images
                  </div>
                )}
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                  <div className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                    ✨ Images Ready for Implementation
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                    These images will be used in your project. Type <strong>CONFIRM</strong> to proceed with creation.
                  </div>
                </div>
              </div>
            ) : searchResults?.videos && searchResults.videos.length > 0 ? (
              <div className="space-y-4">
                <div className="text-sm font-medium">Selected Videos for Project</div>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Preview</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Details</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Creator</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quality</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                      {searchResults.videos.slice(0, 3).map((video: any, index: number) => (
                        <tr key={video.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-2">
                            <img
                              src={video.image}
                              alt={`Video ${index + 1} preview`}
                              className="w-16 h-12 object-cover rounded"
                              loading="lazy"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                              {video.tags?.join(', ') || `Professional Video ${index + 1}`}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Duration: {video.duration || 'Variable'}s • ID: {video.id}
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              {video.user?.name || 'Pexels'}
                            </div>
                            <a
                              href={video.user?.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              View Profile
                            </a>
                          </td>
                          <td className="px-4 py-2">
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              {video.width} × {video.height}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {video.video_files?.find((f: any) => f.quality === 'hd')?.quality || 'HD'} Available
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                  <div className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                    🎬 Videos Ready for Implementation
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                    These videos will be used in your project. Type <strong>CONFIRM</strong> to proceed with creation.
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm font-medium">Search Results</div>
                <pre className="text-xs bg-muted p-3 rounded-md overflow-auto">
                  {JSON.stringify(searchResults, null, 2)}
                </pre>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}