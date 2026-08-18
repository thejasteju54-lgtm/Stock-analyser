/**
 * IndicatorCalculations.ts
 * Pure deterministic mathematical calculations for technical indicators.
 * Implements standard institutional formulas without external charting black-boxes.
 */

import { OHLCVCandle } from './TechnicalTypes';

export class IndicatorCalculations {
  /**
   * Simple Moving Average (SMA)
   */
  public static calculateSMA(values: number[], period: number): (number | null)[] {
    const result: (number | null)[] = [];
    if (period <= 0 || values.length === 0) return result;

    let rollingSum = 0;
    for (let i = 0; i < values.length; i++) {
      rollingSum += values[i];
      if (i >= period) {
        rollingSum -= values[i - period];
      }

      if (i >= period - 1) {
        result.push(Math.round((rollingSum / period) * 100) / 100);
      } else {
        result.push(null);
      }
    }
    return result;
  }

  /**
   * Exponential Moving Average (EMA)
   */
  public static calculateEMA(values: number[], period: number): (number | null)[] {
    const result: (number | null)[] = [];
    if (period <= 0 || values.length === 0) return result;

    if (values.length < period) {
      return values.map(() => null);
    }

    const multiplier = 2 / (period + 1);

    // Initial SMA for first EMA point
    let initialSum = 0;
    for (let i = 0; i < period; i++) {
      initialSum += values[i];
      result.push(null);
    }

    let prevEma = initialSum / period;
    result[period - 1] = Math.round(prevEma * 100) / 100;

    for (let i = period; i < values.length; i++) {
      const currentEma = (values[i] - prevEma) * multiplier + prevEma;
      result.push(Math.round(currentEma * 100) / 100);
      prevEma = currentEma;
    }

    return result;
  }

  /**
   * Relative Strength Index (RSI) using Wilder's Smoothed Moving Average
   * Default period = 14
   */
  public static calculateRSI(closes: number[], period: number = 14): (number | null)[] {
    const result: (number | null)[] = [];
    if (closes.length <= period) {
      return closes.map(() => null);
    }

    // Step 1: Calculate price changes
    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 1; i < closes.length; i++) {
      const diff = closes[i] - closes[i - 1];
      gains.push(diff > 0 ? diff : 0);
      losses.push(diff < 0 ? Math.abs(diff) : 0);
    }

    // First average gain and loss (SMA over period)
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    for (let i = 0; i < period; i++) {
      result.push(null);
    }

