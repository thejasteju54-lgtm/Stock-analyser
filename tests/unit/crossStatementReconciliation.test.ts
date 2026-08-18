import { describe, it, expect } from 'vitest';
import { ForensicAccountingEngine } from '../../src/domain/forensics/ForensicAccountingEngine';
import { FinancialFact } from '../../src/domain/extraction/FinancialFactTypes';

describe('Phase 7 — Cross-Statement Consistency & Accounting Bridges', () => {
  const createFact = (metric: string, value: number, category: any = 'INCOME_STATEMENT'): FinancialFact => ({
    factId: `fact_${metric.toLowerCase()}`,
    projectId: 'proj_cross',
    companyId: 'CROSSCO',
    companySymbol: 'CROSSCO',
    documentId: 'doc_ar',
    documentName: 'CROSSCO_AR_FY24.pdf',
    category,
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
    provenanceSourceType: 'PRIMARY_SOURCE_DERIVED',
    sourceReference: { documentId: 'doc_ar', documentTitle: 'CROSSCO Annual Report', pageNumber: 155 },
    confidence: 95,
    confidenceTier: 'HIGH',
    verificationStatus: 'VERIFIED',
    extractedAt: new Date().toISOString(),
  });

  it('1. Reconciles Capex vs Gross PPE additions using CWIP and FX bridge (EXPLAINED_VARIANCE)', () => {
    const facts = [
      createFact('REVENUE', 100000),
      createFact('CAPEX', 8500, 'CASH_FLOW'),
      createFact('PPE', 45000, 'BALANCE_SHEET'),
      createFact('TOTAL_DEBT', 25000, 'BALANCE_SHEET'),
      createFact('INTEREST_EXPENSE', 2200, 'INCOME_STATEMENT'),
    ];

    const report = ForensicAccountingEngine.analyze(
      'proj_cross',
      'CROSSCO',
      'OPERATING_INDUSTRIAL',
      facts,
      [],
      'FY24'
    );

    expect(report.crossStatementChecks.length).toBeGreaterThan(0);
    const ppeCheck = report.crossStatementChecks.find((c) => c.checkId.includes('chk_ppe_capex'));
    expect(ppeCheck).toBeDefined();
    expect(ppeCheck?.status).toBe('EXPLAINED_VARIANCE');
    expect(ppeCheck?.accountingBridgeExplanation).toContain('CWIP capitalization');

    const debtCheck = report.crossStatementChecks.find((c) => c.checkId.includes('chk_debt_int'));
    expect(debtCheck).toBeDefined();
    expect(debtCheck?.status).toBe('CONSISTENT');
  });
});
