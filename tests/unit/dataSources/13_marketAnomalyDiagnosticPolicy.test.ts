/**
 * 13_marketAnomalyDiagnosticPolicy.test.ts
 * Phase 16 — Price Anomaly & Circuit Diagnostic Policy Verification.
 */

import { describe, it, expect } from 'vitest';
import { MarketAnomalyEngine } from '../../../src/domain/dataSources/MarketAnomalyEngine';
import { CorporateActionRecord } from '../../../src/domain/dataSources/DataSourceTypes';

describe('Market Anomaly Diagnostic Policy (Phase 16)', () => {
  it('classifies moves <= 20% as NORMAL', () => {
    const res = MarketAnomalyEngine.evaluatePriceMove({
      currentPrice: 980,
      previousClose: 950, // +3.15%
      volume: 5000000,
      sessionDate: '2024-06-28',
    });
    expect(res.classification).toBe('NORMAL');
    expect(res.isAssessable).toBe(true);
  });

  it('classifies a 90% decline as EXPLAINED_ANOMALY when matched with 10:1 stock split', () => {
    const actions: CorporateActionRecord[] = [
      {
        actionId: 'split_10_1',
        companyId: 'comp_tatasteel',
        symbol: 'TATASTEEL',
        actionType: 'STOCK_SPLIT',
        announcementDate: '2022-05-03',
        exDate: '2022-07-28',
        effectiveDate: '2022-07-28',
        ratio: '10:1',
        multiplier: 10,
        source: 'BSE Disclosure',
        sourceTier: 'TIER_1_PRIMARY',
        verificationStatus: 'VERIFIED',
      },
    ];

    const res = MarketAnomalyEngine.evaluatePriceMove({
      currentPrice: 120,
      previousClose: 1200, // -90% drop
      volume: 25000000,
      sessionDate: '2022-07-28',
      corporateActions: actions,
    });

    expect(res.classification).toBe('EXPLAINED_ANOMALY');
    expect(res.explanation).toContain('STOCK_SPLIT');
    expect(res.isAssessable).toBe(true);
  });

  it('classifies a 25% single-day swing without corporate action as UNEXPLAINED_ANOMALY', () => {
    const res = MarketAnomalyEngine.evaluatePriceMove({
      currentPrice: 1250,
      previousClose: 1000, // +25%
      volume: 10000, // Low volume
      averageVolume20d: 500000,
      sessionDate: '2024-06-28',
    });

    expect(res.classification).toBe('UNEXPLAINED_ANOMALY');
    expect(res.explanation).toContain('negligible volume');
  });
});
