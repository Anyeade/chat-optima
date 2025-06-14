'use client';

import { useState } from 'react';
import { ChevronDownIcon, LoaderIcon } from './icons';
import { motion, AnimatePresence } from 'framer-motion';
import { ErrorBoundary, ToolErrorFallback } from './error-boundary';

// Simple modal for previewing images/videos
function MediaPreviewModal({ open, onClose, src, type, alt }: { open: boolean; onClose: () => void; src: string; type: 'image' | 'video'; alt?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 max-w-2xl w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-700 dark:text-gray-200 hover:text-red-500 text-xl font-bold"
          aria-label="Close preview"
        >
          ×
        </button>
        {type === 'image' ? (
          <img src={src} alt={alt} className="max-h-[70vh] max-w-full mx-auto rounded" />
        ) : (
          <video src={src} controls autoPlay className="max-h-[70vh] max-w-full mx-auto rounded" />
        )}
        <a
          href={src}
          download
          className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
        >
          Download {type === 'image' ? 'Image' : 'Video'}
        </a>
      </div>
    </div>
  );
}

// Safe data validation function for Pexels results
function validatePexelsResults(results: any): { isValid: boolean; resultCount: number; contentType: string; error?: string } {
  try {
    if (!results) {
      return { isValid: false, resultCount: 0, contentType: 'items', error: 'No search results provided' };
    }

    if (results.error) {
      return { isValid: false, resultCount: 0, contentType: 'items', error: results.error };
    }

    // Check for photos
    if (results.photos && Array.isArray(results.photos)) {
      return { 
        isValid: true, 
        resultCount: results.total_results || results.photos.length, 
        contentType: 'photos' 
      };
    }

    // Check for videos
    if (results.videos && Array.isArray(results.videos)) {
      return { 
        isValid: true, 
        resultCount: results.total_results || results.videos.length, 
        contentType: 'videos' 
      };
    }

    // Handle total_results field
    if (typeof results.total_results === 'number') {
      return { 
        isValid: true, 
        resultCount: results.total_results, 
        contentType: results.content_type || 'items' 
      };
    }

    // Handle alternative response structures
    if (typeof results === 'object') {
      return { isValid: true, resultCount: 0, contentType: 'items' };
    }

    return { isValid: false, resultCount: 0, contentType: 'items', error: 'Invalid Pexels results format' };
  } catch (error) {
    return { isValid: false, resultCount: 0, contentType: 'items', error: 'Failed to validate Pexels results' };
  }
}

// Safe photo rendering component
function SafePhotoRow({ photo, index, onPreview }: { photo: any; index: number; onPreview: (src: string, alt?: string) => void }) {
  try {
    const safeSrc = photo?.src?.large || photo?.src?.original || photo?.src?.small || photo?.src?.tiny || '';
    const safeAlt = photo?.alt || `Image ${index + 1}`;
    const safePhotographer = photo?.photographer || 'Unknown';
    const safePhotographerUrl = photo?.photographer_url || '#';
    const safeWidth = photo?.width || 'N/A';
    const safeHeight = photo?.height || 'N/A';
    const safeId = photo?.id || index;

    return (
      <tr key={safeId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
        <td className="px-4 py-2">
          {safeSrc ? (
            <button onClick={() => onPreview(safeSrc, safeAlt)} className="focus:outline-none">
              <img
                src={safeSrc}
                alt={safeAlt}
                className="w-16 h-12 object-cover rounded border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA2NCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yOCAyNEwyNCAyMEwyOCAyNFoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';
                }}
              />
            </button>
          ) : (
            <div className="w-16 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-xs">
              No image
            </div>
          )}
        </td>
        <td className="px-4 py-2">
          <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">
            {safeAlt}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            ID: {safeId}
          </div>
        </td>
        <td className="px-4 py-2">
          <div className="text-sm text-gray-900 dark:text-gray-100">
            {safePhotographer}
          </div>
          {safePhotographerUrl && safePhotographerUrl !== '#' && (
            <a
              href={safePhotographerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              View Profile
            </a>
          )}
        </td>
        <td className="px-4 py-2">
          <div className="text-sm text-gray-900 dark:text-gray-100">
            {safeWidth} × {safeHeight}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {photo?.src?.large ? 'HD Available' : 'Standard'}
          </div>
        </td>
      </tr>
    );
  } catch (error) {
    console.error('Error rendering photo row:', error);
    return (
      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
        <td colSpan={4} className="px-4 py-2 text-center text-red-500">
          Error displaying image {index + 1}
        </td>
      </tr>
    );
  }
}

