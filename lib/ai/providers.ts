import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { xai } from '@ai-sdk/xai';
import { google } from '@ai-sdk/google';
import { groq } from '@ai-sdk/groq';
import { mistral } from '@ai-sdk/mistral';
import { cohere } from '@ai-sdk/cohere';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

// Debug function to check environment variables
function checkProviderKeys() {
  const keys = {
    google: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    groq: process.env.GROQ_API_KEY,
    mistral: process.env.MISTRAL_API_KEY,
    cohere: process.env.COHERE_API_KEY,
    xai: process.env.XAI_API_KEY,
  };
  
  console.log('Provider API Keys Status:');
  Object.entries(keys).forEach(([provider, key]) => {
    console.log(`${provider}: ${key ? '✓ Set' : '✗ Missing'}`);
  });
  
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
        'chat-model': xai('grok-2-vision-1212'),
        'chat-model-reasoning': wrapLanguageModel({
          model: xai('grok-3-mini-beta'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': xai('grok-2-1212'),
        'artifact-model': xai('grok-2-1212'),

        // Google Gemini Models
        'gemini-2.5-flash-preview-04-17': google('gemini-2.5-flash-preview-04-17'),
        'gemini-2.5-pro-preview-05-06': google('gemini-2.5-pro-preview-05-06'),
        'gemini-2.0-flash': google('gemini-2.0-flash'),
        'gemini-2.0-flash-lite-preview-02-05': google('gemini-2.0-flash-lite-preview-02-05'),
        'gemini-2.0-flash-thinking-exp-01-21': google('gemini-2.0-flash-thinking-exp-01-21'),
        'gemini-2.0-flash-thinking-exp-1219': google('gemini-2.0-flash-thinking-exp-1219'),
        'gemini-1.5-pro-001': google('gemini-1.5-pro-001'),
        'gemini-1.5-pro-002': google('gemini-1.5-pro-002'),
        'gemini-1.5-flash-001': google('gemini-1.5-flash-001'),
        'gemini-1.5-flash-002': google('gemini-1.5-flash-002'),
        'gemini-1.5-flash-8b-001': google('gemini-1.5-flash-8b-001'),
        'gemini-1.5-flash-8b-exp-0924': google('gemini-1.5-flash-8b-exp-0924'),
        'gemma-3-27b-it': google('gemma-3-27b-it'),

        // Groq Models
        'llama-4-scout-17b-16e-instruct': groq('meta-llama/llama-4-scout-17b-16e-instruct'),
        'qwen-qwq-32b': groq('qwen-qwq-32b'),
        'deepseek-r1-distill-llama-70b': groq('deepseek-r1-distill-llama-70b'),

        // Mistral Models
        'pixtral-12b-2409': mistral('pixtral-12b-2409'),

        // Cohere Models
        'command-r-plus': cohere('command-r-plus'),
        'command-r': cohere('command-r'),
        'command-light': cohere('command-light'),
      },
      imageModels: {
        'small-model': xai.image('grok-2-image'),
      },
    });
