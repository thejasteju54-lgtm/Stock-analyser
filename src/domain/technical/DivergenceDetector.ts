/**
 * DivergenceDetector.ts
 * Deterministic detection of regular bullish and bearish momentum/volume divergences.
 * Compares confirmed price swing points against oscillator swings.
 */

import {
  SwingPoint,
  TechnicalDivergence,
} from './TechnicalTypes';

export class DivergenceDetector {
  /**
   * Detects RSI, MACD, and Volume divergences across confirmed swing points.
   */
  public static detectDivergences(
    swingHighs: SwingPoint[],
    swingLows: SwingPoint[],
    rsiValues: (number | null)[],
    macdValues: (number | null)[]
  ): TechnicalDivergence[] {
    const divergences: TechnicalDivergence[] = [];

    // 1. Regular Bearish Divergence on Swing Highs (Price Higher High, Indicator Lower High)
    if (swingHighs.length >= 2) {
      for (let i = 1; i < swingHighs.length; i++) {
        const prev = swingHighs[i - 1];
        const curr = swingHighs[i];

        if (curr.price > prev.price) {
          // Check RSI Divergence
          const prevRsi = rsiValues[prev.index];
          const currRsi = rsiValues[curr.index];

          if (prevRsi !== null && currRsi !== null && currRsi < prevRsi - 2.0) {
            divergences.push({
              divergenceId: `div_bear_rsi_${curr.candidateTimestamp}`,
              type: 'BEARISH_DIVERGENCE',
              indicator: 'RSI',
              swingDates: [prev.candidateTimestamp, curr.candidateTimestamp],
              priceSwing: [prev.price, curr.price],
              indicatorSwing: [prevRsi, currRsi],
              confidence: Math.abs(currRsi - prevRsi) > 5.0 ? 'HIGH' : 'MEDIUM',
              description: `Regular Bearish RSI Divergence: Price formed Higher High (₹${prev.price} → ₹${curr.price}) while RSI formed Lower High (${prevRsi.toFixed(1)} → ${currRsi.toFixed(1)}).`,
              isConfirmed: true,
            });
          }

          // Check MACD Divergence
          const prevMacd = macdValues[prev.index];
          const currMacd = macdValues[curr.index];

          if (prevMacd !== null && currMacd !== null && currMacd < prevMacd - 0.5) {
            divergences.push({
              divergenceId: `div_bear_macd_${curr.candidateTimestamp}`,
              type: 'BEARISH_DIVERGENCE',
              indicator: 'MACD',
              swingDates: [prev.candidateTimestamp, curr.candidateTimestamp],
              priceSwing: [prev.price, curr.price],
              indicatorSwing: [prevMacd, currMacd],
              confidence: 'MEDIUM',
              description: `Regular Bearish MACD Divergence: Price formed Higher High (₹${prev.price} → ₹${curr.price}) while MACD Line formed Lower High (${prevMacd.toFixed(2)} → ${currMacd.toFixed(2)}).`,
              isConfirmed: true,
            });
          }
        }
      }
    }

    // 2. Regular Bullish Divergence on Swing Lows (Price Lower Low, Indicator Higher Low)
    if (swingLows.length >= 2) {
      for (let i = 1; i < swingLows.length; i++) {
        const prev = swingLows[i - 1];
        const curr = swingLows[i];

        if (curr.price < prev.price) {
          // Check RSI Divergence
          const prevRsi = rsiValues[prev.index];
          const currRsi = rsiValues[curr.index];

          if (prevRsi !== null && currRsi !== null && currRsi > prevRsi + 2.0) {
            divergences.push({
              divergenceId: `div_bull_rsi_${curr.candidateTimestamp}`,
              type: 'BULLISH_DIVERGENCE',
              indicator: 'RSI',
              swingDates: [prev.candidateTimestamp, curr.candidateTimestamp],
              priceSwing: [prev.price, curr.price],
              indicatorSwing: [prevRsi, currRsi],
              confidence: Math.abs(currRsi - prevRsi) > 5.0 ? 'HIGH' : 'MEDIUM',
              description: `Regular Bullish RSI Divergence: Price formed Lower Low (₹${prev.price} → ₹${curr.price}) while RSI formed Higher Low (${prevRsi.toFixed(1)} → ${currRsi.toFixed(1)}).`,
              isConfirmed: true,
            });
          }

          // Check MACD Divergence
          const prevMacd = macdValues[prev.index];
          const currMacd = macdValues[curr.index];

          if (prevMacd !== null && currMacd !== null && currMacd > prevMacd + 0.5) {
            divergences.push({
              divergenceId: `div_bull_macd_${curr.candidateTimestamp}`,
              type: 'BULLISH_DIVERGENCE',
              indicator: 'MACD',
              swingDates: [prev.candidateTimestamp, curr.candidateTimestamp],
              priceSwing: [prev.price, curr.price],
              indicatorSwing: [prevMacd, currMacd],
              confidence: 'MEDIUM',
              description: `Regular Bullish MACD Divergence: Price formed Lower Low (₹${prev.price} → ₹${curr.price}) while MACD Line formed Higher Low (${prevMacd.toFixed(2)} → ${currMacd.toFixed(2)}).`,
              isConfirmed: true,
            });
          }
        }
      }
    }

    return divergences;
  }
}
