/**
 * scenarioProbabilityPolicy.test.ts
 * Phase 13 — Deterministic Scenario Probability Policy Tests
 * Verifies normalization, weights, Base+Bull+Bear=100%, caps/floors,
 * missing-data behavior, and display-only placeholder guards.
 */

import { describe, it, expect } from 'vitest';
import { ScenarioProbabilityPolicyRegistry } from '../../src/domain/scenarios/ScenarioProbabilityPolicyRegistry';

describe('Phase 13 — Scenario Probability Policy & Missing Data Gating', () => {
  it('strictly enforces Base + Bull + Bear = 100% across various evidence inputs', () => {
    const res1 = ScenarioProbabilityPolicyRegistry.evaluateProbabilities({
      historicalStabilityScore: 80,
      managementCredibilityScore: 85,
      industryForecastConfidenceScore: 75,
      phase12AsymmetryRatio: 2.2,
      phase12CriticalRiskCount: 0,
      phase12HighRiskCount: 1,
    });

    expect(res1.probabilityStatus).toBe('ASSESSABLE');
    expect(res1.isDisplayPlaceholder).toBe(false);
    expect(res1.probabilities.BASE + res1.probabilities.BULL + res1.probabilities.BEAR).toBe(100);
    expect(res1.probabilities.BULL).toBeGreaterThan(res1.probabilities.BEAR);
  });

  it('handles severe downside inputs with higher Bear probability while respecting 100% sum', () => {
    const res2 = ScenarioProbabilityPolicyRegistry.evaluateProbabilities({
      historicalStabilityScore: 35,
      managementCredibilityScore: 40,
      industryForecastConfidenceScore: 45,
      phase12AsymmetryRatio: 0.6,
      phase12CriticalRiskCount: 2,
      phase12HighRiskCount: 3,
    });

    expect(res2.probabilityStatus).toBe('ASSESSABLE');
    expect(res2.probabilities.BASE + res2.probabilities.BULL + res2.probabilities.BEAR).toBe(100);
    expect(res2.probabilities.BEAR).toBeGreaterThan(res2.probabilities.BULL);
    expect(res2.probabilities.BEAR).toBeLessThanOrEqual(ScenarioProbabilityPolicyRegistry.MAX_PROBABILITY_CEILING);
  });

  it('strictly marks probabilityStatus as NOT_ASSESSABLE and flags isDisplayPlaceholder: true when evidence is missing', () => {
    const resMissing = ScenarioProbabilityPolicyRegistry.evaluateProbabilities({
      hasSufficientEvidence: false,
    });

    expect(resMissing.probabilityStatus).toBe('NOT_ASSESSABLE');
    expect(resMissing.isDisplayPlaceholder).toBe(true);
    expect(resMissing.modelConfidenceScore).toBe(0);
    expect(resMissing.derivationTrace.formula).toContain('PROBABILITY_NOT_ASSESSABLE');
  });

  it('respects minimum 5% floor and 85% ceiling caps', () => {
    const resExtreme = ScenarioProbabilityPolicyRegistry.evaluateProbabilities({
      historicalStabilityScore: 99,
      managementCredibilityScore: 99,
      industryForecastConfidenceScore: 99,
      phase12AsymmetryRatio: 5.0,
      phase12CriticalRiskCount: 0,
      phase12HighRiskCount: 0,
    });

    expect(resExtreme.probabilities.BEAR).toBeGreaterThanOrEqual(ScenarioProbabilityPolicyRegistry.MIN_PROBABILITY_FLOOR);
    expect(resExtreme.probabilities.BULL).toBeLessThanOrEqual(ScenarioProbabilityPolicyRegistry.MAX_PROBABILITY_CEILING);
    expect(resExtreme.probabilities.BASE + resExtreme.probabilities.BULL + resExtreme.probabilities.BEAR).toBe(100);
  });
});
