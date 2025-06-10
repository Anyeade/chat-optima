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
  try {
    const { text: suggestions } = await generateText({
      model: myProvider.languageModel('title-model'),
      system: `You are a JSON generator. ONLY return valid JSON, no explanations or additional text.

Generate exactly 5 diverse and engaging prompt suggestions for an AI chat interface.

CRITICAL: Return ONLY a valid JSON array with NO additional text, explanations, or formatting. Start directly with [ and end with ].

Format:
[
  {"title": "Create a modern website", "label": "for a tech startup", "action": "Create a modern website for a tech startup with hero section, features, and pricing"},
  {"title": "Write code to", "label": "demonstrate dijkstra's algorithm", "action": "Write code to demonstrate dijkstra's algorithm"},
  {"title": "Analyze the performance", "label": "of this React component", "action": "Analyze the performance of this React component and suggest optimizations"},
  {"title": "Help me plan", "label": "a weekend hiking trip", "action": "Help me plan a weekend hiking trip with route suggestions and gear recommendations"},
  {"title": "Explain the concept", "label": "of machine learning", "action": "Explain the concept of machine learning in simple terms with practical examples"}
]`,
      prompt: 'Generate exactly 5 diverse prompt suggestions as valid JSON array only',
      maxTokens: 800,
    });

    // Clean the response - remove any non-JSON content
    let cleanSuggestions = suggestions.trim();
    
    // Find the first [ and last ] to extract only the JSON array
    const startIndex = cleanSuggestions.indexOf('[');
    const endIndex = cleanSuggestions.lastIndexOf(']');
    
    if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
      cleanSuggestions = cleanSuggestions.substring(startIndex, endIndex + 1);
    }

    // Parse the JSON response
    const parsedSuggestions = JSON.parse(cleanSuggestions);
    
    // Validate the structure
    if (Array.isArray(parsedSuggestions) && parsedSuggestions.length >= 3) {
      return parsedSuggestions.slice(0, 5).map(suggestion => ({
        title: suggestion.title || 'Untitled',
        label: suggestion.label || '',
        action: suggestion.action || suggestion.title || 'Ask me anything',
      }));
    }
    
    throw new Error('Invalid response structure');
    
  } catch (error) {
    console.error('Failed to generate AI suggestions:', error);
    console.log('Falling back to static suggestions');
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
