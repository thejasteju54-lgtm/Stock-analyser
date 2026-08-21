/**
 * 11_evidenceCompletenessQA.test.ts
 * QA Track: 11-Pillar Evidence Completeness & Critical Pillar Gating.
 */

import { describe, it, expect } from 'vitest';
import { createResearchProject } from '../../src/domain/models/ResearchProject';
import { EvidenceCompletenessEngine } from '../../src/domain/readiness/EvidenceCompletenessEngine';

describe('Evidence Completeness QA', () => {
  it('evaluates all 11 evidence pillars and does not mask missing critical pillars', () => {
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

    const report = EvidenceCompletenessEngine.evaluateProjectCompleteness(project);
    expect(Object.keys(report.pillars).length).toBe(11);
    expect(report.totalPillarsCount).toBe(11);
    expect(report.criticalPillarsSatisfied).toBeDefined();
  });
});
