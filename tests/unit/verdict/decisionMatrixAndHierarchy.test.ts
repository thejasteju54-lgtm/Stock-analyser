import { describe, it, expect } from 'vitest';
import { InvestmentDecisionPolicyRegistry, DecisionEvaluationContext } from '../../../src/domain/verdict/InvestmentDecisionPolicyRegistry';

describe('Phase 14 — InvestmentDecisionPolicyRegistry & Override Hierarchy', () => {
  const baseContext: DecisionEvaluationContext = {
    currentPrice: 900,
    priceFreshnessStatus: 'CURRENT',
    businessQualityScore: 78.5,
    investmentAttractivenessScore: 82.0,
    forensicState: 'NO_MATERIAL_CONCERN',
    managementState: 'EXCELLENT',
    marginOfSafetyStatus: 'ADEQUATE',
    actualMarginOfSafetyPercent: 18.5,
    requiredMarginOfSafetyPercent: 15.0,
    downsideProtectionStatus: 'STRONG',
    thesisBreakerState: 'SAFE',
    decisionEvidenceConfidence: 88,
    balanceSheetStrength: 'FORTRESS',
    activeBlockers: [],
    activeConflicts: [],
  };

  it('Tier 1: Evaluates DATA_INTEGRITY_OVERRIDE on critically stale price', () => {
    const res = InvestmentDecisionPolicyRegistry.evaluateDecision({
      ...baseContext,
      priceFreshnessStatus: 'CRITICALLY_STALE',
    });
    expect(res.verdict).toBe('DECISION_NOT_ASSESSABLE');
    expect(res.appliedOverrideTier).toBe('DATA_INTEGRITY_OVERRIDE');
  });

  it('Tier 2: Evaluates CRITICAL_FORENSIC_OVERRIDE on fraud or auditor resignation', () => {
    const res = InvestmentDecisionPolicyRegistry.evaluateDecision({
      ...baseContext,
      forensicState: 'CRITICAL_OVERRIDE',
    });
    expect(res.verdict).toBe('AVOID');
    expect(res.appliedOverrideTier).toBe('CRITICAL_FORENSIC_OVERRIDE');
    expect(res.isOverridingAvoid).toBe(true);
  });

  it('Tier 3: Evaluates THESIS_INVALIDATION_OVERRIDE on persistent structural failure', () => {
    const res = InvestmentDecisionPolicyRegistry.evaluateDecision({
      ...baseContext,
      thesisBreakerState: 'THESIS_INVALIDATED',
    });
    expect(res.verdict).toBe('AVOID');
    expect(res.appliedOverrideTier).toBe('THESIS_INVALIDATION_OVERRIDE');
    expect(res.isOverridingAvoid).toBe(true);
  });

  it('Tier 4: Evaluates BALANCE_SHEET_DISTRESS_OVERRIDE on insolvency', () => {
    const res = InvestmentDecisionPolicyRegistry.evaluateDecision({
      ...baseContext,
      balanceSheetStrength: 'DISTRESSED',
    });
    expect(res.verdict).toBe('AVOID');
    expect(res.appliedOverrideTier).toBe('BALANCE_SHEET_DISTRESS_OVERRIDE');
    expect(res.isOverridingAvoid).toBe(true);
  });

  it('Tier 5: Evaluates VALUATION_GATE on extended price (MoS < -25%)', () => {
    const res = InvestmentDecisionPolicyRegistry.evaluateDecision({
      ...baseContext,
      actualMarginOfSafetyPercent: -30.0,
      marginOfSafetyStatus: 'NEGATIVE',
    });
    expect(res.verdict).toBe('HOLD');
    expect(res.appliedOverrideTier).toBe('VALUATION_GATE');
  });

  it('Tier 6: Grants BUY when all criteria pass', () => {
    const res = InvestmentDecisionPolicyRegistry.evaluateDecision(baseContext);
    expect(res.verdict).toBe('BUY');
    expect(res.appliedOverrideTier).toBe('BUY_ELIGIBILITY_GATE');
    expect(res.appliedRuleId).toBe('R01_BUY_CLEAN');
  });

  it('Tier 7: Falls back to HOLD when MoS is limited but business quality is high', () => {
    const res = InvestmentDecisionPolicyRegistry.evaluateDecision({
      ...baseContext,
      actualMarginOfSafetyPercent: 5.0,
      marginOfSafetyStatus: 'LIMITED', // Required is 15.0%
    });
    expect(res.verdict).toBe('HOLD');
    expect(res.appliedOverrideTier).toBe('HOLD_FALLBACK');
  });

  it('Tier 8: Enforces AVOID for weak fundamentals', () => {
    const res = InvestmentDecisionPolicyRegistry.evaluateDecision({
      ...baseContext,
      businessQualityScore: 35.0,
      actualMarginOfSafetyPercent: 5.0,
      marginOfSafetyStatus: 'LIMITED',
      downsideProtectionStatus: 'NONE',
    });
    expect(res.verdict).toBe('AVOID');
    expect(res.appliedOverrideTier).toBe('AVOID_DEFAULT');
  });
});
