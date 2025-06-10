import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { cerebras } from '@ai-sdk/cerebras';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { xai } from '@ai-sdk/xai';
import { groq } from '@ai-sdk/groq';
import { mistral } from '@ai-sdk/mistral';
import { cohere } from '@ai-sdk/cohere';
import { openai } from '@ai-sdk/openai';
import { togetherai } from '@ai-sdk/togetherai';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

// Create OpenAI-compatible providers
const requestyAI = createOpenAICompatible({
  name: 'requesty-ai',
  baseURL: 'https://router.requesty.ai/v1',
  apiKey: process.env.REQUESTY_AI_API_KEY || 'dummy-key', // Some providers may not require auth
});

const glamaAI = createOpenAICompatible({
  name: 'glama-ai',
  baseURL: 'https://glama.ai/api/gateway/openai/v1',
  apiKey: process.env.GLAMA_AI_API_KEY || 'dummy-key', // Some providers may not require auth
});

const chutesAI = createOpenAICompatible({
  name: 'chutes-ai',
  baseURL: 'https://llm.chutes.ai/v1',
  apiKey: process.env.CHUTES_AI_API_KEY || 'dummy-key', // Some providers may not require auth
});

// Google Gemini (OpenAI-compatible endpoint)
const googleAI = createOpenAICompatible({
  name: 'google-ai',
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || 'dummy-key',
});

// OpenRouter (Official AI SDK Provider)
const openRouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || 'dummy-key',
  headers: {
    'HTTP-Referer': process.env.VERCEL_URL || 'https://chat-optima.vercel.app',
    'X-Title': 'Chat Optima',
  },
});

// Cerebras (Official AI SDK Provider) - No custom config needed
// Uses CEREBRAS_API_KEY environment variable automatically

// Debug function to check environment variables
function checkProviderKeys() {
  const keys = {
    google: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    groq: process.env.GROQ_API_KEY,
    mistral: process.env.MISTRAL_API_KEY,
    cohere: process.env.COHERE_API_KEY,
    openai: process.env.OPENAI_API_KEY,
    togetherai: process.env.TOGETHER_AI_API_KEY,
    requestyai: process.env.REQUESTY_AI_API_KEY,
    glamaai: process.env.GLAMA_AI_API_KEY,
    chutesai: process.env.CHUTES_AI_API_KEY,
    chutesimage: process.env.CHUTES_IMAGE_API_TOKEN,
    xai: process.env.XAI_API_KEY,
    openrouter: process.env.OPENROUTER_API_KEY,
    cerebras: process.env.CEREBRAS_API_KEY,
  };
  
  console.log('🔑 Provider API Keys Status:');
  console.log('================================');
  Object.entries(keys).forEach(([provider, key]) => {
    const status = key && key !== 'dummy-key' ? '✅ Set' : '❌ Missing';
    const keyPreview = key && key !== 'dummy-key' ? `${key.substring(0, 8)}...` : 'Not found';
    console.log(`${provider.padEnd(12)}: ${status} (${keyPreview})`);
  });
  // Special debug for the new providers
  if (process.env.OPENROUTER_API_KEY) {
    console.log('🌐 OpenRouter (Official AI SDK):', {
      'HTTP-Referer': process.env.VERCEL_URL || 'https://chat-optima.vercel.app',
      'X-Title': 'Chat Optima',
      'API-Key-Length': process.env.OPENROUTER_API_KEY.length
    });
  }
  
  if (process.env.CEREBRAS_API_KEY) {
    console.log('🧠 Cerebras (Official AI SDK):', {
      'Auto-configuration': 'Uses CEREBRAS_API_KEY environment variable',
      'API-Key-Length': process.env.CEREBRAS_API_KEY.length
    });
  }
  
  console.log('================================');
  
  return keys;
}

