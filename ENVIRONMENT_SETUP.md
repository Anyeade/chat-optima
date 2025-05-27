# Environment Variables Setup for AI Providers

## Required Environment Variables for Vercel

To use all the AI providers in your application, you need to set the following environment variables in your Vercel project settings:

### 1. Google AI (Gemini Models)
```
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key_here
```
- Get your API key from: https://aistudio.google.com/app/apikey
- Used for all Gemini models (gemini-2.0-flash, gemini-1.5-pro, etc.)

### 2. Groq
```
GROQ_API_KEY=your_groq_api_key_here
```
- Get your API key from: https://console.groq.com/keys
- Used for Llama, Qwen, and DeepSeek models

### 3. Mistral AI
```
MISTRAL_API_KEY=your_mistral_api_key_here
```
- Get your API key from: https://console.mistral.ai/api-keys/
- Used for Pixtral models

### 4. Cohere
```
COHERE_API_KEY=your_cohere_api_key_here
```
- Get your API key from: https://dashboard.cohere.com/api-keys
- Used for Command models

### 5. X.AI (Grok)
```
XAI_API_KEY=your_xai_api_key_here
```
- Get your API key from: https://console.x.ai/
- Used for Grok models

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable with its corresponding value
5. Make sure to set them for all environments (Production, Preview, Development)
6. Redeploy your application after adding the variables

## Debugging

After setting up the environment variables, check your Vercel function logs to see:
- Which API keys are detected
- Which model is being selected
- Any authentication errors

The application will now log the provider status and selected models to help you debug any issues.

## Model Mapping

- **Optima Series** → Google Gemini models
- **Trio Series** → Groq models  
- **Optima Fast** → Mistral models
- **Optima Deluxe/Light** → Cohere models
- **Optima Core/Reasoning** → X.AI Grok models 