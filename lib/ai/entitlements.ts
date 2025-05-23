import type { UserType } from '@/app/(auth)/auth';
import type { ChatModel } from './models';

interface Entitlements {
  maxMessagesPerDay: number;
  availableChatModelIds: Array<ChatModel['id']>;
}

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For users without an account
   */
  guest: {
    maxMessagesPerDay: 30,
    availableChatModelIds: ['chat-model', 'chat-model-reasoning'],
  },

  /*
   * For users with an account
   */
  regular: {
    maxMessagesPerDay: 200,
    availableChatModelIds: [
      // Main models
      'chat-model',
      'chat-model-reasoning',
      // Google Gemini Models
      'gemini-2.5-flash-preview-04-17',
      'gemini-2.5-pro-preview-05-06',
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite-preview-02-05',
      'gemini-2.0-flash-thinking-exp-01-21',
      'gemini-2.0-flash-thinking-exp-1219',
      'gemini-1.5-pro-001',
      'gemini-1.5-pro-002',
      'gemini-1.5-flash-001',
      'gemini-1.5-flash-002',
      'gemini-1.5-flash-8b-001',
      'gemini-1.5-flash-8b-exp-0924',
      'gemma-3-27b-it',
      // Groq Models
      'llama-4-scout-17b-16e-instruct',
      'qwen-qwq-32b',
      'deepseek-r1-distill-llama-70b',
      // Mistral Models
      'pixtral-12b-2409',
      // Cohere Models
      'command-r-plus',
      'command-r',
      'command-light',
    ],
  },

  /*
   * TODO: For users with an account and a paid membership
   */
};
