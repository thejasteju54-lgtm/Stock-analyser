import { describe, it, expect } from 'vitest';
import { FinancialCalculationEngine } from '../../src/domain/calculations/FinancialCalculationEngine';
import { FinancialFact } from '../../src/domain/extraction/FinancialFactTypes';

describe('Phase 5 — Return Metrics (ROE & ROCE) & Methodology Fallbacks', () => {
  const createFact = (metric: string, value: number | undefined, fy: string = 'FY24', category: any = 'BALANCE_SHEET'): FinancialFact => ({
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
    sourceReference: { documentId: `doc_ar_${fy}`, documentTitle: `TATAMOTORS_AR_${fy}.pdf`, pageNumber: 130 },
    confidence: 98,
    confidenceTier: 'HIGH',
    verificationStatus: 'VERIFIED',
    extractedAt: new Date().toISOString(),
  });

  it('1. ROE (Average Equity Default): computes ROE using (Opening + Closing Equity) / 2', () => {
    const facts = [
      createFact('PAT', 31807, 'FY24', 'INCOME_STATEMENT'),
      createFact('NET_WORTH', 84931, 'FY24'), // Closing equity FY24
      createFact('NET_WORTH', 45318, 'FY23'), // Opening equity FY23
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_1', 'TATAMOTORS', 'AUTO_OEM', facts, 'FY24', 'FY23');
    const roe = metrics.find((m) => m.metricCode === 'ROE');

    expect(roe).toBeDefined();
    expect(roe?.status).toBe('CALCULATED');
    expect(roe?.methodologyId).toBe('ROE_AVERAGE_EQUITY_V1');
    // Avg Equity = (84931 + 45318) / 2 = 65124.5
    // ROE = (31807 / 65124.5) * 100 = 48.8398% -> 48.84%
    expect(roe?.value).toBe(48.84);
    expect(roe?.inputFactIds).toContain('fact_pat_fy24');
    expect(roe?.inputFactIds).toContain('fact_net_worth_fy24');
    expect(roe?.inputFactIds).toContain('fact_net_worth_fy23');
  });

  it('2. ROE (Missing Opening Equity Fallback): uses Closing Equity with explicit warning', () => {
    const facts = [
      createFact('PAT', 31807, 'FY24', 'INCOME_STATEMENT'),
      createFact('NET_WORTH', 84931, 'FY24'), // Only closing equity FY24
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_1', 'TATAMOTORS', 'AUTO_OEM', facts, 'FY24', 'FY23');
    const roe = metrics.find((m) => m.metricCode === 'ROE');

    expect(roe?.status).toBe('CALCULATED');
    expect(roe?.methodologyId).toBe('ROE_CLOSING_EQUITY_FALLBACK_V1');
    // Closing ROE = (31807 / 84931) * 100 = 37.45%
    expect(roe?.value).toBe(37.45);
    expect(roe?.warnings[0]).toContain('FALLBACK_CLOSING_EQUITY_USED');
  });

  it('3. ROE (Negative Equity): returns NOT_CALCULABLE (negative net worth)', () => {
    const facts = [
      createFact('PAT', 5000, 'FY24', 'INCOME_STATEMENT'),
      createFact('NET_WORTH', -10000, 'FY24'),
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_1', 'TATAMOTORS', 'AUTO_OEM', facts, 'FY24', 'FY23');
    const roe = metrics.find((m) => m.metricCode === 'ROE');

    expect(roe?.status).toBe('NOT_CALCULABLE');
    expect(roe?.value).toBeUndefined();
    expect(roe?.warnings[0]).toContain('non-positive');
  });

  it('4. ROCE (Average Capital Employed): computes EBIT / Average CE', () => {
    const facts = [
      createFact('EBIT', 36248, 'FY24', 'INCOME_STATEMENT'),
      createFact('TOTAL_DEBT', 84394, 'FY24'),
      createFact('NET_WORTH', 84931, 'FY24'),
      createFact('CASH', 38686, 'FY24'),
      // FY23 Opening balances
      createFact('TOTAL_DEBT', 92000, 'FY23'),
      createFact('NET_WORTH', 45318, 'FY23'),
      createFact('CASH', 35000, 'FY23'),
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_1', 'TATAMOTORS', 'AUTO_OEM', facts, 'FY24', 'FY23');
    const roce = metrics.find((m) => m.metricCode === 'ROCE');

    expect(roce).toBeDefined();
    expect(roce?.status).toBe('CALCULATED');
    expect(roce?.methodologyId).toBe('ROCE_AVERAGE_CAPITAL_EMPLOYED_V1');
    // Closing CE = 84394 + 84931 - 38686 = 130639
    // Opening CE = 92000 + 45318 - 35000 = 102318
    // Avg CE = (130639 + 102318) / 2 = 116478.5
    // ROCE = (36248 / 116478.5) * 100 = 31.119% -> 31.12%
    expect(roce?.value).toBe(31.12);
  });
});
