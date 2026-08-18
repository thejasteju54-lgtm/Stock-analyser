import { describe, it, expect } from 'vitest';
import { IndicatorCalculations } from '../../src/domain/technical/IndicatorCalculations';
import { TechnicalAnalysisEngine } from '../../src/domain/technical/TechnicalAnalysisEngine';
import { TechnicalDataset, OHLCVCandle } from '../../src/domain/technical/TechnicalTypes';

describe('Phase 10 — Volume Dynamics & Strict Up/Down Classification', () => {
  it('strictly classifies UpVolume (Close > PrevClose) and DownVolume (Close < PrevClose)', () => {
    const candles: OHLCVCandle[] = [
      { timestamp: '2024-01-01', open: 100, high: 102, low: 98, close: 100, volume: 1000 },
      { timestamp: '2024-01-02', open: 100, high: 105, low: 99, close: 105, volume: 2000 }, // Up Session (+2000)
      { timestamp: '2024-01-03', open: 105, high: 106, low: 99, close: 102, volume: 1000 }, // Down Session (+1000)
      { timestamp: '2024-01-04', open: 102, high: 103, low: 101, close: 102, volume: 500 },  // Unchanged Session (+500)
    ];

    const result = IndicatorCalculations.calculateUpDownVolume(candles, 10);
    expect(result.upVolumeTotal).toBe(2000);
    expect(result.downVolumeTotal).toBe(1000);
    expect(result.unchangedVolumeTotal).toBe(500);
    expect(result.upDownRatio).toBe(2.0); // 2000 / 1000 = 2.0
  });

  it('marks volume analysis as NOT_ASSESSABLE when volume data is zero or missing', () => {
    const zeroVolCandles: OHLCVCandle[] = [];
    for (let i = 0; i < 30; i++) {
      zeroVolCandles.push({
        timestamp: `2024-01-${i + 1}`,
        open: 100 + i,
        high: 102 + i,
        low: 99 + i,
        close: 101 + i,
        volume: 0, // Missing / Zero volume
      });
    }

    const dataset: TechnicalDataset = {
      datasetId: 'ds_novol',
      symbol: 'TESTCORP',
      exchange: 'NSE',
      timeframe: 'DAILY',
      startDate: '2024-01-01',
      endDate: '2024-01-30',
      candleCount: 30,
      adjusted: true,
      source: 'NSE Bhavcopy',
      sourceTimestamp: '2024-01-30T16:00:00Z',
      dataQuality: 'MEDIUM',
      isStale: false,
      freshnessThresholdHours: 24,
    };

    const report = TechnicalAnalysisEngine.analyze(
      'proj_1',
      'TESTCORP',
      'NSE',
      dataset,
      zeroVolCandles
    );

    expect(report.volume.status).toBe('NOT_ASSESSABLE');
    expect(report.volume.calculationStatus).toBe('MISSING_INPUT');
    expect(report.volume.evidenceNotes[0]).toContain('Volume data unavailable');
  });
});
