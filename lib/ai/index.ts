/**
 * AI Service Index - Main entry point for AI functionality
 * 
 * This module provides:
 * - In-memory caching with TTL
 * - Context management with conversation tracking
 * - Token counting and context window management
 * - NLP-based conversation summarization
 * - Multi-level rate limiting (per second, minute, hour, day)
 * - User entitlement integration
 * - Ultra-fast response generation (sub-3-second target)
 * - Optimized streaming with sub-500ms first token
 * - Both synchronous and asynchronous operations
 */

// Core exports
export { aiService, createAIServiceOptions } from './service';
export { contextManager } from './context-manager';
export { enhancedRateLimiter } from './enhanced-rate-limiter';
export {
  responseCache,
  contextCache,
  rateLimitCache,
  TTLCache,
  AsyncCache
} from './cache';

// Fast response exports
export {
  fastResponseService,
  getFastResponse,
  createFastOptions
} from './fast-response';
export {
  streamingOptimizer,
  getStreamingResponse,
  consumeStream
} from './streaming-optimizer';
export {
  slidingWindowOptimizer,
  autoOptimize,
  optimizeForSpeed,
  optimizeForBalance,
  optimizeForQuality
} from './sliding-window';

// Types
export type {
  AIServiceOptions,
  AIResponse,
  AIStreamResponse
} from './service';
export type {
  ConversationContext,
  ConversationMessage,
  ContextWindow,
  SummarizationStrategy,
  TokenCountResult
} from './context-manager';
export type {
  RateLimitConfig,
  RateLimitResult
} from './enhanced-rate-limiter';
export type {
  CacheEntry,
  CacheOptions,
  CacheKeyParams
} from './cache';
export type {
  FastResponseOptions,
  FastResponseResult
} from './fast-response';
export type {
  StreamingOptions,
  StreamingResult,
  StreamChunk
} from './streaming-optimizer';
export type {
  WindowSlice,
  SlidingWindowConfig
} from './sliding-window';

// Utility functions
export { 
  estimateTokenCount, 
  countMessageTokens, 
  summarizationStrategies, 
  contextWindows 
} from './context-manager';

// Configuration
export { entitlementsByUserType } from './entitlements';
export { chatModels, DEFAULT_CHAT_MODEL } from './models';
export { myProvider } from './providers';

// Legacy exports for backward compatibility
export { RateLimiter } from './rate-limiter';