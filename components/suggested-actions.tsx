'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { memo, useEffect, useState } from 'react';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { VisibilityType } from './visibility-selector';
import { generatePromptSuggestions } from '@/app/chat/actions';

interface SuggestedAction {
  title: string;
  label: string;
  action: string;
}

interface SuggestedActionsProps {
  chatId: string;
  append: UseChatHelpers['append'];
  selectedVisibilityType: VisibilityType;
}

function PureSuggestedActions({
  chatId,
  append,
  selectedVisibilityType,
}: SuggestedActionsProps) {
  const [suggestedActions, setSuggestedActions] = useState<SuggestedAction[]>([
    {
      title: 'What are the advantages',
      label: 'of using Next.js?',
      action: 'What are the advantages of using Next.js?',
    },
    {
      title: 'Create a modern website',
      label: 'for a tech startup',
      action: 'Create a modern website for a tech startup with hero section, features, and pricing',
    },
    {
      title: 'Write code to',
      label: `demonstrate dijkstra's algorithm`,
      action: `Write code to demonstrate dijkstra's algorithm`,
    },
    {
      title: 'Help me write an essay',
      label: `about silicon valley`,
      action: `Help me write an essay about silicon valley`,
    },
    {
      title: 'What is the weather',
      label: 'in San Francisco?',
      action: 'What is the weather in San Francisco?',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        setIsLoading(true);
        const dynamicSuggestions = await generatePromptSuggestions();
        setSuggestedActions(dynamicSuggestions);
      } catch (error) {
        console.error('Failed to load dynamic suggestions:', error);
        // Keep default suggestions on error
      } finally {
        setIsLoading(false);
      }
    };

    loadSuggestions();
  }, []);

  return (
    <div
      data-testid="suggested-actions"
      className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 w-full"
    >
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? 'hidden sm:block' : 'block'}
        >
          <Button
            variant="ghost"
            onClick={async () => {
              window.history.replaceState({}, '', `/chat/${chatId}`);

              append({
                role: 'user',
                content: suggestedAction.action,
              });
            }}
            disabled={isLoading}
            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start disabled:opacity-50"
          >
            <span className="font-medium">
              {isLoading ? 'Loading...' : suggestedAction.title}
            </span>
            <span className="text-muted-foreground">
              {isLoading ? 'Generating suggestions' : suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) return false;
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType)
      return false;

    return true;
  },
);
