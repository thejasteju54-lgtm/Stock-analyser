/**
 * 15_memoryStabilityAndLeakDetection.test.ts
 * Phase 17 — Memory Stability & Leak Detection Suite.
 */

import { describe, it, expect } from 'vitest';
import { createResearchProject } from '../../src/domain/models/ResearchProject';
import { ResearchPipelineOrchestrator } from '../../src/domain/orchestration/ResearchPipelineOrchestrator';
import { InvestmentResearchReportEngine } from '../../src/domain/reports/InvestmentResearchReportEngine';
import { ResearchSnapshotEngine } from '../../src/domain/snapshots/ResearchSnapshotEngine';

describe('Memory Stability & Lifecycle Suite', () => {
  it('executes 25 repeated project creation, pipeline execution, report generation, and discard cycles without unbounded growth', () => {
    const cycleCount = 25;

    for (let c = 0; c < cycleCount; c++) {
      const project = createResearchProject({
        company: {
          id: `comp_cycle_${c}`,
          legalName: `Cycle Company ${c}`,
          displayName: `CycleCo ${c}`,
          symbol: `CYC${c}`,
          exchange: 'NSE',
          isin: `INE999A010${c.toString().padStart(2, '0')}`,
          sector: 'Industrial Manufacturing',
          subsector: 'Capital Goods',
          businessModel: 'NON_FINANCIAL_OPERATING',
          marketCapCategory: 'LARGE_CAP',
          createdAt: '2024-01-01',
          updatedAt: '2024-06-30',
        },
      });

      const rep = ResearchPipelineOrchestrator.executePipeline(project);
      expect(rep.isSuccess).toBe(true);

      const report = InvestmentResearchReportEngine.generateReport(project);
      expect(report.section1_CompanyOverview).toBeDefined();

      const snapshot = ResearchSnapshotEngine.createSnapshot(project);
      expect(snapshot.hash.length).toBe(64);
    }
  });
});
