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

### 5. Together.ai
```
TOGETHER_AI_API_KEY=your_together_ai_api_key_here
```
- Get your API key from: https://api.together.xyz/settings/api-keys
- Used for 200+ open-source models with free tier options

### 6. Requesty AI Router (Optional)
```
REQUESTY_AI_API_KEY=your_requesty_ai_api_key_here
```
- Get your API key from: https://router.requesty.ai/
- OpenAI-compatible router for accessing various models
- May not require authentication for some endpoints

### 7. Glama AI Gateway (Optional)
```
GLAMA_AI_API_KEY=your_glama_ai_api_key_here
```
- Get your API key from: https://glama.ai/
- OpenAI-compatible gateway for accessing Phi-3 and Llama models
- May not require authentication for some endpoints

### 8. Chutes AI (Optional)
```
CHUTES_AI_API_KEY=your_chutes_ai_api_key_here
```
- Get your API key from: https://llm.chutes.ai/
- OpenAI-compatible provider for DeepSeek V3, DeepSeek R1, Qwen 3, and Llama 4 models
- May not require authentication for some endpoints

### 8b. Chutes AI Image Generation (Optional)
```
CHUTES_IMAGE_API_TOKEN=your_chutes_image_api_token_here
```
- Get your API token from: https://chutes-infiniteyou.chutes.ai/
- Used for AI image generation (replaces OpenAI DALL-E 3)
- Primary image generation provider with OpenAI fallback

### 9. X.AI (Grok) - Optional
```
XAI_API_KEY=your_xai_api_key_here
```
- Get your API key from: https://console.x.ai/
- Used for Grok models (currently commented out due to credit limits)

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