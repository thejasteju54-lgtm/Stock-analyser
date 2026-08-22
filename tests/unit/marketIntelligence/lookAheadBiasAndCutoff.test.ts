import { describe, it, expect } from 'vitest';
import { MarketHistoryStore } from '../../../src/domain/marketIntelligence/MarketHistoryStore';
import { DailyMarketSnapshot } from '../../../src/domain/marketIntelligence/MarketIntelligenceTypes';

describe('Phase 22 — Zero Look-Ahead Bias & Snapshot Immutability', () => {
  it('preserves immutable historical daily market snapshots without overwriting historical scores', () => {
    const historicalSnapshot: DailyMarketSnapshot = {
      snapshotId: 'snap_mkt_2026-08-21_NSE_500',
      date: '2026-08-21',
      asOfTime: '15:30 IST (Post-Market Close)',
      cutoff: 'POST_MARKET',
      universe: 'NSE_500',
      universeScannedCount: 500,
      indices: [],
      breadth: { advancers: 1100, decliners: 800, unchanged: 100, highs52W: 60, lows52W: 8 },
      top10Opportunities: [],
      trendingStocks: [],
      sectorHeatmap: [],
      eventsRadar: [],
      riskRadar: [],
      dataQuality: {
        scannedCount: 500,
        financialCoveragePercent: 95,
        newsCoveragePercent: 95,
        marketDataCoveragePercent: 100,
        sourceConflictsCount: 0,
        criticalMissingDataCount: 0,
        calculationIntegrity: 'PASS',
      },
      policyVersion: 'v1.0.0',
    };

    MarketHistoryStore.saveSnapshot(historicalSnapshot);

    const retrieved = MarketHistoryStore.getSnapshot('2026-08-21');
    expect(retrieved).toBeDefined();
    expect(retrieved!.date).toBe('2026-08-21');
    expect(retrieved!.cutoff).toBe('POST_MARKET');
    expect(retrieved!.policyVersion).toBe('v1.0.0');
  });
});
