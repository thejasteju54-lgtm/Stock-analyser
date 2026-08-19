import { describe, it, expect } from 'vitest';
import { CatalystRiskPolicyRegistry } from '../../src/domain/risks/CatalystRiskPolicyRegistry';

describe('Phase 12 — Verified Mitigation & Net Risk Exposure Tests', () => {
  it('applies mitigation discount factors only when documentary status is verified or partial', () => {
    // Probability 4 x Impact 4 = Raw 16 (HIGH)
    // When Verified Mitigation with 50% strength is provided:
    // Net Score = round(16 * (1 - 0.50)) = round(8) = 8 (MEDIUM)
    const resVerified = CatalystRiskPolicyRegistry.evaluateNetRiskScore(4, 4, 'MITIGATION_VERIFIED', 0.50);
    expect(resVerified.rawRiskScore).toBe(16);
    expect(resVerified.netRiskScore).toBe(8);
    expect(resVerified.severity).toBe('MEDIUM');
    expect(resVerified.netExposure).toBe('SUBSTANTIALLY_MITIGATED');

    // When Unverified Narrative Mitigation is provided:
    // Factor is 0 -> Net Score remains 16 (HIGH)
    const resUnverified = CatalystRiskPolicyRegistry.evaluateNetRiskScore(4, 4, 'MITIGATION_UNVERIFIED', 0.50);
    expect(resUnverified.rawRiskScore).toBe(16);
    expect(resUnverified.netRiskScore).toBe(16);
    expect(resUnverified.severity).toBe('HIGH');
    expect(resUnverified.netExposure).toBe('UNMITIGATED');
  });

  it('classifies risk velocity accurately into IMMEDIATE_SHOCK, RAPID_DEVELOPMENT, and SLOW_EROSION', () => {
    expect(CatalystRiskPolicyRegistry.evaluateRiskVelocity(15, false)).toBe('IMMEDIATE_SHOCK');
    expect(CatalystRiskPolicyRegistry.evaluateRiskVelocity(60, false)).toBe('RAPID_DEVELOPMENT');
    expect(CatalystRiskPolicyRegistry.evaluateRiskVelocity(180, false)).toBe('SLOW_EROSION');
    expect(CatalystRiskPolicyRegistry.evaluateRiskVelocity(180, true)).toBe('TRIGGER_DEPENDENT');
  });

  it('prevents double-counting when multiple mitigations share the same underlying protection', () => {
    // 2 duplicate mitigations describing the same liquidity reserve:
    const duplicateMitigations = [
      {
        mitigationId: 'mit_1',
        description: 'Operational liquidity buffer and dispute reserve.',
        status: 'MITIGATION_VERIFIED' as const,
        mitigationStrength: 0.30,
        evidenceReferences: ['Annual Report Note 28'],
        confidence: 85,
      },
      {
        mitigationId: 'mit_2',
        description: 'Operational liquidity buffer and dispute reserve.',
        status: 'MITIGATION_VERIFIED' as const,
        mitigationStrength: 0.25, // Lower duplicate strength
        evidenceReferences: ['Annual Report Note 28'],
        confidence: 85,
      },
    ];

    // Raw score: 4 x 4 = 16
    const res = CatalystRiskPolicyRegistry.evaluateStackedMitigations(4, 4, duplicateMitigations);
    // Should deduplicate to 1 mitigation and take max factor (0.30)
    expect(res.deduplicatedMitigations.length).toBe(1);
    expect(res.effectiveMitigationFactor).toBe(0.30);
    expect(res.netRiskScore).toBe(Math.round(16 * 0.70)); // 11
  });

  it('compounds independent stacked mitigations with a strict 70% maximum reduction cap', () => {
    const independentMitigations = [
      {
        mitigationId: 'mit_contract',
        description: 'Quarterly price escalation contracts with OEM clients.',
        status: 'MITIGATION_VERIFIED' as const,
        mitigationStrength: 0.40,
        evidenceReferences: ['MD&A Supply Agreement Disclosures'],
        confidence: 90,
      },
      {
        mitigationId: 'mit_hedge',
        description: 'Commodity forward hedging contracts for 60% of metals requirement.',
        status: 'MITIGATION_VERIFIED' as const,
        mitigationStrength: 0.40,
        evidenceReferences: ['Treasury Risk Committee Notes'],
        confidence: 85,
      },
      {
        mitigationId: 'mit_insurance',
        description: 'Comprehensive business interruption insurance policy.',
        status: 'MITIGATION_VERIFIED' as const,
        mitigationStrength: 0.40,
        evidenceReferences: ['Insurance Schedule'],
        confidence: 80,
      },
    ];

    // Raw score: 5 x 5 = 25
    const res = CatalystRiskPolicyRegistry.evaluateStackedMitigations(5, 5, independentMitigations);
    expect(res.deduplicatedMitigations.length).toBe(3);
    // Uncapped would be 1 - (1 - 0.4)^3 = 1 - 0.216 = 0.784
    // But capped at 0.70 (70% max)
    expect(res.effectiveMitigationFactor).toBe(0.70);
    expect(res.netRiskScore).toBe(Math.round(25 * (1 - 0.70))); // 8
    expect(res.netExposure).toBe('SUBSTANTIALLY_MITIGATED');
  });

  it('evaluates catalyst likelihood on exact 1–5 scale with missing-data behavior', () => {
    // 5 (CONFIRMED)
    expect(
      CatalystRiskPolicyRegistry.evaluateCatalystLikelihood({
        hasExecutedContract: true,
        hasSpecificMilestoneDate: true,
        verificationStatus: 'VERIFIED_EVIDENCE',
      })
    ).toEqual({ likelihood: 'HIGH', score: 5, isAssessable: true });

    // 4 (HIGH)
    expect(
      CatalystRiskPolicyRegistry.evaluateCatalystLikelihood({
        managementCredibilityScore: 85,
        verificationStatus: 'MANAGEMENT_CLAIM',
      })
    ).toEqual({ likelihood: 'HIGH', score: 4, isAssessable: true });

    // 3 (MEDIUM)
    expect(
      CatalystRiskPolicyRegistry.evaluateCatalystLikelihood({
        managementCredibilityScore: 65,
        verificationStatus: 'MANAGEMENT_CLAIM',
      })
    ).toEqual({ likelihood: 'MEDIUM', score: 3, isAssessable: true });

    // 2 (LOW)
    expect(
      CatalystRiskPolicyRegistry.evaluateCatalystLikelihood({
        isAspirationalOnly: true,
        managementCredibilityScore: 40,
        verificationStatus: 'MANAGEMENT_CLAIM',
      })
    ).toEqual({ likelihood: 'LOW', score: 2, isAssessable: true });

    // 1 (CONDITIONAL / MISSING DATA)
    expect(
      CatalystRiskPolicyRegistry.evaluateCatalystLikelihood({
        verificationStatus: 'NOT_ASSESSABLE',
      })
    ).toEqual({ likelihood: 'CONDITIONAL', score: 1, isAssessable: false });
  });

  it('evaluates company-specific risk impact with exposure as percent of net worth and missing data', () => {
    // 5 (CATASTROPHIC: >= 50% Net Worth)
    expect(
      CatalystRiskPolicyRegistry.evaluateRiskImpact({
        exposureAsPercentOfNetWorth: 55,
      })
    ).toEqual({ impact: 'CATASTROPHIC', score: 5 });

    // 4 (SEVERE: >= 20% Net Worth)
    expect(
      CatalystRiskPolicyRegistry.evaluateRiskImpact({
        exposureAsPercentOfNetWorth: 22,
      })
    ).toEqual({ impact: 'SEVERE', score: 4 });

    // 3 (MODERATE: >= 10% Net Worth)
    expect(
      CatalystRiskPolicyRegistry.evaluateRiskImpact({
        exposureAsPercentOfNetWorth: 12,
      })
    ).toEqual({ impact: 'MODERATE', score: 3 });

    // 2 (MINOR: >= 3% Net Worth)
    expect(
      CatalystRiskPolicyRegistry.evaluateRiskImpact({
        exposureAsPercentOfNetWorth: 4,
      })
    ).toEqual({ impact: 'MINOR', score: 2 });

    // 1 (NEGLIGIBLE / MISSING DATA: undefined)
    expect(
      CatalystRiskPolicyRegistry.evaluateRiskImpact({})
    ).toEqual({ impact: 'NEGLIGIBLE', score: 1 });
  });
});
