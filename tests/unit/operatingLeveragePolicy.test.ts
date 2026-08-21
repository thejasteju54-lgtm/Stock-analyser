/**
 * operatingLeveragePolicy.test.ts
 * Phase 13 — Operating Leverage Policy Tests.
 * Verifies multi-period incremental margin estimation, confidence gating,
 * and refusal to invent operating leverage when data is missing or revenue declines.
 */

import { describe, it, expect } from 'vitest';
import { OperatingLeveragePolicyRegistry } from '../../src/domain/scenarios/OperatingLeveragePolicyRegistry';

describe('Phase 13 — Operating Leverage & Incremental Margin Policy', () => {
  it('correctly calculates incremental margin and operating leverage factor from historical periods', () => {
    const periods = [
      { periodLabel: 'FY22', revenue: 8000, ebitda: 1000 },
      { periodLabel: 'FY23', revenue: 9000, ebitda: 1200 },
      { periodLabel: 'FY24', revenue: 10000, ebitda: 1500 },
    ];

    const res = OperatingLeveragePolicyRegistry.calculateOperatingLeverage(periods);
    expect(res.isAssessable).toBe(true);
    // Delta Rev: 2000, Delta EBITDA: 500 => Incremental Margin: 25%
    expect(res.incrementalMarginPercent).toBe(25);
    expect(res.operatingLeverageFactor).toBeGreaterThan(1.0);
    expect(res.confidence).toBeGreaterThanOrEqual(80);
  });

  it('marks NOT_ASSESSABLE and clamps to 1.0x baseline when historical periods < 2', () => {
    const res = OperatingLeveragePolicyRegistry.calculateOperatingLeverage([
      { periodLabel: 'FY24', revenue: 10000, ebitda: 1500 },
    ]);

    expect(res.isAssessable).toBe(false);
    expect(res.operatingLeverageFactor).toBe(1.0);
    expect(res.incrementalMarginPercent).toBeNull();
    expect(res.explanation).toContain('NOT_ASSESSABLE');
  });

  it('marks NOT_ASSESSABLE when historical revenue declines (cannot invent positive leverage)', () => {
    const periods = [
      { periodLabel: 'FY23', revenue: 10000, ebitda: 1500 },
      { periodLabel: 'FY24', revenue: 9000, ebitda: 1200 },
    ];

    const res = OperatingLeveragePolicyRegistry.calculateOperatingLeverage(periods);
    expect(res.isAssessable).toBe(false);
    expect(res.operatingLeverageFactor).toBe(1.0);
  });
});
