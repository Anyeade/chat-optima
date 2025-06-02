export class RateLimiter {
  private tokensPerInterval: number;
  private interval: number;
  private tokenBucket: number;
  private lastRefillTime: number;

  constructor(tokensPerInterval: number, interval: number) {
    this.tokensPerInterval = tokensPerInterval;
    this.interval = interval;
    this.tokenBucket = tokensPerInterval;
    this.lastRefillTime = Date.now();
  }

  /**
   * Check if a request can be made
   */
  allowRequest(): boolean {
    this.refillTokenBucket();

    if (this.tokenBucket >= 1) {
      this.tokenBucket -= 1;
      return true;
    }

    return false;
  }

  /**
   * Refill the token bucket
   */
  private refillTokenBucket(): void {
    const now = Date.now();
    const timeSinceLastRefill = now - this.lastRefillTime;
    const tokensToAdd = (timeSinceLastRefill / this.interval) * this.tokensPerInterval;

    this.tokenBucket = Math.min(this.tokensPerInterval, this.tokenBucket + tokensToAdd);
    this.lastRefillTime = now;
  }
}