import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TTLCache, AsyncCache, contextManager, enhancedRateLimiter } from './index';
import { estimateTokenCount, countMessageTokens } from './context-manager';
import type { CoreMessage } from 'ai';

describe('TTL Cache', () => {
  let cache: TTLCache<string>;

  beforeEach(() => {
    cache = new TTLCache<string>({
      defaultTTL: 1000, // 1 second for testing
      maxSize: 5,
      cleanupInterval: 100,
    });
  });

  afterEach(() => {
    cache.destroy();
  });

  it('should store and retrieve values', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('should expire values after TTL', async () => {
    cache.set('key1', 'value1', 500); // 500ms TTL
    expect(cache.get('key1')).toBe('value1');
    
    await new Promise(resolve => setTimeout(resolve, 600));
    expect(cache.get('key1')).toBeNull();
  });

  it('should generate consistent cache keys', () => {
    const params1 = { modelId: 'test', userId: 'user1', temp: 0.7 };
    const params2 = { userId: 'user1', modelId: 'test', temp: 0.7 };
    
    const key1 = TTLCache.generateKey(params1);
    const key2 = TTLCache.generateKey(params2);
    
    expect(key1).toBe(key2);
  });

  it('should evict oldest entries when maxSize is reached', () => {
    for (let i = 0; i < 10; i++) {
      cache.set(`key${i}`, `value${i}`);
    }
    
    expect(cache.getStats().size).toBeLessThanOrEqual(5);
  });

  it('should provide accurate statistics', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.get('key1'); // Access key1
    
    const stats = cache.getStats();
    expect(stats.size).toBe(2);
    expect(stats.totalAccesses).toBe(1);
  });
});

describe('Async Cache', () => {
  let cache: AsyncCache<string>;

  beforeEach(() => {
    cache = new AsyncCache<string>({
      defaultTTL: 1000,
      maxSize: 5,
    });
  });

  afterEach(() => {
    cache.destroy();
  });

  it('should handle async operations', async () => {
    let callCount = 0;
    const fetcher = async () => {
      callCount++;
      return 'async-value';
    };

    const result1 = await cache.getOrSet('async-key', fetcher);
    const result2 = await cache.getOrSet('async-key', fetcher);

    expect(result1).toBe('async-value');
    expect(result2).toBe('async-value');
    expect(callCount).toBe(1); // Should only call fetcher once
  });

  it('should handle concurrent requests', async () => {
    let callCount = 0;
    const fetcher = async () => {
      callCount++;
      await new Promise(resolve => setTimeout(resolve, 100));
      return 'concurrent-value';
    };

    const promises = Array(5).fill(0).map(() => 
      cache.getOrSet('concurrent-key', fetcher)
    );

    const results = await Promise.all(promises);
    
    expect(results).toEqual(Array(5).fill('concurrent-value'));
    expect(callCount).toBe(1); // Should only call fetcher once despite concurrent requests
  });
});

describe('Token Counting', () => {
  it('should estimate token count for text', () => {
    const text = 'Hello world, this is a test message.';
    const tokens = estimateTokenCount(text);
    expect(tokens).toBeGreaterThan(0);
    expect(tokens).toBeLessThan(text.length); // Should be less than character count
  });

  it('should count tokens in messages', () => {
    const message: CoreMessage = {
      role: 'user',
      content: 'This is a test message for token counting.',
    };

    const tokens = countMessageTokens(message);
    expect(tokens).toBeGreaterThan(3); // Should include role overhead
  });

  it('should handle multimodal content', () => {
    const message: CoreMessage = {
      role: 'user',
      content: [
        { type: 'text', text: 'Describe this image:' },
        { type: 'image', image: 'data:image/jpeg;base64,...' },
      ],
    };

    const tokens = countMessageTokens(message);
    expect(tokens).toBeGreaterThan(765); // Should include image token cost
  });
});

