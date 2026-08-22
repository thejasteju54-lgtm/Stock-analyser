import { describe, it, expect } from 'vitest';
import { DailyMarketScanner } from '../../../src/domain/marketIntelligence/DailyMarketScanner';

describe('Phase 22 — Daily Market Scanner (E2E)', () => {
  it('scans Indian equity market, builds 10 top opportunities, sector heatmap, and events radar', () => {
    const snapshot = DailyMarketScanner.scanDailyMarket('NSE_500');

    expect(snapshot.snapshotId).toContain('NSE_500');
    expect(snapshot.date).toBe('2026-08-22');
    expect(snapshot.indices.length).toBeGreaterThan(0);
    expect(snapshot.breadth.advancers).toBeGreaterThan(0);
    expect(snapshot.top10Opportunities.length).toBe(10);

    // Verify top 10 order is sorted descending by opportunityScore
    for (let i = 0; i < snapshot.top10Opportunities.length - 1; i++) {
      expect(snapshot.top10Opportunities[i].opportunityScore).toBeGreaterThanOrEqual(
        snapshot.top10Opportunities[i + 1].opportunityScore
      );
    }

    expect(snapshot.sectorHeatmap.length).toBeGreaterThan(0);
    expect(snapshot.trendingStocks.length).toBeGreaterThan(0);
    expect(snapshot.eventsRadar.length).toBeGreaterThan(0);
    expect(snapshot.riskRadar.length).toBeGreaterThan(0);
    expect(snapshot.dataQuality.calculationIntegrity).toBe('PASS');
  });
});
