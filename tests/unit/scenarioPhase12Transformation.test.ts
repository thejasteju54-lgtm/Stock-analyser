/**
 * scenarioPhase12Transformation.test.ts
 * Phase 13 — Phase 12 Evidence Transformation Policy Tests.
 * Verifies that Phase 12 asymmetry ratio is transformed into probability shifts
 * with a full derivation trace and never directly equated to scenario probability.
 */

import { describe, it, expect } from 'vitest';
import { ScenarioProbabilityPolicyRegistry } from '../../src/domain/scenarios/ScenarioProbabilityPolicyRegistry';

describe('Phase 13 — Phase 12 to Scenario Probability Transformation', () => {
  it('transforms high asymmetry (e.g. 2.5x) into positive Bull shift and negative Bear shift', () => {
    const shift = ScenarioProbabilityPolicyRegistry.transformPhase12ToProbabilityShifts({
      asymmetryRatio: 2.5,
      criticalRiskCount: 0,
      highRiskCount: 0,
    });

    expect(shift.shiftBullPercent).toBeGreaterThan(0);
    expect(shift.shiftBullPercent).toBeLessThanOrEqual(25);
    expect(shift.shiftBearPercent).toBeLessThanOrEqual(0);
    expect(shift.formula).toContain('BullShift');
  });

  it('transforms low asymmetry (e.g. 0.4x) with critical risks into positive Bear shift and negative Bull shift', () => {
    const shift = ScenarioProbabilityPolicyRegistry.transformPhase12ToProbabilityShifts({
      asymmetryRatio: 0.4,
      criticalRiskCount: 2,
      highRiskCount: 2,
    });

    expect(shift.shiftBearPercent).toBeGreaterThan(15);
    expect(shift.shiftBearPercent).toBeLessThanOrEqual(30);
    expect(shift.shiftBullPercent).toBeLessThan(0);
  });
});
