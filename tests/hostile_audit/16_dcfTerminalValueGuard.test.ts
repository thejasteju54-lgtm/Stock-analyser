/**
 * 16_dcfTerminalValueGuard.test.ts
 * Phase 19 — Hostile DCF Terminal Value & WACC Boundary Guard Suite.
 */

import { describe, it, expect } from 'vitest';
import { SectorValuationEngine } from '../../src/domain/valuation/SectorValuationEngine';
import { MarketValuationSnapshot } from '../../src/domain/valuation/ValuationTypes';

describe('DCF Terminal Value Guard Suite', () => {
  it('prevents mathematical explosion when terminal growth >= WACC by capping terminal growth below discount rate', () => {
    const marketSnapshot: MarketValuationSnapshot = {
      currentPrice: 500,
      priceDate: '2024-06-01',
      marketDataTimestamp: '2024-06-01T15:30:00Z',
      currency: 'INR',
      shareCapital: {
        basicShares: 200,
        dilutedShares: 200,
        weightedAverageShares: 200,
        faceValue: 5,
        effectiveDate: '2024-03-31',
        corporateActionAdjustments: [],
        source: 'BSE_OFFICIAL',
        confidence: 95,
      },
      evBridge: {
        marketCapitalization: 100000,
        plusTotalDebt: 10000,
        plusPreferredEquity: 0,
        plusMinorityInterest: 0,
        lessCashAndEquivalents: 5000,
        lessLiquidInvestments: 2000,
        netDebt: 3000,
        enterpriseValue: 103000,
        formulaDescription: 'MCap + NetDebt',
        accountingBasis: 'CONSOLIDATED',
        financialPeriod: 'FY24',
      },
      isStale: false,
      freshnessThresholdHours: 48,
      source: 'NSE_OFFICIAL',
      confidence: 95,
    };

    const report = SectorValuationEngine.analyze(
      'proj_dcf_guard',
      'INFOSYS',
      'NON_FINANCIAL_OPERATING',
      'IT_SERVICES',
      marketSnapshot,
      [],
      [],
      null,
      null,
      [],
      []
    );

    expect(report.dcfModel).toBeDefined();
    for (const scenarioKey of ['BASE', 'BULL', 'BEAR'] as const) {
      const scenario = report.dcfModel.scenarios[scenarioKey];
      expect(scenario.terminalGrowthRate).toBeLessThan(scenario.wacc);
      expect(scenario.valuePerShare).toBeGreaterThan(0);
      expect(scenario.valuePerShare).not.toBe(Infinity);
      expect(scenario.valuePerShare).not.toBeNaN();
    }
  });
});
