import { describe, it, expect } from 'vitest';
import { DecisionBlocker } from '../../../src/domain/verdict/VerdictTypes';
import { InvestmentDecisionPolicyRegistry } from '../../../src/domain/verdict/InvestmentDecisionPolicyRegistry';

describe('Phase 14 — DecisionBlocker Lifecycle & Multi-Blocker Gating', () => {
  it('blocks BUY eligibility when active blockers are present', () => {
    const activeBlocker: DecisionBlocker = {
      blockerId: 'blk_forensic_1',
      sourcePhase: 'Phase 7 (Forensics)',
      type: 'CRITICAL_FORENSIC',
      severity: 'CRITICAL',
      evidenceReferences: ['Finding FND_1'],
      requiredResolution: 'Statutory auditor sign-off or audited reconciliation note.',
      currentStatus: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    const res = InvestmentDecisionPolicyRegistry.evaluateDecision({
      currentPrice: 900,
      priceFreshnessStatus: 'CURRENT',
      businessQualityScore: 80,
      investmentAttractivenessScore: 85,
      forensicState: 'WATCH', // Even if watch, an active blocker exists
      managementState: 'EXCELLENT',
      marginOfSafetyStatus: 'ADEQUATE',
      actualMarginOfSafetyPercent: 20.0,
      requiredMarginOfSafetyPercent: 15.0,
      downsideProtectionStatus: 'STRONG',
      thesisBreakerState: 'SAFE',
      decisionEvidenceConfidence: 90,
      balanceSheetStrength: 'FORTRESS',
      activeBlockers: [activeBlocker],
      activeConflicts: [],
    });

    // Blocker presence prevents BUY eligibility (Tier 6 requires activeBlockers.length === 0)
    expect(res.verdict).toBe('HOLD');
    expect(res.appliedOverrideTier).toBe('HOLD_FALLBACK');
  });

  it('restores BUY eligibility once all active blockers are resolved', () => {
    const res = InvestmentDecisionPolicyRegistry.evaluateDecision({
      currentPrice: 900,
      priceFreshnessStatus: 'CURRENT',
      businessQualityScore: 80,
      investmentAttractivenessScore: 85,
      forensicState: 'NO_MATERIAL_CONCERN',
      managementState: 'EXCELLENT',
      marginOfSafetyStatus: 'ADEQUATE',
      actualMarginOfSafetyPercent: 20.0,
      requiredMarginOfSafetyPercent: 15.0,
      downsideProtectionStatus: 'STRONG',
      thesisBreakerState: 'SAFE',
      decisionEvidenceConfidence: 90,
      balanceSheetStrength: 'FORTRESS',
      activeBlockers: [], // Zero active blockers
      activeConflicts: [],
    });

    expect(res.verdict).toBe('BUY');
    expect(res.appliedOverrideTier).toBe('BUY_ELIGIBILITY_GATE');
  });
});
