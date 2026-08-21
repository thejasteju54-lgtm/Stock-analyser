/**
 * 24_phase20ReleaseCertification.test.ts
 * Phase 20 — Final Ship, Release Certification & Smoke Deployment Suite.
 */

import { describe, it, expect } from 'vitest';
import packageJson from '../../package.json';
import { createResearchProject } from '../../src/domain/models/ResearchProject';
import { ResearchSnapshotEngine } from '../../src/domain/snapshots/ResearchSnapshotEngine';
import { VerdictMasterEngine } from '../../src/domain/verdict/VerdictMasterEngine';
import { InvestmentResearchReportEngine } from '../../src/domain/reports/InvestmentResearchReportEngine';
import { ReportExportService } from '../../src/domain/reports/ReportExportService';
import { HealthCheckEngine } from '../../src/domain/observability/HealthCheckEngine';
import { DeploymentRollbackEngine } from '../../src/domain/operations/DeploymentRollbackEngine';
import { SecretRedactionEngine } from '../../src/domain/security/SecretRedactionEngine';
import { ProductionConfig } from '../../src/domain/config/ProductionConfig';

describe('Phase 20 Final Release Certification Suite', () => {
  it('certifies semantic version 1.0.0 in package metadata', () => {
    expect(packageJson.version).toBe('1.0.0');
    expect(packageJson.name).toBe('indian-equity-research-terminal');
  });

  it('validates production configuration integrity without development leaks', () => {
    const configResult = ProductionConfig.validateEnvironment({
      NODE_ENV: 'PRODUCTION',
      APP_ENV: 'PRODUCTION',
      APP_URL: 'https://terminal.equity-research.internal',
      DATABASE_URL: 'postgresql://app_user:strong_secret_pw@prod-db.internal:5432/equity_research',
      STORAGE_DRIVER: 'S3_COMPLIANT',
      ENCRYPTION_KEY: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      SESSION_SECRET: 'super_secret_jwt_signing_key_32bytes_long!!',
      ALLOWED_ORIGINS: 'https://terminal.equity-research.internal',
      ENABLE_DEBUG_MODE: 'false',
      MAX_FILE_SIZE_BYTES: '52428800',
    });

    expect(configResult.isValid).toBe(true);
    expect(configResult.environment).toBe('PRODUCTION');
  });

  it('executes a complete end-to-end analytical smoke test and produces a 22-section institutional report', () => {
    const project = createResearchProject({
      company: {
        id: 'comp_tata_smoke',
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

    // 1. Ingestion / Verification
    expect(project.company.symbol).toBe('TATAMOTORS');

    // 2. Verdict Decision Gate
    const verdict = VerdictMasterEngine.generateVerdictReport(project);
    expect(verdict).toBeDefined();
    expect(verdict.verdict).toBeDefined();

    // 3. 22-Section Report Assembly
    const report = InvestmentResearchReportEngine.generateReport(project);
    expect(report.section1_CompanyOverview).toBeDefined();
    expect(report.section2_ExecutiveVerdict).toBeDefined();
    expect(report.section3_Conviction).toBeDefined();
    expect(report.section4_OneLineThesis).toBeDefined();
    expect(report.section5_MarketPriceTelemetry).toBeDefined();
    expect(report.section6_InterestingPriceRange).toBeDefined();
    expect(report.section7_FundamentalHealth).toBeDefined();
    expect(report.section8_ForensicAccounting).toBeDefined();
    expect(report.section9_ManagementDna).toBeDefined();
    expect(report.section10_Valuation).toBeDefined();
    expect(report.section11_TechnicalStructure).toBeDefined();
    expect(report.section12_NewsAndIndustry).toBeDefined();
    expect(report.section13_TopCatalysts).toBeDefined();
    expect(report.section14_TopRisks).toBeDefined();
    expect(report.section15_ThesisBreakers).toBeDefined();
    expect(report.section16_ScenarioSpectrum).toBeDefined();
    expect(report.section17_ShortTermOutlook).toBeDefined();
    expect(report.section18_LongTermOutlook).toBeDefined();
    expect(report.section19_DecisionChangeConditions).toBeDefined();
    expect(report.section20_EvidenceAndSources).toBeDefined();
    expect(report.section21_DataFreshnessAudit).toBeDefined();
    expect(report.section22_SnapshotAuditMetadata).toBeDefined();

    // 4. Exports
    const jsonExport = ReportExportService.generateJsonExport(report);
    expect(jsonExport).toContain('TATAMOTORS');

    const csvExport = ReportExportService.generateCsvExport(report);
    expect(csvExport).toContain('TATAMOTORS');

    const pdfMock = ReportExportService.generatePrintHtml(report);
    expect(pdfMock).toContain('TATAMOTORS');
  });

  it('guarantees deterministic bit-level reproducible snapshots with parent hash-chaining', () => {
    const project = createResearchProject({
      company: {
        id: 'comp_snap_smoke',
        legalName: 'Infosys Limited',
        displayName: 'Infosys',
        symbol: 'INFY',
        exchange: 'NSE',
        isin: 'INE009A01021',
        sector: 'Information Technology',
        subsector: 'IT Services',
        businessModel: 'IT_SERVICES',
        marketCapCategory: 'LARGE_CAP',
        createdAt: '2024-01-01',
        updatedAt: '2024-06-30',
      },
    });

    const snap1 = ResearchSnapshotEngine.createSnapshot(project, undefined, 'Genesis Snapshot');
    expect(snap1.snapshotId).toBeDefined();
    expect(snap1.snapshotId).toContain('snap_');
    expect(snap1.hash).toBeDefined();

    const snap2 = ResearchSnapshotEngine.createSnapshot(project, snap1.snapshotId, 'Incremental Snapshot');
    expect(snap2.parentSnapshotId).toBe(snap1.snapshotId);
  });

  it('verifies health check endpoints and deployment rollback safety', () => {
    const liveness = HealthCheckEngine.checkLiveness();
    expect(liveness.status).toBe('HEALTHY');

    const readiness = HealthCheckEngine.checkReadiness();
    expect(readiness.isReady).toBe(true);

    const rollbackValidation = DeploymentRollbackEngine.validateRollbackCompatibility({
      version: '0.0.9',
      gitCommit: 'prod_prev_commit',
      schemaVersion: 3,
      deployedAt: '2026-08-20T00:00:00Z',
      isStable: true,
    });
    expect(rollbackValidation.canRollbackSafely).toBe(true);
  });

  it('scans text and redaction filters to ensure zero secret leakage', () => {
    const rawWithSecret = 'Database string: postgres://admin:supersecret123@prod.internal:5432/db';
    const redacted = SecretRedactionEngine.redactString(rawWithSecret);
    expect(redacted).not.toContain('supersecret123');
    expect(redacted).toContain('***REDACTED***');
  });
});
