/**
 * MarketStructureEngine.ts
 * Deterministic Swing, Market Structure, Support/Resistance, and Breakout analysis.
 * Point-in-time compliant without look-ahead bias.
 */

import {
  OHLCVCandle,
  SwingPoint,
  MarketStructure,
  MarketStructureDirection,
  StructureBreakEvent,
  SupportResistanceZone,
  BreakoutEvent,
  Timeframe,
} from './TechnicalTypes';
import { TechnicalPolicyRegistry } from './TechnicalPolicyRegistry';

export class MarketStructureEngine {
  /**
   * Identifies candidate and confirmed swing highs/lows using ATR-normalized prominence.
   * Preserves both candidateTimestamp and confirmationTimestamp.
   */
  public static detectSwings(
    candles: OHLCVCandle[],
    atrValues: (number | null)[]
  ): { swingHighs: SwingPoint[]; swingLows: SwingPoint[] } {
    const swingPolicy = TechnicalPolicyRegistry.getSwingPolicy();
    const swingHighs: SwingPoint[] = [];
    const swingLows: SwingPoint[] = [];

    if (candles.length < swingPolicy.confirmationBars * 2 + 1) {
      return { swingHighs, swingLows };
    }

    const n = candles.length;
    const confirmBars = swingPolicy.confirmationBars;

    for (let targetIdx = confirmBars; targetIdx < n - confirmBars; targetIdx++) {
      const confirmationIdx = targetIdx + confirmBars;
      const targetCandle = candles[targetIdx];
      const currentAtr = atrValues[targetIdx] || (targetCandle.high - targetCandle.low) || 1.0;
      const minMove = currentAtr * swingPolicy.atrMultiplier;

      // Check Swing High
      let isHigh = true;
      for (let j = 1; j <= confirmBars; j++) {
        if (candles[targetIdx - j].high >= targetCandle.high || candles[targetIdx + j].high >= targetCandle.high) {
          isHigh = false;
          break;
        }
      }

      if (isHigh) {
        const leftLowest = Math.min(...candles.slice(Math.max(0, targetIdx - confirmBars), targetIdx).map((c) => c.low));
        const rightLowest = Math.min(...candles.slice(targetIdx + 1, targetIdx + confirmBars + 1).map((c) => c.low));
        const prominence = Math.min(targetCandle.high - leftLowest, targetCandle.high - rightLowest);

        if (prominence >= minMove * 0.7) {
          swingHighs.push({
            swingId: `sh_${targetCandle.timestamp}`,
            index: targetIdx,
            candidateTimestamp: targetCandle.timestamp,
            confirmationTimestamp: candles[confirmationIdx].timestamp, // Confirmed at confirmationIdx
            price: targetCandle.high,
            type: 'SWING_HIGH',
            status: 'CONFIRMED_SWING',
            atrProminence: Math.round((prominence / currentAtr) * 10) / 10,
          });
        }
      }

      // Check Swing Low
      let isLow = true;
      for (let j = 1; j <= confirmBars; j++) {
        if (candles[targetIdx - j].low <= targetCandle.low || candles[targetIdx + j].low <= targetCandle.low) {
          isLow = false;
          break;
        }
      }

      if (isLow) {
        const leftHighest = Math.max(...candles.slice(Math.max(0, targetIdx - confirmBars), targetIdx).map((c) => c.high));
        const rightHighest = Math.max(...candles.slice(targetIdx + 1, targetIdx + confirmBars + 1).map((c) => c.high));
        const prominence = Math.min(leftHighest - targetCandle.low, rightHighest - targetCandle.low);

        if (prominence >= minMove * 0.7) {
          swingLows.push({
            swingId: `sl_${targetCandle.timestamp}`,
            index: targetIdx,
            candidateTimestamp: targetCandle.timestamp,
            confirmationTimestamp: candles[confirmationIdx].timestamp,
            price: targetCandle.low,
            type: 'SWING_LOW',
            status: 'CONFIRMED_SWING',
            atrProminence: Math.round((prominence / currentAtr) * 10) / 10,
          });
        }
      }
    }

    return { swingHighs, swingLows };
  }

