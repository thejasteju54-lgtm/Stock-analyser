import { describe, it, expect } from 'vitest';
import { SectorValuationEngine } from '../../src/domain/valuation/SectorValuationEngine';
import { MarketValuationSnapshot } from '../../src/domain/valuation/ValuationTypes';

describe('Phase 9 — Reverse DCF & Embedded Expectations Engine', () => {
  const baseMarketSnapshot: MarketValuationSnapshot = {
    currentPrice: 800.0,
    priceDate: '2024-03-31',
    marketDataTimestamp: new Date().toISOString(),
    currency: 'INR',
    shareCapital: {
      basicShares: 10.0,
      dilutedShares: 10.0,
      weightedAverageShares: 10.0,
      faceValue: 10.0,
      effectiveDate: '2024-03-31',
      corporateActionAdjustments: [],
      source: 'Exchange Filing',
      confidence: 95,
    },
    evBridge: {
      marketCapitalization: 8000.0,
      plusTotalDebt: 1000.0,
      plusPreferredEquity: 0,
      plusMinorityInterest: 0,
      lessCashAndEquivalents: 500.0,
      lessLiquidInvestments: 0,
      netDebt: 500.0,
      enterpriseValue: 8500.0,
      formulaDescription: 'Market Cap + Debt - Cash',
      accountingBasis: 'CONSOLIDATED',
      financialPeriod: 'FY24',
    },
    isStale: false,
    freshnessThresholdHours: 24,
    source: 'NSE',
    confidence: 95,
  };

  const facts: any[] = [
    { metricCode: 'REVENUE', value: 2000.0 },
    { metricCode: 'EBIT', value: 300.0 },
    { metricCode: 'EBITDA', value: 400.0 },
    { metricCode: 'PAT', value: 200.0 },
    { metricCode: 'TOTAL_EQUITY', value: 1500.0 },
    { metricCode: 'REVENUE_GROWTH', value: 10.0 },
  ];

  it('solves for implied revenue growth required to justify current market price', () => {
    const report = SectorValuationEngine.analyze(
      'proj_1',
      'TESTCORP',
      'OPERATING_INDUSTRIAL',
      'Manufacturing',
      baseMarketSnapshot,
      facts,
      [],
      null,
      null
    );

    const embed = report.embeddedExpectations;
    expect(embed.solvedVariable).toBe('REVENUE_CAGR');
    expect(embed.impliedRevenueCagr).toBeGreaterThan(0);
    expect(embed.diagnosticExplanation).toContain('At the current price of ₹800.0');
    expect(embed.diagnosticExplanation).toContain('% sustained revenue CAGR');
  });
});
