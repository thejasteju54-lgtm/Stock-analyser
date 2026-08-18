import { describe, it, expect } from 'vitest';
import { TechnicalAnalysisEngine } from '../../src/domain/technical/TechnicalAnalysisEngine';
import { TechnicalDataset, OHLCVCandle, BenchmarkDataset } from '../../src/domain/technical/TechnicalTypes';

describe('Phase 10 — Relative Strength Benchmarking & Volatility Regimes', () => {
  const baseDataset: TechnicalDataset = {
    datasetId: 'ds_test',
    symbol: 'TATAMOTORS',
    exchange: 'NSE',
    timeframe: 'DAILY',
    startDate: '2023-04-01',
    endDate: '2024-03-31',
    candleCount: 250,
    adjusted: true,
    source: 'NSE Bhavcopy',
    sourceTimestamp: '2024-03-31T16:00:00Z',
    dataQuality: 'HIGH',
    isStale: false,
    freshnessThresholdHours: 24,
  };

  const stockCandles: OHLCVCandle[] = [];
  const niftyCandles: OHLCVCandle[] = [];

  for (let i = 0; i < 250; i++) {
    stockCandles.push({
      timestamp: `2023-04-${(i % 28) + 1}`,
      open: 500 + i * 2, // 100% gain
      high: 505 + i * 2,
      low: 495 + i * 2,
      close: 500 + i * 2,
      volume: 10000,
    });

    niftyCandles.push({
      timestamp: `2023-04-${(i % 28) + 1}`,
      open: 18000 + i * 10, // ~14% gain
      high: 18050 + i * 10,
      low: 17950 + i * 10,
      close: 18000 + i * 10,
      volume: 5000000,
    });
  }

  const niftyBenchmark: BenchmarkDataset = {
    benchmarkId: 'bm_nifty',
    symbol: 'NIFTY 50',
    benchmarkName: 'Nifty 50 Index',
    benchmarkType: 'BROAD_MARKET',
    timeframe: 'DAILY',
    startDate: '2023-04-01',
    endDate: '2024-03-31',
    candles: niftyCandles,
    source: 'NSE',
    sourceTimestamp: '2024-03-31T16:00:00Z',
    adjusted: true,
    dataQuality: 'HIGH',
  };

  it('correctly calculates alpha over 1M/3M/6M/1Y and classifies OUTPERFORMING', () => {
    const report = TechnicalAnalysisEngine.analyze(
      'proj_1',
      'TATAMOTORS',
      'NSE',
      baseDataset,
      stockCandles,
      niftyBenchmark,
      undefined // No sector benchmark
    );

    const comp = report.relativeStrength.broadMarketComparison;
    expect(comp).toBeDefined();
    expect(comp?.classification).toBe('OUTPERFORMING');
    expect(comp?.relativeReturn3M).toBeGreaterThan(0);

    // Missing sector benchmark is noted without silent substitution
    expect(report.relativeStrength.sectorComparison).toBeUndefined();
    expect(report.relativeStrength.diagnosticNotes[0]).toContain('Sector benchmark dataset unavailable');
  });
});