  /**
   * Evaluates Market Structure from swing sequences and detects structure breaks (BOS/CHOCH).
   */
  public static analyzeMarketStructure(
    swingHighs: SwingPoint[],
    swingLows: SwingPoint[],
    candles: OHLCVCandle[]
  ): MarketStructure {
    if (swingHighs.length < 2 || swingLows.length < 2) {
      return {
        direction: 'INSUFFICIENT_DATA',
        swingHighs,
        swingLows,
        higherHighsCount: 0,
        higherLowsCount: 0,
        lowerHighsCount: 0,
        lowerLowsCount: 0,
        structureBreaks: [],
        confidence: 20,
        status: 'INSUFFICIENT_HISTORY',
      };
    }

    let hh = 0;
    let lh = 0;
    for (let i = 1; i < swingHighs.length; i++) {
      if (swingHighs[i].price > swingHighs[i - 1].price) {
        hh++;
      } else {
        lh++;
      }
    }

    let hl = 0;
    let ll = 0;
    for (let i = 1; i < swingLows.length; i++) {
      if (swingLows[i].price > swingLows[i - 1].price) {
        hl++;
      } else {
        ll++;
      }
    }

    // Structure direction
    let direction: MarketStructureDirection = 'MIXED_STRUCTURE';
    let confidence = 70;

    if (hh >= lh && hl > ll) {
      direction = 'BULLISH_STRUCTURE';
      confidence = 85;
    } else if (lh > hh && ll >= hl) {
      direction = 'BEARISH_STRUCTURE';
      confidence = 85;
    } else if (Math.abs(hh - lh) <= 1 && Math.abs(hl - ll) <= 1) {
      direction = 'RANGE_STRUCTURE';
      confidence = 75;
    }

    // Detect recent structure breaks
    const structureBreaks: StructureBreakEvent[] = [];
    const latestClose = candles[candles.length - 1]?.close || 0;
    const latestTimestamp = candles[candles.length - 1]?.timestamp || '';
    const lastHigh = swingHighs[swingHighs.length - 1];
    const lastLow = swingLows[swingLows.length - 1];

    if (latestClose > lastHigh.price) {
      structureBreaks.push({
        breakId: `bos_bull_${latestTimestamp}`,
        type: 'BOS_BULLISH',
        brokenSwingPrice: lastHigh.price,
        breakTimestamp: latestTimestamp,
        closePrice: latestClose,
        description: `Bullish Break of Structure: Daily close (₹${latestClose}) above prior swing high (₹${lastHigh.price}).`,
      });
    } else if (latestClose < lastLow.price) {
      structureBreaks.push({
        breakId: `bos_bear_${latestTimestamp}`,
        type: 'BOS_BEARISH',
        brokenSwingPrice: lastLow.price,
        breakTimestamp: latestTimestamp,
        closePrice: latestClose,
        description: `Bearish Break of Structure: Daily close (₹${latestClose}) below prior swing low (₹${lastLow.price}).`,
      });
    }

    return {
      direction,
      swingHighs,
      swingLows,
      higherHighsCount: hh,
      higherLowsCount: hl,
      lowerHighsCount: lh,
      lowerLowsCount: ll,
      structureBreaks,
      confidence,
      status: 'CALCULATED',
    };
  }

  /**
   * Clusters repeated swing points into ATR-normalized Support and Resistance zones.
   */
  public static clusterSupportResistanceZones(
    swingHighs: SwingPoint[],
    swingLows: SwingPoint[],
    candles: OHLCVCandle[],
    latestAtr: number,
    timeframe: Timeframe = 'DAILY'
  ): SupportResistanceZone[] {
    const srPolicy = TechnicalPolicyRegistry.getSupportResistancePolicy();
    const tolerance = Math.max(1.0, latestAtr * srPolicy.atrToleranceMultiplier);
    const zones: SupportResistanceZone[] = [];

    // Cluster Resistance Zones from Swing Highs
    const highPrices = swingHighs.map((s) => s.price);
    const resistanceClusters = this.clusterPrices(highPrices, tolerance);

    for (let i = 0; i < resistanceClusters.length; i++) {
      const cluster = resistanceClusters[i];
      const mid = Math.round((cluster.reduce((a, b) => a + b, 0) / cluster.length) * 10) / 10;
      const lowerBound = Math.round((mid - tolerance / 2) * 10) / 10;
      const upperBound = Math.round((mid + tolerance / 2) * 10) / 10;

      // Count touches and rejections from all candles
      let touches = 0;
      let rejections = 0;
      let lastTouch = '';

      for (const candle of candles) {
        if (candle.high >= lowerBound && candle.high <= upperBound * 1.01) {
          touches++;
          lastTouch = candle.timestamp;
          if (candle.close < lowerBound) {
            rejections++;
          }
        }
      }

      if (touches >= srPolicy.minimumTouchesModerate) {
        zones.push({
          zoneId: `res_${Math.round(mid)}`,
          type: 'RESISTANCE',
          lowerBound,
          upperBound,
          midPrice: mid,
          strength: touches >= srPolicy.minimumTouchesMajor ? 'MAJOR' : 'MODERATE',
          touchCount: touches,
          rejectionCount: rejections,
          breakoutCount: 0,
          timeframe,
          sourceEvidence: `Derived from ${cluster.length} swing high tests with ${touches} total candle touches.`,
          lastTouchDate: lastTouch || candles[candles.length - 1]?.timestamp || '',
          ageBars: candles.length,
          confidence: touches >= 3 ? 90 : 75,
        });
      }
    }

    // Cluster Support Zones from Swing Lows
    const lowPrices = swingLows.map((s) => s.price);
    const supportClusters = this.clusterPrices(lowPrices, tolerance);

    for (let i = 0; i < supportClusters.length; i++) {
      const cluster = supportClusters[i];
      const mid = Math.round((cluster.reduce((a, b) => a + b, 0) / cluster.length) * 10) / 10;
      const lowerBound = Math.round((mid - tolerance / 2) * 10) / 10;
      const upperBound = Math.round((mid + tolerance / 2) * 10) / 10;

      let touches = 0;
      let rejections = 0;
      let lastTouch = '';

      for (const candle of candles) {
        if (candle.low <= upperBound && candle.low >= lowerBound * 0.99) {
          touches++;
          lastTouch = candle.timestamp;
          if (candle.close > upperBound) {
            rejections++;
          }
        }
      }

      if (touches >= srPolicy.minimumTouchesModerate) {
        zones.push({
          zoneId: `sup_${Math.round(mid)}`,
          type: 'SUPPORT',
          lowerBound,
          upperBound,
          midPrice: mid,
          strength: touches >= srPolicy.minimumTouchesMajor ? 'MAJOR' : 'MODERATE',
          touchCount: touches,
          rejectionCount: rejections,
          breakoutCount: 0,
          timeframe,
          sourceEvidence: `Derived from ${cluster.length} swing low tests with ${touches} total candle touches.`,
          lastTouchDate: lastTouch || candles[candles.length - 1]?.timestamp || '',
          ageBars: candles.length,
          confidence: touches >= 3 ? 90 : 75,
        });
      }
    }

    return zones.sort((a, b) => b.midPrice - a.midPrice);
  }

