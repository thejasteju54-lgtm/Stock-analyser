import { describe, it, expect } from 'vitest';
import { OpportunityScoreEngine } from '../../../src/domain/marketIntelligence/OpportunityScoreEngine';
import { DailyStockSignal } from '../../../src/domain/marketIntelligence/MarketIntelligenceTypes';

describe('Phase 22 — Opportunity Score Engine', () => {
  const baseSignal: DailyStockSignal = {
    symbol: 'BEL',
    displayName: 'Bharat Electronics',
    legalName: 'Bharat Electronics Limited',
    sector: 'Capital Goods',
    industry: 'Heavy Electrical Equipment',
    marketCapCategory: 'LARGE_CAP',
    price: 312.0,
    previousClose: 300.0,
    open: 301.0,
    high: 315.0,
    low: 300.0,
    volume: 25000000,
    avgVolume20D: 10000000,
    returns: { d1: 4.0, d5: 8.0, m1: 15.0, m3: 30.0, m6: 50.0, y1: 120.0 },
    technical: {
      rsi14: 65,
      above50Dma: true,
      above200Dma: true,
      isBreakout: true,
      volumeMultiple: 2.5,
    },
    fundamentals: {
      revenueGrowthYoY: 18.5,
      ebitdaMargin: 24.5,
      roce: 28.5,
      roe: 23.0,
      debtToEquity: 0.0,
      cfoToPat: 0.95,
      peRatio: 38.0,
      pbRatio: 8.0,
    },
    events: [
      {
        type: 'ORDER_WIN',
        headline: 'MoD awards ₹1,150 Cr radar contract to BEL',
        description: 'New tracking radar contract.',
        date: '2026-08-22',
        source: 'NSE Primary Filing',
        sourceTier: 1,
        materiality: 'HIGH',
        impact: 'POSITIVE',
      },
    ],
    newsIntensity: {
      totalArticles: 8,
      uniqueEventCount: 1,
      independentSourceCount: 3,
      isSyndicatedWire: false,
      direction: 'POSITIVE',
    },
    risks: [
      { category: 'EXECUTION', description: 'Defence supply chain lead times', severity: 'LOW' },
    ],
    dataConfidence: 'HIGH',
  };

  it('calculates deterministic high opportunity score for strong fundamental & order catalyst stock', () => {
    const { breakdown, opportunityType, whyTodayBullets, keyCatalysts } =
      OpportunityScoreEngine.calculateOpportunityScore(baseSignal);

    expect(breakdown.finalOpportunityScore).toBeGreaterThanOrEqual(75);
    expect(breakdown.riskPenalty).toBe(0); // Low risk penalty is 0
    expect(opportunityType).toBe('ORDER_BOOK');
    expect(whyTodayBullets.length).toBeGreaterThan(0);
    expect(keyCatalysts[0]).toContain('MoD awards ₹1,150 Cr radar contract');
  });

  it('deducts risk penalty when critical risks exist', () => {
    const riskySignal: DailyStockSignal = {
      ...baseSignal,
      risks: [
        { category: 'GOVERNANCE', description: 'Promoter pledge and auditor qualification', severity: 'CRITICAL' },
      ],
    };

    const { breakdown } = OpportunityScoreEngine.calculateOpportunityScore(riskySignal);
    expect(breakdown.riskPenalty).toBe(35);
    expect(breakdown.finalOpportunityScore).toBe(breakdown.rawTotal - 35);
  });
});
