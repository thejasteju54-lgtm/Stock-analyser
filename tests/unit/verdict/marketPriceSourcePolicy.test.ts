import { describe, it, expect } from 'vitest';
import { MarketPriceSourcePolicy } from '../../../src/domain/verdict/MarketPriceSourcePolicy';

describe('Phase 14 — MarketPriceSourcePolicy', () => {
  it('resolves valid fresh market price as CURRENT', () => {
    const today = new Date().toISOString().substring(0, 10);
    const snapshot = MarketPriceSourcePolicy.resolveMarketPrice({
      symbol: 'TATAMOTORS',
      price: 950.0,
      priceDate: today,
    });

    expect(snapshot.price).toBe(950.0);
    expect(snapshot.freshnessStatus).toBe('CURRENT');
    expect(snapshot.sourceTier).toBe('PRIMARY');
  });

  it('marks price older than 5 days as CRITICALLY_STALE', () => {
    const snapshot = MarketPriceSourcePolicy.resolveMarketPrice({
      symbol: 'TATAMOTORS',
      price: 950.0,
      priceDate: '2024-01-01',
      nowIso: '2024-01-15T12:00:00Z',
    });

    expect(snapshot.freshnessStatus).toBe('CRITICALLY_STALE');
  });

  it('detects unadjusted corporate action and gates valuation comparison', () => {
    const unadjusted = MarketPriceSourcePolicy.resolveMarketPrice({
      symbol: 'TATAMOTORS',
      price: 950.0,
      isAdjustedForCorporateActions: false,
      corporateActionNotes: '2:1 Stock Split pending historical adjustment.',
    });

    expect(unadjusted.freshnessStatus).toBe('CORPORATE_ACTION_UNADJUSTED');
  });
});
