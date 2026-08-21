/**
 * InvestmentDecisionPolicyRegistry.ts
 * Phase 14 — Deterministic Master Decision Matrix & Precedence Override Hierarchy.
 */

import {
  InvestmentVerdict,
  MarketPriceFreshnessStatus,
  ForensicDecisionState,
  ManagementDecisionState,
  MarginOfSafetyStatus,
  ThesisBreakerDecisionStatus,
  DecisionBlocker,
  DecisionConflict,
} from './VerdictTypes';

export interface DecisionEvaluationContext {
  currentPrice: number;
  priceFreshnessStatus: MarketPriceFreshnessStatus;
  businessQualityScore: number; // 0-100
  investmentAttractivenessScore: number; // 0-100
  forensicState: ForensicDecisionState;
  managementState: ManagementDecisionState;
  marginOfSafetyStatus: MarginOfSafetyStatus;
  actualMarginOfSafetyPercent: number | null;
  requiredMarginOfSafetyPercent: number;
  downsideProtectionStatus: 'STRONG' | 'MODERATE' | 'WEAK' | 'NONE' | 'NOT_ASSESSABLE';
  thesisBreakerState: ThesisBreakerDecisionStatus;
  decisionEvidenceConfidence: number; // 0-100
  balanceSheetStrength: 'FORTRESS' | 'ADEQUATE' | 'LEVERAGED' | 'DISTRESSED';
  activeBlockers: DecisionBlocker[];
  activeConflicts: DecisionConflict[];
}

export interface DecisionEvaluationResult {
  verdict: InvestmentVerdict;
  appliedRuleId: string;
  appliedOverrideTier?: string;
  oneLineVerdict: string;
  primaryRationale: string;
  isOverridingAvoid: boolean;
}

