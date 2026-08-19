/**
 * CatalystRiskPolicyRegistry.ts
 * Phase 12 — Deterministic Policy Registry for Catalyst Scoring, Risk Probability,
 * Risk Impact, 5x5 Matrix Geometry, Thesis Breaker Threshold Operators, and Asymmetry.
 */

import {
  CatalystImpactMagnitude,
  CatalystLikelihood,
  CatalystVerificationStatus,
  CatalystHorizon,
  RiskProbability,
  RiskImpact,
  RiskSeverity,
  RiskVelocity,
  NetRiskExposure,
  MitigationStatus,
  BreakerOperator,
  BreakerStatus,
  DataFreshnessStatus,
  AggregateRiskRating,
  AsymmetryAssessment,
  RiskItem,
  CatalystItem,
} from './CatalystRiskTypes';

export class CatalystRiskPolicyRegistry {
  /**
   * Deterministic Catalyst Priority Score (1–10).
   * Formula: round(0.30*M + 0.25*L + 0.20*E + 0.10*T + 0.10*C + 0.05*H)
   */
  public static calculateCatalystScore(params: {
    impactMagnitude: CatalystImpactMagnitude;
    likelihood: CatalystLikelihood;
    verificationStatus: CatalystVerificationStatus;
    horizon: CatalystHorizon;
    isPrimaryFinancialChannel: boolean;
    precedentFrequency?: number;
    confidence: number;
  }): { score: number; isAssessable: boolean } {
    if (
      params.verificationStatus === 'NOT_ASSESSABLE' ||
      params.confidence <= 0
    ) {
      return { score: 0, isAssessable: false };
    }

    // M: Impact Magnitude (1-10)
    let m = 2.5;
    if (params.impactMagnitude === 'MATERIAL') m = 10.0;
    else if (params.impactMagnitude === 'HIGH') m = 7.5;
    else if (params.impactMagnitude === 'MEDIUM') m = 5.0;

    // L: Likelihood (1-10)
    let l = 3.0;
    if (params.likelihood === 'HIGH') l = 10.0;
    else if (params.likelihood === 'MEDIUM') l = 6.5;
    else if (params.likelihood === 'CONDITIONAL') l = 5.0;

    // E: Evidence Strength (1-10)
    let e = 3.0;
    if (params.verificationStatus === 'VERIFIED_EVIDENCE') e = 10.0;
    else if (params.verificationStatus === 'MANAGEMENT_CLAIM') e = 6.0;

    // T: Time Horizon relevance (1-10)
    let t = 6.0;
    if (params.horizon === 'IMMEDIATE_0_3M') t = 10.0;
    else if (params.horizon === 'SHORT_TERM_3_6M') t = 8.5;
    else if (params.horizon === 'MEDIUM_TERM_6_12M') t = 7.0;
    else if (params.horizon === 'STRUCTURAL') t = 8.0;

    // C: Financial Channel (1-10)
    const c = params.isPrimaryFinancialChannel ? 10.0 : 5.0;

    // H: Historical Precedent (1-10)
    const freq = params.precedentFrequency !== undefined ? Math.max(0, Math.min(1, params.precedentFrequency)) : 0.5;
    const h = freq * 10.0;

    const raw = 0.30 * m + 0.25 * l + 0.20 * e + 0.10 * t + 0.10 * c + 0.05 * h;
    const score = Math.max(1, Math.min(10, Math.round(raw)));

    return { score, isAssessable: true };
  }

