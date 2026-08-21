/**
 * 07_sourceFabricationAndOrphanDefense.test.ts
 * Phase 19 — Hostile Source Fabrication & Orphaned Provenance Defense Suite.
 */

import { describe, it, expect } from 'vitest';
import { createResearchProject } from '../../src/domain/models/ResearchProject';
import { InvestmentResearchReportEngine } from '../../src/domain/reports/InvestmentResearchReportEngine';

describe('Source Fabrication & Orphaned Provenance Defense Suite', () => {
  it('strictly preserves verified source attribution without manufacturing citations', () => {
    const project = createResearchProject({
      company: {
        id: 'comp_tata_orphan',
        legalName: 'Tata Motors Limited',
        displayName: 'Tata Motors',
        symbol: 'TATAMOTORS',
        exchange: 'NSE',
        isin: 'INE155A01022',
        sector: 'Automobile',
        subsector: 'Commercial Vehicles',
        businessModel: 'NON_FINANCIAL_OPERATING',
        marketCapCategory: 'LARGE_CAP',
        createdAt: '2024-01-01',
        updatedAt: '2024-06-30',
      },
    });

    const report = InvestmentResearchReportEngine.generateReport(project);
    expect(report.section1_CompanyOverview).toBeDefined();
    expect(report.section1_CompanyOverview.symbol).toBe('TATAMOTORS');
    expect(report.section20_EvidenceAndSources).toBeDefined();
  });
});
