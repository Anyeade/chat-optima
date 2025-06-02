# AI Service with Caching and Context Management

This comprehensive AI service provides advanced caching, context management, rate limiting, and conversation tracking for chat applications.

## Features

### 🚀 **Caching Layer**
- **In-memory cache using Map** for fast lookups
- **TTL (Time To Live)** for cache entries with automatic cleanup
- **Cache key generation** based on request parameters
- **Support for both synchronous and asynchronous operations**
- **LRU-style eviction** when cache reaches capacity

### 🧠 **Context Management**
- **Track conversation history** with automatic token counting
- **Context condensing and summarizing** using NLP techniques
- **Automatic context window management** per model
- **Different summarization strategies** (conservative, aggressive, balanced, minimal)
- **Token counting and estimation** for messages

### 🛡️ **Rate Limiting**
- **Multi-level rate limiting**: per second, minute, hour, and day
- **User-based entitlements** integration
- **1 request per 10 seconds** and **10 requests per minute** global limits
- **Burst allowance** for legitimate usage spikes
- **Per-user type limits** (guest vs regular users)

## Quick Start

```typescript
import { aiService, createAIServiceOptions } from '@/lib/ai';

// Basic usage
const options = createAIServiceOptions(
  'chat-model', // modelId
  'user123',    // userId
  'conv456',    // conversationId
  'regular'     // userType
);

const response = await aiService.generateResponse([
  { role: 'user', content: 'Hello, how are you?' }
], options);

console.log(response.content);
```

## API Reference

### AIService

#### `generateResponse(messages, options)`
Generate a text response with full context management.

```typescript
const response = await aiService.generateResponse(messages, {
  modelId: 'chat-model',
  userId: 'user123',
  conversationId: 'conv456',
  userType: 'regular',
  useCache: true,
  cacheTTL: 600000, // 10 minutes
  temperature: 0.7,
  maxTokens: 2048
});
```

#### `generateStreamingResponse(messages, options)`
Generate a streaming response for real-time chat.

```typescript
const stream = await aiService.generateStreamingResponse(messages, options);
// Handle stream.stream ReadableStream
```

### Cache System

#### TTLCache
Basic cache with TTL support.

```typescript
import { TTLCache } from '@/lib/ai';

const cache = new TTLCache({
  defaultTTL: 300000,  // 5 minutes
  maxSize: 1000,       // 1000 entries max
  cleanupInterval: 60000 // 1 minute cleanup
});

cache.set('key', 'value', 120000); // 2 minute TTL
const value = cache.get('key');
```

#### AsyncCache
Async-friendly cache for Promise-based operations.

```typescript
import { AsyncCache } from '@/lib/ai';

const asyncCache = new AsyncCache();

const result = await asyncCache.getOrSet(
  'expensive-operation',
  async () => {
    // Expensive async operation
    return await fetchDataFromAPI();
  },
  300000 // 5 minute TTL
);
```

### Context Management

#### Track Conversations
```typescript
import { contextManager } from '@/lib/ai';

// Create context
const context = contextManager.createContext('conv123', 'user456', 'chat-model');

// Add messages
contextManager.addMessage('conv123', {
  role: 'user',
  content: 'What is the weather like?'
}, 'msg123');

// Get optimized messages for AI request
const { messages, tokenCount, truncated } = 
  contextManager.getMessagesForRequest('conv123', 'chat-model');
```

#### Token Counting
```typescript
import { countMessageTokens, estimateTokenCount } from '@/lib/ai';

const tokenCount = countMessageTokens({
  role: 'user',
  content: 'Hello, how are you today?'
});

const textTokens = estimateTokenCount('This is some text');
```

#### Summarization Strategies
```typescript
import { summarizationStrategies, contextManager } from '@/lib/ai';

// Available strategies: conservative, aggressive, balanced, minimal
const context = contextManager.summarizeContext(
  existingContext, 
  summarizationStrategies.balanced
);
```

### Rate Limiting

#### Check Rate Limits
```typescript
import { enhancedRateLimiter } from '@/lib/ai';

const result = enhancedRateLimiter.checkRateLimit('user123', 'regular');

if (!result.allowed) {
  console.log(`Rate limited: ${result.reason}`);
  console.log(`Reset time: ${new Date(result.resetTime!)}`);
}
```

