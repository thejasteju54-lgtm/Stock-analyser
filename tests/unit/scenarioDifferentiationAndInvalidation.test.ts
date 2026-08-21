/**
 * scenarioDifferentiationAndInvalidation.test.ts
 * Phase 13 — Scenario Differentiation, Invalidation Conditions, and Valuation Ordering Tests.
 */

import { describe, it, expect } from 'vitest';
import { ScenarioMasterEngine } from '../../src/domain/scenarios/ScenarioMasterEngine';
import { ResearchProject, createResearchProject } from '../../src/domain/models/ResearchProject';
import { createCompanyEntity } from '../../src/domain/models/Company';

describe('Phase 13 — Scenario Differentiation & Invalidation Conditions', () => {
  const mockCompany = createCompanyEntity({
    symbol: 'TATAMOTORS',
    displayName: 'Tata Motors Limited',
    legalName: 'Tata Motors Limited',
    exchange: 'NSE',
    sector: 'Automobile',
    subsector: 'Passenger Vehicles (PV)',
    businessModel: 'NON_FINANCIAL_OPERATING',
    marketCapCategory: 'LARGE_CAP',
  });

  it('generates distinctly differentiated Base, Bull, and Bear scenarios without static +/- 20% heuristics', () => {
    const project: ResearchProject = createResearchProject({ company: mockCompany });
    const report = ScenarioMasterEngine.generateScenarioReport(project);

    expect(report.scenarios.BASE).toBeDefined();
    expect(report.scenarios.BULL).toBeDefined();
    expect(report.scenarios.BEAR).toBeDefined();

    // Verify true driver differentiation
    expect(report.comparison.revenueCagr3Yr.BULL).toBeGreaterThan(report.comparison.revenueCagr3Yr.BASE);
    expect(report.comparison.revenueCagr3Yr.BASE).toBeGreaterThan(report.comparison.revenueCagr3Yr.BEAR);

    expect(report.scenarios.BULL.marginProjection.ebitdaMarginPercent).toBeGreaterThan(
      report.scenarios.BEAR.marginProjection.ebitdaMarginPercent
    );

    // Verify ordering: Bear <= Base <= Bull
    expect(report.scenarios.BEAR.valuationRange.baseValuePerShare).toBeLessThanOrEqual(
      report.scenarios.BASE.valuationRange.baseValuePerShare
    );
    expect(report.scenarios.BASE.valuationRange.baseValuePerShare).toBeLessThanOrEqual(
      report.scenarios.BULL.valuationRange.baseValuePerShare
    );
  });

  it('creates falsifiable invalidation conditions linked to Phase 12 thesis breakers', () => {
    const project: ResearchProject = createResearchProject({ company: mockCompany });
    const report = ScenarioMasterEngine.generateScenarioReport(project);

    const baseInvals = report.scenarios.BASE.invalidationConditions;
    expect(baseInvals.length).toBeGreaterThanOrEqual(2);

    const marginInval = baseInvals.find((c) => c.metric === 'EBITDA Margin');
    expect(marginInval).toBeDefined();
    expect(marginInval?.operator).toBe('LESS_THAN');
    expect(marginInval?.distanceToTriggerPercent).toBeDefined();
    expect(marginInval?.thesisBreakerReferenceId).toBe('tb_ebitda_margin_breach');
  });
});
