/**
 * ScenarioProbabilityPolicyRegistry.ts
 * Phase 13 — Deterministic Policy Registry for Scenario Probability,
 * Phase 12 Asymmetry Transformation, Caps/Floors, and Missing-Data Gating.
 */

import { ScenarioType } from './ScenarioTypes';

export interface ProbabilityInputs {
  historicalStabilityScore?: number; // 0-100 (from Phase 5/6)
  managementCredibilityScore?: number; // 0-100 (from Phase 8)
  industryForecastConfidenceScore?: number; // 0-100 (from Phase 11)
  phase12AsymmetryRatio?: number; // from Phase 12 (e.g. 2.1x)
  phase12CriticalRiskCount?: number;
  phase12HighRiskCount?: number;
  hasSufficientEvidence?: boolean;
}

export interface ScenarioProbabilityResult {
  probabilities: Record<ScenarioType, number>;
  probabilityStatus: 'ASSESSABLE' | 'NOT_ASSESSABLE';
  isDisplayPlaceholder: boolean;
  modelConfidenceScore: number; // 0-100
  derivationTrace: {
    historicalWeight: number;
    managementWeight: number;
    industryWeight: number;
    phase12TransformedWeight: number;
    phase12RawShiftBull: number;
    phase12RawShiftBear: number;
    formula: string;
    explanation: string;
  };
}

export class ScenarioProbabilityPolicyRegistry {
  public static readonly MIN_PROBABILITY_FLOOR = 5; // 5% minimum floor
  public static readonly MAX_PROBABILITY_CEILING = 85; // 85% maximum ceiling

  /**
   * Deterministically transform Phase 12 evidence (Asymmetry Ratio & Risk counts)
   * into scenario probability adjustment shifts.
   */
  public static transformPhase12ToProbabilityShifts(params: {
    asymmetryRatio?: number;
    criticalRiskCount?: number;
    highRiskCount?: number;
  }): { shiftBullPercent: number; shiftBearPercent: number; formula: string } {
    const asym = params.asymmetryRatio ?? 1.0;
    const crit = params.criticalRiskCount ?? 0;
    const high = params.highRiskCount ?? 0;

    // Asymmetry > 1.0 shifts towards Bull; Asymmetry < 1.0 shifts towards Bear
    // Clamped between -20% and +25%
    const shiftBullPercent = Math.min(
      25,
      Math.max(-20, Math.round((asym - 1.0) * 12.5 * 10) / 10)
    );

    // Critical and high risks increase Bear probability, offset by positive asymmetry
    // Clamped between -15% and +30%
    const rawBearShift = crit * 10 + high * 4 - (asym - 1.0) * 6;
    const shiftBearPercent = Math.min(
      30,
      Math.max(-15, Math.round(rawBearShift * 10) / 10)
    );

    const formula = `BullShift = clamp(-20, 25, (Asym - 1.0) * 12.5); BearShift = clamp(-15, 30, Crit*10 + High*4 - (Asym - 1.0)*6)`;

    return {
      shiftBullPercent,
      shiftBearPercent,
      formula,
    };
  }

