import { describe, it, expect } from 'vitest';
import { NewsIntensityEngine } from '../../../src/domain/marketIntelligence/NewsIntensityEngine';
import { TrendingStockEngine } from '../../../src/domain/marketIntelligence/TrendingStockEngine';
import { DailyStockSignal } from '../../../src/domain/marketIntelligence/MarketIntelligenceTypes';

describe('Phase 22 — News Intensity & Trending Stock Detection', () => {
  const signal: DailyStockSignal = {
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
        headline: 'MoD contract win',
        description: 'Radar order',
        date: '2026-08-22',
        source: 'NSE LODR Filing',
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
    risks: [],
    dataConfidence: 'HIGH',
  };

  it('evaluates news intensity correctly and identifies positive direction', () => {
    const res = NewsIntensityEngine.evaluateNewsIntensity(signal);
    expect(res.intensityScore).toBeGreaterThanOrEqual(60);
    expect(res.direction).toBe('POSITIVE');
    expect(res.uniqueEvents).toBe(1);
    expect(res.independentSources).toBe(3);
  });

  it('discounts news score when only syndicated wire articles exist without independent confirmation', () => {
    const syndicatedSignal: DailyStockSignal = {
      ...signal,
      newsIntensity: {
        totalArticles: 15,
        uniqueEventCount: 1,
        independentSourceCount: 1,
        isSyndicatedWire: true,
        direction: 'POSITIVE',
      },
    };

    const res = NewsIntensityEngine.evaluateNewsIntensity(syndicatedSignal);
    expect(res.intensityScore).toBeLessThanOrEqual(65);
  });

  it('detects volume shocks and breakout behavior in trending detection', () => {
    const trend = TrendingStockEngine.evaluateTrending(signal);
    expect(trend.isVolumeShock).toBe(true);
    expect(trend.isBreakout).toBe(true);
    expect(trend.volumeMultiple).toBe(2.5);
    expect(trend.trendType).toBe('EVENT_DRIVEN');
  });
});
