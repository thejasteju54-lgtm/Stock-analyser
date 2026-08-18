import { describe, it, expect } from 'vitest';
import { ForensicAccountingEngine } from '../../src/domain/forensics/ForensicAccountingEngine';
import { FinancialFact } from '../../src/domain/extraction/FinancialFactTypes';
import { CalculatedMetric } from '../../src/domain/calculations/CalculationTypes';

describe('Phase 7 — Forensic Signals vs Accusatory Conclusions', () => {
  const createFact = (metric: string, value: number, fy: string = 'FY24'): FinancialFact => ({
    factId: `fact_${metric.toLowerCase()}_${fy.toLowerCase()}`,
    projectId: 'proj_test',
    companyId: 'TESTCO',
    companySymbol: 'TESTCO',
    documentId: `doc_${fy.toLowerCase()}`,
    documentName: `TESTCO_AR_${fy}.pdf`,
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
    sourceReference: { documentId: `doc_${fy.toLowerCase()}`, documentTitle: `TESTCO_AR_${fy}.pdf`, pageNumber: 120 },
    confidence: 95,
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

  it('1. Threshold breach triggers objective signal and REQUIRES_INVESTIGATION without accusing fraud', () => {
    const facts = [
      createFact('REVENUE', 12000, 'FY24'),
      createFact('REVENUE', 10000, 'FY23'),
      createFact('TRADE_RECEIVABLES', 3000, 'FY24'),
      createFact('TRADE_RECEIVABLES', 1500, 'FY23'), // 100% growth vs 20% revenue growth
      createFact('PAT', 1000, 'FY24'),
      createFact('CFO', 400, 'FY24'),
      createFact('NET_WORTH', 8000, 'FY24'),
    ];

    const metrics = [
      createMetric('REVENUE_GROWTH', 20.0, 'GROWTH', 'FY24'),
      createMetric('CFO_TO_PAT_RATIO', 0.4, 'CASH_FLOW_QUALITY', 'FY24'),
    ];

    const report = ForensicAccountingEngine.analyze(
      'proj_test',
      'TESTCO',
      'OPERATING_INDUSTRIAL',
      facts,
      metrics,
      'FY24',
      'FY23'
    );

    expect(report.findings.length).toBeGreaterThan(0);
    const revFinding = report.findings.find((f) => f.category === 'REVENUE_QUALITY');
    expect(revFinding).toBeDefined();
    expect(revFinding?.signal).toBe('RECEIVABLES_VS_REVENUE_GROWTH_DIVERGENCE_SIGNAL');
    expect(revFinding?.status).toBe('REQUIRES_INVESTIGATION');

    // String serialized check to ensure non-accusatory institutional language
    const serializedReport = JSON.stringify(report).toUpperCase();
    expect(serializedReport).not.toContain('FRAUD');
    expect(serializedReport).not.toContain('COOKING THE BOOKS');
    expect(serializedReport).not.toContain('MANIPULATION');
    expect(serializedReport).not.toContain('CHEATING');

    // Confirms alternative explanations are provided
    expect(revFinding?.alternativeExplanations.length).toBeGreaterThan(0);
  });

  it('2. Legitimate operational explanation prevents escalation to material red flag', () => {
    const facts = [
      createFact('REVENUE', 10000, 'FY24'),
      createFact('PAT', 1200, 'FY24'),
      createFact('CFO', 1400, 'FY24'),
      createFact('CAPEX', 2000, 'FY24'),
      createFact('NET_WORTH', 9000, 'FY24'),
    ];

    const metrics = [
      createMetric('CFO_TO_PAT_RATIO', 1.17, 'CASH_FLOW_QUALITY', 'FY24'),
      createMetric('FREE_CASH_FLOW', -600, 'CASH_FLOW_QUALITY', 'FY24'), // Negative FCF due to Capex
    ];

    const report = ForensicAccountingEngine.analyze(
      'proj_test',
      'TESTCO',
      'OPERATING_INDUSTRIAL',
      facts,
      metrics,
      'FY24',
      'FY23'
    );

    const fcfFinding = report.findings.find((f) => f.signal === 'NEGATIVE_FCF_CAPEX_REINVESTMENT_SIGNAL');
    expect(fcfFinding).toBeDefined();
    expect(fcfFinding?.severity).toBe('LOW');
    expect(fcfFinding?.status).toBe('OBSERVED');
    expect(fcfFinding?.alternativeExplanations[0]).toContain('Growth-oriented capital expenditure');
  });
});