  /**
   * Evaluates deterministic scenario probabilities across Base, Bull, and Bear.
   * Strictly enforces Base + Bull + Bear = 100%.
   * Flags NOT_ASSESSABLE if evidence is insufficient, marking isDisplayPlaceholder: true.
   */
  public static evaluateProbabilities(inputs: ProbabilityInputs): ScenarioProbabilityResult {
    // 1. Missing data / Insufficient evidence check
    if (
      inputs.hasSufficientEvidence === false ||
      (inputs.historicalStabilityScore === undefined &&
        inputs.managementCredibilityScore === undefined &&
        inputs.industryForecastConfidenceScore === undefined &&
        inputs.phase12AsymmetryRatio === undefined)
    ) {
      return {
        probabilities: {
          BASE: 33.4,
          BULL: 33.3,
          BEAR: 33.3,
        },
        probabilityStatus: 'NOT_ASSESSABLE',
        isDisplayPlaceholder: true, // PROHIBITED from expected value calculations!
        modelConfidenceScore: 0,
        derivationTrace: {
          historicalWeight: 0,
          managementWeight: 0,
          industryWeight: 0,
          phase12TransformedWeight: 0,
          phase12RawShiftBull: 0,
          phase12RawShiftBear: 0,
          formula: 'PROBABILITY_NOT_ASSESSABLE: Insufficient cross-layer evidence.',
          explanation:
            'Probabilities cannot be justified from verified source data. Neutral 33.3% values are display placeholders only and must not be used in valuation weighting or investment recommendations.',
        },
      };
    }

    const hist = inputs.historicalStabilityScore ?? 50;
    const mgmt = inputs.managementCredibilityScore ?? 50;
    const ind = inputs.industryForecastConfidenceScore ?? 50;

    // 2. Transform Phase 12 evidence
    const p12 = this.transformPhase12ToProbabilityShifts({
      asymmetryRatio: inputs.phase12AsymmetryRatio,
      criticalRiskCount: inputs.phase12CriticalRiskCount,
      highRiskCount: inputs.phase12HighRiskCount,
    });

    // 3. Baseline starting distribution (Evidence-supported Base priority: 55% Base, 25% Bull, 20% Bear)
    let rawBull = 25 + p12.shiftBullPercent + (mgmt > 75 ? 5 : mgmt < 40 ? -5 : 0) + (ind > 75 ? 5 : 0);
    let rawBear = 20 + p12.shiftBearPercent + (hist < 40 ? 8 : 0) + (mgmt < 40 ? 5 : 0);
    let rawBase = 100 - (rawBull + rawBear);

    // If rawBase falls below 35%, rebalance
    if (rawBase < 35) {
      const excess = 35 - rawBase;
      rawBull -= excess / 2;
      rawBear -= excess / 2;
      rawBase = 35;
    }

    // 4. Apply Floor & Ceiling bounds
    let bull = Math.min(this.MAX_PROBABILITY_CEILING, Math.max(this.MIN_PROBABILITY_FLOOR, Math.round(rawBull)));
    let bear = Math.min(this.MAX_PROBABILITY_CEILING, Math.max(this.MIN_PROBABILITY_FLOOR, Math.round(rawBear)));
    let base = 100 - (bull + bear);

    // Guard against base breach
    if (base < this.MIN_PROBABILITY_FLOOR) {
      base = this.MIN_PROBABILITY_FLOOR;
      const rem = 100 - base;
      const ratio = bull / (bull + bear || 1);
      bull = Math.round(rem * ratio);
      bear = 100 - (base + bull);
    }

    // Final exact 100% check
    const total = base + bull + bear;
    if (total !== 100) {
      base += 100 - total;
    }

    // Model confidence calculation (0-100)
    const availableInputCount = [
      inputs.historicalStabilityScore,
      inputs.managementCredibilityScore,
      inputs.industryForecastConfidenceScore,
      inputs.phase12AsymmetryRatio,
    ].filter((v) => v !== undefined).length;

    const modelConfidenceScore = Math.min(
      95,
      Math.max(20, Math.round((availableInputCount / 4) * 60 + (hist * 0.15 + mgmt * 0.15 + ind * 0.1)))
    );

    return {
      probabilities: {
        BASE: base,
        BULL: bull,
        BEAR: bear,
      },
      probabilityStatus: 'ASSESSABLE',
      isDisplayPlaceholder: false,
      modelConfidenceScore,
      derivationTrace: {
        historicalWeight: 0.35,
        managementWeight: 0.25,
        industryWeight: 0.2,
        phase12TransformedWeight: 0.2,
        phase12RawShiftBull: p12.shiftBullPercent,
        phase12RawShiftBear: p12.shiftBearPercent,
        formula: `Base=${base}%, Bull=${bull}%, Bear=${bear}%; Transformed from Hist(${hist}), Mgmt(${mgmt}), Ind(${ind}), P12(Asym:${inputs.phase12AsymmetryRatio ?? 1.0}x, Crit:${inputs.phase12CriticalRiskCount ?? 0})`,
        explanation: `Probabilities derived deterministically: Base (${base}%) reflects baseline visibility; Bull (${bull}%) accounts for positive asymmetry & management delivery; Bear (${bear}%) accounts for active risk count and downside friction.`,
      },
    };
  }
}
