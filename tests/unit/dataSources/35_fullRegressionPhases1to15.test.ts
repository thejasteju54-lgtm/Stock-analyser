/**
 * 35_fullRegressionPhases1to15.test.ts
 * Phase 16 — Comprehensive Regression Verification across Phases 1 through 15.
 */

import { describe, it, expect } from 'vitest';
import { createResearchProject } from '../../../src/domain/models/ResearchProject';
import { ResearchPipelineOrchestrator } from '../../../src/domain/orchestration/ResearchPipelineOrchestrator';
import { EvidenceCompletenessEngine } from '../../../src/domain/readiness/EvidenceCompletenessEngine';
import { ResearchSnapshotEngine } from '../../../src/domain/snapshots/ResearchSnapshotEngine';
import { InvestmentResearchReportEngine } from '../../../src/domain/reports/InvestmentResearchReportEngine';
import { FinancialCalculationEngine } from '../../../src/domain/calculations/FinancialCalculationEngine';
import { FundamentalHealthEngine } from '../../../src/domain/analysis/FundamentalHealthEngine';
import { ForensicAccountingEngine } from '../../../src/domain/forensics/ForensicAccountingEngine';
import { ManagementDnaEngine } from '../../../src/domain/management/ManagementDnaEngine';
import { CatalystRiskMasterEngine } from '../../../src/domain/risks/CatalystRiskMasterEngine';
import { ScenarioMasterEngine } from '../../../src/domain/scenarios/ScenarioMasterEngine';
import { VerdictMasterEngine } from '../../../src/domain/verdict/VerdictMasterEngine';

describe('Comprehensive End-to-End Regression Across Phases 1 to 15 (Phase 16)', () => {
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
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-06-30T00:00:00Z',
    },
  });

  it('verifies full pipeline execution through ResearchPipelineOrchestrator', () => {
    const report = ResearchPipelineOrchestrator.executePipeline(project);
    expect(report.isSuccess).toBe(true);
    expect(report.executedPhases.length).toBeGreaterThanOrEqual(5);
  });

  it('verifies Phase 5 Financial Calculation Engine', () => {
    const metrics = FinancialCalculationEngine.calculateAllMetrics(
      project.id,
      project.company.symbol,
      project.company.businessModel,
      project.facts || []
    );
    expect(Array.isArray(metrics)).toBe(true);
  });

  it('verifies Phase 6 Fundamental Health Engine', () => {
    const health = FundamentalHealthEngine.analyze(
      project.id,
      project.company.symbol,
      project.company.businessModel,
      project.facts || [],
      project.calculatedMetrics || []
    );
    expect(health.dataCompleteness).toBeGreaterThanOrEqual(0);
  });

  it('verifies Phase 7 Forensic Accounting Engine', () => {
    const forensic = ForensicAccountingEngine.analyze(
      project.id,
      project.company.symbol,
      project.company.businessModel,
      project.facts || [],
      project.calculatedMetrics || []
    );
    expect(forensic.overallForensicRisk).toBeDefined();
  });

  it('verifies Phase 8 Management DNA Engine', () => {
    const mgmt = ManagementDnaEngine.analyze(
      project.id,
      project.company.symbol,
      [],
      project.facts || [],
      project.calculatedMetrics || [],
      project.forensicAnalysis
    );
    expect(mgmt.credibilityAssessment.isAssessable).toBeDefined();
  });

  it('verifies Phase 12 Catalysts & Risks Engine', () => {
    const risks = CatalystRiskMasterEngine.execute(project);
    expect(risks.matrixSummary.aggregateRiskRating).toBeDefined();
  });

  it('verifies Phase 13 Scenario Modeling Engine', () => {
    const scen = ScenarioMasterEngine.generateScenarioReport(project);
    expect(Object.keys(scen.scenarios).length).toBe(3);
  });

  it('verifies Phase 14 Investment Verdict Engine', () => {
    const verdict = VerdictMasterEngine.generateVerdictReport(project);
    expect(verdict.verdict).toBeDefined();
    expect(verdict.convictionScore).toBeGreaterThanOrEqual(0);
  });

  it('verifies Phase 15 Completeness, Snapshots, and 22-Section Report Delivery', () => {
    const comp = EvidenceCompletenessEngine.evaluateProjectCompleteness(project);
    expect(Object.keys(comp.pillars).length).toBe(11);

    const snap = ResearchSnapshotEngine.createSnapshot(project);
    expect(snap.snapshotId).toBeDefined();
    expect(snap.hash.length).toBe(64);

    const report = InvestmentResearchReportEngine.generateReport(project, snap.snapshotId);
    expect(report.reproducibilityChecksum.length).toBe(64);
    expect(report.section1_CompanyOverview.symbol).toBe('TATAMOTORS');
    expect(report.section22_SnapshotAuditMetadata).toBeDefined();
  });
});