// Check keys on initialization
if (!isTestEnvironment) {
  checkProviderKeys();
}

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': groq('meta-llama/llama-4-scout-17b-16e-instruct'),
        'chat-model-reasoning': wrapLanguageModel({
          model: groq('deepseek-r1-distill-llama-70b'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),        'title-model': groq('llama3-70b-8192'), // High volume model with tool support        'artifact-model': groq('meta-llama/llama-4-scout-17b-16e-instruct'),        // Google Gemini Models (OpenAI-compatible endpoint)
        'gemini-2.0-flash': googleAI('gemini-2.0-flash'),
        'gemini-2.0-flash-lite': googleAI('gemini-2.0-flash-lite'), 
        'gemini-2.0-flash-exp': googleAI('gemini-2.0-flash-exp'),
        'gemini-2.0-flash-thinking-exp-01-21': googleAI('gemini-2.0-flash-thinking-exp-01-21'),
        'gemma-3-27b-it': googleAI('gemma-3-27b-it'),

        // Groq Models
        // Premium models (lower daily limits but high token throughput)
        'meta-llama/llama-4-scout-17b-16e-instruct': groq('meta-llama/llama-4-scout-17b-16e-instruct'), // 30k tokens/min, 1k req/day
        'meta-llama/llama-4-maverick-17b-128e-instruct': groq('meta-llama/llama-4-maverick-17b-128e-instruct'), // 6k tokens/min, 1k req/day
        'compound-beta': groq('compound-beta'), // 70k tokens/min, 200 req/day
        'compound-beta-mini': groq('compound-beta-mini'), // 70k tokens/min, 200 req/day
        'deepseek-r1-distill-llama-70b': wrapLanguageModel({
          model: groq('deepseek-r1-distill-llama-70b'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }), // 6k tokens/min, 1k req/day        'llama-3.3-70b-versatile': groq('llama-3.3-70b-versatile'), // 12k tokens/min, 1k req/day
        'qwen-qwq-32b': wrapLanguageModel({
          model: groq('qwen-qwq-32b'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }), // 6k tokens/min, 1k req/day
        
        // High volume models (higher daily limits)
        'llama-3.1-8b-instant': groq('llama-3.1-8b-instant'), // 6k tokens/min, 14.4k req/day
        'gemma2-9b-it': groq('gemma2-9b-it'), // 15k tokens/min, 14.4k req/day
        'llama3-70b-8192': groq('llama3-70b-8192'), // 6k tokens/min, 14.4k req/day
        'llama3-8b-8192': groq('llama3-8b-8192'), // 6k tokens/min, 14.4k req/day        // Mistral Models
        'pixtral-12b-2409': mistral('pixtral-12b-2409'),
        'mistral-small-2503': mistral('mistral-small-2503'),
        'devstral-small-2505': mistral('devstral-small-2505'),
        'open-codestral-mamba': mistral('open-codestral-mamba'),
        'open-mistral-nemo': mistral('open-mistral-nemo'),

        // Cohere Models (128K context, tool support, no vision)
        'command-a-03-2025': cohere('command-a-03-2025'),
        'command-nightly': cohere('command-nightly'),
        'command-r-plus-04-2024': cohere('command-r-plus-04-2024'),
        'command-r-08-2024': cohere('command-r-08-2024'),

        // Together.ai Models (200+ open-source models, free options)
        'meta-llama/Llama-Vision-Free': togetherai('meta-llama/Llama-Vision-Free'),
        'deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free': wrapLanguageModel({
          model: togetherai('deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free': togetherai('meta-llama/Llama-3.3-70B-Instruct-Turbo-Free'),

        // Requesty AI Router Models (OpenAI-compatible)
        'google/gemini-2.0-flash-exp': requestyAI('google/gemini-2.0-flash-exp'),
        'gemma-3-27b-it-requesty': requestyAI('gemma-3-27b-it'),

        // Glama AI Gateway Models (OpenAI-compatible)
        'phi-3-medium-128k-instruct': glamaAI('phi-3-medium-128k-instruct'),
        'phi-3-mini-128k-instruct': glamaAI('phi-3-mini-128k-instruct'),
        'llama-3.2-11b-vision-instruct': glamaAI('llama-3.2-11b-vision-instruct'),

        // Chutes AI Models (OpenAI-compatible)
        'deepseek-ai/DeepSeek-V3-0324': chutesAI('deepseek-ai/DeepSeek-V3-0324'),        'deepseek-ai/DeepSeek-R1': wrapLanguageModel({
          model: chutesAI('deepseek-ai/DeepSeek-R1'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'Qwen/Qwen3-235B-A22B': wrapLanguageModel({
          model: chutesAI('Qwen/Qwen3-235B-A22B'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'chutesai/Llama-4-Maverick-17B-128E-Instruct-FP8': chutesAI('chutesai/Llama-4-Maverick-17B-128E-Instruct-FP8'),// X.AI Models (Grok series)
        'grok-3-mini-beta': xai('grok-3-mini-beta'),        // OpenRouter Models (Free tier with multiple providers)
        'qwen/qwen2.5-vl-72b-instruct:free': wrapLanguageModel({
          model: openRouter.chat('qwen/qwen2.5-vl-72b-instruct:free'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'deepseek/deepseek-v3-base:free': openRouter.chat('deepseek/deepseek-v3-base:free'),
        'meta-llama/llama-4-scout:free': openRouter.chat('meta-llama/llama-4-scout:free'),
        'meta-llama/llama-4-maverick:free': openRouter.chat('meta-llama/llama-4-maverick:free'),
        'nvidia/llama-3.1-nemotron-ultra-253b-v1:free': openRouter.chat('nvidia/llama-3.1-nemotron-ultra-253b-v1:free'),
        'microsoft/mai-ds-r1:free': openRouter.chat('microsoft/mai-ds-r1:free'),
        'tngtech/deepseek-r1t-chimera:free': openRouter.chat('tngtech/deepseek-r1t-chimera:free'),

        // Cerebras Models (Ultra-fast inference, free tier)
        'llama-4-scout-17b-16e-instruct-cerebras': cerebras('llama-4-scout-17b-16e-instruct'),
        'llama3.1-8b-cerebras': cerebras('llama3.1-8b'),
        'llama-3.3-70b-cerebras': cerebras('llama-3.3-70b'),
        'qwen-3-32b-cerebras': cerebras('qwen-3-32b'),
      },
      imageModels: {
        'small-model': xai.image('grok-2-image-1212'),
      },
    });
