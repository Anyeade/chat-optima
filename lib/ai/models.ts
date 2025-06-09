export const DEFAULT_CHAT_MODEL: string = 'meta-llama/llama-4-scout-17b-16e-instruct';

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
  },
  // Trio Series (Groq Models)
  {
    id: 'meta-llama/llama-4-scout-17b-16e-instruct',
    name: 'Trio Scout 4',
    description: 'Llama 4 Scout - Multimodal with vision',
  },
  {
    id: 'meta-llama/llama-4-maverick-17b-128e-instruct',
    name: 'Trio Maverick 4',
    description: 'Llama 4 Maverick - Advanced reasoning',
  },
  {
    id: 'deepseek-r1-distill-llama-70b',
    name: 'Trio DeepSeek R1',
    description: 'DeepSeek R1 distilled reasoning model',
  },
  {
    id: 'compound-beta',
    name: 'Trio Compound',
    description: 'Groq compound beta model',
  },
  {
    id: 'compound-beta-mini',
    name: 'Trio Compound Mini',
    description: 'Groq compound beta mini model',
  },
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Trio Llama 3.3',
    description: 'Llama 3.3 70B versatile model',
  },
  {
    id: 'qwen-qwq-32b',
    name: 'Trio Qwen QWQ',
    description: 'Qwen QWQ 32B reasoning model',
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Trio Llama 3.1 Fast',
    description: 'Llama 3.1 8B instant (14.4k req/day)',
  },
  {
    id: 'gemma2-9b-it',
    name: 'Trio Gemma 2',
    description: 'Gemma 2 9B instruction tuned (14.4k req/day)',
  },
  {
    id: 'llama3-70b-8192',
    name: 'Trio Llama 3 70B',
    description: 'Llama 3 70B classic (14.4k req/day)',
  },
  {
    id: 'llama3-8b-8192',
    name: 'Trio Llama 3 8B',
    description: 'Llama 3 8B classic (14.4k req/day)',
  },  // Optima Fast (Mistral Models)
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
  },
  // Optima Command Series (Cohere - 128K context, tool support)
  {
    id: 'command-a-03-2025',
    name: 'Optima Command A',
    description: 'Latest Cohere model (128K context, tools)',
  },
  {
    id: 'command-nightly',
    name: 'Optima Command Nightly',
    description: 'Cohere nightly build (128K context, tools)',
  },
  {
    id: 'command-r-plus-04-2024',
    name: 'Optima Command R+',
    description: 'Cohere R+ model (128K context, tools)',
  },
  {
    id: 'command-r-08-2024',
    name: 'Optima Command R',
    description: 'Cohere R model (128K context, tools)',
  },
  // Together.ai Series (200+ open-source models, free options)
  {
    id: 'meta-llama/Llama-Vision-Free',
    name: 'Together Vision Free',
    description: 'Llama Vision model - Free tier',
  },
  {
    id: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free',
    name: 'Together DeepSeek R1 Free',
    description: 'DeepSeek R1 distilled - Free tier',
  },
  {
    id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
    name: 'Together Llama 3.3 Free',
    description: 'Llama 3.3 70B Turbo - Free tier',
  },
  // Requesty AI Router Series (OpenAI-compatible gateway)
  {
    id: 'google/gemini-2.0-flash-exp',
    name: 'Requesty Gemini 2.0 Flash',
    description: 'Gemini 2.0 Flash Experimental via Requesty Router',
  },
  {
    id: 'gemma-3-27b-it-requesty',
    name: 'Requesty Gemma 3 27B',
    description: 'Gemma 3 27B instructive model via Requesty Router',
  },
  // Glama AI Gateway Series (OpenAI-compatible gateway)
  {
    id: 'phi-3-medium-128k-instruct',
    name: 'Glama Phi-3 Medium',
    description: 'Microsoft Phi-3 Medium 128K context via Glama',
  },
  {
    id: 'phi-3-mini-128k-instruct',
    name: 'Glama Phi-3 Mini',
    description: 'Microsoft Phi-3 Mini 128K context via Glama',
  },
  {
    id: 'llama-3.2-11b-vision-instruct',
    name: 'Glama Llama 3.2 Vision',
    description: 'Llama 3.2 11B with vision capabilities via Glama',
  },
  // Chutes AI Series (OpenAI-compatible gateway)
  {
    id: 'deepseek-ai/DeepSeek-V3-0324',
    name: 'Chutes DeepSeek V3',
    description: 'DeepSeek V3 latest model via Chutes AI',
  },
  {
    id: 'deepseek-ai/DeepSeek-R1',
    name: 'Chutes DeepSeek R1',
    description: 'DeepSeek R1 reasoning model via Chutes AI',
  },
  {
    id: 'Qwen/Qwen3-235B-A22B',
    name: 'Chutes Qwen 3 235B',
    description: 'Qwen 3 235B large model via Chutes AI',
  },
  {
    id: 'chutesai/Llama-4-Maverick-17B-128E-Instruct-FP8',
    name: 'Chutes Llama 4 Maverick',
    description: 'Llama 4 Maverick 17B FP8 optimized via Chutes AI',
  },  // X.AI Series (Grok Models)
  {
    id: 'grok-3-mini-beta',
    name: 'Optima Grok 3 Mini',
    description: 'X.AI Grok 3 Mini - Compact and efficient',
  },
  // OpenRouter Free Series (Multiple providers via OpenRouter)
  {
    id: 'qwen/qwen2.5-vl-72b-instruct:free',
    name: 'Router Qwen 2.5 VL 72B',
    description: 'Qwen 2.5 Vision-Language 72B - Free via OpenRouter',
  },
  {
    id: 'deepseek/deepseek-v3-base:free',
    name: 'Router DeepSeek V3 Base',
    description: 'DeepSeek V3 Base model - Free via OpenRouter',
  },
  {
    id: 'meta-llama/llama-4-scout:free',
    name: 'Router Llama 4 Scout',
    description: 'Llama 4 Scout - Free via OpenRouter',
  },
  {
    id: 'meta-llama/llama-4-maverick:free',
    name: 'Router Llama 4 Maverick',
    description: 'Llama 4 Maverick - Free via OpenRouter',
  },
  {
    id: 'nvidia/llama-3.1-nemotron-ultra-253b-v1:free',
    name: 'Router Nemotron Ultra 253B',
    description: 'NVIDIA Nemotron Ultra 253B - Free via OpenRouter',
  },
  {
    id: 'microsoft/mai-ds-r1:free',
    name: 'Router MAI DS R1',
    description: 'Microsoft MAI DS R1 - Free via OpenRouter',
  },
  {
    id: 'tngtech/deepseek-r1t-chimera:free',
    name: 'Router DeepSeek R1T Chimera',
    description: 'DeepSeek R1T Chimera - Free via OpenRouter',
  },
  // Cerebras Fast Series (Ultra-fast inference)
  {
    id: 'llama-4-scout-17b-16e-instruct-cerebras',
    name: 'Fast Llama 4 Scout',
    description: 'Llama 4 Scout via Cerebras - Ultra-fast inference',
  },
  {
    id: 'llama3.1-8b-cerebras',
    name: 'Fast Llama 3.1 8B',
    description: 'Llama 3.1 8B via Cerebras - 2200 tokens/s',
  },
  {
    id: 'llama-3.3-70b-cerebras',
    name: 'Fast Llama 3.3 70B',
    description: 'Llama 3.3 70B via Cerebras - 2100 tokens/s',
  },
  {
    id: 'qwen-3-32b-cerebras',
    name: 'Fast Qwen 3 32B',
    description: 'Qwen 3 32B via Cerebras - 2100 tokens/s',
  },
];
