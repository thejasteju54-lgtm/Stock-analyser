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
  MitigationAssessment,
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
   * Deterministic Catalyst Likelihood Evaluation (Exact 1–5 scale).
   * 5 (CONFIRMED): Signed contract / audited commissioning / confirmed board resolution with exact date.
   * 4 (HIGH): Formal management guidance with proven delivery track record >= 80% or active regulatory clearance.
   * 3 (MEDIUM): Ongoing capacity expansion or guidance with moderate track record (60–79%) or structural industry trend.
   * 2 (LOW): Early-stage aspirational announcement, uncorroborated report, or credibility < 60%.
   * 1 (CONDITIONAL): Missing data, unverified claim without citations, or conditional upon unknown external approval.
   */
  public static evaluateCatalystLikelihood(params: {
    verificationStatus?: CatalystVerificationStatus;
    hasExecutedContract?: boolean;
    hasStatutoryApproval?: boolean;
    managementCredibilityScore?: number;
    hasSpecificMilestoneDate?: boolean;
    isAspirationalOnly?: boolean;
    confidence?: number;
  }): { likelihood: CatalystLikelihood; score: number; isAssessable: boolean } {
    if (
      params.verificationStatus === 'NOT_ASSESSABLE' ||
      (params.confidence !== undefined && params.confidence <= 0)
    ) {
      return { likelihood: 'CONDITIONAL', score: 1, isAssessable: false };
    }

    if (
      (params.hasExecutedContract && params.hasSpecificMilestoneDate) ||
      params.hasStatutoryApproval
    ) {
      return { likelihood: 'HIGH', score: 5, isAssessable: true };
    }

    if (
      (params.managementCredibilityScore !== undefined && params.managementCredibilityScore >= 80) ||
      params.hasExecutedContract
    ) {
      return { likelihood: 'HIGH', score: 4, isAssessable: true };
    }

    if (
      (params.managementCredibilityScore !== undefined && params.managementCredibilityScore >= 60) ||
      params.verificationStatus === 'VERIFIED_EVIDENCE'
    ) {
      return { likelihood: 'MEDIUM', score: 3, isAssessable: true };
    }

    if (
      params.isAspirationalOnly ||
      (params.managementCredibilityScore !== undefined && params.managementCredibilityScore < 60) ||
      params.verificationStatus === 'MANAGEMENT_CLAIM'
    ) {
      return { likelihood: 'LOW', score: 2, isAssessable: true };
    }

    // Default missing / unverified data behavior
    return { likelihood: 'CONDITIONAL', score: 1, isAssessable: false };
  }

  /**
   * Deterministic Risk Probability Score (Exact 1–5 scale).
   * 5: ALMOST_CERTAIN (Active regulatory order / litigation judgement, historical frequency >= 80%, or trigger proximity <= 0% [already breached/imminent]).
   * 4: HIGH (Historical frequency >= 50%, consecutive negative quarters >= 2, or trigger proximity <= 5%).
   * 3: MODERATE (Historical frequency >= 25%, consecutive negative quarters === 1, or trigger proximity <= 15%).
   * 2: LOW (Trigger proximity <= 30%, or external news corroborated).
   * 1: REMOTE (Default when no active adverse indicators exist or data is unverified/missing).
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

    // Missing-data / baseline behavior: Never manufacture risk without evidence
    return { probability: 'REMOTE', score: 1 };
  }

  /**
   * Deterministic Risk Impact Score (Exact 1–5 scale).
   * 5: CATASTROPHIC (Threatens business continuity / solvency, PAT impact >= 50%, or exposure >= 50% Net Worth).
   * 4: SEVERE (Credit rating downgrade, PAT impact >= 20%, exposure >= 20% Net Worth, or margin compression >= 300 bps).
   * 3: MODERATE (PAT impact >= 10%, exposure >= 10% Net Worth, or margin compression >= 100 bps).
   * 2: MINOR (PAT impact >= 3%, exposure >= 3% Net Worth, or margin compression >= 30 bps).
   * 1: NEGLIGIBLE (PAT impact < 3%, margin compression < 30 bps, or unquantified/missing financial exposure).
   */
  public static evaluateRiskImpact(params: {
    potentialPatImpactPercent?: number;
    exposureAsPercentOfNetWorth?: number;
    threatensBusinessContinuity?: boolean;
    potentialCreditDowngrade?: boolean;
    potentialMarginCompressionBps?: number;
  }): { impact: RiskImpact; score: number } {
    const netWorthExp = params.exposureAsPercentOfNetWorth;
    const patExp = params.potentialPatImpactPercent;

    if (
      params.threatensBusinessContinuity ||
      (patExp !== undefined && patExp >= 50) ||
      (netWorthExp !== undefined && netWorthExp >= 50)
    ) {
      return { impact: 'CATASTROPHIC', score: 5 };
    }

    if (
      params.potentialCreditDowngrade ||
      (patExp !== undefined && patExp >= 20) ||
      (netWorthExp !== undefined && netWorthExp >= 20) ||
      (params.potentialMarginCompressionBps !== undefined && params.potentialMarginCompressionBps >= 300)
    ) {
      return { impact: 'SEVERE', score: 4 };
    }

    if (
      (patExp !== undefined && patExp >= 10) ||
      (netWorthExp !== undefined && netWorthExp >= 10) ||
      (params.potentialMarginCompressionBps !== undefined && params.potentialMarginCompressionBps >= 100)
    ) {
      return { impact: 'MODERATE', score: 3 };
    }

    if (
      (patExp !== undefined && patExp >= 3) ||
      (netWorthExp !== undefined && netWorthExp >= 3) ||
      (params.potentialMarginCompressionBps !== undefined && params.potentialMarginCompressionBps >= 30)
    ) {
      return { impact: 'MINOR', score: 2 };
    }

    // Missing-data / baseline behavior: Never manufacture financial losses without evidence
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
   * Evaluates Stacked Mitigations with anti-double-counting protection and evidence preservation.
   * Anti-double-counting rules:
   * 1. Mitigations sharing the same description/evidence or underlying protection mechanism are deduplicated (taking max strength).
   * 2. Multiple distinct independent mitigations stack via compounding multiplicative factors:
   *    (1 - combinedFactor) = (1 - factor_1) * (1 - factor_2) * ...
   * 3. Combined mitigation factor is capped at 0.70 (70% max risk reduction), preventing risk from being zeroed out.
   */
  public static evaluateStackedMitigations(
    probabilityScore: number,
    impactScore: number,
    mitigations: MitigationAssessment[]
  ): {
    rawRiskScore: number;
    netRiskScore: number;
    severity: RiskSeverity;
    netExposure: NetRiskExposure;
    effectiveMitigationFactor: number;
    deduplicatedMitigations: MitigationAssessment[];
  } {
    const rawRiskScore = probabilityScore * impactScore; // 1-25

    if (!mitigations || mitigations.length === 0) {
      return {
        rawRiskScore,
        netRiskScore: rawRiskScore,
        severity: this.getSeverityFromNetScore(rawRiskScore),
        netExposure: 'UNMITIGATED',
        effectiveMitigationFactor: 0,
        deduplicatedMitigations: [],
      };
    }

    // 1. Deduplicate by unique protection key (description or primary evidence ref) to prevent double counting
    const protectionMap = new Map<string, MitigationAssessment>();
    for (const mit of mitigations) {
      const key = (mit.description.trim().toLowerCase().slice(0, 40) + '_' + (mit.evidenceReferences[0] || '')).toLowerCase();
      const existing = protectionMap.get(key);
      if (!existing || mit.mitigationStrength > existing.mitigationStrength) {
        protectionMap.set(key, mit);
      }
    }

    const deduplicatedMitigations = Array.from(protectionMap.values());

    // 2. Multiplicative stacking across distinct protections with diminishing returns
    let unmitigatedMultiplier = 1.0;
    for (const mit of deduplicatedMitigations) {
      let singleFactor = 0.0;
      if (mit.status === 'MITIGATION_VERIFIED') {
        singleFactor = Math.max(0.1, Math.min(0.5, mit.mitigationStrength));
      } else if (mit.status === 'MITIGATION_PARTIAL') {
        singleFactor = Math.max(0.05, Math.min(0.25, mit.mitigationStrength * 0.5));
      }
      unmitigatedMultiplier *= (1.0 - singleFactor);
    }

    // 3. Cap combined reduction at 70% max
    const effectiveMitigationFactor = Math.min(0.70, Number((1.0 - unmitigatedMultiplier).toFixed(4)));

    const netRiskScore = Math.max(1, Math.min(25, Math.round(rawRiskScore * (1.0 - effectiveMitigationFactor))));
    const severity = this.getSeverityFromNetScore(netRiskScore);

    let netExposure: NetRiskExposure = 'UNMITIGATED';
    if (effectiveMitigationFactor >= 0.40) {
      netExposure = 'SUBSTANTIALLY_MITIGATED';
    } else if (effectiveMitigationFactor > 0) {
      netExposure = 'PARTIALLY_MITIGATED';
    }

    return {
      rawRiskScore,
      netRiskScore,
      severity,
      netExposure,
      effectiveMitigationFactor,
      deduplicatedMitigations,
    };
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
    const singleMit: MitigationAssessment = {
      mitigationId: 'mit_single',
      description: 'Single mitigation entry',
      status: mitigationStatus,
      mitigationStrength,
      evidenceReferences: [],
      confidence: 80,
    };
    const res = this.evaluateStackedMitigations(probabilityScore, impactScore, [singleMit]);
    return {
      rawRiskScore: res.rawRiskScore,
      netRiskScore: res.netRiskScore,
      severity: res.severity,
      netExposure: res.netExposure,
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
