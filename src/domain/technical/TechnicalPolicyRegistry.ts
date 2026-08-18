/**
 * TechnicalPolicyRegistry.ts
 * Centralized deterministic policies for Phase 10 Technical Analysis.
 * Strictly non-LLM thresholds.
 */

import {
  TrendDirection,
  MarketStructureDirection,
  MarketCyclePhase,
  TechnicalRiskLevel,
} from './TechnicalTypes';

export interface ISwingDetectionPolicy {
  atrMultiplier: number;
  minimumBarsBetweenSwings: number;
  confirmationBars: number;
  prominenceThresholdPercent: number;
}

export interface ITrendClassificationPolicy {
  minimumTrendBars: number;
  dmaAlignmentWeight: number;
  structureWeight: number;
  slopeThresholdPercent: number;
}

export interface ISupportResistancePolicy {
  atrToleranceMultiplier: number;
  minimumTouchesModerate: number;
  minimumTouchesMajor: number;
  zoneMergeDistanceAtr: number;
  decayBarsThreshold: number;
}

export interface IBreakoutPolicy {
  minimumCloseBeyondZoneAtr: number;
  volumeConfirmationThresholdRvol: number;
  followThroughBars: number;
}

export interface IVolumePolicy {
  rvolLookback: number;
  volumeExpansionThreshold: number;
  volumeContractionThreshold: number;
  highVolumeWarningDescription: string;
}

export interface IMarketPhasePolicy {
  consolidationVolatilityMaxAtrPercent: number;
  markupMinTrendSlope: number;
  markdownMaxTrendSlope: number;
}

export interface ITechnicalRiskPolicy {
  supportBreakdownPoints: number;
  longTermMaFailurePoints: number;
  bearishStructurePoints: number;
  failedBreakoutPoints: number;
  bearishDivergencePoints: number;
  elevatedVolatilityPoints: number;
  relativeUnderperformancePoints: number;
}

export interface ITechnicalConfidencePolicy {
  dataQualityWeight: number;
  observationCountWeight: number;
  timeframeAgreementWeight: number;
  indicatorAgreementWeight: number;
  volumeConfirmationWeight: number;
  benchmarkAvailabilityWeight: number;
}

export interface IPriceAdjustmentPolicy {
  supportedActions: string[];
}

export const SWING_DETECTION_POLICY: ISwingDetectionPolicy = {
  atrMultiplier: 1.5,
  minimumBarsBetweenSwings: 4,
  confirmationBars: 3,
  prominenceThresholdPercent: 1.5,
};

export const TREND_CLASSIFICATION_POLICY: ITrendClassificationPolicy = {
  minimumTrendBars: 20,
  dmaAlignmentWeight: 0.5,
  structureWeight: 0.5,
  slopeThresholdPercent: 0.5,
};

export const SUPPORT_RESISTANCE_POLICY: ISupportResistancePolicy = {
  atrToleranceMultiplier: 0.75,
  minimumTouchesModerate: 2,
  minimumTouchesMajor: 3,
  zoneMergeDistanceAtr: 1.0,
  decayBarsThreshold: 120, // ~6 months of trading days
};

export const BREAKOUT_POLICY: IBreakoutPolicy = {
  minimumCloseBeyondZoneAtr: 0.4,
  volumeConfirmationThresholdRvol: 1.4, // 1.4x 20-day avg volume
  followThroughBars: 2,
};

export const VOLUME_POLICY: IVolumePolicy = {
  rvolLookback: 20,
  volumeExpansionThreshold: 1.3,
  volumeContractionThreshold: 0.7,
  highVolumeWarningDescription: 'High volume can reflect either institutional absorption, distribution, panic capitulation, or news-driven re-pricing; it is not inherently directional.',
};

export const MARKET_PHASE_POLICY: IMarketPhasePolicy = {
  consolidationVolatilityMaxAtrPercent: 2.0,
  markupMinTrendSlope: 0.8,
  markdownMaxTrendSlope: -0.8,
};

export const TECHNICAL_RISK_POLICY: ITechnicalRiskPolicy = {
  supportBreakdownPoints: 25,
  longTermMaFailurePoints: 20,
  bearishStructurePoints: 20,
  failedBreakoutPoints: 15,
  bearishDivergencePoints: 10,
  elevatedVolatilityPoints: 10,
  relativeUnderperformancePoints: 10,
};

export const TECHNICAL_CONFIDENCE_POLICY: ITechnicalConfidencePolicy = {
  dataQualityWeight: 30,
  observationCountWeight: 20,
  timeframeAgreementWeight: 15,
  indicatorAgreementWeight: 15,
  volumeConfirmationWeight: 10,
  benchmarkAvailabilityWeight: 10,
};

