/**
 * 09_temporalLeakageSentinel.test.ts
 * Phase 19 — Hostile Temporal Leakage & Point-In-Time Look-Ahead Sentinel Suite.
 */

import { describe, it, expect } from 'vitest';
import { PointInTimeIntegrityEngine } from '../../src/domain/dataSources/PointInTimeIntegrityEngine';

describe('Temporal Leakage Sentinel Suite', () => {
  it('strictly rejects future market prices, filings, and news when running on historical cutoff date', () => {
    const cutoffDate = '2024-03-31T23:59:59Z';

    // Item 1: Future market tick
    const futureMarketTick = {
      category: 'MARKET_DATA' as const,
      tradeTimestamp: '2024-04-01T09:15:00Z',
    };

    const evalMarket = PointInTimeIntegrityEngine.evaluateEligibility(futureMarketTick, cutoffDate);
    expect(evalMarket.isEligible).toBe(false);
    expect(evalMarket.isLookAheadBias).toBe(true);

    // Item 2: Future news announcement
    const futureNews = {
      category: 'NEWS' as const,
      publicationDate: '2024-05-10T14:30:00Z',
    };

    const evalNews = PointInTimeIntegrityEngine.evaluateEligibility(futureNews, cutoffDate);
    expect(evalNews.isEligible).toBe(false);
    expect(evalNews.isLookAheadBias).toBe(true);
  });
});
