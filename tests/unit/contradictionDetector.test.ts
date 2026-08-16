import { describe, it, expect } from 'vitest';
import { ContradictionDetector } from '../../src/domain/extraction/ContradictionDetector';
import { FinancialFact } from '../../src/domain/extraction/FinancialFactTypes';

describe('Phase 4 — ContradictionDetector & Discrepancy Classification', () => {
  const baseFact: FinancialFact = {
    factId: 'fact_tatamotors_rev_fy24_primary',
    projectId: 'proj_test',
    companyId: 'TATAMOTORS',
    companySymbol: 'TATAMOTORS',
    documentId: 'doc_ar_fy24',
    documentName: 'TATAMOTORS_Annual_Report_FY24.pdf',
    pageId: 'doc_ar_fy24_page_124',
    pageNumber: 124,
    category: 'INCOME_STATEMENT',
    metric: 'REVENUE',
    metricLabel: 'Revenue from Operations',
    availabilityStatus: 'AVAILABLE',
    value: 437928,
    originalValue: 437928,
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
      pageId: 'doc_ar_fy24_page_124',
      pageNumber: 124,
      rawSnippet: 'Revenue from operations: ₹4,37,928 Cr',
    },
    confidence: 98,
    confidenceTier: 'HIGH',
    verificationStatus: 'VERIFIED',
    extractedAt: new Date().toISOString(),
  };

  it('1. MATCH: detects exact or negligible variance (<0.05%) across documents', () => {
    const identicalFact: FinancialFact = {
      ...baseFact,
      factId: 'fact_tatamotors_rev_fy24_duplicate_source',
      documentName: 'TATAMOTORS_Investor_Presentation_FY24.pdf',
      value: 437928,
    };

    const analysis = ContradictionDetector.analyzePair(baseFact, identicalFact);
    expect(analysis.discrepancyType).toBe('MATCH');
    expect(analysis.difference).toBe(0);
  });

  it('2. ROUNDING_VARIANCE: classifies minor rounding differences (0.05% - 0.5%)', () => {
    const roundedFact: FinancialFact = {
      ...baseFact,
      factId: 'fact_tatamotors_rev_fy24_rounded',
      documentName: 'News_Release_FY24.pdf',
      value: 439000, // 0.24% difference (between 0.05% and 0.5%)
    };

    const analysis = ContradictionDetector.analyzePair(baseFact, roundedFact);
    expect(analysis.discrepancyType).toBe('ROUNDING_VARIANCE');
    expect(analysis.percentageDiff).toBeLessThanOrEqual(0.5);
  });

  it('3. ACCOUNTING_BASIS_VARIANCE: large difference caused by consolidated/standalone basis is NOT classified as conflict', () => {
    const standaloneFact: FinancialFact = {
      ...baseFact,
      factId: 'fact_tatamotors_rev_fy24_standalone',
      documentName: 'TATAMOTORS_Standalone_AR_FY24.pdf',
      accountingBasis: 'STANDALONE',
      value: 73000, // Standalone revenue is ~83% lower than consolidated
    };

    const analysis = ContradictionDetector.analyzePair(baseFact, standaloneFact);
    expect(analysis.discrepancyType).toBe('ACCOUNTING_BASIS_VARIANCE');
    expect(analysis.explanation).toContain('Accounting basis variance');
    expect(analysis.defaultResolutionStatus).toBe('RESOLVED_CONSOLIDATED');
  });

  it('4. RESTATEMENT: large difference caused by subsequent annual report restatement is classified as RESTATEMENT', () => {
    const restatedFact: FinancialFact = {
      ...baseFact,
      factId: 'fact_tatamotors_rev_fy24_restated',
      documentId: 'doc_ar_fy25',
      documentName: 'TATAMOTORS_Annual_Report_FY25.pdf', // Next year's report restating FY24
      value: 442000, // Significant restatement (> 0.5%)
    };

    const analysis = ContradictionDetector.analyzePair(baseFact, restatedFact);
    expect(analysis.discrepancyType).toBe('RESTATEMENT');
    expect(analysis.explanation).toContain('Financial figure restatement detected');
    expect(analysis.defaultResolutionStatus).toBe('RESOLVED_RESTATED');
  });

  it('5. PERIOD_VARIANCE: large difference caused by period mismatch (Annual vs Quarterly) is classified as PERIOD_VARIANCE', () => {
    const quarterlyFact: FinancialFact = {
      ...baseFact,
      factId: 'fact_tatamotors_rev_q4fy24',
      documentName: 'TATAMOTORS_Q4FY24_Results.pdf',
      reportingPeriod: { fiscalYear: 'FY24', quarter: 'Q4', isIdentifiable: true, periodType: 'QUARTERLY', rawPeriodString: 'Q4FY24' },
      value: 119986, // Q4 standalone quarter vs full year
    };

    const analysis = ContradictionDetector.analyzePair(baseFact, quarterlyFact);
    expect(analysis.discrepancyType).toBe('PERIOD_VARIANCE');
    expect(analysis.explanation).toContain('Period mismatch');
    expect(analysis.defaultResolutionStatus).toBe('OPEN');
  });

  it('6. UNIT_VARIANCE: unit difference (e.g. Lakhs truncation or currency divergence) is classified as UNIT_VARIANCE', () => {
    const unitVariantFact: FinancialFact = {
      ...baseFact,
      factId: 'fact_tatamotors_rev_lakhs',
      originalUnit: 'INR_LAKH',
      originalValue: 43792800,
      value: 437930, // Truncation difference from lakh scaling (< 2.0%)
    };

    const analysis = ContradictionDetector.analyzePair(baseFact, unitVariantFact);
    expect(analysis.discrepancyType).toBe('UNIT_VARIANCE');
    expect(analysis.explanation).toContain('Unit conversion precision difference');
  });

  it('7. SOURCE_DEFINITION_VARIANCE: primary filing vs screenshot difference is investigated as definition variance', () => {
    const screenshotFact: FinancialFact = {
      ...baseFact,
      factId: 'fact_tatamotors_rev_fy24_screenshot',
      documentName: 'Screener_TATAMOTORS_Ratios.png',
      provenanceSourceType: 'SCREENSHOT_DERIVED',
      extractionMethod: 'SCREENSHOT_DERIVED',
      value: 435000,
    };

    const analysis = ContradictionDetector.analyzePair(baseFact, screenshotFact);
    expect(analysis.discrepancyType).toBe('SOURCE_DEFINITION_VARIANCE');
    expect(analysis.explanation).toContain('Source definition divergence');
    expect(analysis.defaultResolutionStatus).toBe('RESOLVED_PREFER_PRIMARY');
  });

  it('8. MATERIAL_CONFLICT: genuine same-context material conflict between verified sources flags for analyst resolution', () => {
    const conflictingFact: FinancialFact = {
      ...baseFact,
      factId: 'fact_tatamotors_rev_fy24_conflict',
      documentName: 'TATAMOTORS_Annual_Report_FY24_RevisionB.pdf',
      value: 390000, // Large unexplained divergence > 10% between verified same-basis primary sources
    };

    const analysis = ContradictionDetector.analyzePair(baseFact, conflictingFact);
    expect(analysis.discrepancyType).toBe('MATERIAL_CONFLICT');
    expect(analysis.defaultResolutionStatus).toBe('REQUIRES_ANALYST_CHOICE');
  });

  it('9. UNRESOLVED: unverified or ambiguous discrepancy is classified as UNRESOLVED rather than forcing conflict', () => {
    const unverifiedFact: FinancialFact = {
      ...baseFact,
      factId: 'fact_unverified_source',
      documentName: 'Unknown_Source_Scrap.txt',
      confidence: 40,
      verificationStatus: 'UNVERIFIED',
      extractionMethod: 'OCR_DERIVED',
      value: 350000,
    };

    const analysis = ContradictionDetector.analyzePair(baseFact, unverifiedFact);
    expect(analysis.discrepancyType).toBe('UNRESOLVED');
    expect(analysis.explanation).toContain('Unresolved discrepancy');
    expect(analysis.defaultResolutionStatus).toBe('REQUIRES_ANALYST_CHOICE');
  });

  it('10. detectContradictions: groups and preserves all conflicting facts in structured records', () => {
    const screenshotFact: FinancialFact = {
      ...baseFact,
      factId: 'fact_tatamotors_rev_fy24_ss',
      documentName: 'Screener.png',
      provenanceSourceType: 'SCREENSHOT_DERIVED',
      value: 435000,
    };

    const contradictions = ContradictionDetector.detectContradictions([baseFact, screenshotFact]);
    expect(contradictions.length).toBe(1);
    expect(contradictions[0].factA.factId).toBe(baseFact.factId);
    expect(contradictions[0].factB.factId).toBe(screenshotFact.factId);
  });
});
