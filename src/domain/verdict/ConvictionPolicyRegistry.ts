/**
 * ConvictionPolicyRegistry.ts
 * Phase 14 — Deterministic Conviction and Decision Soundness Scoring Policy.
 */

import { ConvictionRatingTier } from './VerdictTypes';

export interface ConvictionEvaluationInputs {
  evidenceQualityNormalized: number; // 0.0 to 1.0
  crossLayerAgreementNormalized: number; // 0.0 to 1.0
  valuationConfidenceNormalized: number; // 0.0 to 1.0
  scenarioConfidenceNormalized: number; // 0.0 to 1.0
  isPriceStale?: boolean; // > 48h
  isFinancialsStale?: boolean; // > 180d
  isNewsStale?: boolean; // > 30d
  areScenarioProbabilitiesPlaceholders?: boolean;
  forensicStatus?: 'NO_MATERIAL_CONCERN' | 'WATCH' | 'MATERIAL_CONCERN' | 'SEVERE_CONCERN' | 'CRITICAL_OVERRIDE' | 'NOT_ASSESSABLE';
  unresolvedConflictCount?: number;
  isThesisBreakerApproaching?: boolean;
  isOverridingAvoid?: boolean;
}

export interface ConvictionResult {
  convictionScore: number; // 0.0 to 10.0 (Clamped)
  convictionBand: ConvictionRatingTier;
  decisionConfidenceScore: number; // 0.0 to 10.0 (Decision Soundness)
  baseScore: number; // 0.0 to 1.0
  rawConviction: number; // 0.0 to 10.0
  totalPenalties: number;
  penaltyBreakdown: Array<{ description: string; deduction: number }>;
}

export class ConvictionPolicyRegistry {
  /**
   * Evaluates deterministic conviction and decision confidence on a 0.0 to 10.0 scale.
   */
  public static evaluateConviction(inputs: ConvictionEvaluationInputs): ConvictionResult {
    // 1. If an overriding AVOID has been triggered by confirmed fraud/thesis invalidation,
    // Decision Confidence is 10.0 / 10.0 (maximum certainty to avoid).
    if (inputs.isOverridingAvoid || inputs.forensicStatus === 'CRITICAL_OVERRIDE') {
      return {
        convictionScore: 10.0,
        convictionBand: 'VERY_HIGH',
        decisionConfidenceScore: 10.0,
        baseScore: 1.0,
        rawConviction: 10.0,
        totalPenalties: 0.0,
        penaltyBreakdown: [
          { description: 'Critical Override Certainty (Decision Soundness = 10.0)', deduction: 0 },
        ],
      };
    }

    // 2. Normalize and Clamp Inputs to 0.0 - 1.0
    const evQuality = Math.max(0.0, Math.min(1.0, inputs.evidenceQualityNormalized || 0.5));
    const agreement = Math.max(0.0, Math.min(1.0, inputs.crossLayerAgreementNormalized || 0.5));
    const valConf = Math.max(0.0, Math.min(1.0, inputs.valuationConfidenceNormalized || 0.5));
    const scenConf = Math.max(0.0, Math.min(1.0, inputs.scenarioConfidenceNormalized || 0.5));

    // 3. Compute Normalized Base Score (0.0 to 1.0)
    const baseScore = 0.35 * evQuality + 0.25 * agreement + 0.20 * valConf + 0.20 * scenConf;
    const rawConviction = Math.round(baseScore * 100) / 10; // 0.0 to 10.0

    // 4. Calculate Penalty Deductions (on 0.0 - 10.0 scale)
    const penalties: Array<{ description: string; deduction: number }> = [];

    if (inputs.isPriceStale) {
      penalties.push({ description: 'Market price is stale (> 48h)', deduction: 1.5 });
    }
    if (inputs.isFinancialsStale) {
      penalties.push({ description: 'Financial statements are stale (> 180d)', deduction: 1.0 });
    }
    if (inputs.isNewsStale) {
      penalties.push({ description: 'News & industry data are stale (> 30d)', deduction: 0.5 });
    }
    if (inputs.areScenarioProbabilitiesPlaceholders) {
      penalties.push({ description: 'Scenario probabilities are unweighted placeholders', deduction: 2.0 });
    }
    if (inputs.forensicStatus === 'WATCH') {
      penalties.push({ description: 'Forensic watch items flagged', deduction: 1.0 });
    } else if (inputs.forensicStatus === 'MATERIAL_CONCERN') {
      penalties.push({ description: 'Material forensic anomalies present', deduction: 2.5 });
    }
    const conflictCount = inputs.unresolvedConflictCount || 0;
    if (conflictCount > 0) {
      const conflictDeduction = Math.min(3.0, conflictCount * 1.0);
      penalties.push({
        description: `${conflictCount} unresolved cross-layer conflict(s)`,
        deduction: conflictDeduction,
      });
    }
    if (inputs.isThesisBreakerApproaching) {
      penalties.push({ description: 'Core thesis breaker approaching trigger threshold', deduction: 1.0 });
    }

    const totalPenalties = penalties.reduce((sum, p) => sum + p.deduction, 0);

    // 5. Final Score Clamped between 0.0 and 10.0
    const finalScore = Math.max(0.0, Math.min(10.0, Math.round((rawConviction - totalPenalties) * 10) / 10));

    // 6. Map to Conviction Band
    let convictionBand: ConvictionRatingTier = 'MODERATE';
    if (finalScore >= 9.0) {
      convictionBand = 'VERY_HIGH';
    } else if (finalScore >= 7.0) {
      convictionBand = 'HIGH';
    } else if (finalScore >= 5.0) {
      convictionBand = 'MODERATE';
    } else if (finalScore >= 3.0) {
      convictionBand = 'LOW';
    } else {
      convictionBand = 'VERY_LOW';
    }

    return {
      convictionScore: finalScore,
      convictionBand,
      decisionConfidenceScore: finalScore,
      baseScore: Math.round(baseScore * 1000) / 1000,
      rawConviction,
      totalPenalties: Math.round(totalPenalties * 10) / 10,
      penaltyBreakdown: penalties,
    };
  }
}
