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
      system: `Generate 5 complete prompt suggestions as a JSON array. Return only valid JSON with no extra text.

Each suggestion must have:
- title: short engaging start (3-6 words)
- label: completion phrase (2-4 words) 
- action: full detailed prompt (8+ words)

Example format:
[
  {"title": "Create a modern website", "label": "for a tech startup", "action": "Create a modern website for a tech startup with hero section, features, and pricing"},
  {"title": "Write Python code", "label": "for data analysis", "action": "Write Python code to analyze sales data and create visualizations"}
]

CRITICAL: Always close the JSON array with ] and no trailing commas!
Return ONLY the JSON array, nothing else.`,
      prompt: 'Generate 5 diverse, complete prompt suggestions as JSON array',
      maxTokens: 1500,
    });

    console.log('Suggestion generation response:', suggestions.substring(0, 200) + '...');

    // Clean the response more aggressively
    let cleanSuggestions = suggestions.trim();
    
    // Remove any markdown formatting
    cleanSuggestions = cleanSuggestions.replace(/```json\s*/gi, '').replace(/```\s*/gi, '');
    
    // Find the JSON array bounds
    const startIndex = cleanSuggestions.indexOf('[');
    let endIndex = cleanSuggestions.lastIndexOf(']');
    
    if (startIndex !== -1) {
      if (endIndex === -1 || endIndex <= startIndex) {
        // JSON is incomplete, try to fix it
        console.log('Incomplete JSON detected, attempting to fix...');
        
        // Get everything from [ onwards
        let partialJson = cleanSuggestions.substring(startIndex);
        
        // Clean up any trailing whitespace and incomplete parts
        partialJson = partialJson.replace(/\s+$/, ''); // Remove trailing whitespace
        
        // Remove any trailing incomplete object or malformed content
        const lastCompleteObjectIndex = partialJson.lastIndexOf('}');
        if (lastCompleteObjectIndex !== -1) {
          partialJson = partialJson.substring(0, lastCompleteObjectIndex + 1);
          
          // Remove any trailing comma and close the array
          partialJson = partialJson.replace(/,\s*$/, '') + ']';
          cleanSuggestions = partialJson;
        } else {
          throw new Error('Cannot repair incomplete JSON - no complete objects found');
        }
      } else {
        cleanSuggestions = cleanSuggestions.substring(startIndex, endIndex + 1);
      }
    } else {
      throw new Error('No valid JSON array found in response');
    }

    // Parse the JSON response
    const parsedSuggestions = JSON.parse(cleanSuggestions);
    
    // Validate and filter suggestions
    if (Array.isArray(parsedSuggestions) && parsedSuggestions.length >= 3) {
      const validSuggestions = parsedSuggestions
        .filter(suggestion => 
          suggestion.title && 
          suggestion.title.length >= 3 && 
          suggestion.action && 
          suggestion.action.length >= 10
        )
        .slice(0, 5)
        .map(suggestion => ({
          title: suggestion.title.trim(),
          label: (suggestion.label || '').trim(),
          action: suggestion.action.trim(),
        }));
      
      if (validSuggestions.length >= 3) {
        console.log(`Generated ${validSuggestions.length} valid suggestions`);
        return validSuggestions;
      }
    }
    
    throw new Error('Insufficient valid suggestions generated');
    
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
