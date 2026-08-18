import { describe, it, expect } from 'vitest';
import { MarketStructureEngine } from '../../src/domain/technical/MarketStructureEngine';
import { OHLCVCandle, SupportResistanceZone } from '../../src/domain/technical/TechnicalTypes';

describe('Phase 10 — Support/Resistance & Breakout Confirmation', () => {
  it('clusters swing levels into ATR-normalized zones with multi-touch counts', () => {
    const swingHighs = [
      { swingId: 'sh1', index: 5, candidateTimestamp: '2024-01-05', price: 100.0, type: 'SWING_HIGH', status: 'CONFIRMED_SWING', atrProminence: 2.0 },
      { swingId: 'sh2', index: 15, candidateTimestamp: '2024-01-15', price: 101.5, type: 'SWING_HIGH', status: 'CONFIRMED_SWING', atrProminence: 2.0 },
      { swingId: 'sh3', index: 25, candidateTimestamp: '2024-01-25', price: 100.8, type: 'SWING_HIGH', status: 'CONFIRMED_SWING', atrProminence: 2.0 },
    ] as any[];

    const swingLows: any[] = [];
    const candles: OHLCVCandle[] = [
      { timestamp: '2024-01-05', open: 98, high: 100.0, low: 97, close: 99, volume: 1000 },
      { timestamp: '2024-01-15', open: 99, high: 101.5, low: 98, close: 100, volume: 1000 },
      { timestamp: '2024-01-25', open: 98, high: 100.8, low: 97, close: 98, volume: 1000 },
    ];

    const zones = MarketStructureEngine.clusterSupportResistanceZones(
      swingHighs,
      swingLows,
      candles,
      3.0, // ATR
      'DAILY'
    );

    expect(zones.length).toBe(1);
    expect(zones[0].type).toBe('RESISTANCE');
    expect(zones[0].strength).toBe('MAJOR');
    expect(zones[0].touchCount).toBe(3);
  });

  it('marks breakout as CONFIRMED when price closes beyond zone with elevated volume (RVOL >= 1.4)', () => {
    const zones: SupportResistanceZone[] = [
      {
        zoneId: 'res_100',
        type: 'RESISTANCE',
        lowerBound: 99.0,
        upperBound: 101.0,
        midPrice: 100.0,
        strength: 'MAJOR',
        touchCount: 3,
        rejectionCount: 2,
        breakoutCount: 0,
        timeframe: 'DAILY',
        sourceEvidence: '3 touches',
        lastTouchDate: '2024-01-20',
        ageBars: 30,
        confidence: 90,
      },
    ];

    const candles: OHLCVCandle[] = [
      { timestamp: '2024-01-20', open: 98, high: 100, low: 97, close: 99, volume: 1000 },
      { timestamp: '2024-01-21', open: 99, high: 100, low: 98, close: 99, volume: 1000 },
      { timestamp: '2024-01-22', open: 99, high: 100, low: 98, close: 99, volume: 1000 },
      { timestamp: '2024-01-23', open: 99, high: 100, low: 98, close: 99, volume: 1000 },
      { timestamp: '2024-01-24', open: 100, high: 108, low: 100, close: 107, volume: 3000 }, // Breakout bar
    ];

    const rvolValues = [1.0, 1.0, 1.0, 1.0, 2.5]; // 2.5x volume expansion
    const breakouts = MarketStructureEngine.evaluateBreakouts(zones, candles, rvolValues);

    expect(breakouts.length).toBe(1);
    expect(breakouts[0].type).toBe('CONFIRMED_BREAKOUT');
    expect(breakouts[0].confirmationStatus).toBe('CONFIRMED');
    expect(breakouts[0].volumeMultiplier).toBe(2.5);
  });
});
