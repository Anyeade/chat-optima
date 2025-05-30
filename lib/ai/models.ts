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
  // Optima Series (selected Google models only)
  {
    id: 'gemini-2.0-flash',
    name: 'Optima Flash 2.0',
    description: 'HansTech flash model',
  },
  {
    id: 'gemini-1.5-flash-8b',
    name: 'Optima Flash Lite',
    description: 'HansTech lightweight flash (Gemini 1.5 Flash 8B)',
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
  },
  // Optima Fast
  {
    id: 'pixtral-12b-2409',
    name: 'Optima Fast',
    description: 'HansTech fast model',
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
  },
  // X.AI Series (Optional - Commented out for now)
  // {
  //   id: 'grok-2-vision-1212',
  //   name: 'Grok Vision 2',
  //   description: 'X.AI vision model',
  // },
  // {
  //   id: 'grok-3-mini-beta',
  //   name: 'Grok 3 Mini',
  //   description: 'X.AI compact model',
  // },
  // {
  //   id: 'grok-2-1212',
  //   name: 'Grok 2',
  //   description: 'X.AI standard model',
  // },
];
