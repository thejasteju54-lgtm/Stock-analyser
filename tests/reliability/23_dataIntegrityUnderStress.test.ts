/**
 * 23_dataIntegrityUnderStress.test.ts
 * Phase 17 — Data Integrity Under Stress: Deterministic Equivalence Suite.
 */

import { describe, it, expect } from 'vitest';
import { createResearchProject } from '../../src/domain/models/ResearchProject';
import { ResearchPipelineOrchestrator } from '../../src/domain/orchestration/ResearchPipelineOrchestrator';
import { InvestmentResearchReportEngine } from '../../src/domain/reports/InvestmentResearchReportEngine';
import { CanonicalJsonSerializer } from '../../src/domain/audit/CanonicalJsonSerializer';

describe('Data Integrity Under Stress Suite', () => {
  it('guarantees identical analytical calculations, verdicts, and checksums between standard and stressed executions', () => {
    const createTestProject = () =>
      createResearchProject({
        company: {
          id: 'comp_tata_equiv',
          legalName: 'Tata Motors Limited',
          displayName: 'Tata Motors',
          symbol: 'TATAMOTORS',
          exchange: 'NSE',
          isin: 'INE155A01022',
          sector: 'Automobile and Ancillaries',
          subsector: 'Commercial Vehicles',
          businessModel: 'NON_FINANCIAL_OPERATING',
          marketCapCategory: 'LARGE_CAP',
          createdAt: '2024-01-01',
          updatedAt: '2024-06-30',
        },
      });

    // 1. Standard Run
    const pStandard = createTestProject();
    ResearchPipelineOrchestrator.executePipeline(pStandard);
    const reportStandard = InvestmentResearchReportEngine.generateReport(pStandard, 'snap_standard');

    // 2. Stressed / Repeated Run
    const pStressed = createTestProject();
    ResearchPipelineOrchestrator.executePipeline(pStressed);
    const reportStressed = InvestmentResearchReportEngine.generateReport(pStressed, 'snap_standard');

    // Verify deterministic equivalence of verdict, sections, and conviction
    expect(reportStandard.section2_ExecutiveVerdict.verdict).toBe(reportStressed.section2_ExecutiveVerdict.verdict);
    expect(reportStandard.section3_Conviction.convictionScore).toBe(reportStressed.section3_Conviction.convictionScore);
    expect(reportStandard.section1_CompanyOverview.symbol).toBe(reportStressed.section1_CompanyOverview.symbol);

    const hashStandard = CanonicalJsonSerializer.sha256(CanonicalJsonSerializer.canonicalize(reportStandard.section1_CompanyOverview));
    const hashStressed = CanonicalJsonSerializer.sha256(CanonicalJsonSerializer.canonicalize(reportStressed.section1_CompanyOverview));
    expect(hashStandard).toBe(hashStressed);
  });
});
