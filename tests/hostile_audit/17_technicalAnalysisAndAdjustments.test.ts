/**
 * 17_technicalAnalysisAndAdjustments.test.ts
 * Phase 19 — Hostile Technical Analysis & Price Adjustment Inconsistencies Suite.
 */

import { describe, it, expect } from 'vitest';
import { TechnicalAnalysisEngine } from '../../src/domain/technical/TechnicalAnalysisEngine';

describe('Technical Analysis & Adjustments Suite', () => {
  it('processes empty or minimal candle datasets gracefully without throwing unhandled exceptions', () => {
    const dataset = {
      symbol: 'TATAMOTORS',
      exchange: 'NSE',
      timeframe: 'DAILY' as const,
      startDate: '2024-01-01',
      endDate: '2024-06-01',
      source: 'NSE_HISTORICAL',
    };

    const report = TechnicalAnalysisEngine.analyze(
      'proj_tech_test',
      'TATAMOTORS',
      'NSE',
      dataset as any,
      [],
      undefined,
      undefined,
      []
    );

    expect(report).toBeDefined();
    expect(report.trend).toBeDefined();
    expect(report.currentPrice).toBeDefined();
  });
});
