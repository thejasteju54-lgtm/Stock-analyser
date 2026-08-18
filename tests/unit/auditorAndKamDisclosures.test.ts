import { describe, it, expect } from 'vitest';
import { ForensicAccountingEngine } from '../../src/domain/forensics/ForensicAccountingEngine';
import { FinancialFact } from '../../src/domain/extraction/FinancialFactTypes';

describe('Phase 7 — Auditor Disclosures & Non-Escalating KAM Forensics', () => {
  const createFact = (metric: string, value: number, label?: string, category: any = 'INCOME_STATEMENT'): FinancialFact => ({
    factId: `fact_${metric.toLowerCase()}`,
    projectId: 'proj_aud',
    companyId: 'AUDCO',
    companySymbol: 'AUDCO',
    documentId: 'doc_ar',
    documentName: 'AUDCO_AR_FY24.pdf',
    category,
    metric,
    metricLabel: label || metric,
    availabilityStatus: 'AVAILABLE',
    value,
    originalValue: value,
    unit: 'INR_CRORE',
    originalUnit: 'INR_CRORE',
    normalizedUnit: 'INR_CRORE',
    originalCurrency: 'INR',
    normalizedCurrency: 'INR',
    reportingPeriod: { fiscalYear: 'FY24', isIdentifiable: true, periodType: 'ANNUAL', rawPeriodString: 'FY24' },
    accountingBasis: 'CONSOLIDATED',
    extractionMethod: 'STRUCTURED_TABLE',
    provenanceSourceType: 'PRIMARY_SOURCE_DERIVED',
    sourceReference: { documentId: 'doc_ar', documentTitle: 'AUDCO Annual Report', pageNumber: 170 },
    confidence: 98,
    confidenceTier: 'HIGH',
    verificationStatus: 'VERIFIED',
    extractedAt: new Date().toISOString(),
  });

  it('1. Unmodified audit opinion with standard KAM topics does NOT escalate forensic risk score', () => {
    const facts = [
      createFact('REVENUE', 10000),
      createFact('NET_WORTH', 6000),
      createFact('AUDITOR_OPINION', 1, 'Unmodified Opinion with 3 Key Audit Matters', 'AUDITOR'),
    ];

    const report = ForensicAccountingEngine.analyze(
      'proj_aud',
      'AUDCO',
      'OPERATING_INDUSTRIAL',
      facts,
      [],
      'FY24'
    );

    expect(report.auditorDisclosures.length).toBeGreaterThan(0);
    const aud = report.auditorDisclosures[0];
    expect(aud.auditOpinion).toBe('UNMODIFIED');
    expect(aud.keyAuditMattersCount).toBe(3);

    // KAM presence should not produce a HIGH/CRITICAL finding
    const auditFinding = report.findings.find((f) => f.category === 'AUDITOR_DISCLOSURES');
    expect(auditFinding).toBeUndefined(); // Remains clean observation
    expect(report.overallForensicRisk).not.toBe('HIGH');
  });

  it('2. Qualified audit opinion triggers CRITICAL finding and MATERIAL_CONCERN status', () => {
    const facts = [
      createFact('REVENUE', 10000),
      createFact('NET_WORTH', 6000),
      createFact('AUDITOR_QUALIFICATION', 1, 'Auditor Qualified Opinion on Asset Carrying Value', 'AUDITOR'),
    ];

    const report = ForensicAccountingEngine.analyze(
      'proj_aud',
      'AUDCO',
      'OPERATING_INDUSTRIAL',
      facts,
      [],
      'FY24'
    );

    const auditFinding = report.findings.find((f) => f.category === 'AUDITOR_DISCLOSURES');
    expect(auditFinding).toBeDefined();
    expect(auditFinding?.severity).toBe('CRITICAL');
    expect(auditFinding?.status).toBe('MATERIAL_CONCERN');
  });
});