  /**
   * Deterministic Risk Probability Score (1–5).
   */
  public static evaluateRiskProbability(params: {
    historicalFrequency?: number; // 0.0 - 1.0
    consecutiveNegativeQuarters?: number;
    triggerProximityPercent?: number; // Distance to breach
    hasActiveRegulatoryOrder?: boolean;
    isExternalCorroborated?: boolean;
  }): { probability: RiskProbability; score: number } {
    if (
      params.hasActiveRegulatoryOrder ||
      (params.historicalFrequency !== undefined && params.historicalFrequency >= 0.80) ||
      (params.triggerProximityPercent !== undefined && params.triggerProximityPercent <= 0)
    ) {
      return { probability: 'ALMOST_CERTAIN', score: 5 };
    }

    if (
      (params.historicalFrequency !== undefined && params.historicalFrequency >= 0.50) ||
      (params.consecutiveNegativeQuarters !== undefined && params.consecutiveNegativeQuarters >= 2) ||
      (params.triggerProximityPercent !== undefined && params.triggerProximityPercent <= 5)
    ) {
      return { probability: 'HIGH', score: 4 };
    }

    if (
      (params.historicalFrequency !== undefined && params.historicalFrequency >= 0.25) ||
      (params.consecutiveNegativeQuarters !== undefined && params.consecutiveNegativeQuarters === 1) ||
      (params.triggerProximityPercent !== undefined && params.triggerProximityPercent <= 15)
    ) {
      return { probability: 'MODERATE', score: 3 };
    }

    if (
      (params.triggerProximityPercent !== undefined && params.triggerProximityPercent <= 30) ||
      params.isExternalCorroborated
    ) {
      return { probability: 'LOW', score: 2 };
    }

    return { probability: 'REMOTE', score: 1 };
  }

  /**
   * Deterministic Risk Impact Score (1–5).
   */
  public static evaluateRiskImpact(params: {
    potentialPatImpactPercent?: number;
    threatensBusinessContinuity?: boolean;
    potentialCreditDowngrade?: boolean;
    potentialMarginCompressionBps?: number;
  }): { impact: RiskImpact; score: number } {
    if (
      params.threatensBusinessContinuity ||
      (params.potentialPatImpactPercent !== undefined && params.potentialPatImpactPercent >= 50)
    ) {
      return { impact: 'CATASTROPHIC', score: 5 };
    }

    if (
      params.potentialCreditDowngrade ||
      (params.potentialPatImpactPercent !== undefined && params.potentialPatImpactPercent >= 20) ||
      (params.potentialMarginCompressionBps !== undefined && params.potentialMarginCompressionBps >= 300)
    ) {
      return { impact: 'SEVERE', score: 4 };
    }

    if (
      (params.potentialPatImpactPercent !== undefined && params.potentialPatImpactPercent >= 10) ||
      (params.potentialMarginCompressionBps !== undefined && params.potentialMarginCompressionBps >= 100)
    ) {
      return { impact: 'MODERATE', score: 3 };
    }

    if (
      (params.potentialPatImpactPercent !== undefined && params.potentialPatImpactPercent >= 3) ||
      (params.potentialMarginCompressionBps !== undefined && params.potentialMarginCompressionBps >= 30)
    ) {
      return { impact: 'MINOR', score: 2 };
    }

    return { impact: 'NEGLIGIBLE', score: 1 };
  }

