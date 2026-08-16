import { describe, it, expect } from 'vitest';
import { FundamentalHealthEngine } from '../../src/domain/analysis/FundamentalHealthEngine';
import { FinancialFact } from '../../src/domain/extraction/FinancialFactTypes';
import { CalculatedMetric } from '../../src/domain/calculations/CalculationTypes';

describe('Phase 6 — Signal vs Red Flag Severity Context', () => {
  const createFact = (metric: string, value: number): FinancialFact => ({
    factId: `fact_${metric.toLowerCase()}_fy24`,
    projectId: 'proj_test',
    companyId: 'TESTCO',
    companySymbol: 'TESTCO',
    documentId: 'doc_ar_fy24',
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
    sourceReference: { documentId: 'doc_ar_fy24', documentTitle: 'TESTCO_AR_FY24.pdf', pageNumber: 10 },
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
    inputFactsSummary: [
      {
        factId: `fact_${code.toLowerCase()}_fy24`,
        metric: code,
        metricLabel: code,
        value,
        unit: 'PERCENT',
        currency: 'INR',
        accountingBasis: 'CONSOLIDATED',
        period: 'FY24',
        documentName: 'TESTCO_AR_FY24.pdf',
        pageNumber: 10,
      },
    ],
    calculationTimestamp: new Date().toISOString(),
    status: 'CALCULATED',
    warnings: [],
    isApplicableForBusinessModel: true,
  });

  it('1. Moderate CFO/PAT divergence: flags as signal and sets status to REQUIRES_INVESTIGATION with forensic lead', () => {
    const facts = [createFact('REVENUE', 10000), createFact('PAT', 1000), createFact('CFO', 400)];
    const metrics = [
      createMetric('REVENUE_GROWTH', 10, 'GROWTH'),
      createMetric('EBITDA_MARGIN', 15, 'MARGINS'),
      createMetric('CFO_TO_PAT_RATIO', 0.4, 'CASH_FLOW_QUALITY'), // < 0.5x threshold
    ];

    const analysis = FundamentalHealthEngine.analyze(
      'proj_test',
      'TESTCO',
      'OPERATING_INDUSTRIAL',
      facts,
      metrics,
      'FY24'
    );

    const cfoFlag = analysis.redFlags.find((r) => r.category === 'CASH_FLOW_QUALITY');
    expect(cfoFlag).toBeDefined();
    expect(cfoFlag?.signal.signalCode).toBe('LOW_CFO_PAT_CONVERSION_SIGNAL');
    expect(cfoFlag?.status).toBe('REQUIRES_INVESTIGATION');
    expect(cfoFlag?.requiresForensicReview).toBe(true);
    expect(cfoFlag?.severity).toBe('MEDIUM'); // Moderate divergence is MEDIUM, not automatically CRITICAL
  });

  it('2. Severe Interest Coverage breakdown (< 1.0x): classified as CRITICAL MATERIAL_CONCERN', () => {
    const facts = [createFact('REVENUE', 10000), createFact('EBIT', 500), createFact('FINANCE_COST', 600)];
    const metrics = [
      createMetric('REVENUE_GROWTH', 5, 'GROWTH'),
      createMetric('INTEREST_COVERAGE', 0.83, 'LEVERAGE'), // < 1.0x coverage
    ];

    const analysis = FundamentalHealthEngine.analyze(
      'proj_test',
      'TESTCO',
      'OPERATING_INDUSTRIAL',
      facts,
      metrics,
      'FY24'
    );

    const intFlag = analysis.redFlags.find((r) => r.signal.signalCode === 'LOW_INTEREST_COVERAGE_SIGNAL');
    expect(intFlag).toBeDefined();
    expect(intFlag?.severity).toBe('CRITICAL');
    expect(intFlag?.status).toBe('MATERIAL_CONCERN');
  });
});