export const PRICE_ADJUSTMENT_POLICY: IPriceAdjustmentPolicy = {
  supportedActions: ['SPLIT', 'BONUS', 'RIGHTS', 'MERGER', 'DEMERGER'],
};

export class TechnicalPolicyRegistry {
  public static getSwingPolicy(): ISwingDetectionPolicy {
    return SWING_DETECTION_POLICY;
  }

  public static getTrendPolicy(): ITrendClassificationPolicy {
    return TREND_CLASSIFICATION_POLICY;
  }

  public static getSupportResistancePolicy(): ISupportResistancePolicy {
    return SUPPORT_RESISTANCE_POLICY;
  }

  public static getBreakoutPolicy(): IBreakoutPolicy {
    return BREAKOUT_POLICY;
  }

  public static getVolumePolicy(): IVolumePolicy {
    return VOLUME_POLICY;
  }

  public static getMarketPhasePolicy(): IMarketPhasePolicy {
    return MARKET_PHASE_POLICY;
  }

  public static getTechnicalRiskPolicy(): ITechnicalRiskPolicy {
    return TECHNICAL_RISK_POLICY;
  }

  public static getConfidencePolicy(): ITechnicalConfidencePolicy {
    return TECHNICAL_CONFIDENCE_POLICY;
  }

  public static getPriceAdjustmentPolicy(): IPriceAdjustmentPolicy {
    return PRICE_ADJUSTMENT_POLICY;
  }

  /**
   * Deterministically classifies Trend based on structure, moving averages, and slope.
   */
  public static classifyTrend(
    structure: MarketStructureDirection,
    priceVs200Dma: 'ABOVE' | 'BELOW' | 'AT' | 'NOT_ASSESSABLE',
    priceVs50Dma: 'ABOVE' | 'BELOW' | 'AT' | 'NOT_ASSESSABLE',
    _maAlignment: string,
    slopePercent: number
  ): { trend: TrendDirection; confidence: number; rationale: string } {
    if (structure === 'INSUFFICIENT_DATA') {
      return {
        trend: 'INSUFFICIENT_DATA',
        confidence: 0,
        rationale: 'Insufficient price history to establish technical trend.',
      };
    }

    if (
      structure === 'BULLISH_STRUCTURE' &&
      priceVs200Dma === 'ABOVE' &&
      priceVs50Dma === 'ABOVE' &&
      slopePercent > 1.0
    ) {
      return {
        trend: 'STRONG_UPTREND',
        confidence: 90,
        rationale: 'Bullish market structure (HH/HL) confirmed by Price trading above rising 50DMA and 200DMA.',
      };
    }

    if (structure === 'BULLISH_STRUCTURE' || (priceVs200Dma === 'ABOVE' && slopePercent > 0.3)) {
      return {
        trend: 'UPTREND',
        confidence: 75,
        rationale: 'Price maintaining positive trajectory above major baseline moving averages.',
      };
    }

    if (
      structure === 'BEARISH_STRUCTURE' &&
      priceVs200Dma === 'BELOW' &&
      priceVs50Dma === 'BELOW' &&
      slopePercent < -1.0
    ) {
      return {
        trend: 'STRONG_DOWNTREND',
        confidence: 90,
        rationale: 'Bearish market structure (LH/LL) with Price trading below falling 50DMA and 200DMA.',
      };
    }

    if (structure === 'BEARISH_STRUCTURE' || (priceVs200Dma === 'BELOW' && slopePercent < -0.3)) {
      return {
        trend: 'DOWNTREND',
        confidence: 75,
        rationale: 'Price establishing lower structural levels below 200-day moving average.',
      };
    }

    return {
      trend: 'SIDEWAYS',
      confidence: 65,
      rationale: 'Price oscillating within horizontal consolidation bands without clear directional impulse.',
    };
  }

