/**
 * 23_scenarioModelProbabilityAndBridges.test.ts
 * Phase 19 — Hostile Scenario Model Probability Sum-to-100% & Bridges Suite.
 */

import { describe, it, expect } from 'vitest';
import { ScenarioProbabilityPolicyRegistry } from '../../src/domain/scenarios/ScenarioProbabilityPolicyRegistry';

describe('Scenario Model Probability & Bridges Suite', () => {
  it('strictly ensures Base + Bull + Bear probabilities sum to exactly 100% and marks missing evidence as NOT_ASSESSABLE', () => {
    // 1. Valid inputs
    const validResult = ScenarioProbabilityPolicyRegistry.evaluateProbabilities({
      hasSufficientEvidence: true,
      historicalStabilityScore: 80,
      managementCredibilityScore: 75,
      industryForecastConfidenceScore: 70,
      phase12AsymmetryRatio: 1.5,
      phase12CriticalRiskCount: 0,
      phase12HighRiskCount: 1,
    });

    expect(validResult.probabilityStatus).toBe('ASSESSABLE');
    const sum = validResult.probabilities.BASE + validResult.probabilities.BULL + validResult.probabilities.BEAR;
    expect(sum).toBe(100);

    // 2. Insufficient evidence inputs
    const unassessableResult = ScenarioProbabilityPolicyRegistry.evaluateProbabilities({
      hasSufficientEvidence: false,
    });
    expect(unassessableResult.probabilityStatus).toBe('NOT_ASSESSABLE');
    expect(unassessableResult.isDisplayPlaceholder).toBe(true);
  });
});
