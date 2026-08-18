import { describe, it, expect } from 'vitest';
import { SectorValuationEngine } from '../../src/domain/valuation/SectorValuationEngine';
import { MarketValuationSnapshot } from '../../src/domain/valuation/ValuationTypes';

describe('Phase 9 — Business Model Valuation Policy Gating', () => {
  const bankMarketSnapshot: MarketValuationSnapshot = {
    currentPrice: 1500.0,
    priceDate: '2024-03-31',
    marketDataTimestamp: new Date().toISOString(),
    currency: 'INR',
    shareCapital: {
      basicShares: 50.0,
      dilutedShares: 50.0,
      weightedAverageShares: 50.0,
      faceValue: 1.0,
      effectiveDate: '2024-03-31',
      corporateActionAdjustments: [],
      source: 'Exchange Filing',
      confidence: 95,
    },
    evBridge: {
      marketCapitalization: 75000.0,
      plusTotalDebt: 0,
      plusPreferredEquity: 0,
      plusMinorityInterest: 0,
      lessCashAndEquivalents: 0,
      lessLiquidInvestments: 0,
      netDebt: 0,
      enterpriseValue: 75000.0,
      formulaDescription: 'EV is prohibited for banks',
      accountingBasis: 'CONSOLIDATED',
      financialPeriod: 'FY24',
    },
    isStale: false,
    freshnessThresholdHours: 24,
    source: 'NSE',
    confidence: 95,
  };

  it('prohibits EV/EBITDA and EV/Sales for Banking business models', () => {
    const facts: any[] = [
      { metricCode: 'REVENUE', value: 80000.0 },
      { metricCode: 'PAT', value: 15000.0 },
      { metricCode: 'TOTAL_EQUITY', value: 60000.0 },
      { metricCode: 'DIVIDEND_PER_SHARE', value: 20.0 },
    ];

    const report = SectorValuationEngine.analyze(
      'proj_bank',
      'HDFCBANK',
      'BANKING',
      'Banking',
      bankMarketSnapshot,
      facts,
      [],
      null,
      null
    );

    const evEbitda = report.relativeMultiples.find((m) => m.multipleCode === 'EV_EBITDA');
    expect(evEbitda?.status).toBe('NOT_APPLICABLE');
    expect(evEbitda?.statusExplanation).toContain('prohibited for financial institutions');

    const pb = report.relativeMultiples.find((m) => m.multipleCode === 'PB');
    expect(pb?.status).toBe('CALCULATED');
    expect(pb?.currentValue).toBe(1.3); // 1500 / (60000 / 50) = 1.25 -> 1.3
  });
});
