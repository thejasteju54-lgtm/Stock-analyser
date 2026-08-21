/**
 * 24_productionLikeE2EWorkflow.test.ts
 * Phase 18 — Production-Like End-to-End Workflow Verification Suite.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AuthManager } from '../../src/domain/security/AuthManager';
import { RbacAuthorizationEngine } from '../../src/domain/security/RbacAuthorizationEngine';
import { createResearchProject } from '../../src/domain/models/ResearchProject';
import { ResearchPipelineOrchestrator } from '../../src/domain/orchestration/ResearchPipelineOrchestrator';
import { InvestmentResearchReportEngine } from '../../src/domain/reports/InvestmentResearchReportEngine';
import { ResearchSnapshotEngine } from '../../src/domain/snapshots/ResearchSnapshotEngine';
import { ReportExportService } from '../../src/domain/reports/ReportExportService';
import { ResearchAuditLog } from '../../src/domain/audit/ResearchAuditLog';
import { PersistenceEngine } from '../../src/domain/storage/PersistenceEngine';

describe('Production-Like End-to-End Workflow Suite', () => {
  beforeEach(() => {
    AuthManager.clear();
    RbacAuthorizationEngine.clear();
    PersistenceEngine.clear();
  });

  it('successfully completes the full research lifecycle in a production-configured environment', async () => {
    // 1. User Authentication
    const { session } = AuthManager.createSession('analyst_lead', 'SENIOR_RESEARCH_ANALYST');
    expect(session.token).toBeDefined();

    // 2. Project Creation & Authorization
    const project = createResearchProject({
      company: {
        id: 'comp_tatamotors_e2e',
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

    RbacAuthorizationEngine.registerProjectOwner(project.id, session.userId);
    const authCheck = RbacAuthorizationEngine.authorizeAction(session, 'ANALYSIS_EXECUTE', project.id);
    expect(authCheck.isAuthorized).toBe(true);

    // 3. Execution of Pipeline (Phases 5-13)
    const runResult = ResearchPipelineOrchestrator.executePipeline(project);
    expect(runResult.isSuccess).toBe(true);
    expect(runResult.executedPhases.length).toBeGreaterThan(0);

    // 4. Phase 14 Verdict & Phase 15 Report Generation
    const snapshot = ResearchSnapshotEngine.createSnapshot(project, undefined, 'Prod Release Snapshot');
    expect(snapshot.snapshotId).toBeDefined();

    const report = InvestmentResearchReportEngine.generateReport(project, snapshot.snapshotId);
    expect(report.section2_ExecutiveVerdict.verdict).toBeDefined();
    expect(report.section1_CompanyOverview.symbol).toBe('TATAMOTORS');

    // 5. Exports (HTML, JSON, CSV)
    const htmlExport = ReportExportService.generatePrintHtml(report);
    const jsonExport = ReportExportService.generateJsonExport(report);
    expect(htmlExport.length).toBeGreaterThan(500);
    expect(jsonExport.length).toBeGreaterThan(500);

    // 6. Persistence & Audit Trail
    const saveRes = await PersistenceEngine.saveProjectAtomic(project);
    expect(saveRes.isSuccess).toBe(true);

    const auditLog = new ResearchAuditLog();
    auditLog.appendEvent('SYSTEM', 'REPORT_GENERATED', {
      projectId: project.id,
      snapshotId: snapshot.snapshotId,
    });

    const auditVerification = auditLog.verifyAuditChain();
    expect(auditVerification.isValid).toBe(true);
  });
});