describe('Context Manager', () => {
  beforeEach(() => {
    // Clean up any existing contexts
    contextManager.cleanup();
  });

  it('should create and manage conversation contexts', () => {
    const context = contextManager.createContext('conv1', 'user1', 'chat-model');
    
    expect(context.id).toBe('conv1');
    expect(context.userId).toBe('user1');
    expect(context.messages).toEqual([]);
    expect(context.totalTokens).toBe(0);
  });

  it('should add messages to context', () => {
    contextManager.createContext('conv1', 'user1', 'chat-model');
    
    const message: CoreMessage = {
      role: 'user',
      content: 'Hello, how are you?',
    };

    const updatedContext = contextManager.addMessage('conv1', message, 'msg1');
    
    expect(updatedContext.messages).toHaveLength(1);
    expect(updatedContext.messages[0].content).toBe('Hello, how are you?');
    expect(updatedContext.totalTokens).toBeGreaterThan(0);
  });

  it('should optimize messages for requests', () => {
    contextManager.createContext('conv1', 'user1', 'chat-model');
    
    // Add multiple messages
    for (let i = 0; i < 5; i++) {
      contextManager.addMessage('conv1', {
        role: 'user',
        content: `Message ${i}`,
      }, `msg${i}`);
    }

    const { messages, tokenCount, truncated } = 
      contextManager.getMessagesForRequest('conv1', 'chat-model');

    expect(messages).toHaveLength(5);
    expect(tokenCount).toBeGreaterThan(0);
    expect(truncated).toBe(false);
  });

  it('should summarize context when needed', () => {
    const context = contextManager.createContext('conv1', 'user1', 'chat-model');
    
    // Add many messages to trigger summarization
    for (let i = 0; i < 50; i++) {
      contextManager.addMessage('conv1', {
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `This is a longer message ${i} that contains more content to increase token count and trigger summarization when the context gets too large.`,
      }, `msg${i}`);
    }

    const updatedContext = contextManager.getContext('conv1');
    expect(updatedContext?.summary).toBeDefined();
  });
});

describe('Enhanced Rate Limiter', () => {
  beforeEach(() => {
    enhancedRateLimiter.cleanup();
  });

  it('should allow requests within limits', () => {
    const result = enhancedRateLimiter.checkRateLimit('user1', 'regular');
    expect(result.allowed).toBe(true);
  });

  it('should block requests exceeding rate limits', () => {
    // Make multiple requests quickly
    for (let i = 0; i < 12; i++) {
      enhancedRateLimiter.checkRateLimit('user1', 'regular');
    }

    const result = enhancedRateLimiter.checkRateLimit('user1', 'regular');
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Rate limit exceeded');
  });

  it('should respect different limits for different user types', () => {
    const guestResult = enhancedRateLimiter.checkRateLimit('guest1', 'guest');
    const regularResult = enhancedRateLimiter.checkRateLimit('user1', 'regular');
    
    expect(guestResult.allowed).toBe(true);
    expect(regularResult.allowed).toBe(true);
    
    const guestStatus = enhancedRateLimiter.getStatus('guest1', 'guest');
    const regularStatus = enhancedRateLimiter.getStatus('user1', 'regular');
    
    expect(guestStatus.dailyEntitlement.total).toBe(30);
    expect(regularStatus.dailyEntitlement.total).toBe(200);
  });

  it('should provide detailed status information', () => {
    enhancedRateLimiter.checkRateLimit('user1', 'regular');
    
    const status = enhancedRateLimiter.getStatus('user1', 'regular');
    
    expect(status.userId).toBe('user1');
    expect(status.userType).toBe('regular');
    expect(status.usage.perDay).toBe(1);
    expect(status.remaining.perDay).toBe(199);
    expect(status.dailyEntitlement.used).toBe(1);
    expect(status.dailyEntitlement.remaining).toBe(199);
  });

  it('should clear user limits when requested', () => {
    // Use up some rate limit
    for (let i = 0; i < 5; i++) {
      enhancedRateLimiter.checkRateLimit('user1', 'regular');
    }
    
    let status = enhancedRateLimiter.getStatus('user1', 'regular');
    expect(status.usage.perDay).toBe(5);
    
    enhancedRateLimiter.clearUserLimits('user1');
    
    status = enhancedRateLimiter.getStatus('user1', 'regular');
    expect(status.usage.perDay).toBe(0);
  });
});

describe('Integration Tests', () => {
  it('should work together - cache, context, and rate limiting', () => {
    // Test the full integration
    const cache = new TTLCache({ defaultTTL: 1000 });
    
    // Create context
    const context = contextManager.createContext('integration-test', 'user1', 'chat-model');
    
    // Check rate limit
    const rateLimitResult = enhancedRateLimiter.checkRateLimit('user1', 'regular');
    expect(rateLimitResult.allowed).toBe(true);
    
    // Add message to context
    contextManager.addMessage('integration-test', {
      role: 'user',
      content: 'Integration test message',
    }, 'msg1');
    
    // Cache a response
    const cacheKey = TTLCache.generateKey({
      conversationId: 'integration-test',
      modelId: 'chat-model',
      userId: 'user1',
    });
    
    cache.set(cacheKey, 'Cached response');
    
    // Verify everything works
    const cachedResponse = cache.get(cacheKey);
    expect(cachedResponse).toBe('Cached response');
    
    const updatedContext = contextManager.getContext('integration-test');
    expect(updatedContext?.messages).toHaveLength(1);
    
    cache.destroy();
  });
});