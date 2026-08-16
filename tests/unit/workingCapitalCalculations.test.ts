import { describe, it, expect } from 'vitest';
import { FinancialCalculationEngine } from '../../src/domain/calculations/FinancialCalculationEngine';
import { FinancialFact } from '../../src/domain/extraction/FinancialFactTypes';

describe('Phase 5 — Working Capital Activity Days & Strict COGS Policy', () => {
  const createFact = (metric: string, value: number | undefined, fy: string = 'FY24'): FinancialFact => ({
    factId: `fact_${metric.toLowerCase()}_${fy}`,
    projectId: 'proj_tatamotors_test',
    companyId: 'TATAMOTORS',
    companySymbol: 'TATAMOTORS',
    documentId: `doc_ar_${fy}`,
    documentName: `TATAMOTORS_Annual_Report_${fy}.pdf`,
    category: metric === 'REVENUE' || metric === 'COGS' ? 'INCOME_STATEMENT' : 'BALANCE_SHEET',
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
    sourceReference: { documentId: `doc_ar_${fy}`, documentTitle: `TATAMOTORS_AR_${fy}.pdf`, pageNumber: 130 },
    confidence: 98,
    confidenceTier: 'HIGH',
    verificationStatus: 'VERIFIED',
    extractedAt: new Date().toISOString(),
  });

  it('1. Debtor Days (Receivable Days): computes (Average Receivables / Revenue) * 365', () => {
    const facts = [
      createFact('REVENUE', 437928, 'FY24'),
      createFact('RECEIVABLES', 17097, 'FY24'), // Closing FY24
      createFact('RECEIVABLES', 15000, 'FY23'), // Opening FY23
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_1', 'TATAMOTORS', 'AUTO_OEM', facts, 'FY24', 'FY23');
    const recDays = metrics.find((m) => m.metricCode === 'RECEIVABLE_DAYS');

    expect(recDays?.status).toBe('CALCULATED');
    // Avg Rec = (17097 + 15000) / 2 = 16048.5
    // Rec Days = (16048.5 / 437928) * 365 = 13.376 -> 13.4 Days
    expect(recDays?.value).toBe(13.4);
    expect(recDays?.unit).toBe('DAYS');
  });

  it('2. Inventory Days (Strict COGS Denominator): computes (Average Inventory / COGS) * 365', () => {
    const facts = [
      createFact('COGS', 280000, 'FY24'),
      createFact('INVENTORY', 45000, 'FY24'),
      createFact('INVENTORY', 41000, 'FY23'),
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_1', 'TATAMOTORS', 'AUTO_OEM', facts, 'FY24', 'FY23');
    const invDays = metrics.find((m) => m.metricCode === 'INVENTORY_DAYS');

    expect(invDays?.status).toBe('CALCULATED');
    // Avg Inv = (45000 + 41000) / 2 = 43000
    // Inv Days = (43000 / 280000) * 365 = 56.05 -> 56.1 Days
    expect(invDays?.value).toBe(56.1);
  });

  it('3. Missing COGS Policy: returns MISSING_INPUT and NEVER silently substitutes Revenue', () => {
    const facts = [
      createFact('REVENUE', 437928, 'FY24'), // Revenue exists, but COGS is missing!
      createFact('INVENTORY', 45000, 'FY24'),
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_1', 'TATAMOTORS', 'AUTO_OEM', facts, 'FY24', 'FY23');
    const invDays = metrics.find((m) => m.metricCode === 'INVENTORY_DAYS');

    expect(invDays?.status).toBe('MISSING_INPUT');
    expect(invDays?.value).toBeUndefined();
    expect(invDays?.warnings[0]).toContain('Revenue is not substituted');
  });

  it('4. Working Capital Days: computes ((Receivables + Inventory - Payables) / Revenue) * 365', () => {
    const facts = [
      createFact('REVENUE', 437928, 'FY24'),
      createFact('RECEIVABLES', 17097, 'FY24'),
      createFact('INVENTORY', 45000, 'FY24'),
      createFact('PAYABLES', 75000, 'FY24'), // Payables exceed receivables + inventory (negative working capital)
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_1', 'TATAMOTORS', 'AUTO_OEM', facts, 'FY24', 'FY23');
    const wcDays = metrics.find((m) => m.metricCode === 'WORKING_CAPITAL_DAYS');

    expect(wcDays?.status).toBe('CALCULATED');
    // Operating WC = 17097 + 45000 - 75000 = -12903
    // WC Days = (-12903 / 437928) * 365 = -10.75 -> -10.8 Days
    expect(wcDays?.value).toBe(-10.8);
    expect(wcDays?.warnings[0]).toContain('Negative working capital days');
  });

  it('5. Cash Conversion Cycle (CCC): computes Receivable Days + Inventory Days - Payable Days', () => {
    const facts = [
      createFact('REVENUE', 437928, 'FY24'),
      createFact('COGS', 280000, 'FY24'),
      createFact('RECEIVABLES', 17097, 'FY24'),
      createFact('INVENTORY', 45000, 'FY24'),
      createFact('PAYABLES', 75000, 'FY24'),
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_1', 'TATAMOTORS', 'AUTO_OEM', facts, 'FY24');
    const ccc = metrics.find((m) => m.metricCode === 'CASH_CONVERSION_CYCLE');

    expect(ccc?.status).toBe('CALCULATED');
    expect(ccc?.unit).toBe('DAYS');
  });
});
