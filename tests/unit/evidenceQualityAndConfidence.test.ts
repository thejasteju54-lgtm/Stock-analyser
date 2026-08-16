import { describe, it, expect } from 'vitest';
import { FundamentalHealthEngine } from '../../src/domain/analysis/FundamentalHealthEngine';
import { FinancialFact } from '../../src/domain/extraction/FinancialFactTypes';
import { CalculatedMetric } from '../../src/domain/calculations/CalculationTypes';

describe('Phase 6 — Multi-Dimensional Quality & Confidence Evaluation', () => {
  const createFact = (
    metric: string,
    value: number,
    confidence: number = 95,
    verification: any = 'VERIFIED',
    sourceType: any = 'PRIMARY_SOURCE_DERIVED'
  ): FinancialFact => ({
    factId: `fact_${metric.toLowerCase()}_fy24`,
    projectId: 'proj_test',
    companyId: 'TESTCO',
    companySymbol: 'TESTCO',
    documentId: 'doc_1',
    documentName: 'TESTCO_AR_FY24.pdf',
    category: 'INCOME_STATEMENT',
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
    provenanceSourceType: sourceType,
    sourceReference: { documentId: 'doc_1', documentTitle: 'TESTCO_AR_FY24.pdf', pageNumber: 1 },
    confidence,
    confidenceTier: confidence >= 80 ? 'HIGH' : 'LOW',
    verificationStatus: verification,
    extractedAt: new Date().toISOString(),
  });

  const createMetric = (code: string, value: number, category: any): CalculatedMetric => ({
    metricId: `calc_${code.toLowerCase()}_fy24`,
    metricCode: code,
    metricName: code,
    category,
    value,
    unit: 'PERCENT',
    period: 'FY24',
    formulaId: `FORMULA_${code}`,
    formulaName: code,
    formulaExpression: code,
    methodologyId: 'DEFAULT_V1',
    methodologyVersion: 'india-equity-methodology-v1',
    calculationVersion: 'financial-metrics-v1',
    inputFactIds: [`fact_${code.toLowerCase()}_fy24`],
    inputFactsSummary: [],
    calculationTimestamp: new Date().toISOString(),
    status: 'CALCULATED',
    warnings: [],
    isApplicableForBusinessModel: true,
  });

  it('1. High Quality & High Completeness: yields HIGH analysis confidence', () => {
    const facts = [
      createFact('REVENUE', 10000, 95, 'VERIFIED', 'PRIMARY_SOURCE_DERIVED'),
      createFact('PAT', 1200, 95, 'VERIFIED', 'PRIMARY_SOURCE_DERIVED'),
      createFact('EBITDA', 2000, 95, 'VERIFIED', 'PRIMARY_SOURCE_DERIVED'),
      createFact('CFO', 1500, 95, 'VERIFIED', 'PRIMARY_SOURCE_DERIVED'),
      createFact('TOTAL_DEBT', 2000, 95, 'VERIFIED', 'PRIMARY_SOURCE_DERIVED'),
      createFact('NET_WORTH', 8000, 95, 'VERIFIED', 'PRIMARY_SOURCE_DERIVED'),
    ];

    const metrics = [
      createMetric('REVENUE_GROWTH', 12, 'GROWTH'),
      createMetric('EBITDA_GROWTH', 15, 'GROWTH'),
      createMetric('PAT_GROWTH', 18, 'GROWTH'),
      createMetric('EBITDA_MARGIN', 20, 'MARGINS'),
      createMetric('EBIT_MARGIN', 15, 'MARGINS'),
      createMetric('PAT_MARGIN', 12, 'MARGINS'),
      createMetric('CFO_TO_PAT_RATIO', 1.25, 'CASH_FLOW_QUALITY'),
      createMetric('FREE_CASH_FLOW', 800, 'CASH_FLOW_QUALITY'),
      createMetric('DEBT_TO_EQUITY', 0.25, 'LEVERAGE'),
      createMetric('NET_DEBT_TO_EBITDA', 0.5, 'LEVERAGE'),
      createMetric('INTEREST_COVERAGE', 8.0, 'LEVERAGE'),
      createMetric('ROE', 15.0, 'RETURNS'),
      createMetric('ROCE', 18.0, 'RETURNS'),
      createMetric('RECEIVABLE_DAYS', 35, 'WORKING_CAPITAL'),
      createMetric('INVENTORY_DAYS', 40, 'WORKING_CAPITAL'),
      createMetric('PAYABLE_DAYS', 50, 'WORKING_CAPITAL'),
      createMetric('WORKING_CAPITAL_DAYS', 25, 'WORKING_CAPITAL'),
      createMetric('CASH_CONVERSION_CYCLE', 25, 'WORKING_CAPITAL'),
    ];

    const analysis = FundamentalHealthEngine.analyze(
      'proj_high',
      'HIGHCO',
      'OPERATING_INDUSTRIAL',
      facts,
      metrics,
      'FY24'
    );

    expect(analysis.dataCompleteness).toBeGreaterThanOrEqual(80);
    expect(analysis.evidenceQuality).toBeGreaterThanOrEqual(80);
    expect(analysis.analysisConfidence).toBe('HIGH');
  });

  it('2. Moderate Completeness (50-79%): yields MEDIUM analysis confidence', () => {
    const facts = [
      createFact('REVENUE', 10000),
      createFact('PAT', 1000),
      createFact('EBITDA', 1500),
      createFact('CFO', 1100),
    ];

    const metrics = [
      createMetric('REVENUE_GROWTH', 10, 'GROWTH'),
      createMetric('EBITDA_GROWTH', 12, 'GROWTH'),
      createMetric('PAT_GROWTH', 15, 'GROWTH'),
      createMetric('EBITDA_MARGIN', 15, 'MARGINS'),
      createMetric('PAT_MARGIN', 10, 'MARGINS'),
      createMetric('ROE', 14, 'RETURNS'),
      createMetric('ROCE', 16, 'RETURNS'),
      createMetric('CFO_TO_PAT_RATIO', 1.0, 'CASH_FLOW_QUALITY'),
      createMetric('DEBT_TO_EQUITY', 0.5, 'LEVERAGE'),
      createMetric('INTEREST_COVERAGE', 6.0, 'LEVERAGE'),
    ];

    const analysis = FundamentalHealthEngine.analyze(
      'proj_med',
      'MEDCO',
      'OPERATING_INDUSTRIAL',
      facts,
      metrics,
      'FY24'
    );

    expect(analysis.dataCompleteness).toBeGreaterThanOrEqual(50);
    expect(analysis.isAssessable).toBe(true);
    expect(analysis.analysisConfidence).toBe('MEDIUM');
  });
});
