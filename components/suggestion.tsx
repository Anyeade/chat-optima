'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useWindowSize } from 'usehooks-ts';

import type { UISuggestion } from '@/lib/editor/suggestions';

import { CrossIcon, MessageIcon, SparklesIcon, CodeIcon } from './icons';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import type { ArtifactKind } from './artifact';

export const Suggestion = ({
  suggestion,
  onApply,
  artifactKind,
}: {
  suggestion: UISuggestion;
  onApply: () => void;
  artifactKind: ArtifactKind;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { width: windowWidth } = useWindowSize();

  // Determine icon and styles based on suggestion type
  const getSuggestionIcon = () => {
    if ((suggestion as any).type === 'targeted-change') {
      return <CodeIcon size={windowWidth && windowWidth < 768 ? 16 : 14} />;
    }
    if ((suggestion as any).type === 'improvement-suggestion') {
      return <SparklesIcon size={windowWidth && windowWidth < 768 ? 16 : 14} />;
    }
    return <MessageIcon size={windowWidth && windowWidth < 768 ? 16 : 14} />;
  };

  // Get appropriate color based on suggestion category or type
  const getCategoryColor = () => {
    const category = (suggestion as any).category;
    
    if (!category) {
      return (suggestion as any).type === 'targeted-change' ? 'bg-blue-50 border-blue-200 text-blue-800' :
        'bg-green-50 border-green-200 text-green-800';
    }
    
    switch (category) {
      case 'accessibility': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'performance': return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'seo': return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'responsive': return 'bg-sky-50 border-sky-200 text-sky-800';
      case 'semantic': return 'bg-indigo-50 border-indigo-200 text-indigo-800';
      case 'style': return 'bg-rose-50 border-rose-200 text-rose-800';
      default: return 'bg-green-50 border-green-200 text-green-800';
    }
  };

  // Get button color based on type/category
  const getButtonClass = () => {
    if ((suggestion as any).type === 'targeted-change') {
      return 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800';
    }
    if ((suggestion as any).category === 'accessibility') {
      return 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-800';
    }
    return 'bg-green-50 hover:bg-green-100 border-green-200 text-green-800';
  };

  return (
    <AnimatePresence>
      {!isExpanded ? (
        <motion.div
          className={cn('cursor-pointer text-muted-foreground p-1', {
            'absolute -right-8': artifactKind === 'text',
            'sticky top-0 right-4': artifactKind === 'code',
          })}
          onClick={() => {
            setIsExpanded(true);
          }}
          whileHover={{ scale: 1.1 }}
        >
          {getSuggestionIcon()}
        </motion.div>
      ) : (
        <motion.div
          key={suggestion.id}
          className={`absolute ${getCategoryColor()} p-3 flex flex-col gap-3 rounded-2xl border text-sm w-64 shadow-xl z-50 -right-12 md:-right-16 font-sans`}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: -20 }}
          exit={{ opacity: 0, y: -10 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-2">
              <div className="size-4 bg-muted-foreground/25 rounded-full" />
              <div className="font-medium">
                {(suggestion as any).type === 'targeted-change' ? 'Targeted Change' : 
                 (suggestion as any).type === 'improvement-suggestion' ? 'Improvement' : 'Suggestion'}
              </div>
            </div>
            <button
              type="button"
              className="text-xs text-gray-500 cursor-pointer"
              onClick={() => {
                setIsExpanded(false);
              }}
            >
              <CrossIcon size={12} />
            </button>
          </div>
          
          {(suggestion as any).category && (suggestion as any).category !== 'general' && (
            <div className="text-xs px-1.5 py-0.5 rounded-full w-fit font-medium">
              {(suggestion as any).category.charAt(0).toUpperCase() + (suggestion as any).category.slice(1)}
            </div>
          )}
          
          <div className="text-sm">{suggestion.description}</div>
          
          <Button
            variant="outline"
            className={`w-fit py-1.5 px-3 rounded-full ${getButtonClass()}`}
            onClick={onApply}
          >
            Apply Change
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
