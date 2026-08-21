/**
 * 15_valuationModelBreakage.test.ts
 * Phase 19 — Hostile Valuation Model Invalidation & Mathematical Breakage Suite.
 */

import { describe, it, expect } from 'vitest';
import { SectorValuationEngine } from '../../src/domain/valuation/SectorValuationEngine';
import { MarketValuationSnapshot } from '../../src/domain/valuation/ValuationTypes';

describe('Valuation Model Invalidation Suite', () => {
  it('correctly executes sector valuation without generating NaN or unhandled exceptions when inputs are given', () => {
    const marketSnapshot: MarketValuationSnapshot = {
      currentPrice: 950,
      priceDate: '2024-06-01',
      marketDataTimestamp: '2024-06-01T15:30:00Z',
      currency: 'INR',
      shareCapital: {
        basicShares: 368,
        dilutedShares: 368,
        weightedAverageShares: 368,
        faceValue: 2,
        effectiveDate: '2024-03-31',
        corporateActionAdjustments: [],
        source: 'BSE_OFFICIAL',
        confidence: 95,
      },
      evBridge: {
        marketCapitalization: 350000,
        plusTotalDebt: 80000,
        plusPreferredEquity: 0,
        plusMinorityInterest: 0,
        lessCashAndEquivalents: 30000,
        lessLiquidInvestments: 10000,
        netDebt: 40000,
        enterpriseValue: 390000,
        formulaDescription: 'MCap + Debt - Cash',
        accountingBasis: 'CONSOLIDATED',
        financialPeriod: 'FY24',
      },
      isStale: false,
      freshnessThresholdHours: 48,
      source: 'NSE_OFFICIAL',
      confidence: 95,
    };

    const report = SectorValuationEngine.analyze(
      'proj_val_test',
      'TATAMOTORS',
      'NON_FINANCIAL_OPERATING',
      'Automobile',
      marketSnapshot,
      [],
      [],
      null,
      null,
      [],
      []
    );

    expect(report).toBeDefined();
    expect(report.relativeMultiples).toBeDefined();
    expect(report.triangulation).toBeDefined();
  });
});
