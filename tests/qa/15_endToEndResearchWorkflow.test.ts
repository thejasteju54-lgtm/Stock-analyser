/**
 * 15_endToEndResearchWorkflow.test.ts
 * QA Track: Complete End-to-End Autonomous Pipeline & Report Generation.
 */

import { describe, it, expect } from 'vitest';
import { createResearchProject } from '../../src/domain/models/ResearchProject';
import { ResearchPipelineOrchestrator } from '../../src/domain/orchestration/ResearchPipelineOrchestrator';
import { InvestmentResearchReportEngine } from '../../src/domain/reports/InvestmentResearchReportEngine';
import { ResearchSnapshotEngine } from '../../src/domain/snapshots/ResearchSnapshotEngine';

describe('End-to-End Research Workflow QA', () => {
  it('executes full pipeline from initial project state to snapshot and 22-section institutional report', () => {
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

    const executionReport = ResearchPipelineOrchestrator.executePipeline(project);
    expect(executionReport.isSuccess).toBe(true);

    const report = InvestmentResearchReportEngine.generateReport(project);
    expect(report.section1_CompanyOverview).toBeDefined();
    expect(report.section2_ExecutiveVerdict).toBeDefined();
    expect(report.section3_Conviction).toBeDefined();

    const snapshot = ResearchSnapshotEngine.createSnapshot(project);
    expect(snapshot.snapshotId).toBeDefined();
    expect(snapshot.hash.length).toBe(64);
  });
});
