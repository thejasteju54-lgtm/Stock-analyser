/**
 * DataSourceRateLimiter.ts
 * Phase 16 — Pre-Network Token Bucket Rate Limiter with Exponential Backoff & Jitter.
 * Enforces that no external network request is dispatched if the token budget is exhausted.
 */

export interface RateLimitStatus {
  isAllowed: boolean;
  remainingTokens: number;
  totalTokens: number;
  retryAfterMs?: number;
  resetTime: number;
}

export class DataSourceRateLimiter {
  private static readonly tokenBuckets = new Map<string, { tokens: number; lastRefill: number }>();

  /**
   * Pre-request authorization gate. Must be called before initiating external network requests.
   */
  public static acquire(sourceId: string, rateLimitPerMinute: number): RateLimitStatus {
    const now = Date.now();
    const bucket = this.tokenBuckets.get(sourceId) || { tokens: rateLimitPerMinute, lastRefill: now };

    // Refill tokens proportionally to elapsed time
    const elapsedMs = now - bucket.lastRefill;
    const tokensToAdd = (elapsedMs / 60000) * rateLimitPerMinute;
    bucket.tokens = Math.min(rateLimitPerMinute, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      this.tokenBuckets.set(sourceId, bucket);
      return {
        isAllowed: true,
        remainingTokens: Math.floor(bucket.tokens),
        totalTokens: rateLimitPerMinute,
        resetTime: now + 60000,
      };
    } else {
      const waitTimeMs = Math.ceil(((1 - bucket.tokens) / rateLimitPerMinute) * 60000);
      this.tokenBuckets.set(sourceId, bucket);
      return {
        isAllowed: false,
        remainingTokens: 0,
        totalTokens: rateLimitPerMinute,
        retryAfterMs: Math.max(waitTimeMs, 100),
        resetTime: now + waitTimeMs,
      };
    }
  }

  /**
   * Computes exponential backoff with full jitter for retry attempts.
   */
  public static getBackoffDelayMs(attempt: number, baseMs: number = 200, maxMs: number = 5000): number {
    const exp = Math.min(Math.pow(2, attempt) * baseMs, maxMs);
    // Full jitter between 0.5 * exp and exp
    return Math.floor((0.5 + Math.random() * 0.5) * exp);
  }

  public static reset(sourceId?: string): void {
    if (sourceId) {
      this.tokenBuckets.delete(sourceId);
    } else {
      this.tokenBuckets.clear();
    }
  }
}
