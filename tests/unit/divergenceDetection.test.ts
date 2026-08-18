import { describe, it, expect } from 'vitest';
import { DivergenceDetector } from '../../src/domain/technical/DivergenceDetector';
import { SwingPoint } from '../../src/domain/technical/TechnicalTypes';

describe('Phase 10 — Divergence Sentinel (RSI & MACD vs Price)', () => {
  it('detects regular bearish RSI divergence when price makes Higher High and RSI makes Lower High', () => {
    const swingHighs: SwingPoint[] = [
      { swingId: 'sh1', index: 5, candidateTimestamp: '2024-01-05', price: 100, type: 'SWING_HIGH', status: 'CONFIRMED_SWING', atrProminence: 2.0 },
      { swingId: 'sh2', index: 15, candidateTimestamp: '2024-01-15', price: 112, type: 'SWING_HIGH', status: 'CONFIRMED_SWING', atrProminence: 2.0 },
    ];

    const swingLows: SwingPoint[] = [];

    const rsiValues = new Array(20).fill(50);
    rsiValues[5] = 78.0; // Prior peak
    rsiValues[15] = 65.0; // Lower peak on higher price

    const macdValues = new Array(20).fill(0);

    const divs = DivergenceDetector.detectDivergences(swingHighs, swingLows, rsiValues, macdValues);
    expect(divs.length).toBeGreaterThanOrEqual(1);

    const rsiDiv = divs.find((d) => d.indicator === 'RSI');
    expect(rsiDiv?.type).toBe('BEARISH_DIVERGENCE');
    expect(rsiDiv?.confidence).toBe('HIGH');
  });

  it('detects regular bullish RSI divergence when price makes Lower Low and RSI makes Higher Low', () => {
    const swingHighs: SwingPoint[] = [];
    const swingLows: SwingPoint[] = [
      { swingId: 'sl1', index: 5, candidateTimestamp: '2024-01-05', price: 90, type: 'SWING_LOW', status: 'CONFIRMED_SWING', atrProminence: 2.0 },
      { swingId: 'sl2', index: 15, candidateTimestamp: '2024-01-15', price: 82, type: 'SWING_LOW', status: 'CONFIRMED_SWING', atrProminence: 2.0 },
    ];

    const rsiValues = new Array(20).fill(50);
    rsiValues[5] = 22.0; // Prior trough
    rsiValues[15] = 31.0; // Higher trough on lower price

    const macdValues = new Array(20).fill(0);

    const divs = DivergenceDetector.detectDivergences(swingHighs, swingLows, rsiValues, macdValues);
    expect(divs.length).toBeGreaterThanOrEqual(1);

    const rsiDiv = divs.find((d) => d.indicator === 'RSI');
    expect(rsiDiv?.type).toBe('BULLISH_DIVERGENCE');
    expect(rsiDiv?.confidence).toBe('HIGH');
  });
});
