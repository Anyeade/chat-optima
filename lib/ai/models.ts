export const DEFAULT_CHAT_MODEL: string = 'llama-3.3-70b-versatile';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'Optima Core',
    description: 'HansTech flagship model (Llama 4)',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Optima Reasoning',
    description: 'HansTech advanced reasoning (DeepSeek R1)',
  },
  // Optima Series (Google Gemini models)
  {
    id: 'gemini-2.0-flash',
    name: 'Optima Flash 2.0',
    description: 'Google Gemini 2.0 Flash - Latest multimodal model',
  },
  {
    id: 'gemini-2.0-flash-lite',
    name: 'Optima Flash 2.0 Lite',
    description: 'Google Gemini 2.0 Flash Lite - Lightweight version',
  },
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Optima Flash 2.0 Experimental',
    description: 'Google Gemini 2.0 Flash Experimental - Cutting-edge features',
  },
  {
    id: 'gemini-2.0-flash-thinking-exp-01-21',
    name: 'Optima Flash 2.0 Thinking',
    description: 'Google Gemini 2.0 Flash with advanced reasoning',
  },
  {
    id: 'gemma-3-27b-it',
    name: 'Optima Gemma 3',
    description: 'Google Gemma 3 27B - Instructive model',
  },  // Trio Series (Groq Models) - Enhanced for long code generation
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Trio Llama 3.3 70B',
    description: 'Llama 3.3 70B versatile model via Groq (32k context, 12k max tokens)',
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Trio Mixtral 8x7B',
    description: 'Mixtral 8x7B model via Groq - Excellent for code (32k context, 12k max tokens)',
  },{
    id: 'deepseek-r1-distill-llama-70b',
    name: 'Trio DeepSeek R1',
    description: 'DeepSeek R1 distilled reasoning model (12k max tokens)',
  },
  // Compound models removed from user selection (used internally for suggestions)
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Trio Llama 3.3',
    description: 'Llama 3.3 70B versatile model',
  },
  {
    id: 'qwen-qwq-32b',
    name: 'Trio Qwen QWQ',
    description: 'Qwen QWQ 32B reasoning model',
  },  {
    id: 'llama-3.1-8b-instant',
    name: 'Trio Llama 3.1 Fast',
    description: 'Llama 3.1 8B instant (14.4k req/day, 12k max tokens)',
  },
  {
    id: 'gemma2-9b-it',
    name: 'Trio Gemma 2',
    description: 'Gemma 2 9B instruction tuned (14.4k req/day, 12k max tokens)',
  },
  {
    id: 'llama3-70b-8192',
    name: 'Trio Llama 3 70B',
    description: 'Llama 3 70B classic (14.4k req/day, 12k max tokens)',
  },
  {
    id: 'llama3-8b-8192',
    name: 'Trio Llama 3 8B',
    description: 'Llama 3 8B classic (14.4k req/day, 12k max tokens)',
  },// Optima Fast (Mistral Models)
  {
    id: 'pixtral-12b-2409',
    name: 'Optima Fast',
    description: 'HansTech fast model',
  },  {
    id: 'mistral-small-2503',
    name: 'Optima Small 2503',
    description: 'Mistral Small 2503 - Compact and efficient',
  },  {
    id: 'devstral-small-2505',
    name: 'Optima DevStral Small',
    description: 'DevStral Small 2505 - Specialized for development',
  },
  {
    id: 'open-codestral-mamba',
    name: 'Optima Codestral Mamba',
    description: 'Open Codestral Mamba - Advanced code generation',
  },
  {
    id: 'open-mistral-nemo',
    name: 'Optima Mistral Nemo',
    description: 'Open Mistral Nemo - Versatile open model',
  },  // Optima Command Series (Cohere - 128K context, tool support) - Enhanced tokens
  {
    id: 'command-a-03-2025',
    name: 'Optima Command A',
    description: 'Latest Cohere model (128K context, tools, 16k max tokens)',
  },
  {
    id: 'command-nightly',
    name: 'Optima Command Nightly',
    description: 'Cohere nightly build (128K context, tools, 16k max tokens)',
  },
  {
    id: 'command-r-plus-04-2024',
    name: 'Optima Command R+',
    description: 'Cohere R+ model (128K context, tools, 16k max tokens)',
  },
  {
    id: 'command-r-08-2024',
    name: 'Optima Command R',
    description: 'Cohere R model (128K context, tools, 16k max tokens)',
  },// Together.ai Series (200+ open-source models, free options) - Enhanced tokens
  {
    id: 'meta-llama/Llama-Vision-Free',
    name: 'Together Vision Free',
    description: 'Llama Vision model - Free tier (8k max tokens)',
  },
  {
    id: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free',
    name: 'Together DeepSeek R1 Free',
    description: 'DeepSeek R1 distilled - Free tier (8k max tokens)',
  },
  {
    id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
    name: 'Together Llama 3.3 Free',
    description: 'Llama 3.3 70B Turbo - Free tier (8k max tokens)',
  },  // Requesty AI Router Series (OpenAI-compatible gateway) - Enhanced tokens
  {
    id: 'gemma-3-27b-it-requesty',
    name: 'Requesty Gemma 3 27B',
    description: 'Gemma 3 27B instructive model via Requesty Router (8k max tokens)',
  },// Glama AI Gateway Series removed due to API issues  // Chutes AI Series (OpenAI-compatible gateway) - Enhanced for long code generation
  {
    id: 'deepseek-ai/DeepSeek-V3-0324',
    name: 'Chutes DeepSeek V3',
    description: 'DeepSeek V3 latest model via Chutes AI (163k context, 32k max tokens)',
  },
  {
    id: 'deepseek-ai/DeepSeek-R1',
    name: 'Chutes DeepSeek R1',
    description: 'DeepSeek R1 reasoning model via Chutes AI (163k context, 32k max tokens)',
  },
  {
    id: 'Qwen/Qwen3-235B-A22B',
    name: 'Chutes Qwen 3 235B',
    description: 'Qwen 3 235B large model via Chutes AI (large context, 16k max tokens)',
  },
  {
    id: 'chutesai/Llama-4-Maverick-17B-128E-Instruct-FP8',
    name: 'Chutes Llama 4 Maverick',
    description: 'Llama 4 Maverick 17B FP8 optimized via Chutes AI (extended context, 16k max tokens)',  },// X.AI Series (Grok Models) - Enhanced tokens
  {
    id: 'grok-3-mini-beta',
    name: 'Optima Grok 3 Mini',
    description: 'X.AI Grok 3 Mini - Compact and efficient (8k max tokens)',
  },  // OpenRouter Free Series removed due to API issues
  // Cerebras Fast Series (Ultra-fast inference) - Enhanced tokens
  {
    id: 'llama-4-scout-17b-16e-instruct-cerebras',
    name: 'Fast Llama 4 Scout',
    description: 'Llama 4 Scout via Cerebras - Ultra-fast inference (8k max tokens)',
  },
  {
    id: 'llama3.1-8b-cerebras',
    name: 'Fast Llama 3.1 8B',
    description: 'Llama 3.1 8B via Cerebras - 2200 tokens/s (8k max tokens)',
  },
  {
    id: 'llama-3.3-70b-cerebras',
    name: 'Fast Llama 3.3 70B',
    description: 'Llama 3.3 70B via Cerebras - 2100 tokens/s (8k max tokens)',
  },
  {
    id: 'qwen-3-32b-cerebras',
    name: 'Fast Qwen 3 32B',
    description: 'Qwen 3 32B via Cerebras - 2100 tokens/s (8k max tokens)',
  },
];
