import { describe, it, expect } from 'vitest';
import { SectorValuationEngine } from '../../src/domain/valuation/SectorValuationEngine';
import { MarketValuationSnapshot } from '../../src/domain/valuation/ValuationTypes';

describe('Phase 9 — 2D DCF Sensitivity Matrix', () => {
  const baseMarketSnapshot: MarketValuationSnapshot = {
    currentPrice: 500.0,
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
      marketCapitalization: 5000.0,
      plusTotalDebt: 1000.0,
      plusPreferredEquity: 0,
      plusMinorityInterest: 0,
      lessCashAndEquivalents: 500.0,
      lessLiquidInvestments: 0,
      netDebt: 500.0,
      enterpriseValue: 5500.0,
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
  ];

  it('generates 3x3 2D sensitivity matrix across WACC (+-1%) and Terminal Growth (+-0.5%)', () => {
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

    const matrix = report.dcfModel.sensitivityMatrix;
    expect(matrix.waccRange.length).toBe(3);
    expect(matrix.terminalGrowthRange.length).toBe(3);
    expect(matrix.valuesPerShare.length).toBe(3);
    expect(matrix.valuesPerShare[0].length).toBe(3);

    // Value must decrease as WACC increases (holding growth constant)
    const lowWaccVal = matrix.valuesPerShare[0][1]; // lower WACC
    const highWaccVal = matrix.valuesPerShare[2][1]; // higher WACC
    expect(lowWaccVal).toBeGreaterThan(highWaccVal);

    // Value must increase as terminal growth increases (holding WACC constant)
    const lowGrowthVal = matrix.valuesPerShare[1][0]; // lower g
    const highGrowthVal = matrix.valuesPerShare[1][2]; // higher g
    expect(highGrowthVal).toBeGreaterThan(lowGrowthVal);
  });
});
