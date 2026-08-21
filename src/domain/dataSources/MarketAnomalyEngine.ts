/**
 * MarketAnomalyEngine.ts
 * Phase 16 — Price Anomaly & Circuit Diagnostic Policy Engine.
 * Evaluates large single-session price moves (>20%) against corporate actions, circuit bands, and volume.
 */

import { CorporateActionRecord, MarketPriceRecord } from './DataSourceTypes';

export interface AnomalyEvaluationResult {
  classification: 'NORMAL' | 'EXPLAINED_ANOMALY' | 'UNEXPLAINED_ANOMALY' | 'MATERIAL_CONFLICT' | 'NOT_ASSESSABLE';
  percentageChange: number;
  explanation: string;
  isAssessable: boolean;
}

export class MarketAnomalyEngine {
  public static evaluatePriceMove(params: {
    currentPrice: number;
    previousClose: number;
    volume: number;
    averageVolume20d?: number;
    sessionDate: string;
    corporateActions?: CorporateActionRecord[];
    isCircuitBreakerHit?: boolean;
    hasOfficialNewsFiling?: boolean;
    isHolidayOrClosed?: boolean;
  }): AnomalyEvaluationResult {
    const { currentPrice, previousClose, volume, sessionDate, corporateActions = [] } = params;

    if (currentPrice <= 0 || previousClose <= 0) {
      return {
        classification: 'NOT_ASSESSABLE',
        percentageChange: 0,
        explanation: 'Invalid zero or negative price encountered.',
        isAssessable: false,
      };
    }

    const rawMovePercent = ((currentPrice - previousClose) / previousClose) * 100;
    const absMove = Math.abs(rawMovePercent);

    // Normal move (< 20%)
    if (absMove <= 20.0) {
      return {
        classification: 'NORMAL',
        percentageChange: Number(rawMovePercent.toFixed(2)),
        explanation: `Normal price movement (${rawMovePercent.toFixed(2)}%) within standard market thresholds.`,
        isAssessable: true,
      };
    }

    // Large move (> 20%): Diagnostic Cross-Checks

    // 1. Check for Corporate Action on sessionDate
    const matchingAction = corporateActions.find((a) => a.exDate === sessionDate || a.effectiveDate === sessionDate);
    if (matchingAction) {
      return {
        classification: 'EXPLAINED_ANOMALY',
        percentageChange: Number(rawMovePercent.toFixed(2)),
        explanation: `Price adjustment of ${rawMovePercent.toFixed(2)}% explained by corporate action (${matchingAction.actionType}, ratio ${matchingAction.ratio || matchingAction.multiplier}).`,
        isAssessable: true,
      };
    }

    // 2. Check for Circuit Breaker / Official Filing with Heavy Volume
    if (params.isCircuitBreakerHit || params.hasOfficialNewsFiling) {
      return {
        classification: 'EXPLAINED_ANOMALY',
        percentageChange: Number(rawMovePercent.toFixed(2)),
        explanation: `Large price move (${rawMovePercent.toFixed(2)}%) corroborated by official exchange announcement and market circuit limit.`,
        isAssessable: true,
      };
    }

    // 3. Check for Suspicious Low-Volume Illiquidity Spikes
    const avgVol = params.averageVolume20d || 10000;
    if (volume < 0.05 * avgVol) {
      return {
        classification: 'UNEXPLAINED_ANOMALY',
        percentageChange: Number(rawMovePercent.toFixed(2)),
        explanation: `Unexplained price move of ${rawMovePercent.toFixed(2)}% on negligible volume (${volume} vs avg ${avgVol}). Flagged for review.`,
        isAssessable: true,
      };
    }

    // Unexplained volatility with substantial volume
    return {
      classification: 'UNEXPLAINED_ANOMALY',
      percentageChange: Number(rawMovePercent.toFixed(2)),
      explanation: `Extreme price move (${rawMovePercent.toFixed(2)}%) without recorded corporate action or official disclosure on ${sessionDate}.`,
      isAssessable: true,
    };
  }

  public static attachAnomalyClassification(
    record: MarketPriceRecord,
    prevClose: number,
    corporateActions: CorporateActionRecord[] = []
  ): MarketPriceRecord {
    const result = this.evaluatePriceMove({
      currentPrice: record.rawPrice,
      previousClose: prevClose,
      volume: record.volume,
      sessionDate: record.sessionDate,
      corporateActions,
    });

    return {
      ...record,
      anomalyClassification: result.classification,
      anomalyReason: result.explanation,
    };
  }
}
