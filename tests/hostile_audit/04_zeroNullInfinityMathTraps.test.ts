/**
 * 04_zeroNullInfinityMathTraps.test.ts
 * Phase 19 — Hostile Zero, Null, and Infinity Math Trap Suite.
 */

import { describe, it, expect } from 'vitest';
import { FinancialCalculationEngine } from '../../src/domain/calculations/FinancialCalculationEngine';

describe('Zero, Null, and Infinity Math Traps Suite', () => {
  it('returns NOT_CALCULABLE or MISSING_INPUT for division by zero without producing NaN or Infinity', () => {
    const facts = [
      {
        factId: 'fact_pat_0',
        metric: 'PAT',
        metricLabel: 'Profit After Tax',
        value: 100,
        normalizedValue: 100,
        normalizedUnit: 'CRORES' as const,
        normalizedCurrency: 'INR',
        reportingPeriod: {
          periodType: 'ANNUAL' as const,
          fiscalYear: 'FY24',
          periodEnd: '2024-03-31',
          statementBasis: 'CONSOLIDATED' as const,
        },
        accountingBasis: 'CONSOLIDATED' as const,
        documentName: 'AR24.pdf',
        pageNumber: 10,
        sourceConfidence: 'AUDITED_PRIMARY' as const,
        factProvenance: { extractionMethod: 'MANUAL_ENTRY' as const },
      },
      {
        factId: 'fact_nw_0',
        metric: 'NET_WORTH',
        metricLabel: 'Net Worth',
        value: 0, // Zero equity denominator
        normalizedValue: 0,
        normalizedUnit: 'CRORES' as const,
        normalizedCurrency: 'INR',
        reportingPeriod: {
          periodType: 'ANNUAL' as const,
          fiscalYear: 'FY24',
          periodEnd: '2024-03-31',
          statementBasis: 'CONSOLIDATED' as const,
        },
        accountingBasis: 'CONSOLIDATED' as const,
        documentName: 'AR24.pdf',
        pageNumber: 12,
        sourceConfidence: 'AUDITED_PRIMARY' as const,
        factProvenance: { extractionMethod: 'MANUAL_ENTRY' as const },
      },
    ];

    const metrics = FinancialCalculationEngine.calculateAllMetrics(
      'proj_zero_div',
      'TATAMOTORS',
      'NON_FINANCIAL_OPERATING',
      facts as any,
      'FY24',
      'FY23'
    );

    const roeMetric = metrics.find((m) => m.metricCode === 'ROE_PERCENT');
    if (roeMetric) {
      expect(roeMetric.value).not.toBe(Infinity);
      expect(roeMetric.value).not.toBeNaN();
      expect(roeMetric.status === 'NOT_CALCULABLE' || roeMetric.status === 'INVALID_INPUT' || roeMetric.status === 'MISSING_INPUT').toBe(true);
    }
  });
});
