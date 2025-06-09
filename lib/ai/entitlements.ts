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
    availableChatModelIds: [
      'chat-model', 
      'chat-model-reasoning',
      // Google Gemini Models (basic access)
      'gemini-2.0-flash-lite', // Lightweight model for guests
      // Free/accessible models for guests
      'phi-3-mini-128k-instruct', // Glama AI - smaller model
      'google/gemini-2.0-flash-exp', // Requesty AI - experimental access
    ],
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
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
      'gemini-2.0-flash-exp',
      'gemini-2.0-flash-thinking-exp-01-21',
      'gemma-3-27b-it',
      // Groq Models - Premium (lower daily limits)
      'meta-llama/llama-4-scout-17b-16e-instruct',
      'meta-llama/llama-4-maverick-17b-128e-instruct',
      'compound-beta',
      'compound-beta-mini',
      'deepseek-r1-distill-llama-70b',
      'llama-3.3-70b-versatile',
      'qwen-qwq-32b',
      // Groq Models - High Volume (higher daily limits)
      'llama-3.1-8b-instant',
      'gemma2-9b-it',
      'llama3-70b-8192',
      'llama3-8b-8192',      // Mistral Models
      'pixtral-12b-2409',
      'mistral-small-2503',
      'devstral-small-2505',
      'open-codestral-mamba',
      'open-mistral-nemo',
      // Cohere Models (128K context, tool support)
      'command-a-03-2025',
      'command-nightly',
      'command-r-plus-04-2024',
      'command-r-08-2024',
      // Together.ai Models (200+ open-source models, free options)
      'meta-llama/Llama-Vision-Free',
      'deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free',
      'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
      // Requesty AI Router Models (OpenAI-compatible)
      'google/gemini-2.0-flash-exp',
      'gemma-3-27b-it-requesty',
      // Glama AI Gateway Models (OpenAI-compatible)
      'phi-3-medium-128k-instruct',
      'phi-3-mini-128k-instruct',
      'llama-3.2-11b-vision-instruct',
      // Chutes AI Models (OpenAI-compatible)
      'deepseek-ai/DeepSeek-V3-0324',
      'deepseek-ai/DeepSeek-R1',
      'Qwen/Qwen3-235B-A22B',
      'chutesai/Llama-4-Maverick-17B-128E-Instruct-FP8',
      // X.AI Models (Grok series)
      'grok-3-mini-beta',
    ],
  },

  /*
   * TODO: For users with an account and a paid membership
   */
};
