'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon, CheckCircleFillIcon } from './icons';
import { motion, AnimatePresence } from 'framer-motion';

interface MessageAutoPexelsProps {
  imageData: any;
}

export function MessageAutoPexels({ imageData }: MessageAutoPexelsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Auto-collapse after 3 seconds to reduce clutter
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExpanded(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

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

  const data = typeof imageData === 'string' ? JSON.parse(imageData) : imageData;
  const { message, total_images, categories, sample_images } = data;

  return (
    <div className="flex flex-col">
      <div className="flex flex-row gap-2 items-center">
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
          <CheckCircleFillIcon size={16} />
        </div>
        <div className="font-medium text-green-800 dark:text-green-200">
          {message}
        </div>
        <button
          data-testid="message-auto-pexels-toggle"
          type="button"
          className="cursor-pointer text-green-600 dark:text-green-400"
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
            data-testid="message-auto-pexels"
            key="content"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={variants}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
            className="pl-4 text-zinc-600 dark:text-zinc-400 border-l border-green-200 dark:border-green-700 flex flex-col gap-4"
          >            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4">
                <div className="text-sm text-green-800 dark:text-green-200 font-medium mb-2">
                  🖼️ Auto-Attached Professional Image Library Ready
                </div>
                <div className="text-xs text-green-600 dark:text-green-300 mb-3">
                  {total_images} high-quality images automatically attached from {Object.keys(categories).length} categories
                </div>
                <div className="bg-green-100 dark:bg-green-800/50 border border-green-300 dark:border-green-600 rounded p-3 mb-3">
                  <div className="text-xs font-medium text-green-900 dark:text-green-100 mb-1">
                    ⚡ EXCLUSIVE SOURCE PROTOCOL ACTIVE
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-200">
                    The AI will ONLY use these pre-selected images. No external image services will be used.
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="text-center">
                    <div className="font-medium text-green-800 dark:text-green-200">
                      {categories.ecommerce || 0}
                    </div>
                    <div className="text-green-600 dark:text-green-300">Ecommerce</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-green-800 dark:text-green-200">
                      {categories.backgrounds || 0}
                    </div>
                    <div className="text-green-600 dark:text-green-300">Backgrounds</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-green-800 dark:text-green-200">
                      {categories.profiles || 0}
                    </div>
                    <div className="text-green-600 dark:text-green-300">Profiles</div>
                  </div>
                </div>
              </div>

              {/* Sample Images Preview */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Sample Images (Auto-Selected)
                </div>
                
                {sample_images && (
                  <div className="space-y-3">
                    {sample_images.ecommerce && sample_images.ecommerce.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                          🛒 Ecommerce Samples
                        </div>
                        <div className="flex gap-2 overflow-x-auto">
                          {sample_images.ecommerce.slice(0, 3).map((item: any, index: number) => (
                            <div key={index} className="shrink-0">
                              <img
                                src={item.image.medium_url || item.image.small_url}
                                alt={item.image.alt || `${item.category} sample`}
                                className="w-20 h-16 object-cover rounded border"
                                loading="lazy"
                              />
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-20 truncate">
                                {item.category}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {sample_images.backgrounds && sample_images.backgrounds.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                          🎨 Background Samples
                        </div>
                        <div className="flex gap-2 overflow-x-auto">
                          {sample_images.backgrounds.slice(0, 3).map((item: any, index: number) => (
                            <div key={index} className="shrink-0">
                              <img
                                src={item.image.medium_url || item.image.small_url}
                                alt={item.image.alt || `${item.category} sample`}
                                className="w-20 h-16 object-cover rounded border"
                                loading="lazy"
                              />
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-20 truncate">
                                {item.category}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {sample_images.profiles && sample_images.profiles.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                          👤 Profile Samples
                        </div>
                        <div className="flex gap-2 overflow-x-auto">
                          {sample_images.profiles.slice(0, 3).map((item: any, index: number) => (
                            <div key={index} className="shrink-0">
                              <img
                                src={item.image.medium_url || item.image.small_url}
                                alt={item.image.alt || `${item.category} sample`}
                                className="w-20 h-16 object-cover rounded border"
                                loading="lazy"
                              />
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-20 truncate">
                                {item.category}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>              <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded p-3">
                <div className="font-medium mb-1">✨ Integration Status: ACTIVE</div>
                <div>
                  All {total_images} images are now automatically available to the AI for your HTML artifact. 
                  The system will intelligently select appropriate images based on your design needs, 
                  ensuring professional quality and thematic consistency throughout your website.
                </div>
                <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                  🔒 Exclusive Source Protocol: Only these pre-selected images will be used - no external services!
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
