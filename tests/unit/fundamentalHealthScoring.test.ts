import { describe, it, expect } from 'vitest';
import { FundamentalHealthEngine } from '../../src/domain/analysis/FundamentalHealthEngine';
import { FinancialFact } from '../../src/domain/extraction/FinancialFactTypes';
import { CalculatedMetric } from '../../src/domain/calculations/CalculationTypes';

describe('Phase 6 — Fundamental Health Scoring & Weight Renormalization', () => {
  const createFact = (metric: string, value: number, fy: string = 'FY24'): FinancialFact => ({
    factId: `fact_${metric.toLowerCase()}_${fy.toLowerCase()}`,
    projectId: 'proj_tata_test',
    companyId: 'TATAMOTORS',
    companySymbol: 'TATAMOTORS',
    documentId: `doc_ar_${fy}`,
    documentName: `TATAMOTORS_AR_${fy}.pdf`,
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
    reportingPeriod: { fiscalYear: fy, isIdentifiable: true, periodType: 'ANNUAL', rawPeriodString: fy },
    accountingBasis: 'CONSOLIDATED',
    extractionMethod: 'STRUCTURED_TABLE',
    provenanceSourceType: 'PRIMARY_SOURCE_DERIVED',
    sourceReference: { documentId: `doc_ar_${fy}`, documentTitle: `TATAMOTORS_AR_${fy}.pdf`, pageNumber: 140 },
    confidence: 98,
    confidenceTier: 'HIGH',
    verificationStatus: 'VERIFIED',
    extractedAt: new Date().toISOString(),
  });

  const createMetric = (
    code: string,
    value: number,
    category: any,
    fy: string = 'FY24',
    growthStatus?: any
  ): CalculatedMetric => ({
    metricId: `calc_${code.toLowerCase()}_${fy.toLowerCase()}`,
    metricCode: code,
    metricName: code,
    category,
    value,
    unit: 'PERCENT',
    period: fy,
    formulaId: `FORMULA_${code}`,
    formulaName: code,
    formulaExpression: code,
    methodologyId: 'DEFAULT_V1',
    methodologyVersion: 'india-equity-methodology-v1',
    calculationVersion: 'financial-metrics-v1',
    growthStatus,
    inputFactIds: [`fact_${code.toLowerCase()}_${fy.toLowerCase()}`],
    inputFactsSummary: [
      {
        factId: `fact_${code.toLowerCase()}_${fy.toLowerCase()}`,
        metric: code,
        metricLabel: code,
        value,
        unit: 'PERCENT',
        currency: 'INR',
        accountingBasis: 'CONSOLIDATED',
        period: fy,
        documentName: `TATAMOTORS_AR_${fy}.pdf`,
        pageNumber: 140,
      },
    ],
    calculationTimestamp: new Date().toISOString(),
    status: 'CALCULATED',
    warnings: [],
    isApplicableForBusinessModel: true,
  });

  it('1. Operating Industrial Health Scoring: aggregates all 7 categories into reproducible 0-10 score', () => {
    const facts = [
      createFact('REVENUE', 437928, 'FY24'),
      createFact('REVENUE', 345967, 'FY23'),
      createFact('EBITDA', 62747, 'FY24'),
      createFact('PAT', 31807, 'FY24'),
      createFact('CFO', 46394, 'FY24'),
      createFact('TOTAL_DEBT', 104000, 'FY24'),
      createFact('NET_WORTH', 89000, 'FY24'),
    ];

    const metrics = [
      createMetric('REVENUE_GROWTH', 26.6, 'GROWTH', 'FY24'),
      createMetric('EBITDA_GROWTH', 35.0, 'GROWTH', 'FY24'),
      createMetric('PAT_GROWTH', 110.0, 'GROWTH', 'FY24', 'TURNAROUND'),
      createMetric('EBITDA_MARGIN', 14.3, 'MARGINS', 'FY24'),
      createMetric('EBIT_MARGIN', 8.7, 'MARGINS', 'FY24'),
      createMetric('PAT_MARGIN', 7.3, 'MARGINS', 'FY24'),
      createMetric('CFO_TO_PAT_RATIO', 1.46, 'CASH_FLOW_QUALITY', 'FY24'),
      createMetric('FREE_CASH_FLOW', 14394, 'CASH_FLOW_QUALITY', 'FY24'),
      createMetric('DEBT_TO_EQUITY', 1.17, 'LEVERAGE', 'FY24'),
      createMetric('NET_DEBT_TO_EBITDA', 0.8, 'LEVERAGE', 'FY24'),
      createMetric('INTEREST_COVERAGE', 4.8, 'LEVERAGE', 'FY24'),
      createMetric('ROE', 35.7, 'RETURNS', 'FY24'),
      createMetric('ROCE', 22.4, 'RETURNS', 'FY24'),
      createMetric('RECEIVABLE_DAYS', 14.2, 'WORKING_CAPITAL', 'FY24'),
      createMetric('INVENTORY_DAYS', 37.5, 'WORKING_CAPITAL', 'FY24'),
      createMetric('PAYABLE_DAYS', 62.5, 'WORKING_CAPITAL', 'FY24'),
      createMetric('WORKING_CAPITAL_DAYS', -11.2, 'WORKING_CAPITAL', 'FY24'),
      createMetric('CASH_CONVERSION_CYCLE', -10.8, 'WORKING_CAPITAL', 'FY24'),
    ];

    const analysis = FundamentalHealthEngine.analyze(
      'proj_1',
      'TATAMOTORS',
      'OPERATING_INDUSTRIAL',
      facts,
      metrics,
      'FY24',
      'FY23'
    );

    expect(analysis.isAssessable).toBe(true);
    expect(analysis.overallHealthScore).toBeDefined();
    expect(analysis.overallHealthScore).toBeGreaterThanOrEqual(7.0);
    expect(analysis.analysisConfidence).toBe('HIGH');
    expect(analysis.categoryScores.length).toBe(6);

    // Sum of normalized weights across applicable categories must equal 100%
    const sumNormalizedWeights = analysis.categoryScores
      .filter((c) => c.isApplicable)
      .reduce((sum, c) => sum + c.normalizedWeight, 0);
    expect(Math.round(sumNormalizedWeights)).toBe(100);
  });

  it('2. Applicable-Weight Renormalization: excludes NOT_APPLICABLE categories and renormalizes remaining weights to 100%', () => {
    const facts = [
      createFact('REVENUE', 120000, 'FY24'),
      createFact('PAT', 35000, 'FY24'),
    ];

    const metrics = [
      createMetric('REVENUE_GROWTH', 18.0, 'GROWTH', 'FY24'),
      createMetric('PAT_GROWTH', 22.0, 'GROWTH', 'FY24'),
      createMetric('PAT_MARGIN', 29.2, 'MARGINS', 'FY24'),
      createMetric('ROE', 19.5, 'RETURNS', 'FY24'),
    ];

    // Bank: Cash Flow and Working Capital are NOT_APPLICABLE (0 weight)
    const analysis = FundamentalHealthEngine.analyze(
      'proj_bank',
      'HDFCBANK',
      'BANKING',
      facts,
      metrics,
      'FY24',
      'FY23'
    );

    const wcScore = analysis.categoryScores.find((c) => c.category === 'WORKING_CAPITAL');
    expect(wcScore?.isApplicable).toBe(false);
    expect(wcScore?.applicableWeight).toBe(0);
    expect(wcScore?.normalizedWeight).toBe(0);
    expect(wcScore?.status).toBe('NOT_APPLICABLE');

    // Applicable categories: GROWTH, MARGINS, LEVERAGE, RETURNS (each 25% original -> normalized 25%)
    const sumNormalized = analysis.categoryScores
      .filter((c) => c.isApplicable)
      .reduce((sum, c) => sum + c.normalizedWeight, 0);
    expect(Math.round(sumNormalized)).toBe(100);
  });

  it('3. Score Gate: Data Completeness < 40% returns NOT_ASSESSABLE with undefined overallHealthScore', () => {
    const facts: FinancialFact[] = [];
    const metrics: CalculatedMetric[] = [];

    const analysis = FundamentalHealthEngine.analyze(
      'proj_empty',
      'EMPTY',
      'OPERATING_INDUSTRIAL',
      facts,
      metrics,
      'FY24',
      'FY23'
    );

    expect(analysis.isAssessable).toBe(false);
    expect(analysis.overallHealthScore).toBeUndefined();
    expect(analysis.analysisConfidence).toBe('NOT_ASSESSABLE');
  });
});
