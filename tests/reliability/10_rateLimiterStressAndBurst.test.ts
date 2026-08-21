/**
 * 10_rateLimiterStressAndBurst.test.ts
 * Phase 17 — Rate Limiter Burst & Exhaustion Suite.
 */

import { describe, it, expect } from 'vitest';
import { DataSourceRateLimiter } from '../../src/domain/dataSources/DataSourceRateLimiter';

describe('Rate Limiter Stress & Burst Handling Suite', () => {
  it('enforces token budget under rapid burst requests and provides accurate retryAfterMs when exhausted', () => {
    const sourceId = `PROVIDER_STRESS_${Date.now()}`;
    const limitPerMinute = 5;

    const allowedResults = [];
    for (let i = 0; i < limitPerMinute; i++) {
      allowedResults.push(DataSourceRateLimiter.acquire(sourceId, limitPerMinute));
    }

    for (const res of allowedResults) {
      expect(res.isAllowed).toBe(true);
    }

    // 6th request in burst should be rejected
    const rejectedResult = DataSourceRateLimiter.acquire(sourceId, limitPerMinute);
    expect(rejectedResult.isAllowed).toBe(false);
    expect(rejectedResult.remainingTokens).toBe(0);
    expect(rejectedResult.retryAfterMs).toBeGreaterThan(0);
  });
});