  /**
   * Evaluates Risk Severity from Net Score (1–25).
   */
  public static getSeverityFromNetScore(netScore: number): RiskSeverity {
    if (netScore >= 20) return 'CRITICAL';
    if (netScore >= 12) return 'HIGH';
    if (netScore >= 6) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Evaluates Net Exposure & Net Risk Score considering verified mitigations.
   */
  public static evaluateNetRiskScore(
    probabilityScore: number,
    impactScore: number,
    mitigationStatus: MitigationStatus,
    mitigationStrength: number
  ): {
    rawRiskScore: number;
    netRiskScore: number;
    severity: RiskSeverity;
    netExposure: NetRiskExposure;
  } {
    const rawRiskScore = probabilityScore * impactScore; // 1-25

    let effectiveMitigationFactor = 0.0;
    if (mitigationStatus === 'MITIGATION_VERIFIED') {
      effectiveMitigationFactor = Math.max(0.1, Math.min(0.7, mitigationStrength));
    } else if (mitigationStatus === 'MITIGATION_PARTIAL') {
      effectiveMitigationFactor = Math.max(0.05, Math.min(0.3, mitigationStrength * 0.5));
    }

    const netRiskScore = Math.max(1, Math.min(25, Math.round(rawRiskScore * (1.0 - effectiveMitigationFactor))));
    const severity = this.getSeverityFromNetScore(netRiskScore);

    let netExposure: NetRiskExposure = 'UNMITIGATED';
    if (effectiveMitigationFactor >= 0.4) {
      netExposure = 'SUBSTANTIALLY_MITIGATED';
    } else if (effectiveMitigationFactor > 0) {
      netExposure = 'PARTIALLY_MITIGATED';
    }

    return {
      rawRiskScore,
      netRiskScore,
      severity,
      netExposure,
    };
  }

  /**
   * Deterministic Risk Velocity Classification.
   */
  public static evaluateRiskVelocity(daysToMaterialize?: number, isTriggerDependent?: boolean): RiskVelocity {
    if (isTriggerDependent) return 'TRIGGER_DEPENDENT';
    if (daysToMaterialize !== undefined) {
      if (daysToMaterialize <= 30) return 'IMMEDIATE_SHOCK';
      if (daysToMaterialize <= 90) return 'RAPID_DEVELOPMENT';
      return 'SLOW_EROSION';
    }
    return 'RAPID_DEVELOPMENT';
  }

  /**
   * Deterministic Thesis Breaker Condition Evaluation.
   */
  public static evaluateThesisBreaker(params: {
    operator: BreakerOperator;
    thresholdValue: number | string | boolean;
    currentValue: number | string | boolean | null;
    bufferMarginPercent: number; // e.g. 10%
    freshnessStatus: DataFreshnessStatus;
  }): BreakerStatus {
    if (
      params.currentValue === null ||
      params.currentValue === undefined ||
      params.freshnessStatus === 'EXPIRED' ||
      params.freshnessStatus === 'UNKNOWN'
    ) {
      return 'NOT_ASSESSABLE';
    }

    // Boolean checks
    if (typeof params.thresholdValue === 'boolean' || typeof params.currentValue === 'boolean') {
      const boolCur = Boolean(params.currentValue);
      const boolThresh = Boolean(params.thresholdValue);
      if (params.operator === 'EQUALS') {
        return boolCur === boolThresh ? 'BREACHED' : 'SAFE';
      }
      return boolCur !== boolThresh ? 'BREACHED' : 'SAFE';
    }

    // Numerical checks
    const cur = Number(params.currentValue);
    const thresh = Number(params.thresholdValue);

    if (isNaN(cur) || isNaN(thresh)) {
      return 'NOT_ASSESSABLE';
    }

    const buffer = Math.abs(thresh) * (params.bufferMarginPercent / 100.0);

    switch (params.operator) {
      case 'LESS_THAN':
      case 'LESS_THAN_OR_EQUAL': {
        if (cur <= thresh) return 'BREACHED';
        if (cur <= thresh + buffer) return 'APPROACHING_TRIGGER';
        return 'SAFE';
      }

      case 'GREATER_THAN':
      case 'GREATER_THAN_OR_EQUAL': {
        if (cur >= thresh) return 'BREACHED';
        if (cur >= thresh - buffer) return 'APPROACHING_TRIGGER';
        return 'SAFE';
      }

      case 'EQUALS': {
        if (cur === thresh) return 'BREACHED';
        if (Math.abs(cur - thresh) <= buffer) return 'APPROACHING_TRIGGER';
        return 'SAFE';
      }

      case 'CHANGE_BY':
      case 'PERCENT_CHANGE_BY': {
        if (Math.abs(cur) >= Math.abs(thresh)) return 'BREACHED';
        if (Math.abs(cur) >= Math.abs(thresh) - buffer) return 'APPROACHING_TRIGGER';
        return 'SAFE';
      }

      default:
        return 'NOT_ASSESSABLE';
    }
  }

  /**
   * Evaluates Aggregate Risk Rating and deduplicates cross-layer correlated risks.
   */
  public static calculateAggregateRiskRating(risks: RiskItem[]): {
    rating: AggregateRiskRating;
    deduplicatedRiskCount: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
  } {
    if (risks.length === 0) {
      return {
        rating: 'LOW',
        deduplicatedRiskCount: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
      };
    }

    // Deduplicate by underlyingRiskId
    const uniqueMap = new Map<string, RiskItem>();
    for (const r of risks) {
      const key = r.lineage.underlyingRiskId || r.riskId;
      const existing = uniqueMap.get(key);
      if (!existing || r.netRiskScore > existing.netRiskScore) {
        uniqueMap.set(key, r);
      }
    }

    const dedupRisks = Array.from(uniqueMap.values());
    const criticalCount = dedupRisks.filter((r) => r.severity === 'CRITICAL').length;
    const highCount = dedupRisks.filter((r) => r.severity === 'HIGH').length;
    const mediumCount = dedupRisks.filter((r) => r.severity === 'MEDIUM').length;
    const lowCount = dedupRisks.filter((r) => r.severity === 'LOW').length;

    let rating: AggregateRiskRating = 'MODERATE';
    if (criticalCount >= 2 || (criticalCount === 1 && highCount >= 3)) {
      rating = 'EXTREME';
    } else if (criticalCount === 1 || highCount >= 3) {
      rating = 'HIGH';
    } else if (highCount >= 1 || mediumCount >= 3) {
      rating = 'ELEVATED';
    } else if (mediumCount >= 1 || lowCount >= 2) {
      rating = 'MODERATE';
    } else {
      rating = 'LOW';
    }

    return {
      rating,
      deduplicatedRiskCount: dedupRisks.length,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
    };
  }

  /**
   * Deterministic Catalyst-Risk Asymmetry Evaluator.
   */
  public static calculateCatalystRiskAsymmetry(
    catalysts: CatalystItem[],
    risks: RiskItem[]
  ): {
    asymmetry: AsymmetryAssessment;
    upsideScore: number;
    downsideScore: number;
    ratio: number;
  } {
    if (catalysts.length === 0 && risks.length === 0) {
      return {
        asymmetry: 'NOT_ASSESSABLE',
        upsideScore: 0,
        downsideScore: 0,
        ratio: 1.0,
      };
    }

    // Upside potential from catalysts (0-100)
    let upsideTotal = 0;
    for (const c of catalysts) {
      if (c.verificationStatus !== 'NOT_ASSESSABLE') {
        const likelihoodFactor = c.likelihood === 'HIGH' ? 1.0 : c.likelihood === 'MEDIUM' ? 0.7 : 0.4;
        const confFactor = Math.max(0.3, c.confidence / 100.0);
        upsideTotal += c.impactScore * 10 * likelihoodFactor * confFactor;
      }
    }
    const upsideScore = Math.min(100, Math.round(catalysts.length > 0 ? upsideTotal / catalysts.length : 0));

    // Downside exposure from risks (0-100)
    let downsideTotal = 0;
    const criticalCount = risks.filter((r) => r.severity === 'CRITICAL').length;
    for (const r of risks) {
      const velFactor = r.velocity === 'IMMEDIATE_SHOCK' ? 1.2 : r.velocity === 'RAPID_DEVELOPMENT' ? 1.0 : 0.8;
      const confFactor = Math.max(0.3, r.confidence / 100.0);
      downsideTotal += (r.netRiskScore / 25.0) * 100 * velFactor * confFactor;
    }
    const downsideScore = Math.min(100, Math.round(risks.length > 0 ? downsideTotal / risks.length : 0));

    const denominator = Math.max(10, downsideScore);
    const ratio = Number((upsideScore / denominator).toFixed(2));

    let asymmetry: AsymmetryAssessment = 'BALANCED';
    if (criticalCount >= 2 || ratio < 0.5) {
      asymmetry = 'HIGHLY_ASYMMETRIC_DOWNSIDE';
    } else if (ratio < 0.8 || criticalCount === 1) {
      asymmetry = 'UNFAVORABLE';
    } else if (ratio >= 2.0 && criticalCount === 0) {
      asymmetry = 'HIGHLY_FAVORABLE';
    } else if (ratio >= 1.3 && criticalCount === 0) {
      asymmetry = 'FAVORABLE';
    } else {
      asymmetry = 'BALANCED';
    }

    return {
      asymmetry,
      upsideScore,
      downsideScore,
      ratio,
    };
  }
}
