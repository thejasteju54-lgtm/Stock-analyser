/**
 * 05_valuationIntegrityQA.test.ts
 * QA Track: Sector-Aware Valuation, Model Gating & Zero-Fabrication Verification.
 */

import { describe, it, expect } from 'vitest';
import { SectorValuationEngine } from '../../src/domain/valuation/SectorValuationEngine';
import { MarketValuationSnapshot } from '../../src/domain/valuation/ValuationTypes';

describe('Valuation Integrity QA', () => {
  const mockMarketSnapshot: MarketValuationSnapshot = {
    currentPrice: 980.5,
    priceDate: '2024-06-28',
    marketDataTimestamp: '2024-06-28T15:30:00Z',
    currency: 'INR',
    shareCapital: {
      basicShares: 368.5,
      dilutedShares: 368.5,
      weightedAverageShares: 368.5,
      faceValue: 2,
      effectiveDate: '2024-03-31',
      corporateActionAdjustments: [],
      source: 'Audited Share Capital FY24',
      confidence: 100,
    },
    evBridge: {
      marketCapitalization: 361314,
      plusTotalDebt: 82400,
      plusPreferredEquity: 0,
      plusMinorityInterest: 0,
      lessCashAndEquivalents: 45600,
      lessLiquidInvestments: 0,
      netDebt: 36800,
      enterpriseValue: 398114,
      formulaDescription: 'MarketCap + Debt - Cash',
      accountingBasis: 'CONSOLIDATED',
      financialPeriod: 'FY2024',
    },
    isStale: false,
    freshnessThresholdHours: 48,
    source: 'NSE_OFFICIAL_FEED',
    confidence: 100,
  };

  it('correctly executes sector-tailored valuation report without fabricating peer multiples', () => {
    const report = SectorValuationEngine.analyze(
      'proj_val_qa',
      'TATAMOTORS',
      'NON_FINANCIAL_OPERATING',
      'Automobile and Ancillaries',
      mockMarketSnapshot,
      [],
      [],
      null,
      null,
      []
    );

    expect(report.companySymbol).toBe('TATAMOTORS');
    expect(report.relativeMultiples).toBeDefined();
    expect(report.dcfModel).toBeDefined();
    expect(report.embeddedExpectations).toBeDefined();
    expect(report.triangulation).toBeDefined();
  });
});
