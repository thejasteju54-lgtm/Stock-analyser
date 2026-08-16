import { describe, it, expect } from 'vitest';
import { FinancialCalculationEngine } from '../../src/domain/calculations/FinancialCalculationEngine';
import { FinancialFact } from '../../src/domain/extraction/FinancialFactTypes';
import { CALCULATION_VERSION, METHODOLOGY_VERSION } from '../../src/domain/calculations/FormulaRegistry';

describe('Phase 5 — Calculation Provenance, Versioning & No-NaN Integrity', () => {
  const createFact = (metric: string, value: number | undefined, fy: string = 'FY24', page: number = 105): FinancialFact => ({
    factId: `fact_${metric.toLowerCase()}_${fy.toLowerCase()}`,
    projectId: 'proj_tatamotors_test',
    companyId: 'TATAMOTORS',
    companySymbol: 'TATAMOTORS',
    documentId: `doc_ar_${fy}`,
    documentName: `TATAMOTORS_Annual_Report_${fy}.pdf`,
    category: 'INCOME_STATEMENT',
    metric,
    metricLabel: metric,
    availabilityStatus: value !== undefined ? 'AVAILABLE' : 'NOT_FOUND',
    value,
    originalValue: value,
    unit: 'INR_CRORE',
    originalUnit: 'INR_CRORE',
    normalizedUnit: 'INR_CRORE',
    originalCurrency: 'INR',
    normalizedCurrency: 'INR',
    reportingPeriod: { fiscalYear: fy, isIdentifiable: true, periodType: 'ANNUAL', rawPeriodString: fy },
    accountingBasis: 'CONSOLIDATED',
    extractionMethod: 'STRUCTURED_TABLE',
    provenanceSourceType: 'PRIMARY_SOURCE_DERIVED',
    sourceReference: { documentId: `doc_ar_${fy}`, documentTitle: `TATAMOTORS_AR_${fy}.pdf`, pageNumber: page },
    pageNumber: page,
    confidence: 98,
    confidenceTier: 'HIGH',
    verificationStatus: 'VERIFIED',
    extractedAt: new Date().toISOString(),
  });

  it('1. Multi-Hop Provenance: preserves exact input fact IDs, document names, and page numbers', () => {
    const facts = [
      createFact('REVENUE', 437928, 'FY24', 110),
      createFact('EBITDA', 62145, 'FY24', 112),
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_1', 'TATAMOTORS', 'AUTO_OEM', facts, 'FY24');
    const ebitdaMargin = metrics.find((m) => m.metricCode === 'EBITDA_MARGIN');

    expect(ebitdaMargin).toBeDefined();
    expect(ebitdaMargin?.inputFactIds).toContain('fact_revenue_fy24');
    expect(ebitdaMargin?.inputFactIds).toContain('fact_ebitda_fy24');
    expect(ebitdaMargin?.inputFactsSummary.length).toBe(2);

    const revSummary = ebitdaMargin?.inputFactsSummary.find((s) => s.metric === 'REVENUE');
    expect(revSummary?.documentName).toBe('TATAMOTORS_Annual_Report_FY24.pdf');
    expect(revSummary?.pageNumber).toBe(110);
    expect(revSummary?.value).toBe(437928);
  });

  it('2. Versioning: attaches calculationVersion and methodologyVersion to all calculated metrics', () => {
    const facts = [createFact('REVENUE', 437928, 'FY24')];
    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_1', 'TATAMOTORS', 'AUTO_OEM', facts, 'FY24');

    for (const m of metrics) {
      expect(m.calculationVersion).toBe(CALCULATION_VERSION);
      expect(m.methodologyVersion).toBe(METHODOLOGY_VERSION);
    }
  });

  it('3. Mathematical Safety: never produces NaN, Infinity, or unhandled numeric anomalies', () => {
    const facts = [
      createFact('REVENUE', 0, 'FY24'),
      createFact('EBITDA', 0, 'FY24'),
      createFact('PAT', 0, 'FY24'),
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_1', 'TATAMOTORS', 'AUTO_OEM', facts, 'FY24', 'FY23');

    for (const m of metrics) {
      if (m.value !== undefined) {
        expect(Number.isNaN(m.value)).toBe(false);
        expect(Number.isFinite(m.value)).toBe(true);
      }
    }
  });
});
