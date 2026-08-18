import { describe, it, expect } from 'vitest';
import { TechnicalAnalysisEngine } from '../../src/domain/technical/TechnicalAnalysisEngine';
import { TechnicalDataset, OHLCVCandle } from '../../src/domain/technical/TechnicalTypes';

describe('Phase 10 — OHLCV Data Validation & Ingestion', () => {
  const baseDataset: TechnicalDataset = {
    datasetId: 'ds_test',
    symbol: 'TESTCORP',
    exchange: 'NSE',
    timeframe: 'DAILY',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    candleCount: 60,
    adjusted: true,
    source: 'NSE Bhavcopy',
    sourceTimestamp: '2024-03-31T16:00:00Z',
    dataQuality: 'HIGH',
    isStale: false,
    freshnessThresholdHours: 24,
  };

  it('correctly sorts unsorted candles point-in-time and detects latest price', () => {
    const unsortedCandles: OHLCVCandle[] = [
      { timestamp: '2024-01-03', open: 102, high: 105, low: 101, close: 104, volume: 1000 },
      { timestamp: '2024-01-01', open: 100, high: 102, low: 99, close: 101, volume: 1000 },
      { timestamp: '2024-01-02', open: 101, high: 103, low: 100, close: 102, volume: 1000 },
    ];

    const report = TechnicalAnalysisEngine.analyze(
      'proj_1',
      'TESTCORP',
      'NSE',
      baseDataset,
      unsortedCandles
    );

    expect(report.currentPrice).toBe(104);
    expect(report.priceDate).toBe('2024-01-03');
    expect(report.isAdjusted).toBe(true);
  });

  it('marks data status as INSUFFICIENT_HISTORY when fewer than 20 candles are provided', () => {
    const shortCandles: OHLCVCandle[] = [
      { timestamp: '2024-01-01', open: 100, high: 102, low: 99, close: 101, volume: 1000 },
      { timestamp: '2024-01-02', open: 101, high: 103, low: 100, close: 102, volume: 1000 },
    ];

    const report = TechnicalAnalysisEngine.analyze(
      'proj_1',
      'TESTCORP',
      'NSE',
      baseDataset,
      shortCandles
    );

    expect(report.trend.status).toBe('INSUFFICIENT_HISTORY');
    expect(report.movingAverages.status).toBe('INSUFFICIENT_HISTORY');
  });
});
