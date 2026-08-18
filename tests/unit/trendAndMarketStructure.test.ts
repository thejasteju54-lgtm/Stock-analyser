import { describe, it, expect } from 'vitest';
import { MarketStructureEngine } from '../../src/domain/technical/MarketStructureEngine';
import { TechnicalPolicyRegistry } from '../../src/domain/technical/TechnicalPolicyRegistry';
import { OHLCVCandle } from '../../src/domain/technical/TechnicalTypes';

describe('Phase 10 — Trend & Market Structure Classification', () => {
  it('detects confirmed swings with separate candidate and confirmation timestamps', () => {
    const candles: OHLCVCandle[] = [
      { timestamp: '2024-01-01', open: 100, high: 100, low: 98, close: 100, volume: 1000 },
      { timestamp: '2024-01-02', open: 100, high: 102, low: 99, close: 102, volume: 1000 },
      { timestamp: '2024-01-03', open: 102, high: 105, low: 101, close: 104, volume: 1000 },
      { timestamp: '2024-01-04', open: 105, high: 120, low: 104, close: 118, volume: 1000 }, // Peak High at bar 3
      { timestamp: '2024-01-05', open: 118, high: 110, low: 106, close: 108, volume: 1000 },
      { timestamp: '2024-01-06', open: 108, high: 105, low: 100, close: 102, volume: 1000 },
      { timestamp: '2024-01-07', open: 102, high: 100, low: 90, close: 92, volume: 1000 }, // Swing confirmed at bar 6
      { timestamp: '2024-01-08', open: 92, high: 95, low: 91, close: 94, volume: 1000 },
    ];

    const atrValues = [5, 5, 5, 5, 5, 5, 5, 5];
    const { swingHighs } = MarketStructureEngine.detectSwings(candles, atrValues);

    expect(swingHighs.length).toBeGreaterThanOrEqual(1);
    const sh = swingHighs[0];
    expect(sh.price).toBe(120);
    expect(sh.candidateTimestamp).toBe('2024-01-04');
    expect(sh.confirmationTimestamp).toBe('2024-01-07'); // 3 confirmation bars later (bar 6)
    expect(sh.status).toBe('CONFIRMED_SWING');
  });

  it('classifies BULLISH_STRUCTURE when higher highs and higher lows dominate', () => {
    const swingHighs = [
      { swingId: 'sh1', index: 5, candidateTimestamp: '2024-01-05', price: 100, type: 'SWING_HIGH', status: 'CONFIRMED_SWING', atrProminence: 2.0 },
      { swingId: 'sh2', index: 15, candidateTimestamp: '2024-01-15', price: 110, type: 'SWING_HIGH', status: 'CONFIRMED_SWING', atrProminence: 2.0 },
      { swingId: 'sh3', index: 25, candidateTimestamp: '2024-01-25', price: 120, type: 'SWING_HIGH', status: 'CONFIRMED_SWING', atrProminence: 2.0 },
    ] as any[];

    const swingLows = [
      { swingId: 'sl1', index: 10, candidateTimestamp: '2024-01-10', price: 90, type: 'SWING_LOW', status: 'CONFIRMED_SWING', atrProminence: 2.0 },
      { swingId: 'sl2', index: 20, candidateTimestamp: '2024-01-20', price: 98, type: 'SWING_LOW', status: 'CONFIRMED_SWING', atrProminence: 2.0 },
    ] as any[];

    const candles: any[] = [{ close: 122, timestamp: '2024-01-26' }];
    const structure = MarketStructureEngine.analyzeMarketStructure(swingHighs, swingLows, candles);

    expect(structure.direction).toBe('BULLISH_STRUCTURE');
    expect(structure.higherHighsCount).toBe(2);
    expect(structure.higherLowsCount).toBe(1);
    expect(structure.confidence).toBe(85);
  });

  it('classifies STRONG_UPTREND in TrendClassificationPolicy when structure is bullish and price is above 200DMA and 50DMA', () => {
    const result = TechnicalPolicyRegistry.classifyTrend(
      'BULLISH_STRUCTURE',
      'ABOVE',
      'ABOVE',
      'BULLISH_ALIGNMENT',
      1.5
    );

    expect(result.trend).toBe('STRONG_UPTREND');
    expect(result.confidence).toBe(90);
  });
});
