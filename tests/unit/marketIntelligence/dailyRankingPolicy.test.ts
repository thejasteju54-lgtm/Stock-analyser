import { describe, it, expect } from 'vitest';
import { OpportunityPolicyRegistry } from '../../../src/domain/marketIntelligence/OpportunityPolicyRegistry';

describe('Phase 22 — Opportunity Scoring Policy Registry', () => {
  it('enforces total policy weight sum equals 1.0 (100%) in version v1.0.0', () => {
    const policy = OpportunityPolicyRegistry.getPolicy('v1.0.0');
    expect(policy.version).toBe('v1.0.0');

    const totalWeight =
      policy.weights.momentum +
      policy.weights.fundamentals +
      policy.weights.catalysts +
      policy.weights.valuation +
      policy.weights.technical +
      policy.weights.sector +
      policy.weights.news +
      policy.weights.volume +
      policy.weights.dataConfidence;

    expect(Number(totalWeight.toFixed(2))).toBe(1.0);
  });

  it('defines deterministic risk penalty scales and caps', () => {
    const policy = OpportunityPolicyRegistry.getPolicy();
    expect(policy.riskPenalties.low).toBe(0);
    expect(policy.riskPenalties.medium).toBe(8);
    expect(policy.riskPenalties.high).toBe(18);
    expect(policy.riskPenalties.critical).toBe(35);
    expect(policy.maxPenaltyCap).toBe(40);
  });
});
