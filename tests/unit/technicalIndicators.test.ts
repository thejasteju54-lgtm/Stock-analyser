import { describe, it, expect } from 'vitest';
import { IndicatorCalculations } from '../../src/domain/technical/IndicatorCalculations';
import { OHLCVCandle } from '../../src/domain/technical/TechnicalTypes';

describe('Phase 10 — Technical Indicator Calculations (SMA, EMA, RSI, MACD, ATR)', () => {
  it('calculates SMA correctly with null padding for incomplete initial periods', () => {
    const values = [10, 20, 30, 40, 50];
    const sma3 = IndicatorCalculations.calculateSMA(values, 3);

    expect(sma3[0]).toBeNull();
    expect(sma3[1]).toBeNull();
    expect(sma3[2]).toBe(20.0); // (10+20+30)/3 = 20
    expect(sma3[3]).toBe(30.0); // (20+30+40)/3 = 30
    expect(sma3[4]).toBe(40.0); // (30+40+50)/3 = 40
  });

  it('calculates EMA with initial SMA seed and exponential multiplier', () => {
    const values = [10, 11, 12, 13, 14, 15];
    const ema3 = IndicatorCalculations.calculateEMA(values, 3);

    expect(ema3[0]).toBeNull();
    expect(ema3[1]).toBeNull();
    expect(ema3[2]).toBe(11.0); // SMA seed (10+11+12)/3 = 11.0
    expect(ema3[3]).toBe(12.0); // (13 - 11) * 0.5 + 11 = 12.0
    expect(ema3[4]).toBe(13.0); // (14 - 12) * 0.5 + 12 = 13.0
  });

  it('calculates 14-period RSI using Wilder smoothing and bounds [0, 100]', () => {
    // 15 closes with all consecutive gains
    const risingCloses = [100, 102, 104, 106, 108, 110, 112, 114, 116, 118, 120, 122, 124, 126, 128];
    const rsiRising = IndicatorCalculations.calculateRSI(risingCloses, 14);

    expect(rsiRising[14]).toBe(100); // Zero losses -> RSI = 100
  });

  it('calculates 14-period ATR using True Range expansion', () => {
    const candles: OHLCVCandle[] = [];
    for (let i = 0; i < 20; i++) {
      candles.push({
        timestamp: `2024-01-${i + 1}`,
        open: 100 + i,
        high: 105 + i,
        low: 95 + i,
        close: 102 + i,
        volume: 1000,
      });
    }

    const { atr } = IndicatorCalculations.calculateATR(candles, 14);
    expect(atr[13]).toBe(10.0); // High - Low = 10.0 across constant ranges
    expect(atr[19]).toBe(10.0);
  });
});
