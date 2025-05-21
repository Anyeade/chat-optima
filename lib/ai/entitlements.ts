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
    maxMessagesPerDay: 20,
    availableChatModelIds: [
      'chat-model', 
      'chat-model-reasoning',
      // Google Gemini Models
      'gemini-2.5-flash-preview-04-17',
      'gemini-2.5-pro-preview-05-06',
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite-preview-02-05',
      'gemini-1.5-pro-001',
      'gemini-1.5-pro-002',
      'gemini-1.5-flash-001',
      'gemini-1.5-flash-002',
      // Groq Models
      'llama-4-scout-17b-16e-instruct',
      'qwen-qwq-32b',
      'deepseek-r1-distill-llama-70b'
    ],
  },

  /*
   * For users with an account
   */
  regular: {
    maxMessagesPerDay: 100,
    availableChatModelIds: [
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
      'deepseek-r1-distill-llama-70b'
    ],
  },

  /*
   * TODO: For users with an account and a paid membership
   */
};