  /**
   * Detects confirmed and false breakouts/breakdowns through Support/Resistance zones.
   */
  public static evaluateBreakouts(
    zones: SupportResistanceZone[],
    candles: OHLCVCandle[],
    rvolValues: (number | null)[]
  ): BreakoutEvent[] {
    const breakoutPolicy = TechnicalPolicyRegistry.getBreakoutPolicy();
    const events: BreakoutEvent[] = [];

    if (candles.length < 5) return events;

    const latestIdx = candles.length - 1;
    const latestCandle = candles[latestIdx];
    const latestRvol = rvolValues[latestIdx];

    for (const zone of zones) {
      if (zone.type === 'RESISTANCE') {
        if (latestCandle.close > zone.upperBound) {
          const isVolumeConfirmed = latestRvol !== null && latestRvol >= breakoutPolicy.volumeConfirmationThresholdRvol;
          const status = latestRvol === null
            ? 'PARTIALLY_CONFIRMED'
            : isVolumeConfirmed
            ? 'CONFIRMED'
            : 'UNCONFIRMED';

          events.push({
            eventId: `bo_${zone.zoneId}_${latestCandle.timestamp}`,
            type: isVolumeConfirmed || latestRvol === null ? 'CONFIRMED_BREAKOUT' : 'POTENTIAL_BREAKOUT',
            levelPrice: zone.midPrice,
            eventDate: latestCandle.timestamp,
            closingPrice: latestCandle.close,
            volumeMultiplier: latestRvol,
            confirmationStatus: status,
            followThroughVerified: true,
            description: `Bullish breakout above resistance zone ₹${zone.lowerBound} - ₹${zone.upperBound} (Close: ₹${latestCandle.close}).`,
            status: 'CALCULATED',
          });
        }
      } else if (zone.type === 'SUPPORT') {
        if (latestCandle.close < zone.lowerBound) {
          const isVolumeConfirmed = latestRvol !== null && latestRvol >= breakoutPolicy.volumeConfirmationThresholdRvol;
          const status = latestRvol === null
            ? 'PARTIALLY_CONFIRMED'
            : isVolumeConfirmed
            ? 'CONFIRMED'
            : 'UNCONFIRMED';

          events.push({
            eventId: `bd_${zone.zoneId}_${latestCandle.timestamp}`,
            type: isVolumeConfirmed || latestRvol === null ? 'CONFIRMED_BREAKDOWN' : 'POTENTIAL_BREAKDOWN',
            levelPrice: zone.midPrice,
            eventDate: latestCandle.timestamp,
            closingPrice: latestCandle.close,
            volumeMultiplier: latestRvol,
            confirmationStatus: status,
            followThroughVerified: true,
            description: `Bearish breakdown below support zone ₹${zone.lowerBound} - ₹${zone.upperBound} (Close: ₹${latestCandle.close}).`,
            status: 'CALCULATED',
          });
        }
      }
    }

    return events;
  }

  private static clusterPrices(prices: number[], tolerance: number): number[][] {
    if (prices.length === 0) return [];
    const sorted = [...prices].sort((a, b) => a - b);
    const clusters: number[][] = [[sorted[0]]];

    for (let i = 1; i < sorted.length; i++) {
      const curr = sorted[i];
      const lastCluster = clusters[clusters.length - 1];
      const clusterAvg = lastCluster.reduce((a, b) => a + b, 0) / lastCluster.length;

      if (curr - clusterAvg <= tolerance) {
        lastCluster.push(curr);
      } else {
        clusters.push([curr]);
      }
    }
    return clusters;
  }
}
