/**
 * 10_rateLimiterPreRequestAuthorization.test.ts
 * Phase 16 — Rate Limiter Pre-Request Authorization Gate Verification.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DataSourceRateLimiter } from '../../../src/domain/dataSources/DataSourceRateLimiter';
import { MarketDataAdapter } from '../../../src/domain/dataSources/MarketDataAdapter';
import { DataSourceCache } from '../../../src/domain/dataSources/DataSourceCache';

describe('Rate Limiter Pre-Request Gate (Phase 16)', () => {
  beforeEach(() => {
    DataSourceRateLimiter.reset();
    DataSourceCache.invalidate();
  });

  it('authorizes requests when token budget is available', () => {
    const status = DataSourceRateLimiter.acquire('TEST_SOURCE', 10);
    expect(status.isAllowed).toBe(true);
    expect(status.remainingTokens).toBe(9);
  });

  it('rejects acquisition and enforces retry delay when token budget is exhausted', () => {
    const rateLimit = 3;
    // Consume all tokens
    for (let i = 0; i < rateLimit; i++) {
      const s = DataSourceRateLimiter.acquire('TEST_SOURCE_EXHAUST', rateLimit);
      expect(s.isAllowed).toBe(true);
    }

    // 4th request must be rejected
    const exhaustedStatus = DataSourceRateLimiter.acquire('TEST_SOURCE_EXHAUST', rateLimit);
    expect(exhaustedStatus.isAllowed).toBe(false);
    expect(exhaustedStatus.remainingTokens).toBe(0);
    expect(exhaustedStatus.retryAfterMs).toBeGreaterThan(0);
  });

  it('proves MarketDataAdapter rejects before network fetch when rate limit is exceeded', async () => {
    const adapter = new MarketDataAdapter('NSE_OFFICIAL_FEED');
    const limit = adapter.metadata.rateLimitPerMinute;

    // Exhaust all tokens
    for (let i = 0; i < limit; i++) {
      DataSourceRateLimiter.acquire(adapter.metadata.sourceId, limit);
    }

    // Next fetch must throw rate limit error immediately
    await expect(
      adapter.fetch({ symbol: 'TATAMOTORS', category: 'MARKET_DATA' })
    ).rejects.toThrow(/Rate limit exceeded/);
  });
});
