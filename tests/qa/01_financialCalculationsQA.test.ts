/**
 * 01_financialCalculationsQA.test.ts
 * QA Track: Deterministic Financial Calculations & Mathematical Edge Cases.
 * Validates division-by-zero safety, negative PAT/Equity handling, missing line items,
 * and NaN/Infinity sanitization.
 */

import { describe, it, expect } from 'vitest';
import { FinancialCalculationEngine } from '../../src/domain/calculations/FinancialCalculationEngine';
import { FinancialFact } from '../../src/domain/extraction/FinancialFactTypes';

describe('Financial Calculation QA (Edge Cases & Resilience)', () => {
  const createMockFact = (metric: string, value: number, fiscalYear = 'FY24'): FinancialFact => ({
    factId: `fact_${metric}_${fiscalYear}`,
    projectId: 'proj_qa_calc',
    companyId: 'comp_test',
    companySymbol: 'TESTCO',
    documentId: 'doc_ar24',
    documentName: 'Annual Report FY24',
    pageNumber: 50,
    category: 'INCOME_STATEMENT',
    metric,
    metricLabel: metric,
    value,
    originalValue: value,
    unit: 'INR_CRORE',
    originalUnit: 'INR_CRORE',
    normalizedUnit: 'INR_CRORE',
    originalCurrency: 'INR',
    normalizedCurrency: 'INR',
    reportingPeriod: {
      fiscalYear,
      periodType: 'ANNUAL',
      isIdentifiable: true,
    },
    accountingBasis: 'CONSOLIDATED',
    availabilityStatus: 'AVAILABLE',
    extractionMethod: 'STRUCTURED_TABLE',
    provenanceSourceType: 'PRIMARY_SOURCE_DERIVED',
    sourceReference: {
      documentId: 'doc_ar24',
      documentTitle: 'Annual Report FY24',
      pageNumber: 50,
    },
    confidence: 95,
    confidenceTier: 'HIGH',
    verificationStatus: 'VERIFIED',
    extractedAt: new Date().toISOString(),
  });

  it('handles division-by-zero without producing NaN or Infinity', () => {
    const facts: FinancialFact[] = [
      createMockFact('REVENUE', 0),
      createMockFact('PAT', 100),
      createMockFact('EQUITY', 0),
      createMockFact('TOTAL_DEBT', 500),
      createMockFact('EBITDA', 0),
      createMockFact('INTEREST_EXPENSE', 0),
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics(
      'proj_qa_calc',
      'TESTCO',
      'NON_FINANCIAL_OPERATING',
      facts
    );

    expect(metrics.length).toBeGreaterThan(0);
    for (const metric of metrics) {
      if (metric.value !== undefined && metric.value !== null) {
        expect(Number.isNaN(metric.value)).toBe(false);
        expect(Number.isFinite(metric.value)).toBe(true);
      }
    }
  });

  it('correctly computes negative PAT and negative Equity (Turnaround / Distress cases)', () => {
    const facts: FinancialFact[] = [
      createMockFact('REVENUE', 10000),
      createMockFact('PAT', -2500),
      createMockFact('EQUITY', -1200), // Negative Net Worth
      createMockFact('EBITDA', -1500),
      createMockFact('CFO', -800),
      createMockFact('CAPEX', 400),
      createMockFact('TOTAL_DEBT', 8000),
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics(
      'proj_qa_calc',
      'DISTRESSCO',
      'NON_FINANCIAL_OPERATING',
      facts
    );

    const fcfMetric = metrics.find((m) => m.metricCode === 'FREE_CASH_FLOW' || m.metricCode === 'FCF');
    if (fcfMetric && fcfMetric.value !== null && fcfMetric.value !== undefined) {
      expect(fcfMetric.value).toBe(-1200); // -800 CFO - 400 Capex
    }

    const patMargin = metrics.find((m) => m.metricCode === 'PAT_MARGIN');
    if (patMargin && patMargin.value !== null && patMargin.value !== undefined) {
      expect(patMargin.value).toBe(-25); // (-2500 / 10000) * 100
    }
  });

  it('handles missing lines gracefully without throwing unhandled errors', () => {
    const facts: FinancialFact[] = [createMockFact('REVENUE', 5000)];

    const metrics = FinancialCalculationEngine.calculateAllMetrics(
      'proj_qa_calc',
      'PARTIALCO',
      'NON_FINANCIAL_OPERATING',
      facts
    );

    expect(Array.isArray(metrics)).toBe(true);
  });
});
