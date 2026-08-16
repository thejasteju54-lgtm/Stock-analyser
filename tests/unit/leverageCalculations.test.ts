import { describe, it, expect } from 'vitest';
import { FinancialCalculationEngine } from '../../src/domain/calculations/FinancialCalculationEngine';
import { FinancialFact } from '../../src/domain/extraction/FinancialFactTypes';

describe('Phase 5 — Leverage & Solvency Calculations & Zero/Negative Policies', () => {
  const createFact = (metric: string, value: number | undefined, fy: string = 'FY24'): FinancialFact => ({
    factId: `fact_${metric.toLowerCase()}_${fy}`,
    projectId: 'proj_tatamotors_test',
    companyId: 'TATAMOTORS',
    companySymbol: 'TATAMOTORS',
    documentId: `doc_ar_${fy}`,
    documentName: `TATAMOTORS_Annual_Report_${fy}.pdf`,
    category: 'BALANCE_SHEET',
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
    sourceReference: { documentId: `doc_ar_${fy}`, documentTitle: `TATAMOTORS_AR_${fy}.pdf`, pageNumber: 135 },
    confidence: 98,
    confidenceTier: 'HIGH',
    verificationStatus: 'VERIFIED',
    extractedAt: new Date().toISOString(),
  });

  it('1. Debt to Equity (D/E): computes Total Debt / Net Worth', () => {
    const facts = [
      createFact('TOTAL_DEBT', 84394),
      createFact('NET_WORTH', 84931),
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_1', 'TATAMOTORS', 'AUTO_OEM', facts, 'FY24');
    const de = metrics.find((m) => m.metricCode === 'DEBT_TO_EQUITY');

    expect(de?.status).toBe('CALCULATED');
    expect(de?.value).toBe(0.99); // 84394 / 84931 = 0.9936 -> 0.99x
    expect(de?.unit).toBe('RATIO');
  });

  it('2. Net Debt to EBITDA: computes (Total Debt - Cash) / EBITDA', () => {
    const facts = [
      createFact('TOTAL_DEBT', 84394),
      createFact('CASH', 38686),
      createFact('EBITDA', 62145),
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_1', 'TATAMOTORS', 'AUTO_OEM', facts, 'FY24');
    const netDebtEbitda = metrics.find((m) => m.metricCode === 'NET_DEBT_TO_EBITDA');

    expect(netDebtEbitda?.status).toBe('CALCULATED');
    expect(netDebtEbitda?.value).toBe(0.74); // (84394 - 38686) / 62145 = 45708 / 62145 = 0.7355 -> 0.74x
  });

  it('3. Net Debt to EBITDA with Negative EBITDA: returns NOT_CALCULABLE (loss making)', () => {
    const facts = [
      createFact('TOTAL_DEBT', 50000),
      createFact('CASH', 10000),
      createFact('EBITDA', -5000),
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_1', 'TATAMOTORS', 'AUTO_OEM', facts, 'FY24');
    const netDebtEbitda = metrics.find((m) => m.metricCode === 'NET_DEBT_TO_EBITDA');

    expect(netDebtEbitda?.status).toBe('NOT_CALCULABLE');
    expect(netDebtEbitda?.value).toBeUndefined();
    expect(netDebtEbitda?.warnings[0]).toContain('non-positive');
  });

  it('4. Interest Coverage: computes EBIT / Finance Cost', () => {
    const facts = [
      createFact('EBIT', 36248),
      createFact('FINANCE_COST', 8920),
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_1', 'TATAMOTORS', 'AUTO_OEM', facts, 'FY24');
    const intCov = metrics.find((m) => m.metricCode === 'INTEREST_COVERAGE');

    expect(intCov?.status).toBe('CALCULATED');
    expect(intCov?.value).toBe(4.06); // 36248 / 8920 = 4.0636 -> 4.06x
  });

  it('5. Interest Coverage with Zero/Missing Finance Cost: returns NOT_CALCULABLE', () => {
    const facts = [
      createFact('EBIT', 36248),
      createFact('FINANCE_COST', 0),
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_1', 'TATAMOTORS', 'AUTO_OEM', facts, 'FY24');
    const intCov = metrics.find((m) => m.metricCode === 'INTEREST_COVERAGE');

    expect(intCov?.status).toBe('NOT_CALCULABLE');
    expect(intCov?.value).toBeUndefined();
  });
});
