import { describe, it, expect } from 'vitest';
import { ForensicAccountingEngine } from '../../src/domain/forensics/ForensicAccountingEngine';
import { FinancialFact } from '../../src/domain/extraction/FinancialFactTypes';

describe('Phase 7 — Multi-Denominator Contingent Liability Materiality', () => {
  const createFact = (metric: string, value: number, category: any = 'BALANCE_SHEET', label?: string): FinancialFact => ({
    factId: `fact_${metric.toLowerCase()}`,
    projectId: 'proj_cont',
    companyId: 'CONTCO',
    companySymbol: 'CONTCO',
    documentId: 'doc_ar',
    documentName: 'CONTCO_AR_FY24.pdf',
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
    sourceReference: { documentId: 'doc_ar', documentTitle: 'CONTCO Annual Report', pageNumber: 260 },
    confidence: 95,
    confidenceTier: 'HIGH',
    verificationStatus: 'VERIFIED',
    extractedAt: new Date().toISOString(),
  });

  it('1. Computes contingent liability ratios against Net Worth, Revenue, Cash, and Debt', () => {
    const facts = [
      createFact('REVENUE', 50000, 'INCOME_STATEMENT'),
      createFact('PAT', -1200, 'INCOME_STATEMENT'), // Negative PAT test
      createFact('NET_WORTH', 10000),
      createFact('CASH_AND_EQUIVALENTS', 3000),
      createFact('TOTAL_DEBT', 8000),
      createFact('CONTINGENT_LIABILITY', 2500, 'CONTINGENT_LIABILITY', 'Direct Tax Disputes Under Appeal'),
    ];

    const report = ForensicAccountingEngine.analyze(
      'proj_cont',
      'CONTCO',
      'OPERATING_INDUSTRIAL',
      facts,
      [],
      'FY24'
    );

    expect(report.contingentLiabilities.length).toBeGreaterThan(0);
    const item = report.contingentLiabilities[0];
    expect(item.amount).toBe(2500);
    expect(item.percentOfNetWorth).toBe(25.0); // 2500 / 10000 = 25%
    expect(item.percentOfRevenue).toBe(5.0); // 2500 / 50000 = 5%
    expect(item.percentOfCash).toBe(83.3); // 2500 / 3000 = 83.3%

    // Triggers finding due to Net Worth ratio > 20%
    const contFinding = report.findings.find((f) => f.category === 'CONTINGENT_LIABILITIES');
    expect(contFinding).toBeDefined();
    expect(contFinding?.status).toBe('REQUIRES_INVESTIGATION');
  });
});
