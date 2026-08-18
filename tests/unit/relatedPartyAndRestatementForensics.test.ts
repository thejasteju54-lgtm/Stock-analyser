import { describe, it, expect } from 'vitest';
import { ForensicAccountingEngine } from '../../src/domain/forensics/ForensicAccountingEngine';
import { FinancialFact } from '../../src/domain/extraction/FinancialFactTypes';

describe('Phase 7 — Related-Party Disclosures & Prior-Period Restatements', () => {
  const createFact = (metric: string, value: number, category: any = 'INCOME_STATEMENT', label?: string): FinancialFact => ({
    factId: `fact_${metric.toLowerCase()}`,
    projectId: 'proj_rpt',
    companyId: 'RPTCO',
    companySymbol: 'RPTCO',
    documentId: 'doc_ar',
    documentName: 'RPTCO_AR_FY24.pdf',
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
    sourceReference: { documentId: 'doc_ar', documentTitle: 'RPTCO_AR_FY24.pdf', pageNumber: 245 },
    confidence: 95,
    confidenceTier: 'HIGH',
    verificationStatus: 'VERIFIED',
    extractedAt: new Date().toISOString(),
  });

  it('1. Correctly calculates RPT materiality percentage relative to revenue', () => {
    const facts = [
      createFact('REVENUE', 10000),
      createFact('NET_WORTH', 4000),
      createFact('RELATED_PARTY_PURCHASE', 1200, 'RELATED_PARTY', 'Purchases from Promoter Group Entities'),
    ];

    const report = ForensicAccountingEngine.analyze(
      'proj_rpt',
      'RPTCO',
      'OPERATING_INDUSTRIAL',
      facts,
      [],
      'FY24'
    );

    expect(report.relatedPartyTransactions.length).toBeGreaterThan(0);
    const rpt = report.relatedPartyTransactions[0];
    expect(rpt.amount).toBe(1200);
    expect(rpt.percentOfRevenue).toBe(12.0); // 1200 / 10000 = 12%
    expect(rpt.materialityAssessment).toBe('MATERIAL_TRANSACTION');
  });

  it('2. Distinguishes RECLASSIFICATION from ERROR_CORRECTION in Restatements', () => {
    const report = ForensicAccountingEngine.analyze(
      'proj_rpt',
      'RPTCO',
      'OPERATING_INDUSTRIAL',
      [createFact('REVENUE', 10000)],
      [],
      'FY24'
    );

    expect(report.restatements.length).toBeGreaterThan(0);
    const rst = report.restatements[0];
    expect(rst.restatementType).toBe('RECLASSIFICATION');
    expect(rst.varianceAmount).toBe(400);
  });
});
