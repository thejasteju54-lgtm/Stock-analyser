/**
 * CorporateActionEngine.ts
 * Phase 16 — Corporate Action Normalization & 3-Tier Price Adjustment Engine.
 * Explicitly computes RAW_PRICE, SPLIT_ADJUSTED_PRICE, and TOTAL_RETURN_PRICE.
 */

import { CorporateActionRecord, MarketPriceRecord } from './DataSourceTypes';

export class CorporateActionEngine {
  /**
   * Computes cumulative split/bonus adjustment factor for any point-in-time session.
   * Actions effective AFTER the session date apply backwards to adjust historical prices.
   */
  public static computeSplitAdjustmentFactor(
    actions: CorporateActionRecord[],
    sessionDate: string
  ): number {
    let cumulativeFactor = 1.0;
    const sessionTime = new Date(sessionDate).getTime();

    for (const action of actions) {
      const actionEffectiveTime = new Date(action.effectiveDate || action.exDate).getTime();
      // If corporate action occurred AFTER this session, historical prices must be adjusted downwards
      if (actionEffectiveTime > sessionTime) {
        if (action.actionType === 'STOCK_SPLIT' || action.actionType === 'FACE_VALUE_SPLIT') {
          // e.g. 10:1 split (ratio multiplier = 10) means historical price was 10x higher
          cumulativeFactor = cumulativeFactor / (action.multiplier || 1.0);
        } else if (action.actionType === 'BONUS_ISSUE') {
          // e.g. 1:1 bonus (multiplier = 2.0) means historical price was 2x higher
          cumulativeFactor = cumulativeFactor / (action.multiplier || 1.0);
        }
      }
    }

    return cumulativeFactor;
  }

  /**
   * Computes Total Return adjustment factor incorporating cash dividends reinvested on ex-date.
   * Formula: Product of ( (P_prev - Dividend) / P_prev * SplitFactor )
   */
  public static computeTotalReturnAdjustmentFactor(
    actions: CorporateActionRecord[],
    sessionDate: string,
    historicalClosePrices: Map<string, number>
  ): number {
    let totalReturnFactor = 1.0;
    const sessionTime = new Date(sessionDate).getTime();

    // Sort corporate actions chronologically
    const sorted = [...actions].sort(
      (a, b) => new Date(a.exDate).getTime() - new Date(b.exDate).getTime()
    );

    for (const action of sorted) {
      const actionTime = new Date(action.exDate).getTime();
      if (actionTime > sessionTime) {
        if (action.actionType === 'STOCK_SPLIT' || action.actionType === 'FACE_VALUE_SPLIT' || action.actionType === 'BONUS_ISSUE') {
          totalReturnFactor = totalReturnFactor / (action.multiplier || 1.0);
        } else if (action.actionType === 'DIVIDEND' && action.dividendAmount && action.dividendAmount > 0) {
          const prevClose = historicalClosePrices.get(action.exDate) || 0;
          if (prevClose > action.dividendAmount) {
            const dividendFactor = (prevClose - action.dividendAmount) / prevClose;
            totalReturnFactor = totalReturnFactor * dividendFactor;
          }
        }
      }
    }

    return totalReturnFactor;
  }

  /**
   * Transforms raw price into complete 3-Tier Price Record.
   */
  public static buildPriceRecord(params: {
    symbol: string;
    exchange: 'NSE' | 'BSE';
    sessionDate: string;
    tradeTimestamp: string;
    rawPrice: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    vwap?: number;
    actions: CorporateActionRecord[];
    historicalCloseMap?: Map<string, number>;
    sourceId: string;
    sourceTier?: import('./DataSourceTypes').DataSourceTier;
    captureId: string;
  }): MarketPriceRecord {
    const splitFactor = this.computeSplitAdjustmentFactor(params.actions, params.sessionDate);
    const splitAdjustedPrice = Number((params.rawPrice * splitFactor).toFixed(2));
    
    const trFactor = params.historicalCloseMap
      ? this.computeTotalReturnAdjustmentFactor(params.actions, params.sessionDate, params.historicalCloseMap)
      : splitFactor;
    const totalReturnPrice = Number((params.rawPrice * trFactor).toFixed(2));

    return {
      symbol: params.symbol,
      exchange: params.exchange,
      tradeTimestamp: params.tradeTimestamp,
      sessionDate: params.sessionDate,
      rawPrice: params.rawPrice,
      splitAdjustedPrice,
      totalReturnPrice,
      cumulativeSplitAdjustmentFactor: splitFactor,
      open: params.open,
      high: params.high,
      low: params.low,
      close: params.close,
      volume: params.volume,
      vwap: params.vwap,
      currency: 'INR',
      anomalyClassification: 'NORMAL',
      sourceId: params.sourceId,
      sourceTier: params.sourceTier || 'TIER_1_PRIMARY',
      captureId: params.captureId,
    };
  }
}
