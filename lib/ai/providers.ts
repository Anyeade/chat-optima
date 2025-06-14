import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { cerebras } from '@ai-sdk/cerebras';
// OpenRouter and Glama removed due to API issues
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

// Requesty AI (OpenAI-compatible API) - Enhanced for streaming
const requestyAI = createOpenAICompatible({
  name: 'requesty-ai',
  baseURL: 'https://router.requesty.ai/v1',
  apiKey: process.env.REQUESTY_AI_API_KEY || 'dummy-key', // Some providers may not require auth
  headers: {
    'User-Agent': 'ChatOptima/1.0',
  },
});

// Chutes AI (OpenAI-compatible API) - Enhanced for DeepSeek models
const chutesAI = createOpenAICompatible({
  name: 'chutes-ai',
  baseURL: 'https://llm.chutes.ai/v1',
  apiKey: process.env.CHUTES_AI_API_KEY || 'dummy-key', // Some providers may not require auth
  headers: {
    'User-Agent': 'ChatOptima/1.0',
  },
});

// Google Gemini (OpenAI-compatible endpoint) - Enhanced for streaming
const googleAI = createOpenAICompatible({
  name: 'google-ai',
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || 'dummy-key',
  headers: {
    'User-Agent': 'ChatOptima/1.0',
  },
});

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
    chutesai: process.env.CHUTES_AI_API_KEY,
    chutesimage: process.env.CHUTES_IMAGE_API_TOKEN,
    xai: process.env.XAI_API_KEY,
    cerebras: process.env.CEREBRAS_API_KEY,
  };
    console.log('🔑 Provider API Keys Status:');
  console.log('================================');
  Object.entries(keys).forEach(([provider, key]) => {
    const status = key && key !== 'dummy-key' ? '✅ Set' : '❌ Missing';
    const keyPreview = key && key !== 'dummy-key' ? `${key.substring(0, 8)}...` : 'Not found';
    console.log(`${provider.padEnd(12)}: ${status} (${keyPreview})`);
  });
  
  // Special debug for Cerebras
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
        }),        'title-model': groq('llama-3.1-8b-instant'), // Fast model for titles and JSON generation        'artifact-model': groq('meta-llama/llama-4-scout-17b-16e-instruct'),        // Google Gemini Models (OpenAI-compatible endpoint)
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
        'open-mistral-nemo': mistral('open-mistral-nemo'),        // Cohere Models (128K context, tool support, no vision)
        'command-a-03-2025': cohere('command-a-03-2025'),
        'command-nightly': cohere('command-nightly'),
        'command-r-plus-04-2024': cohere('command-r-plus-04-2024'),
        'command-r-08-2024': cohere('command-r-08-2024'),// Together.ai Models (200+ open-source models, free options)
        'meta-llama/Llama-Vision-Free': togetherai('meta-llama/Llama-Vision-Free'),
        'deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free': wrapLanguageModel({
          model: togetherai('deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free': togetherai('meta-llama/Llama-3.3-70B-Instruct-Turbo-Free'),

        // Requesty AI Router Models (OpenAI-compatible)
        'google/gemini-2.0-flash-exp': requestyAI('google/gemini-2.0-flash-exp'),
        'gemma-3-27b-it-requesty': requestyAI('gemma-3-27b-it'),// Glama AI Gateway Models removed due to API issues        // Chutes AI Models (OpenAI-compatible gateway) - Enhanced for 163k context
        'deepseek-ai/DeepSeek-V3-0324': chutesAI('deepseek-ai/DeepSeek-V3-0324'), // 163k context window
        'deepseek-ai/DeepSeek-R1': wrapLanguageModel({
          model: chutesAI('deepseek-ai/DeepSeek-R1'), // 163k context window with reasoning
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'Qwen/Qwen3-235B-A22B': wrapLanguageModel({
          model: chutesAI('Qwen/Qwen3-235B-A22B'), // Large context window
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'chutesai/Llama-4-Maverick-17B-128E-Instruct-FP8': chutesAI('chutesai/Llama-4-Maverick-17B-128E-Instruct-FP8'), // Extended context// X.AI Models (Grok series)
        'grok-3-mini-beta': xai('grok-3-mini-beta'),        // OpenRouter Models removed due to API issues

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
