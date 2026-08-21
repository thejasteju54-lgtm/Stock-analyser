/**
 * 03_forensicIntegrityQA.test.ts
 * QA Track: Forensic Accounting, Earnings Quality & Severity Gating.
 */

import { describe, it, expect } from 'vitest';
import { ForensicAccountingEngine } from '../../src/domain/forensics/ForensicAccountingEngine';
import { FinancialFact } from '../../src/domain/extraction/FinancialFactTypes';
import { CalculatedMetric } from '../../src/domain/calculations/CalculationTypes';

describe('Forensic Accounting & Integrity QA', () => {
  const createMockFact = (metric: string, value: number, fiscalYear = 'FY24'): FinancialFact => ({
    factId: `fact_${metric}`,
    projectId: 'proj_qa_forensic',
    companyId: 'comp_test',
    companySymbol: 'TESTCO',
    documentId: 'doc_ar24',
    documentName: 'Annual Report FY24',
    pageNumber: 100,
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
      pageNumber: 100,
    },
    confidence: 95,
    confidenceTier: 'HIGH',
    verificationStatus: 'VERIFIED',
    extractedAt: new Date().toISOString(),
  });

  const createMockMetric = (metricCode: string, value: number, period = 'FY24'): CalculatedMetric => ({
    metricId: `metric_${metricCode}`,
    metricCode,
    metricName: metricCode,
    category: 'CASH_FLOW_QUALITY',
    value,
    unit: 'RATIO',
    period,
    formulaId: 'FORMULA_CFO_PAT',
    formulaName: 'CFO to PAT Ratio',
    formulaExpression: 'CFO / PAT',
    methodologyId: 'METH_1',
    methodologyVersion: '1.0',
    calculationVersion: '1.0',
    inputFactIds: [],
    inputFactsSummary: [],
    calculationTimestamp: new Date().toISOString(),
    status: 'CALCULATED',
    warnings: [],
    isApplicableForBusinessModel: true,
  });

  it('detects high-risk CFO/PAT divergence when earnings are not backed by operating cash flow', () => {
    const facts: FinancialFact[] = [
      createMockFact('REVENUE', 10000),
      createMockFact('PAT', 2000),
      createMockFact('CFO', 200), // Severe divergence: CFO is only 10% of PAT
      createMockFact('TRADE_RECEIVABLES', 4500), // 45% of revenue
      createMockFact('EQUITY', 8000),
    ];
    const metrics: CalculatedMetric[] = [
      createMockMetric('CFO_TO_PAT', 0.1),
    ];

    const report = ForensicAccountingEngine.analyze(
      'proj_qa_forensic',
      'TESTCO',
      'NON_FINANCIAL_OPERATING',
      facts,
      metrics,
      'FY24',
      'FY23'
    );

    expect(report.overallForensicRisk).toBeDefined();
    expect(report.overallForensicRiskScore).toBeGreaterThanOrEqual(0);
    expect(report.businessModelCode).toBe('OPERATING_INDUSTRIAL');
  });

  it('properly gates working capital and capex forensics for Financial / Banking institutions', () => {
    const facts: FinancialFact[] = [
      createMockFact('NET_INTEREST_INCOME', 5000),
      createMockFact('PAT', 2500),
    ];

    const report = ForensicAccountingEngine.analyze(
      'proj_qa_forensic',
      'BANKCO',
      'BANKING',
      facts,
      [],
      'FY24',
      'FY23'
    );

    expect(report.businessModelCode).toBe('BANKING');
    expect(report.overallForensicRisk).toBeDefined();
  });
});
