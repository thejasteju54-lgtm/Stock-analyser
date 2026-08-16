import { describe, it, expect } from 'vitest';
import { FundamentalHealthEngine } from '../../src/domain/analysis/FundamentalHealthEngine';
import { FinancialFact } from '../../src/domain/extraction/FinancialFactTypes';
import { CalculatedMetric } from '../../src/domain/calculations/CalculationTypes';

describe('Phase 6 — Evidence-Driven Return Driver Decomposition', () => {
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

  const createMetric = (code: string, value: number, category: any, fy: string = 'FY24'): CalculatedMetric => ({
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
    inputFactIds: [`fact_${code.toLowerCase()}_${fy.toLowerCase()}`],
    inputFactsSummary: [],
    calculationTimestamp: new Date().toISOString(),
    status: 'CALCULATED',
    warnings: [],
    isApplicableForBusinessModel: true,
  });

  it('1. Supported Driver: when component margin and equity facts exist, decomposes return drivers without assumption', () => {
    const facts = [
      createFact('REVENUE', 437928, 'FY24'),
      createFact('PAT', 31807, 'FY24'),
      createFact('NET_WORTH', 89000, 'FY24'),
      createFact('EBIT', 38000, 'FY24'),
    ];

    const metrics = [
      createMetric('ROE', 35.7, 'RETURNS', 'FY24'),
      createMetric('PAT_MARGIN', 7.3, 'MARGINS', 'FY24'),
      createMetric('DEBT_TO_EQUITY', 1.17, 'LEVERAGE', 'FY24'),
      createMetric('ROCE', 22.4, 'RETURNS', 'FY24'),
      createMetric('EBIT_MARGIN', 8.7, 'MARGINS', 'FY24'),
    ];

    const analysis = FundamentalHealthEngine.analyze(
      'proj_tata',
      'TATAMOTORS',
      'OPERATING_INDUSTRIAL',
      facts,
      metrics,
      'FY24'
    );

    const roeDec = analysis.driverDecompositions.find((d) => d.returnMetric === 'ROE');
    expect(roeDec).toBeDefined();
    expect(roeDec?.status).toBe('SUPPORTED_DRIVER');
    expect(roeDec?.supportingEvidence.length).toBeGreaterThanOrEqual(2);
    expect(roeDec?.driverExplanation).toContain('ROE of 35.7%');

    const roceDec = analysis.driverDecompositions.find((d) => d.returnMetric === 'ROCE');
    expect(roceDec?.status).toBe('SUPPORTED_DRIVER');
    expect(roceDec?.driverExplanation).toContain('ROCE of 22.4%');
  });

  it('2. Undeterminable Driver: when component facts are missing, returns DRIVER_NOT_DETERMINABLE without speculation', () => {
    const facts: FinancialFact[] = [];
    const metrics = [createMetric('ROE', 15.0, 'RETURNS', 'FY24')]; // Missing PAT_MARGIN and NET_WORTH facts

    const analysis = FundamentalHealthEngine.analyze(
      'proj_missing',
      'MISSINGCO',
      'OPERATING_INDUSTRIAL',
      facts,
      metrics,
      'FY24'
    );

    const roeDec = analysis.driverDecompositions.find((d) => d.returnMetric === 'ROE');
    expect(roeDec?.status).toBe('DRIVER_NOT_DETERMINABLE');
    expect(roeDec?.driverExplanation).toContain('cannot be deterministically decomposed');
  });
});