  /**
   * Deterministically evaluates Market Cycle Phase without claiming institutional intent.
   */
  public static classifyMarketCycle(
    trend: TrendDirection,
    structure: MarketStructureDirection,
    rsiZone: string,
    upDownVolRatio: number | null,
    _atrPercent: number | null
  ): { phase: MarketCyclePhase; rationale: string; supportingSignals: string[] } {
    const signals: string[] = [];

    if (trend === 'STRONG_UPTREND' || (trend === 'UPTREND' && structure === 'BULLISH_STRUCTURE')) {
      signals.push('Confirmed upward trend trajectory with higher highs and higher lows.');
      if (upDownVolRatio && upDownVolRatio > 1.2) {
        signals.push(`Up-volume dominance (${upDownVolRatio.toFixed(2)}x) supporting advance.`);
      }
      return {
        phase: 'MARKUP',
        rationale: 'Sustained price expansion phase supported by trend and structural progression.',
        supportingSignals: signals,
      };
    }

    if (trend === 'STRONG_DOWNTREND' || (trend === 'DOWNTREND' && structure === 'BEARISH_STRUCTURE')) {
      signals.push('Confirmed downward trend trajectory with lower highs and lower lows.');
      if (upDownVolRatio && upDownVolRatio < 0.8) {
        signals.push(`Down-volume pressure (${upDownVolRatio.toFixed(2)}x) during declines.`);
      }
      return {
        phase: 'MARKDOWN',
        rationale: 'Sustained downward liquidation phase below major structural supports.',
        supportingSignals: signals,
      };
    }

    if (trend === 'SIDEWAYS') {
      if (rsiZone === 'OVERSOLD_ZONE' || (upDownVolRatio && upDownVolRatio > 1.1)) {
        signals.push('Base formation with positive up/down volume absorption.');
        return {
          phase: 'ACCUMULATION',
          rationale: 'Base building and price consolidation following prior decline.',
          supportingSignals: signals,
        };
      }

      if (rsiZone === 'OVERBOUGHT_ZONE' || (upDownVolRatio && upDownVolRatio < 0.9)) {
        signals.push('High-range consolidation with weakening buying impulse.');
        return {
          phase: 'DISTRIBUTION',
          rationale: 'Topping range with elevated supply absorption.',
          supportingSignals: signals,
        };
      }
    }

    return {
      phase: 'RANGE_TRANSITION',
      rationale: 'Price in structural transition or non-trending consolidation band.',
      supportingSignals: ['Mixed trend indicators and structural consolidation.'],
    };
  }

  /**
   * Deterministically computes Technical Risk level (Setup Fragility).
   */
  public static classifyTechnicalRisk(
    breakdownsCount: number,
    below200Dma: boolean,
    bearishStructure: boolean,
    failedBreakoutsCount: number,
    bearishDivergence: boolean,
    atrElevated: boolean,
    underperformingBenchmark: boolean
  ): { level: TechnicalRiskLevel; riskScore: number; definition: string; riskFactors: string[]; invalidatingConditions: string[] } {
    let score = 0;
    const factors: string[] = [];
    const invalidating: string[] = [];

    if (breakdownsCount > 0) {
      score += TECHNICAL_RISK_POLICY.supportBreakdownPoints;
      factors.push(`Recent breakdown below major technical support level (${breakdownsCount} event).`);
      invalidating.push('Reclaiming broken support level on strong volume would negate breakdown.');
    }

    if (below200Dma) {
      score += TECHNICAL_RISK_POLICY.longTermMaFailurePoints;
      factors.push('Price trading below 200-day moving average (long-term structural baseline).');
      invalidating.push('Decisive daily close back above 200DMA.');
    }

    if (bearishStructure) {
      score += TECHNICAL_RISK_POLICY.bearishStructurePoints;
      factors.push('Market structure is currently bearish (sequence of Lower Highs and Lower Lows).');
      invalidating.push('Formation of a Higher High breaking intermediate resistance.');
    }

    if (failedBreakoutsCount > 0) {
      score += TECHNICAL_RISK_POLICY.failedBreakoutPoints;
      factors.push('Recent failed bullish breakout / bull trap observed.');
    }

    if (bearishDivergence) {
      score += TECHNICAL_RISK_POLICY.bearishDivergencePoints;
      factors.push('Negative oscillator divergence against price.');
    }

    if (atrElevated) {
      score += TECHNICAL_RISK_POLICY.elevatedVolatilityPoints;
      factors.push('Elevated volatility regime (ATR > 3.0%).');
    }

    if (underperformingBenchmark) {
      score += TECHNICAL_RISK_POLICY.relativeUnderperformancePoints;
      factors.push('Relative underperformance against NIFTY 50 benchmark.');
    }

    let level: TechnicalRiskLevel = 'LOW';
    if (score >= 60) {
      level = 'EXTREME';
    } else if (score >= 40) {
      level = 'HIGH';
    } else if (score >= 20) {
      level = 'MODERATE';
    }

    return {
      level,
      riskScore: Math.min(100, score),
      definition: 'Fragility / risk characteristics of the technical setup.',
      riskFactors: factors.length > 0 ? factors : ['No major structural fragility flags observed.'],
      invalidatingConditions: invalidating.length > 0 ? invalidating : ['Breakdown below 200DMA or key swing low.'],
    };
  }
}
