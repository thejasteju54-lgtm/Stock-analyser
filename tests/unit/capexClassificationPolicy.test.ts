/**
 * capexClassificationPolicy.test.ts
 * Phase 13 — Maintenance vs Growth Capex Classification Policy Tests.
 * Verifies inflation-adjusted replacement maintenance capex, discretionary growth capex,
 * and link to Phase 11/12 expansion milestones.
 */

import { describe, it, expect } from 'vitest';
import { CapexClassificationPolicyRegistry } from '../../src/domain/scenarios/CapexClassificationPolicyRegistry';

describe('Phase 13 — Capex Classification & Growth Expansion Policy', () => {
  it('correctly classifies maintenance vs announced growth capex with milestone linkage', () => {
    const res = CapexClassificationPolicyRegistry.evaluateCapex({
      historicalDepreciation: 400, // INR Cr
      announcedExpansionCapex: 600, // INR Cr
      projectedRevenue: 10000,
      capacityExpansionMilestone: 'Commissioning of 200k Units EV Battery Plant in Sanand by Q3 FY25',
      sourceReferences: ['Investor Presentation May 2024 Slide 18'],
      scenarioType: 'BASE',
    });

    expect(res.classification).toBe('GROWTH_CAPEX');
    // Maintenance Capex = 400 * 1.05 = 420
    expect(res.maintenanceCapex).toBe(420);
    expect(res.growthCapex).toBe(600);
    expect(res.totalCapex).toBe(1020);
    expect(res.capacityExpansionMilestone).toContain('Sanand');
    expect(res.confidence).toBeGreaterThanOrEqual(85);
  });

  it('differentiates capex across Bull and Bear scenarios without fabricating baseline maintenance', () => {
    const bullRes = CapexClassificationPolicyRegistry.evaluateCapex({
      historicalDepreciation: 500,
      announcedExpansionCapex: 500,
      projectedRevenue: 12000,
      scenarioType: 'BULL',
    });

    const bearRes = CapexClassificationPolicyRegistry.evaluateCapex({
      historicalDepreciation: 500,
      announcedExpansionCapex: 500,
      projectedRevenue: 9000,
      scenarioType: 'BEAR',
    });

    // Bull case executes full expansion (+10% acceleration)
    expect(bullRes.growthCapex).toBe(550);
    // Bear case curtails growth capex (-50%) to protect balance sheet
    expect(bearRes.growthCapex).toBe(250);
    // Both preserve the same baseline maintenance capex (500 * 1.05 = 525)
    expect(bullRes.maintenanceCapex).toBe(525);
    expect(bearRes.maintenanceCapex).toBe(525);
  });

  it('returns NOT_ASSESSABLE when depreciation and capex inputs are 0 or missing', () => {
    const res = CapexClassificationPolicyRegistry.evaluateCapex({
      historicalDepreciation: 0,
      projectedRevenue: 10000,
      scenarioType: 'BASE',
    });

    expect(res.classification).toBe('NOT_ASSESSABLE');
    expect(res.totalCapex).toBe(0);
  });
});