// Safe video rendering component
function SafeVideoRow({ video, index, onPreview }: { video: any; index: number; onPreview: (src: string) => void }) {
  try {
    const safeImage = video?.image || '';
    const safeAlt = `Video ${index + 1} preview`;
    const safeTags = Array.isArray(video?.tags) ? video.tags.join(', ') : `Professional Video ${index + 1}`;
    const safeDuration = typeof video?.duration === 'number' ? video.duration : 'Variable';
    const safeId = video?.id || index;
    const safeUserName = video?.user?.name || 'Pexels';
    const safeUserUrl = video?.user?.url || '';
    const safeWidth = video?.width || 'N/A';
    const safeHeight = video?.height || 'N/A';
    const safeQuality = Array.isArray(video?.video_files)
      ? (video.video_files.find((f: any) => f.quality === 'hd')?.quality || 'HD')
      : 'HD';
    const safeVideoFile = Array.isArray(video?.video_files)
      ? (video.video_files.find((f: any) => f.quality === 'hd')?.link || video.video_files[0]?.link || '')
      : '';

    return (
      <tr key={safeId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
        <td className="px-4 py-2">
          {safeImage ? (
            <button onClick={() => onPreview(safeVideoFile)} className="focus:outline-none">
              <img
                src={safeImage}
                alt={safeAlt}
                className="w-16 h-12 object-cover rounded border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA2NCA0OCIgZmlsbD0ibm9uZSIgeG1zbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yOCAyNEwyNCAyMEwyOCAyNFoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';
                }}
              />
            </button>
          ) : (
            <div className="w-16 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-xs">
              No image
            </div>
          )}
        </td>
        <td className="px-4 py-2">
          <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">
            {safeTags}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Duration: {safeDuration}s • ID: {safeId}
          </div>
        </td>
        <td className="px-4 py-2">
          <div className="text-sm text-gray-900 dark:text-gray-100">
            {safeUserName}
          </div>
          {safeUserUrl && (
            <a
              href={safeUserUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              View Profile
            </a>
          )}
        </td>
        <td className="px-4 py-2">
          <div className="text-sm text-gray-900 dark:text-gray-100">
            {safeWidth} × {safeHeight}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {safeQuality} Available
          </div>
        </td>
      </tr>
    );
  } catch (error) {
    console.error('Error rendering video row:', error);
    return (
      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
        <td colSpan={4} className="px-4 py-2 text-center text-red-500">
          Error displaying video {index + 1}
        </td>
      </tr>
    );
  }
}

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
  const [preview, setPreview] = useState<{ src: string; type: 'image' | 'video'; alt?: string } | null>(null);

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
  const validation = validatePexelsResults(searchResults);
  const resultCount = validation.resultCount;
  const contentType = validation.contentType;

  return (
    <ErrorBoundary fallback={ToolErrorFallback}>
      <div className="flex flex-col">
        {preview && (
          <MediaPreviewModal
            open={!!preview}
            onClose={() => setPreview(null)}
            src={preview.src}
            type={preview.type}
            alt={preview.alt}
          />
        )}
        {isLoading ? (
          <div className="flex flex-row gap-2 items-center">
            <div className="font-medium">Searching Pexels</div>
            <div className="animate-spin">
              <LoaderIcon />
            </div>
          </div>
        ) : (
          <>
            {validation.error ? (
              <div className="flex flex-col p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="text-red-600 dark:text-red-400 font-medium text-sm">
                  Pexels Search Error
                </div>
                <div className="text-red-500 dark:text-red-300 text-xs mt-1">
                  {validation.error}
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
          </>
        )}

        <AnimatePresence initial={false}>
          {isExpanded && !validation.error && validation.isValid && (
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
              {searchResults?.photos && Array.isArray(searchResults.photos) && searchResults.photos.length > 0 ? (
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
                        {searchResults.photos.map((photo: any, index: number) => (
                          <SafePhotoRow key={photo?.id || index} photo={photo} index={index} onPreview={(src, alt) => setPreview({ src, type: 'image', alt })} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                    <div className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                      ✨ Images Ready for Implementation
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                      These images will be used in your project. Type <strong>CONFIRM</strong> to proceed with creation.
                    </div>
                  </div>
                </div>
              ) : searchResults?.videos && Array.isArray(searchResults.videos) && searchResults.videos.length > 0 ? (
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
                        {searchResults.videos.map((video: any, index: number) => (
                          <SafeVideoRow key={video?.id || index} video={video} index={index} onPreview={(src) => setPreview({ src, type: 'video' })} />
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
    </ErrorBoundary>
  );
}