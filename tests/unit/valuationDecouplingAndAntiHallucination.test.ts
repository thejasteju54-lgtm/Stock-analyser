import { describe, it, expect } from 'vitest';
import { SectorValuationEngine } from '../../src/domain/valuation/SectorValuationEngine';
import { MarketValuationSnapshot } from '../../src/domain/valuation/ValuationTypes';

describe('Phase 9 — Valuation Decoupling & Anti-Hallucination Guardrails', () => {
  const baseMarketSnapshot: MarketValuationSnapshot = {
    currentPrice: 1000.0,
    priceDate: '2024-03-31',
    marketDataTimestamp: new Date().toISOString(),
    currency: 'INR',
    shareCapital: {
      basicShares: 100.0,
      dilutedShares: 100.0,
      weightedAverageShares: 100.0,
      faceValue: 10.0,
      effectiveDate: '2024-03-31',
      corporateActionAdjustments: [],
      source: 'Exchange Filing',
      confidence: 95,
    },
    evBridge: {
      marketCapitalization: 100000.0,
      plusTotalDebt: 20000.0,
      plusPreferredEquity: 0,
      plusMinorityInterest: 0,
      lessCashAndEquivalents: 10000.0,
      lessLiquidInvestments: 0,
      netDebt: 10000.0,
      enterpriseValue: 110000.0,
      formulaDescription: 'Market Cap + Debt - Cash',
      accountingBasis: 'CONSOLIDATED',
      financialPeriod: 'FY24',
    },
    isStale: false,
    freshnessThresholdHours: 24,
    source: 'NSE',
    confidence: 95,
  };

  it('strictly produces valuation position without BUY/HOLD/AVOID investment recommendations', () => {
    const report = SectorValuationEngine.analyze(
      'proj_1',
      'TESTCORP',
      'OPERATING_INDUSTRIAL',
      'Manufacturing',
      baseMarketSnapshot,
      [],
      [],
      null,
      null
    );

    // Disclaimers must exist
    expect(report.disclaimers.length).toBeGreaterThanOrEqual(2);
    expect(report.disclaimers[1]).toContain('Zero Investment Verdict');
    expect(report.disclaimers[1]).toContain('does not produce BUY, HOLD, or AVOID');

    // Valuation position must be one of the deterministic labels
    const validPositions = ['DEEP_DISCOUNT', 'DISCOUNT', 'AROUND_FAIR_RANGE', 'PREMIUM', 'EXTREME_PREMIUM', 'NOT_ASSESSABLE'];
    expect(validPositions).toContain(report.valuationPosition);
  });
});
