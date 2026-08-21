/**
 * 19_financialPeriodIncompatibilityGuard.test.ts
 * Phase 16 — Period Alignment & Normalization Guard Verification.
 */

import { describe, it, expect } from 'vitest';
import { PeriodNormalizationEngine } from '../../../src/domain/dataSources/PeriodNormalizationEngine';

describe('Financial Period Incompatibility Guard (Phase 16)', () => {
  it('correctly maps FY2024 to Indian Fiscal Year dates', () => {
    const norm = PeriodNormalizationEngine.normalizePeriod('FY2024');
    expect(norm.normalizedPeriod).toBe('FY2024');
    expect(norm.periodType).toBe('ANNUAL_FY');
    expect(norm.periodStart).toBe('2023-04-01');
    expect(norm.periodEnd).toBe('2024-03-31');
    expect(norm.fiscalYear).toBe(2024);
  });

  it('correctly maps Q3FY24 to quarterly dates', () => {
    const norm = PeriodNormalizationEngine.normalizePeriod('Q3FY24');
    expect(norm.normalizedPeriod).toBe('Q3FY2024');
    expect(norm.periodType).toBe('QUARTERLY');
    expect(norm.periodStart).toBe('2023-10-01');
    expect(norm.periodEnd).toBe('2023-12-31');
  });
});
