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
});
