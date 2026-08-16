import { describe, it, expect } from 'vitest';
import { FinancialCalculationEngine } from '../../src/domain/calculations/FinancialCalculationEngine';
import { FinancialFact } from '../../src/domain/extraction/FinancialFactTypes';

describe('Phase 5 — Margin Calculations & Zero/Negative Revenue Rules', () => {
  const createFact = (metric: string, value: number | undefined, fy: string = 'FY24'): FinancialFact => ({
    factId: `fact_${metric.toLowerCase()}_${fy}`,
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
    sourceReference: { documentId: `doc_ar_${fy}`, documentTitle: `TATAMOTORS_AR_${fy}.pdf`, pageNumber: 120 },
    confidence: 98,
    confidenceTier: 'HIGH',
    verificationStatus: 'VERIFIED',
    extractedAt: new Date().toISOString(),
  });

  it('1. Normal Margins: computes EBITDA, EBIT, and PAT Margins accurately', () => {
    const facts = [
      createFact('REVENUE', 437928),
      createFact('EBITDA', 62145),
      createFact('EBIT', 36248),
      createFact('PAT', 31807),
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_1', 'TATAMOTORS', 'AUTO_OEM', facts, 'FY24');
    const ebitdaMargin = metrics.find((m) => m.metricCode === 'EBITDA_MARGIN');
    const ebitMargin = metrics.find((m) => m.metricCode === 'EBIT_MARGIN');
    const patMargin = metrics.find((m) => m.metricCode === 'PAT_MARGIN');

    expect(ebitdaMargin?.status).toBe('CALCULATED');
    expect(ebitdaMargin?.value).toBe(14.19); // (62145 / 437928) * 100 = 14.1906% -> 14.19%

    expect(ebitMargin?.status).toBe('CALCULATED');
    expect(ebitMargin?.value).toBe(8.28); // (36248 / 437928) * 100 = 8.277% -> 8.28%

    expect(patMargin?.status).toBe('CALCULATED');
    expect(patMargin?.value).toBe(7.26); // (31807 / 437928) * 100 = 7.263% -> 7.26%
  });

  it('2. Zero Revenue Denominator: returns NOT_CALCULABLE (never divides by zero)', () => {
    const facts = [
      createFact('REVENUE', 0),
      createFact('EBITDA', 5000),
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_1', 'TATAMOTORS', 'AUTO_OEM', facts, 'FY24');
    const ebitdaMargin = metrics.find((m) => m.metricCode === 'EBITDA_MARGIN');

    expect(ebitdaMargin?.status).toBe('NOT_CALCULABLE');
    expect(ebitdaMargin?.value).toBeUndefined();
    expect(ebitdaMargin?.warnings[0]).toContain('Revenue is zero');
  });

  it('3. Negative Revenue Denominator: returns INVALID_INPUT', () => {
    const facts = [
      createFact('REVENUE', -500),
      createFact('EBITDA', 100),
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_1', 'TATAMOTORS', 'AUTO_OEM', facts, 'FY24');
    const ebitdaMargin = metrics.find((m) => m.metricCode === 'EBITDA_MARGIN');

    expect(ebitdaMargin?.status).toBe('INVALID_INPUT');
    expect(ebitdaMargin?.value).toBeUndefined();
    expect(ebitdaMargin?.warnings[0]).toContain('economically invalid');
  });

  it('4. Negative Operating EBITDA: returns valid negative operating margin with warning', () => {
    const facts = [
      createFact('REVENUE', 100000),
      createFact('EBITDA', -5000),
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_1', 'TATAMOTORS', 'AUTO_OEM', facts, 'FY24');
    const ebitdaMargin = metrics.find((m) => m.metricCode === 'EBITDA_MARGIN');

    expect(ebitdaMargin?.status).toBe('CALCULATED');
    expect(ebitdaMargin?.value).toBe(-5.0);
    expect(ebitdaMargin?.warnings[0]).toContain('Operating deficit');
  });

  it('5. Missing Numerator Fact: returns MISSING_INPUT', () => {
    const facts = [
      createFact('REVENUE', 100000),
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_1', 'TATAMOTORS', 'AUTO_OEM', facts, 'FY24');
    const ebitdaMargin = metrics.find((m) => m.metricCode === 'EBITDA_MARGIN');

    expect(ebitdaMargin?.status).toBe('MISSING_INPUT');
    expect(ebitdaMargin?.value).toBeUndefined();
  });
});
