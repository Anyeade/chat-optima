'use server';

import { generateText, type UIMessage } from 'ai';
import { cookies } from 'next/headers';
import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisiblityById,
} from '@/lib/db/queries';
import type { VisibilityType } from '@/components/visibility-selector';
import { myProvider } from '@/lib/ai/providers';

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('chat-model', model);
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: UIMessage;
}) {
  const { text: title } = await generateText({
    model: myProvider.languageModel('title-model'),
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisiblityById({ chatId, visibility });
}

export async function generatePromptSuggestions() {
  const { text: suggestions } = await generateText({
    model: myProvider.languageModel('title-model'),
    system: `Generate 5 diverse and engaging prompt suggestions for an AI chat interface.
    Each suggestion should be:
    - Actionable and specific
    - Appealing to different use cases (coding, creative writing, analysis, problem-solving, general knowledge)
    - Between 30-80 characters long
    - Written as direct commands or questions
    
    Return the suggestions as a JSON array of objects with this format:
    [
      {"title": "Create a modern website", "label": "for a tech startup", "action": "Create a modern website for a tech startup with hero section, features, and pricing"},
      {"title": "Write code to", "label": "demonstrate dijkstra's algorithm", "action": "Write code to demonstrate dijkstra's algorithm"},
      ...
    ]
    
    Make the suggestions varied and interesting, covering different domains like technology, creativity, analysis, and everyday tasks.`,
    prompt: 'Generate 5 diverse prompt suggestions for an AI chat interface',
  });

  try {
    // Parse the JSON response
    const parsedSuggestions = JSON.parse(suggestions);
    
    // Validate the structure
    if (Array.isArray(parsedSuggestions) && parsedSuggestions.length === 5) {
      return parsedSuggestions.map(suggestion => ({
        title: suggestion.title || '',
        label: suggestion.label || '',
        action: suggestion.action || suggestion.title || '',
      }));
    }
  } catch (error) {
    console.error('Failed to parse AI-generated suggestions:', error);
  }
  
  // Fallback to static suggestions if AI generation fails
  return [
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
  ];
}
