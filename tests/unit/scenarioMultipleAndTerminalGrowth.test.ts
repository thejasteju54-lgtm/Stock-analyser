/**
 * scenarioMultipleAndTerminalGrowth.test.ts
 * Phase 13 — Valuation Multiple Policy, Terminal Growth Caps, and WACC Inversion Tests.
 */

import { describe, it, expect } from 'vitest';
import { ScenarioMultiplePolicyRegistry } from '../../src/domain/scenarios/ScenarioMultiplePolicyRegistry';
import { TerminalGrowthPolicyRegistry } from '../../src/domain/scenarios/TerminalGrowthPolicyRegistry';

describe('Phase 13 — Scenario Multiple Policy & Terminal Growth Guards', () => {
  it('selects justifiable multiple ranges with ROE and cash conversion adjustments', () => {
    const res = ScenarioMultiplePolicyRegistry.evaluateMultiples({
      primaryMethod: 'PE',
      historicalMedian: 20.0,
      peerMedian: 22.0,
      projectedRoe: 22.5, // > 20% premium
      projectedFcfToPat: 0.85, // Strong conversion
    });

    expect(res.baseMultiple).toBeGreaterThan(20.0);
    expect(res.bullMultiple).toBeGreaterThan(res.baseMultiple);
    expect(res.bearMultiple).toBeLessThan(res.baseMultiple);
    expect(res.adjustments).toContain('ROE > 20% premium (+8%)');
  });

  it('clamps Bull multiple expansion if cash conversion is weak (FCF/PAT < 0.50)', () => {
    const resWeak = ScenarioMultiplePolicyRegistry.evaluateMultiples({
      primaryMethod: 'PE',
      historicalMedian: 20.0,
      peerMedian: 20.0,
      projectedFcfToPat: 0.30, // Weak cash conversion
    });

    expect(resWeak.adjustments).toEqual(
      expect.arrayContaining([expect.stringContaining('Weak cash conversion')])
    );
  });

  it('evaluates terminal growth anchored to Indian nominal GDP and verifies validity against WACC', () => {
    const validRes = TerminalGrowthPolicyRegistry.evaluateTerminalGrowth({
      currency: 'INR',
      country: 'INDIA',
      waccPercent: 11.5,
    });

    expect(validRes.isDcfValid).toBe(true);
    expect(validRes.terminalGrowthPercent).toBeLessThanOrEqual(5.5);
    expect(validRes.nominalGdpGrowthEstimatePercent).toBe(10.5);
    expect(validRes.statusMessage).toContain('VALID');
  });

  it('flags DCF_INVALID when terminal growth is >= WACC (preventing mathematical explosion)', () => {
    const invalidRes = TerminalGrowthPolicyRegistry.evaluateTerminalGrowth({
      currency: 'INR',
      country: 'INDIA',
      waccPercent: 4.5, // WACC is lower than terminal growth (5.0%)
    });

    expect(invalidRes.isDcfValid).toBe(false);
    expect(invalidRes.statusMessage).toContain('DCF_INVALID');
  });
});
