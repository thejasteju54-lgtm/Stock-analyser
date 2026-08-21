/**
 * 06_technicalStructureQA.test.ts
 * QA Track: Technical Analysis, Trend Structure & Point-in-Time Price Action.
 */

import { describe, it, expect } from 'vitest';
import { TechnicalAnalysisEngine } from '../../src/domain/technical/TechnicalAnalysisEngine';
import { OHLCVCandle, TechnicalDataset } from '../../src/domain/technical/TechnicalTypes';

describe('Technical Structure & Indicator QA', () => {
  const generateMockCandles = (count = 50, startPrice = 100): OHLCVCandle[] => {
    const candles: OHLCVCandle[] = [];
    let price = startPrice;
    const baseDate = new Date('2024-01-01').getTime();

    for (let i = 0; i < count; i++) {
      const date = new Date(baseDate + i * 86400000).toISOString().split('T')[0];
      const open = price;
      const close = price + (i % 2 === 0 ? 1.5 : -0.5);
      const high = Math.max(open, close) + 1.0;
      const low = Math.min(open, close) - 1.0;
      const volume = 1000000 + i * 10000;
      price = close;

      candles.push({ timestamp: date, open, high, low, close, volume });
    }
    return candles;
  };

  it('correctly executes full technical analysis across trend, momentum, and volume', () => {
    const candles = generateMockCandles(60, 500);
    const dataset: TechnicalDataset = {
      datasetId: 'ds_test',
      symbol: 'TATAMOTORS',
      exchange: 'NSE',
      timeframe: 'DAILY',
      startDate: candles[0].timestamp,
      endDate: candles[candles.length - 1].timestamp,
      candleCount: candles.length,
      adjusted: true,
      source: 'NSE_HISTORICAL',
      sourceTimestamp: '2024-06-30T15:30:00Z',
      dataQuality: 'HIGH',
      isStale: false,
      freshnessThresholdHours: 48,
    };

    const report = TechnicalAnalysisEngine.analyze(
      'proj_tech_qa',
      'TATAMOTORS',
      'NSE',
      dataset,
      candles
    );

    expect(report.companySymbol).toBe('TATAMOTORS');
    expect(report.marketStructure).toBeDefined();
    expect(report.movingAverages).toBeDefined();
    expect(report.momentum).toBeDefined();
    expect(report.momentum.rsi).toBeDefined();
    expect(report.momentum.macd).toBeDefined();
    expect(report.volume).toBeDefined();
  });
});
