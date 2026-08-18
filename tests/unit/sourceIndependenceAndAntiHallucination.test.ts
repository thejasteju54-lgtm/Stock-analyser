import { describe, it, expect } from 'vitest';
import { ForensicAccountingEngine } from '../../src/domain/forensics/ForensicAccountingEngine';
import { FinancialFact } from '../../src/domain/extraction/FinancialFactTypes';

describe('Phase 7 — Source Lineage & Anti-Hallucination Guardrails', () => {
  const createFact = (metric: string, value: number, srcType: any = 'PRIMARY_SOURCE_DERIVED'): FinancialFact => ({
    factId: `fact_${metric.toLowerCase()}`,
    projectId: 'proj_guard',
    companyId: 'GUARDCO',
    companySymbol: 'GUARDCO',
    documentId: 'doc_ar',
    documentName: 'GUARDCO_AR_FY24.pdf',
    category: 'INCOME_STATEMENT',
    metric,
    metricLabel: metric,
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
    provenanceSourceType: srcType,
    sourceReference: { documentId: 'doc_ar', documentTitle: 'GUARDCO_AR_FY24.pdf', pageNumber: 1 },
    confidence: 95,
    confidenceTier: 'HIGH',
    verificationStatus: 'VERIFIED',
    extractedAt: new Date().toISOString(),
  });

  it('1. Does not fabricate findings or unverified claims when facts are missing', () => {
    const report = ForensicAccountingEngine.analyze(
      'proj_guard',
      'GUARDCO',
      'OPERATING_INDUSTRIAL',
      [createFact('REVENUE', 1000)], // Minimal data
      [],
      'FY24'
    );

    expect(report.isAssessable).toBe(false);
    expect(report.confidence).toBe('NOT_ASSESSABLE');
    expect(report.dataCompleteness).toBeLessThan(35);
  });
});
