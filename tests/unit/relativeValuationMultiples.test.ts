import { describe, it, expect } from 'vitest';
import { SectorValuationEngine } from '../../src/domain/valuation/SectorValuationEngine';
import { MarketValuationSnapshot } from '../../src/domain/valuation/ValuationTypes';

describe('Phase 9 — Relative Valuation Multiples', () => {
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
      marketCapitalization: 100000.0, // 1000 * 100
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

  it('correctly calculates PE, EV/EBITDA, PB, EV/Sales, and FCF Yield for normal positive financials', () => {
    const mockFacts: any[] = [
      { metricCode: 'REVENUE', value: 50000.0 },
      { metricCode: 'EBITDA', value: 10000.0 },
      { metricCode: 'EBIT', value: 8000.0 },
      { metricCode: 'PAT', value: 5000.0 },
      { metricCode: 'TOTAL_EQUITY', value: 25000.0 },
      { metricCode: 'FREE_CASH_FLOW', value: 4000.0 },
      { metricCode: 'DIVIDEND_PER_SHARE', value: 10.0 },
      { metricCode: 'REVENUE_GROWTH', value: 20.0 },
    ];

    const report = SectorValuationEngine.analyze(
      'proj_1',
      'TESTCORP',
      'OPERATING_INDUSTRIAL',
      'Manufacturing',
      baseMarketSnapshot,
      mockFacts,
      [],
      null,
      null
    );

    const pe = report.relativeMultiples.find((m) => m.multipleCode === 'PE');
    expect(pe?.status).toBe('CALCULATED');
    expect(pe?.currentValue).toBe(20.0); // 1000 / (5000 / 100) = 20.0

    const evEbitda = report.relativeMultiples.find((m) => m.multipleCode === 'EV_EBITDA');
    expect(evEbitda?.status).toBe('CALCULATED');
    expect(evEbitda?.currentValue).toBe(11.0); // 110000 / 10000 = 11.0

    const pb = report.relativeMultiples.find((m) => m.multipleCode === 'PB');
    expect(pb?.status).toBe('CALCULATED');
    expect(pb?.currentValue).toBe(4.0); // 1000 / (25000 / 100) = 4.0

    const fcfYield = report.relativeMultiples.find((m) => m.multipleCode === 'FCF_YIELD');
    expect(fcfYield?.status).toBe('CALCULATED');
    expect(fcfYield?.currentValue).toBe(4.0); // (4000 / 100000) * 100 = 4.0%
  });

  it('marks PE as NOT_MEANINGFUL when EPS is negative or zero', () => {
    const mockFacts: any[] = [
      { metricCode: 'REVENUE', value: 50000.0 },
      { metricCode: 'EBITDA', value: 2000.0 },
      { metricCode: 'PAT', value: -1000.0 }, // Negative earnings
      { metricCode: 'TOTAL_EQUITY', value: 25000.0 },
      { metricCode: 'FREE_CASH_FLOW', value: -500.0 },
    ];

    const report = SectorValuationEngine.analyze(
      'proj_1',
      'TESTCORP',
      'OPERATING_INDUSTRIAL',
      'Manufacturing',
      baseMarketSnapshot,
      mockFacts,
      [],
      null,
      null
    );

    const pe = report.relativeMultiples.find((m) => m.multipleCode === 'PE');
    expect(pe?.status).toBe('NOT_MEANINGFUL');
    expect(pe?.currentValue).toBeNull();

    const fcfYield = report.relativeMultiples.find((m) => m.multipleCode === 'FCF_YIELD');
    expect(fcfYield?.currentValue).toBe(-0.5); // Displays negative yield with explanation
  });

  it('marks EV/EBITDA as NOT_MEANINGFUL when EBITDA is negative', () => {
    const mockFacts: any[] = [
      { metricCode: 'REVENUE', value: 50000.0 },
      { metricCode: 'EBITDA', value: -500.0 }, // Negative EBITDA
      { metricCode: 'PAT', value: -2000.0 },
      { metricCode: 'TOTAL_EQUITY', value: 15000.0 },
    ];

    const report = SectorValuationEngine.analyze(
      'proj_1',
      'TESTCORP',
      'OPERATING_INDUSTRIAL',
      'Manufacturing',
      baseMarketSnapshot,
      mockFacts,
      [],
      null,
      null
    );

    const evEbitda = report.relativeMultiples.find((m) => m.multipleCode === 'EV_EBITDA');
    expect(evEbitda?.status).toBe('NOT_MEANINGFUL');
    expect(evEbitda?.currentValue).toBeNull();
  });
});
