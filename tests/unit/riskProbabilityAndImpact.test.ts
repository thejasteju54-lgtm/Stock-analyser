import { describe, it, expect } from 'vitest';
import { CatalystRiskPolicyRegistry } from '../../src/domain/risks/CatalystRiskPolicyRegistry';

describe('Phase 12 — Risk Probability & Impact Deterministic Policies Tests', () => {
  it('maps risk probability deterministically to 1..5 using empirical frequency and trend metrics', () => {
    // 5: ALMOST_CERTAIN (Regulatory order or >= 80% frequency)
    const p5 = CatalystRiskPolicyRegistry.evaluateRiskProbability({
      hasActiveRegulatoryOrder: true,
    });
    expect(p5.probability).toBe('ALMOST_CERTAIN');
    expect(p5.score).toBe(5);

    // 4: HIGH (>= 50% frequency or 2 consecutive negative quarters)
    const p4 = CatalystRiskPolicyRegistry.evaluateRiskProbability({
      consecutiveNegativeQuarters: 2,
    });
    expect(p4.probability).toBe('HIGH');
    expect(p4.score).toBe(4);

    // 3: MODERATE (>= 25% frequency or trigger proximity <= 15%)
    const p3 = CatalystRiskPolicyRegistry.evaluateRiskProbability({
      triggerProximityPercent: 12,
    });
    expect(p3.probability).toBe('MODERATE');
    expect(p3.score).toBe(3);

    // 2: LOW (trigger proximity <= 30%)
    const p2 = CatalystRiskPolicyRegistry.evaluateRiskProbability({
      triggerProximityPercent: 25,
    });
    expect(p2.probability).toBe('LOW');
    expect(p2.score).toBe(2);

    // 1: REMOTE (no triggers breached)
    const p1 = CatalystRiskPolicyRegistry.evaluateRiskProbability({
      triggerProximityPercent: 50,
    });
    expect(p1.probability).toBe('REMOTE');
    expect(p1.score).toBe(1);
  });

  it('maps risk impact deterministically to 1..5 using measurable PAT exposure and solvency thresholds', () => {
    // 5: CATASTROPHIC (Threatens continuity or >= 50% PAT hit)
    const i5 = CatalystRiskPolicyRegistry.evaluateRiskImpact({
      threatensBusinessContinuity: true,
    });
    expect(i5.impact).toBe('CATASTROPHIC');
    expect(i5.score).toBe(5);

    // 4: SEVERE (Credit downgrade or >= 20% PAT hit)
    const i4 = CatalystRiskPolicyRegistry.evaluateRiskImpact({
      potentialPatImpactPercent: 25,
    });
    expect(i4.impact).toBe('SEVERE');
    expect(i4.score).toBe(4);

    // 3: MODERATE (>= 10% PAT hit or >= 100 bps margin compression)
    const i3 = CatalystRiskPolicyRegistry.evaluateRiskImpact({
      potentialPatImpactPercent: 12,
    });
    expect(i3.impact).toBe('MODERATE');
    expect(i3.score).toBe(3);

    // 2: MINOR (>= 3% PAT hit)
    const i2 = CatalystRiskPolicyRegistry.evaluateRiskImpact({
      potentialPatImpactPercent: 5,
    });
    expect(i2.impact).toBe('MINOR');
    expect(i2.score).toBe(2);

    // 1: NEGLIGIBLE (< 3% PAT hit)
    const i1 = CatalystRiskPolicyRegistry.evaluateRiskImpact({
      potentialPatImpactPercent: 1,
    });
    expect(i1.impact).toBe('NEGLIGIBLE');
    expect(i1.score).toBe(1);
  });
});
