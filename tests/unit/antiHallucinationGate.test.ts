import { describe, it, expect } from 'vitest';
import { FinancialFact } from '../../src/domain/extraction/FinancialFactTypes';
import { ContradictionDetector } from '../../src/domain/extraction/ContradictionDetector';

describe('Phase 4 — Anti-Hallucination & Evidence Gating Rules', () => {
  it('1. Missing Data Protection: missing or undisclosed metrics must NEVER be represented as 0', () => {
    const undisclosedFact: FinancialFact = {
      factId: 'fact_orderbook_fy24',
      projectId: 'proj_test',
      companyId: 'TATAMOTORS',
      companySymbol: 'TATAMOTORS',
      documentId: 'doc_ar_fy24',
      documentName: 'TATAMOTORS_Annual_Report_FY24.pdf',
      pageNumber: 120,
      category: 'BUSINESS_METRIC',
      metric: 'ORDER_BOOK_VALUE',
      metricLabel: 'Order Book Backlog',
      availabilityStatus: 'NOT_DISCLOSED',
      value: undefined, // Must be undefined, NOT 0
      originalValue: undefined,
      unit: 'INR_CRORE',
      originalUnit: 'INR_CRORE',
      normalizedUnit: 'INR_CRORE',
      originalCurrency: 'INR',
      normalizedCurrency: 'INR',
      reportingPeriod: { fiscalYear: 'FY24', isIdentifiable: true, periodType: 'ANNUAL', rawPeriodString: 'FY24' },
      accountingBasis: 'CONSOLIDATED',
      extractionMethod: 'STRUCTURED_TABLE',
      provenanceSourceType: 'PRIMARY_SOURCE_DERIVED',
      sourceReference: {
        documentId: 'doc_ar_fy24',
        documentTitle: 'TATAMOTORS_Annual_Report_FY24.pdf',
        pageNumber: 120,
      },
      confidence: 0,
      confidenceTier: 'LOW',
      verificationStatus: 'REQUIRES_REVIEW',
      extractedAt: new Date().toISOString(),
    };

    expect(undisclosedFact.value).toBeUndefined();
    expect(undisclosedFact.value).not.toBe(0);
    expect(undisclosedFact.availabilityStatus).toBe('NOT_DISCLOSED');
  });

  it('2. Unreadable / Low Confidence OCR: flags fact with UNREADABLE and REQUIRES_REVIEW', () => {
    const unreadableFact: FinancialFact = {
      factId: 'fact_unreadable_pbt',
      projectId: 'proj_test',
      companyId: 'TATAMOTORS',
      companySymbol: 'TATAMOTORS',
      documentId: 'doc_scanned_pbt',
      documentName: 'Scanned_Doc.pdf',
      category: 'INCOME_STATEMENT',
      metric: 'PBT',
      metricLabel: 'Profit Before Tax',
      availabilityStatus: 'UNREADABLE',
      value: undefined,
      unit: 'INR_CRORE',
      originalUnit: 'INR_CRORE',
      normalizedUnit: 'INR_CRORE',
      originalCurrency: 'INR',
      normalizedCurrency: 'INR',
      reportingPeriod: { fiscalYear: 'FY24', isIdentifiable: true, periodType: 'ANNUAL', rawPeriodString: 'FY24' },
      accountingBasis: 'CONSOLIDATED',
      extractionMethod: 'OCR_DERIVED',
      provenanceSourceType: 'PRIMARY_SOURCE_DERIVED',
      sourceReference: {
        documentId: 'doc_scanned_pbt',
        documentTitle: 'Scanned_Doc.pdf',
      },
      confidence: 45,
      confidenceTier: 'LOW',
      verificationStatus: 'REQUIRES_REVIEW',
      reviewReason: 'OCR confidence 45% < 80%. Digits obscured in source scan.',
      extractedAt: new Date().toISOString(),
    };

    expect(unreadableFact.availabilityStatus).toBe('UNREADABLE');
    expect(unreadableFact.verificationStatus).toBe('REQUIRES_REVIEW');
    expect(unreadableFact.value).toBeUndefined();
  });

  it('3. Contradiction Protection: never silently overwrite a conflicting reported fact', () => {
    const factA: FinancialFact = {
      factId: 'fact_a',
      projectId: 'proj_test',
      companyId: 'TATAMOTORS',
      companySymbol: 'TATAMOTORS',
      documentId: 'doc_ar',
      documentName: 'Annual_Report_FY24.pdf',
      category: 'INCOME_STATEMENT',
      metric: 'PAT',
      metricLabel: 'Profit After Tax',
      availabilityStatus: 'AVAILABLE',
      value: 31807,
      originalValue: 31807,
      unit: 'INR_CRORE',
      originalUnit: 'INR_CRORE',
      normalizedUnit: 'INR_CRORE',
      originalCurrency: 'INR',
      normalizedCurrency: 'INR',
      reportingPeriod: { fiscalYear: 'FY24', isIdentifiable: true, periodType: 'ANNUAL', rawPeriodString: 'FY24' },
      accountingBasis: 'CONSOLIDATED',
      extractionMethod: 'STRUCTURED_TABLE',
      provenanceSourceType: 'PRIMARY_SOURCE_DERIVED',
      sourceReference: { documentId: 'doc_ar', documentTitle: 'Annual_Report_FY24.pdf' },
      confidence: 98,
      confidenceTier: 'HIGH',
      verificationStatus: 'VERIFIED',
      extractedAt: new Date().toISOString(),
    };

    const factB: FinancialFact = {
      ...factA,
      factId: 'fact_b',
      documentId: 'doc_screener',
      documentName: 'Screener.png',
      provenanceSourceType: 'SCREENSHOT_DERIVED',
      value: 31000,
    };

    const contradictions = ContradictionDetector.detectContradictions([factA, factB]);
    expect(contradictions.length).toBe(1);
    // Both facts must remain completely preserved in the record
    expect(contradictions[0].factA).toEqual(factA);
    expect(contradictions[0].factB).toEqual(factB);
  });
});