#### Get User Status
```typescript
const status = enhancedRateLimiter.getStatus('user123', 'regular');

console.log('Daily usage:', status.dailyEntitlement.used);
console.log('Remaining today:', status.dailyEntitlement.remaining);
console.log('Rate limits:', status.limits);
```

## Configuration

### Context Windows
Configure context windows per model:

```typescript
import { contextWindows } from '@/lib/ai';

// Models with different context sizes
contextWindows['my-model'] = {
  maxTokens: 32000,
  reserveTokens: 4096,
  warningThreshold: 28000
};
```

### Summarization Strategies
Create custom summarization strategies:

```typescript
import { summarizationStrategies } from '@/lib/ai';

summarizationStrategies.custom = {
  name: 'Custom',
  triggerTokenCount: 20000,
  targetTokenCount: 8000,
  preserveRecentMessages: 5,
  summarizeOldMessages: true
};
```

### Rate Limits per User Type
Rate limits are automatically configured based on user entitlements:

- **Guest users**: 1 req/10s, 6 req/min, 30 req/hour, 30 req/day
- **Regular users**: 1 req/5s, 20 req/min, 200 req/hour, 200 req/day

## Advanced Usage

### Custom Cache Implementation
```typescript
import { TTLCache } from '@/lib/ai';

class CustomCache extends TTLCache {
  constructor() {
    super({
      defaultTTL: 3600000, // 1 hour
      maxSize: 5000,
      cleanupInterval: 300000 // 5 minutes
    });
  }

  // Custom cache logic
  smartSet(key: string, value: any, priority: 'high' | 'low' = 'low') {
    const ttl = priority === 'high' ? 7200000 : 3600000; // 2h vs 1h
    this.set(key, value, ttl);
  }
}
```

### Context Middleware
```typescript
// Add custom middleware for context processing
const processedContext = contextManager.getContext('conv123');
if (processedContext) {
  // Custom processing
  const enhancedContext = {
    ...processedContext,
    metadata: {
      userPreferences: getUserPreferences(processedContext.userId),
      conversationTopic: extractTopic(processedContext.messages)
    }
  };
}
```

### Cache Warming
```typescript
// Pre-warm cache with common requests
async function warmCache() {
  const commonPrompts = [
    'Hello, how are you?',
    'What is the weather like?',
    'Help me write an email'
  ];

  for (const prompt of commonPrompts) {
    const cacheKey = TTLCache.generateKey({
      modelId: 'chat-model',
      prompt,
      temperature: 0.7
    });
    
    // Pre-generate and cache responses
    await responseCache.getOrSet(cacheKey, async () => {
      return await generateCommonResponse(prompt);
    });
  }
}
```

## Monitoring and Debugging

### Get System Statistics
```typescript
import { aiService } from '@/lib/ai';

const stats = aiService.getStats();
console.log('Cache hit rate:', stats.responseCache);
console.log('Context usage:', stats.contextManager);
console.log('Rate limit status:', stats.rateLimiter);
```

### Cleanup Operations
```typescript
// Manual cleanup of expired data
aiService.cleanup();

// Or cleanup specific components
responseCache.cleanup();
contextManager.cleanup();
enhancedRateLimiter.cleanup();
```

### Debug Mode
```typescript
// Enable debug logging
process.env.AI_DEBUG = 'true';

// This will log:
// - Cache hits/misses
// - Context summarization events
// - Rate limit checks
// - Token usage
```

## Best Practices

1. **Cache Strategy**: Use shorter TTL for dynamic content, longer for static responses
2. **Context Management**: Regularly summarize long conversations to manage token usage
3. **Rate Limiting**: Monitor rate limit usage and adjust limits based on user behavior
4. **Token Optimization**: Use context window management to reduce token costs
5. **Error Handling**: Always handle rate limit and entitlement errors gracefully

## Error Handling

```typescript
try {
  const response = await aiService.generateResponse(messages, options);
} catch (error) {
  if (error.message.includes('Rate limit exceeded')) {
    // Handle rate limiting
    const status = enhancedRateLimiter.getStatus(userId, userType);
    const resetTime = new Date(status.resetTimes.daily);
    console.log(`Rate limited until ${resetTime}`);
  } else if (error.message.includes('not available for user type')) {
    // Handle model entitlement error
    console.log('Upgrade required for this model');
  } else {
    // Handle other errors
    console.error('AI service error:', error);
  }
}
```

This AI service provides a robust foundation for building intelligent chat applications with proper resource management, user limitations, and performance optimization.