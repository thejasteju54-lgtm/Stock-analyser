import { describe, it, expect } from 'vitest';
import { FinancialCalculationEngine } from '../../src/domain/calculations/FinancialCalculationEngine';
import { FinancialFact } from '../../src/domain/extraction/FinancialFactTypes';

describe('Phase 5 — Growth Calculations & Negative/Zero Base Policies', () => {
  const createFact = (metric: string, value: number | undefined, fy: string): FinancialFact => ({
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
    sourceReference: { documentId: `doc_ar_${fy}`, documentTitle: `TATAMOTORS_AR_${fy}.pdf`, pageNumber: 100 },
    confidence: 98,
    confidenceTier: 'HIGH',
    verificationStatus: 'VERIFIED',
    extractedAt: new Date().toISOString(),
  });

  it('1. Normal Positive Growth: computes YoY percentage growth correctly', () => {
    const facts = [
      createFact('REVENUE', 345967, 'FY23'),
      createFact('REVENUE', 437928, 'FY24'),
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_1', 'TATAMOTORS', 'AUTO_OEM', facts, 'FY24', 'FY23');
    const revGrowth = metrics.find((m) => m.metricCode === 'REVENUE_GROWTH');

    expect(revGrowth).toBeDefined();
    expect(revGrowth?.status).toBe('CALCULATED');
    expect(revGrowth?.growthStatus).toBe('NORMAL_GROWTH');
    expect(revGrowth?.value).toBe(26.58); // ((437928 - 345967) / 345967) * 100 = 26.581% -> 26.58%
    expect(revGrowth?.unit).toBe('PERCENT');
    expect(revGrowth?.calculationVersion).toBe('financial-metrics-v1');
    expect(revGrowth?.methodologyVersion).toBe('india-equity-methodology-v1');
  });

  it('2. Zero Base Denominator: returns NOT_CALCULABLE and ZERO_BASE (never divides by zero)', () => {
    const facts = [
      createFact('REVENUE', 0, 'FY23'),
      createFact('REVENUE', 50000, 'FY24'),
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_1', 'TATAMOTORS', 'AUTO_OEM', facts, 'FY24', 'FY23');
    const revGrowth = metrics.find((m) => m.metricCode === 'REVENUE_GROWTH');

    expect(revGrowth?.status).toBe('NOT_CALCULABLE');
    expect(revGrowth?.growthStatus).toBe('ZERO_BASE');
    expect(revGrowth?.value).toBeUndefined();
    expect(revGrowth?.warnings[0]).toContain('zero');
  });

  it('3. Turnaround (Loss in Base Year to Profit in Current Year): maps to TURNAROUND status', () => {
    const facts = [
      createFact('PAT', -2690, 'FY23'), // Net loss in FY23
      createFact('PAT', 31807, 'FY24'), // Strong profit in FY24
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_1', 'TATAMOTORS', 'AUTO_OEM', facts, 'FY24', 'FY23');
    const patGrowth = metrics.find((m) => m.metricCode === 'PAT_GROWTH');

    expect(patGrowth?.status).toBe('CALCULATED');
    expect(patGrowth?.growthStatus).toBe('TURNAROUND');
    expect(patGrowth?.value).toBeDefined();
    expect(patGrowth?.warnings[0]).toContain('Turnaround');
  });

  it('4. Negative Base (Loss in Base Year and Loss in Current Year): maps to DECLINE_FROM_LOSS or NEGATIVE_BASE', () => {
    const facts = [
      createFact('PAT', -1000, 'FY23'),
      createFact('PAT', -1500, 'FY24'),
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_1', 'TATAMOTORS', 'AUTO_OEM', facts, 'FY24', 'FY23');
    const patGrowth = metrics.find((m) => m.metricCode === 'PAT_GROWTH');

    expect(patGrowth?.status).toBe('CALCULATED');
    expect(patGrowth?.growthStatus).toBe('DECLINE_FROM_LOSS');
    expect(patGrowth?.warnings[0]).toContain('negative losses');
  });

  it('5. Missing Input in one period: returns MISSING_INPUT without throwing errors', () => {
    const facts = [
      createFact('REVENUE', 437928, 'FY24'), // Missing FY23 base
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_1', 'TATAMOTORS', 'AUTO_OEM', facts, 'FY24', 'FY23');
    const revGrowth = metrics.find((m) => m.metricCode === 'REVENUE_GROWTH');

    expect(revGrowth?.status).toBe('MISSING_INPUT');
    expect(revGrowth?.value).toBeUndefined();
    expect(revGrowth?.warnings[0]).toContain('Missing input facts');
  });
});
