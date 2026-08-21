/**
 * 01_financialNumberCorruptions.test.ts
 * Phase 19 — Hostile Financial Number Corruptions & Inconsistencies Suite.
 */

import { describe, it, expect } from 'vitest';
import { FinancialDataAdapter } from '../../src/domain/dataSources/FinancialDataAdapter';
import { PeriodNormalizationEngine } from '../../src/domain/dataSources/PeriodNormalizationEngine';

describe('Financial Number Corruptions Suite', () => {
  it('rejects corrupt financial statements with negative total assets, missing period bounds, or zero revenue in industrial archetype', () => {
    const adapter = new FinancialDataAdapter();

    const corruptStatement: any = {
      reportingPeriod: 'FY24',
      periodStart: '', // Missing
      periodEnd: '2024-03-31',
      archetype: 'INDUSTRIAL_MANUFACTURING',
      revenue: -1000, // Negative revenue
      totalAssets: 0,
    };

    const res = adapter.validate({ parsedData: corruptStatement });
    expect(res.isValid).toBe(false);
    expect(res.errors.length).toBeGreaterThanOrEqual(2);
  });

  it('normalizes financial periods and detects quarterly vs annual period types correctly', () => {
    const fyBounds = PeriodNormalizationEngine.normalizePeriod('FY24');
    expect(fyBounds.periodType).toBe('ANNUAL_FY');
    expect(fyBounds.periodStart).toBe('2023-04-01');
    expect(fyBounds.periodEnd).toBe('2024-03-31');

    const qBounds = PeriodNormalizationEngine.normalizePeriod('Q1FY25');
    expect(qBounds.periodType).toBe('QUARTERLY');
  });
});
