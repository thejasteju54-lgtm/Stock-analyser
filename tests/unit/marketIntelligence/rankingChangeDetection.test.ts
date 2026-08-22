import { describe, it, expect } from 'vitest';
import { DailyMarketScanner } from '../../../src/domain/marketIntelligence/DailyMarketScanner';

describe('Phase 22 — Ranking Delta Change Detection', () => {
  it('detects rank movements and provides causal explanations', () => {
    const snapshot = DailyMarketScanner.scanDailyMarket('NSE_500');

    expect(snapshot.top10Opportunities.length).toBe(10);
    const topStock = snapshot.top10Opportunities[0];
    expect(topStock.rank).toBe(1);
    expect(topStock.rankDeltaFromYesterday).toBeDefined();

    // Verify each rank delta contains a reason
    snapshot.top10Opportunities.forEach((opp) => {
      expect(opp.rankDeltaFromYesterday).toBeDefined();
      expect(opp.rankDeltaFromYesterday!.reason.length).toBeGreaterThan(0);
    });
  });
});
