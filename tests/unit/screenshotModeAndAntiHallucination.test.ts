import { describe, it, expect } from 'vitest';
import { TechnicalAnalysisEngine } from '../../src/domain/technical/TechnicalAnalysisEngine';
import { TechnicalDataset, ScreenshotTechnicalObservation } from '../../src/domain/technical/TechnicalTypes';

describe('Phase 10 — Screenshot Mode & Anti-Hallucination Guardrails', () => {
  const baseDataset: TechnicalDataset = {
    datasetId: 'ds_test',
    symbol: 'TATAMOTORS',
    exchange: 'NSE',
    timeframe: 'DAILY',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    candleCount: 0, // Screenshot only, no exact OHLC series
    adjusted: true,
    source: 'User Chart Screenshot',
    sourceTimestamp: '2024-03-31T16:00:00Z',
    dataQuality: 'INSUFFICIENT',
    isStale: false,
    freshnessThresholdHours: 24,
  };

  const screenshotObs: ScreenshotTechnicalObservation[] = [
    {
      observationId: 'obs_1',
      imageReference: 'tradingview_daily_chart.png',
      pageNumber: 1,
      chartTimeframe: 'DAILY',
      visibleDateRange: 'Jan 2024 - Mar 2024',
      visiblePriceStructure: 'Consolidation band near 52W highs',
      visibleTrend: 'Uptrend',
      visibleSupportResistance: ['₹920 Support', '₹1020 Resistance'],
      visibleMovingAverages: ['Price above 50DMA'],
      confidence: 70,
      calculatedOrVisual: 'VISUAL_OBSERVATION',
      timestamp: '2024-03-31T16:00:00Z',
    },
  ];

  it('separates visual observations without fabricating uncomputable numerical indicators', () => {
    const report = TechnicalAnalysisEngine.analyze(
      'proj_1',
      'TATAMOTORS',
      'NSE',
      baseDataset,
      [], // Empty candle array
      undefined,
      undefined,
      screenshotObs
    );

    // Indicator fields must be uncalculated / NOT_ASSESSABLE without inventing fake numbers
    expect(report.momentum.rsi.status).toBe('INSUFFICIENT_HISTORY');
    expect(report.momentum.rsi.currentValue).toBeNull();
    expect(report.volume.status).toBe('NOT_ASSESSABLE');

    // Visual screenshot observations are preserved with explicit tag
    expect(report.screenshotObservations.length).toBe(1);
    expect(report.screenshotObservations[0].calculatedOrVisual).toBe('VISUAL_OBSERVATION');

    // Zero BUY, HOLD, AVOID investment recommendations
    expect(report.disclaimers.length).toBeGreaterThanOrEqual(2);
    expect(report.disclaimers[0]).toContain('does NOT constitute an investment recommendation or BUY/HOLD/AVOID');
  });
});
