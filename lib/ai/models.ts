export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'Chat model',
    description: 'Primary model for all-purpose chat',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Reasoning model',
    description: 'Uses advanced reasoning',
  },
  // Google Gemini Models
  {
    id: 'gemini-2.5-flash-preview-04-17',
    name: 'Gemini 2.5 Flash Preview (04/17)',
    description: 'Google Gemini 2.5 Flash Preview model',
  },
  {
    id: 'gemini-2.5-pro-preview-05-06',
    name: 'Gemini 2.5 Pro Preview (05/06)',
    description: 'Google Gemini 2.5 Pro Preview model',
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    description: 'Google Gemini 2.0 Flash model',
  },
  {
    id: 'gemini-2.0-flash-lite-preview-02-05',
    name: 'Gemini 2.0 Flash Lite Preview (02/05)',
    description: 'Google Gemini 2.0 Flash Lite Preview model',
  },
  {
    id: 'gemini-2.0-flash-thinking-exp-01-21',
    name: 'Gemini 2.0 Flash Thinking Exp (01/21)',
    description: 'Google Gemini 2.0 Flash Thinking Experimental model',
  },
  {
    id: 'gemini-2.0-flash-thinking-exp-1219',
    name: 'Gemini 2.0 Flash Thinking Exp (12/19)',
    description: 'Google Gemini 2.0 Flash Thinking Experimental model',
  },
  {
    id: 'gemini-1.5-pro-001',
    name: 'Gemini 1.5 Pro (001)',
    description: 'Google Gemini 1.5 Pro model',
  },
  {
    id: 'gemini-1.5-pro-002',
    name: 'Gemini 1.5 Pro (002)',
    description: 'Google Gemini 1.5 Pro model',
  },
  {
    id: 'gemini-1.5-flash-001',
    name: 'Gemini 1.5 Flash (001)',
    description: 'Google Gemini 1.5 Flash model',
  },
  {
    id: 'gemini-1.5-flash-002',
    name: 'Gemini 1.5 Flash (002)',
    description: 'Google Gemini 1.5 Flash model',
  },
  {
    id: 'gemini-1.5-flash-8b-001',
    name: 'Gemini 1.5 Flash 8B (001)',
    description: 'Google Gemini 1.5 Flash 8B model',
  },
  {
    id: 'gemini-1.5-flash-8b-exp-0924',
    name: 'Gemini 1.5 Flash 8B Exp (09/24)',
    description: 'Google Gemini 1.5 Flash 8B Experimental model',
  },
  {
    id: 'gemma-3-27b-it',
    name: 'Gemma 3 27B IT',
    description: 'Google Gemma 3 27B Instruct model',
  },
  // Groq Models
  {
    id: 'llama-4-scout-17b-16e-instruct',
    name: 'Llama 4 Scout 17B Instruct',
    description: 'Groq Llama 4 Scout 17B Instruct model',
  },
  {
    id: 'qwen-qwq-32b',
    name: 'Qwen QWQ 32B',
    description: 'Groq Qwen QWQ 32B model',
  },
  {
    id: 'deepseek-r1-distill-llama-70b',
    name: 'Deepseek R1 Distill Llama 70B',
    description: 'Groq Deepseek R1 Distill Llama 70B model',
  },
  // Mistral Models
  {
    id: 'pixtral-12b-2409',
    name: 'Pixtral 12B',
    description: 'Mistral Pixtral 12B model',
  },
  // Cohere Models
  {
    id: 'command-r-plus',
    name: 'Command R Plus',
    description: 'Cohere Command R Plus model',
  },
  {
    id: 'command-r',
    name: 'Command R',
    description: 'Cohere Command R model',
  },
  {
    id: 'command-light',
    name: 'Command Light',
    description: 'Cohere Command Light model',
  },
];
