import { describe, it, expect } from 'vitest';
import { AutomatedResearchOrchestrator } from '../../../src/domain/dataAcquisition/AutomatedResearchOrchestrator';

describe('Phase 21 — Automated Research Orchestrator (E2E)', () => {
  it('executes full automated research workflow for Bharat Electronics (BEL) through all 10 stages', async () => {
    const progressStages: string[] = [];

    const report = await AutomatedResearchOrchestrator.executeAutomatedResearch(
      'BEL',
      'DEEP_RESEARCH',
      (stage) => {
        if (stage.status === 'COMPLETED') {
          progressStages.push(stage.stageName);
        }
      }
    );

    expect(report.companyName).toBe('Bharat Electronics');
    expect(report.symbol).toBe('BEL');
    expect(report.mode).toBe('DEEP_RESEARCH');
    expect(report.documentsDiscovered).toBeGreaterThan(0);
    expect(report.financialMetricsReconciled).toBeGreaterThan(0);
    expect(report.completenessPercent).toBeGreaterThanOrEqual(90);
    expect(report.project).toBeDefined();
    expect(report.project.company.symbol).toBe('BEL');
    expect(report.project.documents.length).toBeGreaterThan(0);
    expect(report.project.snapshots).toBeDefined();
    expect(report.project.snapshots!.length).toBeGreaterThan(0);

    expect(progressStages).toContain('Company Identity Verified');
    expect(progressStages).toContain('Sources Discovered');
    expect(progressStages).toContain('Documents Ingested');
    expect(progressStages).toContain('Financial Statements Reconciled');
    expect(progressStages).toContain('News Processed');
    expect(progressStages).toContain('Evidence Graph Constructed');
    expect(progressStages).toContain('Project Initialized');
    expect(progressStages).toContain('Analytical Engines Finished');
    expect(progressStages).toContain('Report & Verdict Ready');
    expect(progressStages).toContain('Research Complete');
  });
});
