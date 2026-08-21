/**
 * 08_catalystRiskMatrixQA.test.ts
 * QA Track: Catalyst Ranking, Risk Matrix & Thesis Breakers.
 */

import { describe, it, expect } from 'vitest';
import { createResearchProject } from '../../src/domain/models/ResearchProject';
import { CatalystRiskMasterEngine } from '../../src/domain/risks/CatalystRiskMasterEngine';

describe('Catalyst & Risk Matrix QA', () => {
  it('executes multi-dimensional risk matrix and identifies thesis breakers', () => {
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

    const report = CatalystRiskMasterEngine.execute(project);
    expect(report.matrixSummary).toBeDefined();
    expect(report.matrixSummary.aggregateRiskRating).toBeDefined();
    expect(Array.isArray(report.thesisBreakers)).toBe(true);
  });
});
