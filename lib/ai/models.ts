export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'Optima Core',
    description: 'HansTech flagship model',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Optima Reasoning',
    description: 'HansTech advanced reasoning',
  },
  // Optima Series
  {
    id: 'gemini-2.5-flash-preview-04-17',
    name: 'Optima Flash 2.5',
    description: 'HansTech fast response',
  },
  {
    id: 'gemini-2.5-pro-preview-05-06',
    name: 'Optima Pro 2.5',
    description: 'HansTech pro edition',
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Optima Flash 2.0',
    description: 'HansTech flash model',
  },
  {
    id: 'gemini-2.0-flash-lite-preview-02-05',
    name: 'Optima Flash Lite',
    description: 'HansTech lightweight flash',
  },
  {
    id: 'gemini-2.0-flash-thinking-exp-01-21',
    name: 'Optima Thinker',
    description: 'HansTech experimental thinking',
  },
  {
    id: 'gemini-2.0-flash-thinking-exp-1219',
    name: 'Optima Thinker X',
    description: 'HansTech experimental model',
  },
  {
    id: 'gemini-1.5-pro-001',
    name: 'Optima Pro 1.5',
    description: 'HansTech pro model',
  },
  {
    id: 'gemini-1.5-pro-002',
    name: 'Optima Pro 1.5X',
    description: 'HansTech pro enhanced',
  },
  {
    id: 'gemini-1.5-flash-001',
    name: 'Optima Flash 1.5',
    description: 'HansTech flash edition',
  },
  {
    id: 'gemini-1.5-flash-002',
    name: 'Optima Flash 1.5X',
    description: 'HansTech flash enhanced',
  },
  {
    id: 'gemini-1.5-flash-8b-001',
    name: 'Optima Flash 8B',
    description: 'HansTech 8B flash',
  },
  {
    id: 'gemini-1.5-flash-8b-exp-0924',
    name: 'Optima Flash 8B X',
    description: 'HansTech experimental flash',
  },
  {
    id: 'gemma-3-27b-it',
    name: 'Optima Gem 3',
    description: 'HansTech instructive model',
  },
  // Trio Series
  {
    id: 'llama-4-scout-17b-16e-instruct',
    name: 'Trio Scout 17B',
    description: 'HansTech instructive scout',
  },
  {
    id: 'qwen-qwq-32b',
    name: 'Trio QWQ 32B',
    description: 'HansTech QWQ series',
  },
  {
    id: 'deepseek-r1-distill-llama-70b',
    name: 'Trio Distill 70B',
    description: 'HansTech distilled model',
  },
  // Optima Fast
  {
    id: 'pixtral-12b-2409',
    name: 'Optima Fast',
    description: 'HansTech fast model',
  },
  // Optima Deluxe
  {
    id: 'command-r-plus',
    name: 'Optima Deluxe',
    description: 'HansTech complex tasks',
  },
  {
    id: 'command-r',
    name: 'Trio Beta 2.0',
    description: 'HansTech agentic model',
  },
  {
    id: 'command-light',
    name: 'Optima Light',
    description: 'HansTech light edition',
  },
];
