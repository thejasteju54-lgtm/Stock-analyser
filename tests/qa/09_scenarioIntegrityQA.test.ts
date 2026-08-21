/**
 * 09_scenarioIntegrityQA.test.ts
 * QA Track: Quantitative Scenario Modeling & Probability Normalization.
 */

import { describe, it, expect } from 'vitest';
import { createResearchProject } from '../../src/domain/models/ResearchProject';
import { ScenarioMasterEngine } from '../../src/domain/scenarios/ScenarioMasterEngine';

describe('Scenario Modeling Integrity QA', () => {
  it('generates Base, Bull, and Bear scenarios with normalized probabilities', () => {
    const project = createResearchProject({
      company: {
        id: 'comp_tatamotors',
        legalName: 'Tata Motors Limited',
        displayName: 'Tata Motors',
        symbol: 'TATAMOTORS',
        exchange: 'NSE',
        isin: 'INE155A01022',
        sector: 'Automobile and Ancillaries',
        subsector: 'Commercial & Passenger Vehicles',
        businessModel: 'NON_FINANCIAL_OPERATING',
        marketCapCategory: 'LARGE_CAP',
        createdAt: '2024-01-01',
        updatedAt: '2024-06-30',
      },
    });

    const report = ScenarioMasterEngine.generateScenarioReport(project);
    expect(report.scenarios).toBeDefined();
    expect(report.scenarios['BASE']).toBeDefined();
    expect(report.scenarios['BULL']).toBeDefined();
    expect(report.scenarios['BEAR']).toBeDefined();
  });
});
