import { describe, it, expect } from 'vitest';
import { FinancialCalculationEngine } from '../../src/domain/calculations/FinancialCalculationEngine';
import { FinancialFact } from '../../src/domain/extraction/FinancialFactTypes';

describe('Phase 5 — Business Model & Economic Archetype Gating', () => {
  const createFact = (metric: string, value: number | undefined, fy: string = 'FY24'): FinancialFact => ({
    factId: `fact_${metric.toLowerCase()}_${fy}`,
    projectId: 'proj_hdfcbank_test',
    companyId: 'HDFCBANK',
    companySymbol: 'HDFCBANK',
    documentId: `doc_ar_${fy}`,
    documentName: `HDFCBANK_Annual_Report_${fy}.pdf`,
    category: 'INCOME_STATEMENT',
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
    sourceReference: { documentId: `doc_ar_${fy}`, documentTitle: `HDFCBANK_AR_${fy}.pdf`, pageNumber: 80 },
    confidence: 98,
    confidenceTier: 'HIGH',
    verificationStatus: 'VERIFIED',
    extractedAt: new Date().toISOString(),
  });

  it('1. Banking / Lending Archetype: gates manufacturing Working Capital and Net Debt/EBITDA as NOT_APPLICABLE', () => {
    const facts = [
      createFact('REVENUE', 150000), // Total Income
      createFact('PAT', 60000),
      createFact('NET_WORTH', 280000),
    ];

    // 'BANKING' is mapped to 'LENDING_FINANCIAL' archetype
    const metrics = FinancialCalculationEngine.calculateAllMetrics('proj_hdfc', 'HDFCBANK', 'BANKING', facts, 'FY24');

    const netDebtEbitda = metrics.find((m) => m.metricCode === 'NET_DEBT_TO_EBITDA');
    const invDays = metrics.find((m) => m.metricCode === 'INVENTORY_DAYS');
    const ccc = metrics.find((m) => m.metricCode === 'CASH_CONVERSION_CYCLE');
    const roe = metrics.find((m) => m.metricCode === 'ROE');

    // Gated metrics should be NOT_APPLICABLE
    expect(netDebtEbitda?.status).toBe('NOT_APPLICABLE');
    expect(netDebtEbitda?.isApplicableForBusinessModel).toBe(false);

    expect(invDays?.status).toBe('NOT_APPLICABLE');
    expect(invDays?.isApplicableForBusinessModel).toBe(false);

    expect(ccc?.status).toBe('NOT_APPLICABLE');
    expect(ccc?.isApplicableForBusinessModel).toBe(false);

    // Applicable metrics like ROE should remain enabled
    expect(roe?.isApplicableForBusinessModel).toBe(true);
  });
});