export class InvestmentDecisionPolicyRegistry {
  /**
   * Evaluates the complete Precedence Override Hierarchy and Machine-Readable Decision Matrix.
   */
  public static evaluateDecision(context: DecisionEvaluationContext): DecisionEvaluationResult {
    // =========================================================================
    // TIER 1: DATA INTEGRITY & PRICE AVAILABILITY OVERRIDE
    // =========================================================================
    if (
      context.currentPrice <= 0 ||
      context.priceFreshnessStatus === 'NOT_ASSESSABLE' ||
      context.priceFreshnessStatus === 'CRITICALLY_STALE' ||
      context.priceFreshnessStatus === 'CORPORATE_ACTION_UNADJUSTED'
    ) {
      const reason =
        context.priceFreshnessStatus === 'CRITICALLY_STALE'
          ? 'Market price is critically stale (> 5 days).'
          : context.priceFreshnessStatus === 'CORPORATE_ACTION_UNADJUSTED'
          ? 'Unadjusted corporate action detected.'
          : 'Market price is missing or unverified.';

      return {
        verdict: 'DECISION_NOT_ASSESSABLE',
        appliedRuleId: 'TIER_1_DATA_INTEGRITY',
        appliedOverrideTier: 'DATA_INTEGRITY_OVERRIDE',
        oneLineVerdict: 'Investment decision is unassessable due to missing or critically stale price data.',
        primaryRationale: reason,
        isOverridingAvoid: false,
      };
    }

    // =========================================================================
    // TIER 2: CRITICAL FORENSIC OVERRIDE
    // =========================================================================
    if (context.forensicState === 'CRITICAL_OVERRIDE') {
      return {
        verdict: 'AVOID',
        appliedRuleId: 'TIER_2_CRITICAL_FORENSIC',
        appliedOverrideTier: 'CRITICAL_FORENSIC_OVERRIDE',
        oneLineVerdict: 'Severe accounting integrity or forensic concern overrides fundamental valuation; avoid capital allocation.',
        primaryRationale: 'Critical forensic red flag identified (e.g. auditor resignation, fraud probe, or confirmed restatement).',
        isOverridingAvoid: true,
      };
    }

    // =========================================================================
    // TIER 3: THESIS INVALIDATION OVERRIDE
    // =========================================================================
    if (context.thesisBreakerState === 'THESIS_INVALIDATED') {
      return {
        verdict: 'AVOID',
        appliedRuleId: 'TIER_3_THESIS_INVALIDATED',
        appliedOverrideTier: 'THESIS_INVALIDATION_OVERRIDE',
        oneLineVerdict: 'Core investment thesis is structurally invalidated by persistent multi-period operational failure.',
        primaryRationale: 'One or more core thesis breakers have been permanently breached.',
        isOverridingAvoid: true,
      };
    }

    // =========================================================================
    // TIER 4: BALANCE SHEET DISTRESS OVERRIDE
    // =========================================================================
    if (context.balanceSheetStrength === 'DISTRESSED') {
      return {
        verdict: 'AVOID',
        appliedRuleId: 'TIER_4_BALANCE_SHEET_DISTRESS',
        appliedOverrideTier: 'BALANCE_SHEET_DISTRESS_OVERRIDE',
        oneLineVerdict: 'Severe balance-sheet solvency risk and capital distress preclude investment.',
        primaryRationale: 'Negative net worth or extreme leverage with insufficient interest coverage.',
        isOverridingAvoid: true,
      };
    }

    // =========================================================================
    // TIER 5: VALUATION EXTREME GATE
    // =========================================================================
    const actualMoS = context.actualMarginOfSafetyPercent;
    if (actualMoS !== null && actualMoS < -25.0) {
      if (context.businessQualityScore < 45.0) {
        return {
          verdict: 'AVOID',
          appliedRuleId: 'TIER_5_VALUATION_EXTREME_AVOID',
          appliedOverrideTier: 'VALUATION_GATE',
          oneLineVerdict: 'Sub-par business quality combined with severe valuation overextension leaves high capital loss risk.',
          primaryRationale: 'Market price is priced at a steep premium (> 40% over Base) despite weak fundamentals.',
          isOverridingAvoid: false,
        };
      }

      return {
        verdict: 'HOLD',
        appliedRuleId: 'TIER_5_VALUATION_EXTREME_HOLD',
        appliedOverrideTier: 'VALUATION_GATE',
        oneLineVerdict: 'High-quality business with durable cash generation, but current valuation leaves no margin of safety.',
        primaryRationale: 'Valuation is extended (> 25% premium above conservative intrinsic fair value).',
        isOverridingAvoid: false,
      };
    }

    // =========================================================================
    // TIER 6: BUY ELIGIBILITY GATE (All conditions must pass)
    // =========================================================================
    const unresolvedMaterialConflicts = context.activeConflicts.filter(
      (c) => c.resolutionStatus === 'UNRESOLVED' && c.isMaterial
    ).length;

    const isBuyEligible =
      context.businessQualityScore >= 60.0 &&
      (context.forensicState === 'NO_MATERIAL_CONCERN' || context.forensicState === 'WATCH') &&
      (context.managementState === 'EXCELLENT' || context.managementState === 'GOOD') &&
      context.marginOfSafetyStatus === 'ADEQUATE' &&
      (context.downsideProtectionStatus === 'STRONG' || context.downsideProtectionStatus === 'MODERATE') &&
      (context.thesisBreakerState === 'SAFE' || context.thesisBreakerState === 'APPROACHING_TRIGGER') &&
      context.decisionEvidenceConfidence >= 65.0 &&
      context.activeBlockers.length === 0 &&
      unresolvedMaterialConflicts <= 1;

    if (isBuyEligible) {
      const isWatch = context.forensicState === 'WATCH';
      return {
        verdict: 'BUY',
        appliedRuleId: isWatch ? 'R02_BUY_WATCH' : 'R01_BUY_CLEAN',
        appliedOverrideTier: 'BUY_ELIGIBILITY_GATE',
        oneLineVerdict: isWatch
          ? 'Robust business fundamentals trading at an attractive margin of safety; forensic watch items monitored.'
          : 'High-quality franchise trading at an attractive margin of safety with favorable catalyst asymmetry.',
        primaryRationale: 'Strong business quality, clean governance, and market price below conservative intrinsic value.',
        isOverridingAvoid: false,
      };
    }

    // =========================================================================
    // TIER 7: HOLD FALLBACK (Quality compounder at fair price or mixed risk/reward)
    // =========================================================================
    if (context.businessQualityScore >= 50.0 || context.downsideProtectionStatus === 'STRONG') {
      return {
        verdict: 'HOLD',
        appliedRuleId: 'R03_HOLD_FAIR_VALUE',
        appliedOverrideTier: 'HOLD_FALLBACK',
        oneLineVerdict: 'Solid business trajectory with balanced risk/reward, but current price provides limited margin of safety.',
        primaryRationale: 'Fundamentals remain intact; wait for attractive entry price or catalyst acceleration.',
        isOverridingAvoid: false,
      };
    }

    // =========================================================================
    // TIER 8: AVOID DEFAULT (Weak fundamentals or uncompensated risk)
    // =========================================================================
    return {
      verdict: 'AVOID',
      appliedRuleId: 'R08_AVOID_DEFAULT',
      appliedOverrideTier: 'AVOID_DEFAULT',
      oneLineVerdict: 'Weak business fundamentals and unfavorable risk asymmetry make capital allocation uncompelling.',
      primaryRationale: 'Sub-par return ratios, governance tensions, or lack of downside support.',
      isOverridingAvoid: false,
    };
  }
}