    let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    let rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);
    result.push(Math.round(rsi * 100) / 100);

    // Wilder's smoothing for subsequent periods
    for (let i = period; i < gains.length; i++) {
      avgGain = (avgGain * (period - 1) + gains[i]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

      if (avgLoss === 0) {
        rsi = 100;
      } else {
        rs = avgGain / avgLoss;
        rsi = 100 - 100 / (1 + rs);
      }
      result.push(Math.round(rsi * 100) / 100);
    }

    return result;
  }

  /**
   * Moving Average Convergence Divergence (MACD)
   * Default: 12 Fast, 26 Slow, 9 Signal
   */
  public static calculateMACD(
    closes: number[],
    fastPeriod: number = 12,
    slowPeriod: number = 26,
    signalPeriod: number = 9
  ): {
    macdLine: (number | null)[];
    signalLine: (number | null)[];
    histogram: (number | null)[];
  } {
    const fastEma = this.calculateEMA(closes, fastPeriod);
    const slowEma = this.calculateEMA(closes, slowPeriod);

    const macdLine: (number | null)[] = [];
    const validMacdValues: number[] = [];
    const validIndices: number[] = [];

    for (let i = 0; i < closes.length; i++) {
      if (fastEma[i] !== null && slowEma[i] !== null) {
        const macdVal = Math.round((fastEma[i]! - slowEma[i]!) * 100) / 100;
        macdLine.push(macdVal);
        validMacdValues.push(macdVal);
        validIndices.push(i);
      } else {
        macdLine.push(null);
      }
    }

    // Signal Line is 9 EMA of MACD Line
    const signalValues = this.calculateEMA(validMacdValues, signalPeriod);
    const signalLine: (number | null)[] = new Array(closes.length).fill(null);
    const histogram: (number | null)[] = new Array(closes.length).fill(null);

    for (let k = 0; k < validIndices.length; k++) {
      const originalIdx = validIndices[k];
      const sigVal = signalValues[k];
      signalLine[originalIdx] = sigVal;

      if (sigVal !== null && macdLine[originalIdx] !== null) {
        histogram[originalIdx] = Math.round((macdLine[originalIdx]! - sigVal) * 100) / 100;
      }
    }

    return { macdLine, signalLine, histogram };
  }

  /**
   * Average True Range (ATR)
   * Default period = 14
   */
  public static calculateATR(
    candles: OHLCVCandle[],
    period: number = 14
  ): {
    trueRanges: number[];
    atr: (number | null)[];
  } {
    const trueRanges: number[] = [];
    const atr: (number | null)[] = [];

    if (candles.length === 0) return { trueRanges, atr };

    // True range for first bar is High - Low
    trueRanges.push(candles[0].high - candles[0].low);
    atr.push(null);

    for (let i = 1; i < candles.length; i++) {
      const prevClose = candles[i - 1].close;
      const currentHigh = candles[i].high;
      const currentLow = candles[i].low;

      const tr = Math.max(
        currentHigh - currentLow,
        Math.abs(currentHigh - prevClose),
        Math.abs(currentLow - prevClose)
      );
      trueRanges.push(Math.round(tr * 100) / 100);
      atr.push(null);
    }

    if (candles.length < period) {
      return { trueRanges, atr };
    }

    // First ATR is simple average of first period TRs
    let rollingAtr = trueRanges.slice(0, period).reduce((a, b) => a + b, 0) / period;
    atr[period - 1] = Math.round(rollingAtr * 100) / 100;

    // Subsequent ATRs use Wilder's smoothing
    for (let i = period; i < trueRanges.length; i++) {
      rollingAtr = (rollingAtr * (period - 1) + trueRanges[i]) / period;
      atr[i] = Math.round(rollingAtr * 100) / 100;
    }

    return { trueRanges, atr };
  }

  /**
   * Relative Volume (RVOL)
   * Current Volume / 20-day Volume SMA
   */
  public static calculateRVOL(volumes: number[], period: number = 20): (number | null)[] {
    const volumeSma = this.calculateSMA(volumes, period);
    const rvol: (number | null)[] = [];

    for (let i = 0; i < volumes.length; i++) {
      const avgVol = volumeSma[i];
      if (avgVol !== null && avgVol > 0) {
        rvol.push(Math.round((volumes[i] / avgVol) * 100) / 100);
      } else {
        rvol.push(null);
      }
    }
    return rvol;
  }

  /**
   * Rate of Change (ROC)
   * (Close - Close_n) / Close_n * 100
   */
  public static calculateROC(closes: number[], period: number = 14): (number | null)[] {
    const roc: (number | null)[] = [];
    for (let i = 0; i < closes.length; i++) {
      if (i >= period && closes[i - period] > 0) {
        const val = ((closes[i] - closes[i - period]) / closes[i - period]) * 100;
        roc.push(Math.round(val * 100) / 100);
      } else {
        roc.push(null);
      }
    }
    return roc;
  }

  /**
   * Strict Up/Down Volume aggregation
   * UpVolume: Close > PrevClose
   * DownVolume: Close < PrevClose
   * Unchanged: Close == PrevClose
   */
  public static calculateUpDownVolume(
    candles: OHLCVCandle[],
    lookback: number = 20
  ): {
    upVolumeTotal: number;
    downVolumeTotal: number;
    unchangedVolumeTotal: number;
    upDownRatio: number | null;
  } {
    if (candles.length < 2) {
      return { upVolumeTotal: 0, downVolumeTotal: 0, unchangedVolumeTotal: 0, upDownRatio: null };
    }

    const slice = candles.slice(-lookback);
    let upVol = 0;
    let downVol = 0;
    let unchVol = 0;

    for (let i = 1; i < slice.length; i++) {
      const prevClose = slice[i - 1].close;
      const currClose = slice[i].close;
      const vol = slice[i].volume || 0;

      if (currClose > prevClose) {
        upVol += vol;
      } else if (currClose < prevClose) {
        downVol += vol;
      } else {
        unchVol += vol;
      }
    }

    const ratio = downVol > 0 ? Math.round((upVol / downVol) * 100) / 100 : null;
    return {
      upVolumeTotal: upVol,
      downVolumeTotal: downVol,
      unchangedVolumeTotal: unchVol,
      upDownRatio: ratio,
    };
  }
}
