import { describe, it, expect } from 'vitest';
import { ForensicAccountingEngine } from '../../src/domain/forensics/ForensicAccountingEngine';
import { FinancialFact } from '../../src/domain/extraction/FinancialFactTypes';
import { CalculatedMetric } from '../../src/domain/calculations/CalculationTypes';

describe('Phase 7 — Revenue Quality & Profit vs Cash Flow Forensics', () => {
  const createFact = (metric: string, value: number, fy: string = 'FY24'): FinancialFact => ({
    factId: `fact_${metric.toLowerCase()}_${fy.toLowerCase()}`,
    projectId: 'proj_rev_cf',
    companyId: 'FLOWCO',
    companySymbol: 'FLOWCO',
    documentId: `doc_${fy.toLowerCase()}`,
    documentName: `FLOWCO_AR_${fy}.pdf`,
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
    sourceReference: { documentId: `doc_${fy.toLowerCase()}`, documentTitle: `FLOWCO_AR_${fy}.pdf`, pageNumber: 110 },
    confidence: 95,
    confidenceTier: 'HIGH',
    verificationStatus: 'VERIFIED',
    extractedAt: new Date().toISOString(),
  });

  const createMetric = (code: string, value: number, category: any, fy: string = 'FY24', diagnostic?: any): CalculatedMetric => ({
    metricId: `calc_${code.toLowerCase()}_${fy.toLowerCase()}`,
    metricCode: code,
    metricName: code,
    category,
    value,
    unit: 'RATIO',
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
    cfoPatDiagnostic: diagnostic,
    isApplicableForBusinessModel: true,
  });

  it('1. Flags dual operating loss and cash burn (CASH_BURN_DURING_ACCOUNTING_LOSS)', () => {
    const facts = [
      createFact('REVENUE', 8000, 'FY24'),
      createFact('PAT', -500, 'FY24'),
      createFact('CFO', -350, 'FY24'),
    ];

    const metrics = [
      createMetric('CFO_TO_PAT_RATIO', 0, 'CASH_FLOW_QUALITY', 'FY24', 'CASH_BURN_DURING_ACCOUNTING_LOSS'),
    ];

    const report = ForensicAccountingEngine.analyze(
      'proj_rev_cf',
      'FLOWCO',
      'OPERATING_INDUSTRIAL',
      facts,
      metrics,
      'FY24',
      'FY23'
    );

    const cashBurnFinding = report.findings.find((f) => f.signal === 'CASH_BURN_DURING_LOSS_SIGNAL');
    expect(cashBurnFinding).toBeDefined();
    expect(cashBurnFinding?.severity).toBe('HIGH');
    expect(cashBurnFinding?.status).toBe('MATERIAL_CONCERN');
  });
});
