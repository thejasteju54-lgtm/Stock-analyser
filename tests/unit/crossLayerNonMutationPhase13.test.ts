/**
 * crossLayerNonMutationPhase13.test.ts
 * Phase 13 — Strict Cross-Layer Non-Mutation & Boundary Assertion Tests.
 * Ensures Phase 13 execution does not mutate upstream data from Phases 5–12
 * and produces ZERO BUY/HOLD/AVOID investment recommendations.
 */

import { describe, it, expect } from 'vitest';
import { ScenarioMasterEngine } from '../../src/domain/scenarios/ScenarioMasterEngine';
import { ResearchProject, createResearchProject } from '../../src/domain/models/ResearchProject';
import { createCompanyEntity } from '../../src/domain/models/Company';

describe('Phase 13 — Strict Cross-Layer Non-Mutation & Recommendation Boundary Tests', () => {
  const mockCompany = createCompanyEntity({
    symbol: 'RELIANCE',
    displayName: 'Reliance Industries Limited',
    legalName: 'Reliance Industries Limited',
    exchange: 'NSE',
    sector: 'Oil & Gas',
    subsector: 'Refining & Marketing (R&M)',
    businessModel: 'NON_FINANCIAL_OPERATING',
    marketCapCategory: 'LARGE_CAP',
  });

  it('strictly preserves upstream project data without mutating existing records', () => {
    const project: ResearchProject = createResearchProject({ company: mockCompany });
    // Add mock upstream calculated metric
    project.calculatedMetrics = [
      {
        metricId: 'calc_rev_fy24',
        metricCode: 'REVENUE',
        metricName: 'Revenue from Operations',
        category: 'GROWTH',
        value: 900000,
        unit: 'INR_CRORE',
        period: 'FY24',
        formulaId: 'FORMULA_REVENUE_GROWTH',
        formulaName: 'Revenue Growth',
        formulaExpression: 'Revenue',
        methodologyId: 'METH_1',
        methodologyVersion: '1.0',
        calculationVersion: '1.0',
        inputFactIds: [],
        inputFactsSummary: [],
        calculationTimestamp: new Date().toISOString(),
        status: 'CALCULATED',
        warnings: [],
        isApplicableForBusinessModel: true,
      },
    ];

    const initialMetricsJson = JSON.stringify(project.calculatedMetrics);
    const report = ScenarioMasterEngine.generateScenarioReport(project);

    // Verify upstream data was not mutated
    expect(JSON.stringify(project.calculatedMetrics)).toBe(initialMetricsJson);
    expect(report.scenarios.BASE.horizonStatements[0].revenue).toBeGreaterThan(900000);
  });

  it('guarantees that Phase 13 outputs ZERO final BUY / HOLD / AVOID recommendations or conviction scores', () => {
    const project: ResearchProject = createResearchProject({ company: mockCompany });
    const report = ScenarioMasterEngine.generateScenarioReport(project);
    const reportStr = JSON.stringify(report);

    // Assert that final investment recommendations are strictly absent
    expect(reportStr).not.toContain('"recommendation":"BUY"');
    expect(reportStr).not.toContain('"recommendation":"HOLD"');
    expect(reportStr).not.toContain('"recommendation":"AVOID"');
    expect(reportStr).not.toContain('"verdict":"BUY"');
    expect(reportStr).not.toContain('"verdict":"STRONG_BUY"');
    expect(reportStr).not.toContain('"convictionScore"');
    expect(report.reconciliationAudit.flags).toContain('NO_BUY_HOLD_AVOID_RECOMMENDATION');
  });
});
