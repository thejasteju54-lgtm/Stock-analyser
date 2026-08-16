import { describe, it, expect } from 'vitest';
import { FinancialCalculationEngine } from '../../src/domain/calculations/FinancialCalculationEngine';
import { FinancialFact } from '../../src/domain/extraction/FinancialFactTypes';

describe('Phase 5 — Cash Flow Quality & Free Cash Flow (FCF) Calculations', () => {
  const createFact = (metric: string, value: number | undefined, category: any = 'CASH_FLOW', fy: string = 'FY24'): FinancialFact => ({
    factId: `fact_${metric.toLowerCase()}_${fy.toLowerCase()}`,
    projectId: 'proj_tatamotors_test',
    companyId: 'TATAMOTORS',
    companySymbol: 'TATAMOTORS',
    documentId: `doc_ar_${fy}`,
    documentName: `TATAMOTORS_Annual_Report_${fy}.pdf`,
    category,
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
    sourceReference: { documentId: `doc_ar_${fy}`, documentTitle: `TATAMOTORS_AR_${fy}.pdf`, pageNumber: 140 },
    confidence: 98,
    confidenceTier: 'HIGH',
    verificationStatus: 'VERIFIED',
    extractedAt: new Date().toISOString(),
  });

  it('1. Free Cash Flow (FCF): computes CFO minus Qualifying Capex and preserves input fact IDs', () => {
    const facts = [
      createFact('CFO', 46394, 'CASH_FLOW'),
      createFact('CAPEX', 32000, 'CASH_FLOW'),
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_1', 'TATAMOTORS', 'AUTO_OEM', facts, 'FY24');
    const fcf = metrics.find((m) => m.metricCode === 'FREE_CASH_FLOW');

    expect(fcf).toBeDefined();
    expect(fcf?.status).toBe('CALCULATED');
    expect(fcf?.value).toBe(14394); // 46394 - 32000 = 14394 Cr
    expect(fcf?.unit).toBe('INR_CRORE');
    expect(fcf?.methodologyId).toBe('FCF_CFO_MINUS_QUALIFYING_CAPEX_V1');
    expect(fcf?.inputFactIds).toContain('fact_cfo_fy24');
    expect(fcf?.inputFactIds).toContain('fact_capex_fy24');
  });

  it('2. Negative FCF: flags heavy reinvestment / cash burn with warning', () => {
    const facts = [
      createFact('CFO', 10000, 'CASH_FLOW'),
      createFact('CAPEX', 15000, 'CASH_FLOW'),
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_1', 'TATAMOTORS', 'AUTO_OEM', facts, 'FY24');
    const fcf = metrics.find((m) => m.metricCode === 'FREE_CASH_FLOW');

    expect(fcf?.status).toBe('CALCULATED');
    expect(fcf?.value).toBe(-5000);
    expect(fcf?.warnings[0]).toContain('Negative FCF');
  });

  it('3. CFO to PAT Ratio: computes cash realization ratio', () => {
    const facts = [
      createFact('CFO', 46394, 'CASH_FLOW'),
      createFact('PAT', 31807, 'INCOME_STATEMENT'),
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_1', 'TATAMOTORS', 'AUTO_OEM', facts, 'FY24');
    const cfoToPat = metrics.find((m) => m.metricCode === 'CFO_TO_PAT_RATIO');

    expect(cfoToPat?.status).toBe('CALCULATED');
    expect(cfoToPat?.value).toBe(1.46); // 46394 / 31807 = 1.4586 -> 1.46x
    expect(cfoToPat?.unit).toBe('RATIO');
  });

  it('4. CFO to PAT with Negative PAT and Positive CFO: returns NOT_CALCULABLE with CASH_GENERATION_DURING_ACCOUNTING_LOSS diagnostic', () => {
    const facts = [
      createFact('CFO', 10000, 'CASH_FLOW'),
      createFact('PAT', -5000, 'INCOME_STATEMENT'),
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_1', 'TATAMOTORS', 'AUTO_OEM', facts, 'FY24');
    const cfoToPat = metrics.find((m) => m.metricCode === 'CFO_TO_PAT_RATIO');

    expect(cfoToPat?.status).toBe('NOT_CALCULABLE');
    expect(cfoToPat?.value).toBeUndefined();
    expect(cfoToPat?.cfoPatDiagnostic).toBe('CASH_GENERATION_DURING_ACCOUNTING_LOSS');
    expect(cfoToPat?.warnings[0]).toContain('CASH_GENERATION_DURING_ACCOUNTING_LOSS');
    expect(cfoToPat?.inputFactIds).toContain('fact_cfo_fy24');
    expect(cfoToPat?.inputFactIds).toContain('fact_pat_fy24');
  });

  it('5. CFO to PAT with Negative PAT and Negative CFO: returns NOT_CALCULABLE with CASH_BURN_DURING_ACCOUNTING_LOSS diagnostic', () => {
    const facts = [
      createFact('CFO', -8000, 'CASH_FLOW'),
      createFact('PAT', -5000, 'INCOME_STATEMENT'),
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_1', 'TATAMOTORS', 'AUTO_OEM', facts, 'FY24');
    const cfoToPat = metrics.find((m) => m.metricCode === 'CFO_TO_PAT_RATIO');

    expect(cfoToPat?.status).toBe('NOT_CALCULABLE');
    expect(cfoToPat?.value).toBeUndefined();
    expect(cfoToPat?.cfoPatDiagnostic).toBe('CASH_BURN_DURING_ACCOUNTING_LOSS');
    expect(cfoToPat?.warnings[0]).toContain('CASH_BURN_DURING_ACCOUNTING_LOSS');
    expect(cfoToPat?.inputFactIds).toContain('fact_cfo_fy24');
    expect(cfoToPat?.inputFactIds).toContain('fact_pat_fy24');
  });

  it('6. CFO to PAT with Zero PAT: returns NOT_CALCULABLE with ZERO_PAT diagnostic', () => {
    const facts = [
      createFact('CFO', 10000, 'CASH_FLOW'),
      createFact('PAT', 0, 'INCOME_STATEMENT'),
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_1', 'TATAMOTORS', 'AUTO_OEM', facts, 'FY24');
    const cfoToPat = metrics.find((m) => m.metricCode === 'CFO_TO_PAT_RATIO');

    expect(cfoToPat?.status).toBe('NOT_CALCULABLE');
    expect(cfoToPat?.value).toBeUndefined();
    expect(cfoToPat?.cfoPatDiagnostic).toBe('ZERO_PAT');
  });
});
