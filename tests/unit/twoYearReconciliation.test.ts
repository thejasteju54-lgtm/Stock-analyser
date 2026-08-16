import { describe, it, expect } from 'vitest';
import { TwoYearReconciliation } from '../../src/domain/extraction/TwoYearReconciliation';
import { FinancialFact } from '../../src/domain/extraction/FinancialFactTypes';

describe('Phase 4 — TwoYearReconciliation & Side-by-Side Model Alignment', () => {
  const createFact = (metric: string, label: string, fy: string, value: number, basis: 'CONSOLIDATED' | 'STANDALONE' = 'CONSOLIDATED'): FinancialFact => ({
    factId: `fact_${metric.toLowerCase()}_${fy.toLowerCase()}_${basis.toLowerCase()}`,
    projectId: 'proj_test',
    companyId: 'TATAMOTORS',
    companySymbol: 'TATAMOTORS',
    documentId: `doc_ar_${fy.toLowerCase()}`,
    documentName: `TATAMOTORS_Annual_Report_${fy}.pdf`,
    pageId: `doc_ar_${fy.toLowerCase()}_p124`,
    pageNumber: 124,
    category: 'INCOME_STATEMENT',
    metric,
    metricLabel: label,
    availabilityStatus: 'AVAILABLE',
    value,
    originalValue: value,
    unit: 'INR_CRORE',
    originalUnit: 'INR_CRORE',
    normalizedUnit: 'INR_CRORE',
    originalCurrency: 'INR',
    normalizedCurrency: 'INR',
    reportingPeriod: { fiscalYear: fy, isIdentifiable: true, periodType: 'ANNUAL', rawPeriodString: fy },
    accountingBasis: basis,
    extractionMethod: 'STRUCTURED_TABLE',
    provenanceSourceType: 'PRIMARY_SOURCE_DERIVED',
    sourceReference: {
      documentId: `doc_ar_${fy.toLowerCase()}`,
      documentTitle: `TATAMOTORS_Annual_Report_${fy}.pdf`,
      pageId: `doc_ar_${fy.toLowerCase()}_p124`,
      pageNumber: 124,
    },
    confidence: 96,
    confidenceTier: 'HIGH',
    verificationStatus: 'VERIFIED',
    extractedAt: new Date().toISOString(),
  });

  it('1. Reconciles FY23 (Base) and FY24 (Current) line items side-by-side without computing calculations', () => {
    const revFY23 = createFact('REVENUE', 'Revenue from Operations', 'FY23', 345967);
    const revFY24 = createFact('REVENUE', 'Revenue from Operations', 'FY24', 437928);
    const ebitdaFY23 = createFact('EBITDA', 'Operating EBITDA', 'FY23', 37011);
    const ebitdaFY24 = createFact('EBITDA', 'Operating EBITDA', 'FY24', 62788);

    const reconciled = TwoYearReconciliation.reconcile({
      facts: [revFY23, revFY24, ebitdaFY23, ebitdaFY24],
      fy1Period: 'FY23',
      fy0Period: 'FY24',
      preferredAccountingBasis: 'CONSOLIDATED',
    });

    expect(reconciled.length).toBe(2);

    const revRecord = reconciled.find((r) => r.metric === 'REVENUE');
    expect(revRecord).toBeDefined();
    expect(revRecord?.fy1Fact?.value).toBe(345967);
    expect(revRecord?.fy0Fact?.value).toBe(437928);
    expect(revRecord?.isComparable).toBe(true);

    const ebitdaRecord = reconciled.find((r) => r.metric === 'EBITDA');
    expect(ebitdaRecord?.fy1Fact?.value).toBe(37011);
    expect(ebitdaRecord?.fy0Fact?.value).toBe(62788);
  });

  it('2. Flags non-comparability when an item is reported in only one financial year', () => {
    const singleFact = createFact('NEW_VENTURE_REVENUE', 'New Venture Revenue', 'FY24', 1500);

    const reconciled = TwoYearReconciliation.reconcile({
      facts: [singleFact],
      fy1Period: 'FY23',
      fy0Period: 'FY24',
      preferredAccountingBasis: 'CONSOLIDATED',
    });

    expect(reconciled.length).toBe(1);
    expect(reconciled[0].isComparable).toBe(false);
    expect(reconciled[0].comparabilityNotes).toContain('Reported only in FY24');
  });
});
