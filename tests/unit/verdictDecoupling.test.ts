import { describe, it, expect } from 'vitest';
import { FundamentalHealthEngine } from '../../src/domain/analysis/FundamentalHealthEngine';
import { FinancialFact } from '../../src/domain/extraction/FinancialFactTypes';
import { CalculatedMetric } from '../../src/domain/calculations/CalculationTypes';

describe('Phase 6 — Decoupling of Health Score from Investment Conviction & Verdict', () => {
  const createFact = (metric: string, value: number): FinancialFact => ({
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
    provenanceSourceType: 'PRIMARY_SOURCE_DERIVED',
    sourceReference: { documentId: 'doc_1', documentTitle: 'TESTCO_AR_FY24.pdf', pageNumber: 1 },
    confidence: 95,
    confidenceTier: 'HIGH',
    verificationStatus: 'VERIFIED',
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

  it('1. High Health Score (9.0/10) does NOT produce a BUY recommendation or valuation target', () => {
    const facts = [
      createFact('REVENUE', 10000),
      createFact('EBITDA', 3000),
      createFact('PAT', 2000),
      createFact('CFO', 2500),
      createFact('NET_WORTH', 8000),
    ];

    const metrics = [
      createMetric('REVENUE_GROWTH', 25, 'GROWTH'),
      createMetric('EBITDA_MARGIN', 30, 'MARGINS'),
      createMetric('PAT_MARGIN', 20, 'MARGINS'),
      createMetric('CFO_TO_PAT_RATIO', 1.25, 'CASH_FLOW_QUALITY'),
      createMetric('FREE_CASH_FLOW', 1800, 'CASH_FLOW_QUALITY'),
      createMetric('DEBT_TO_EQUITY', 0.1, 'LEVERAGE'),
      createMetric('INTEREST_COVERAGE', 15.0, 'LEVERAGE'),
      createMetric('ROE', 25.0, 'RETURNS'),
      createMetric('ROCE', 28.0, 'RETURNS'),
      createMetric('WORKING_CAPITAL_DAYS', -5.0, 'WORKING_CAPITAL'),
    ];

    const analysis = FundamentalHealthEngine.analyze(
      'proj_high',
      'HIGHCO',
      'OPERATING_INDUSTRIAL',
      facts,
      metrics,
      'FY24'
    );

    expect(analysis.overallHealthScore).toBeGreaterThanOrEqual(8.5);

    // Assert that no BUY/HOLD/AVOID verdict or target price is produced in Phase 6
    const serialized = JSON.stringify(analysis).toUpperCase();
    expect(serialized).not.toContain('"VERDICT":"BUY"');
    expect(serialized).not.toContain('"VERDICT":"HOLD"');
    expect(serialized).not.toContain('"VERDICT":"AVOID"');
    expect(serialized).not.toContain('TARGET_PRICE');
    expect(serialized).not.toContain('MARGIN_OF_SAFETY');
    expect(analysis.notes).toContain('does not constitute a valuation or investment recommendation');
  });

  it('2. Low Health Score (3.0/10) does NOT produce an AVOID or SELL verdict', () => {
    const facts = [
      createFact('REVENUE', 5000),
      createFact('EBITDA', -500),
      createFact('PAT', -1000),
      createFact('CFO', -800),
      createFact('TOTAL_DEBT', 8000),
      createFact('NET_WORTH', 2000),
    ];

    const metrics = [
      createMetric('REVENUE_GROWTH', -15, 'GROWTH'),
      createMetric('EBITDA_GROWTH', -25, 'GROWTH'),
      createMetric('PAT_GROWTH', -40, 'GROWTH'),
      createMetric('EBITDA_MARGIN', -10, 'MARGINS'),
      createMetric('PAT_MARGIN', -20, 'MARGINS'),
      createMetric('DEBT_TO_EQUITY', 4.0, 'LEVERAGE'),
      createMetric('INTEREST_COVERAGE', 0.5, 'LEVERAGE'),
      createMetric('ROE', -50.0, 'RETURNS'),
      createMetric('ROCE', -15.0, 'RETURNS'),
      createMetric('CFO_TO_PAT_RATIO', 0.8, 'CASH_FLOW_QUALITY'),
    ];

    const analysis = FundamentalHealthEngine.analyze(
      'proj_low',
      'LOWCO',
      'OPERATING_INDUSTRIAL',
      facts,
      metrics,
      'FY24'
    );

    expect(analysis.isAssessable).toBe(true);
    expect(analysis.overallHealthScore).toBeDefined();
    expect(analysis.overallHealthScore).toBeLessThanOrEqual(5.0);

    const serialized = JSON.stringify(analysis).toUpperCase();
    expect(serialized).not.toContain('"VERDICT":"AVOID"');
    expect(serialized).not.toContain('"VERDICT":"SELL"');
  });
});
