/**
 * 17_historicalFxPointInTimeNormalization.test.ts
 * Phase 16 — Historical Point-in-Time FX Conversion Verification.
 */

import { describe, it, expect } from 'vitest';
import { PeriodNormalizationEngine } from '../../../src/domain/dataSources/PeriodNormalizationEngine';

describe('Historical Point-in-Time FX Normalization (Phase 16)', () => {
  it('converts historical USD revenue using period average FX instead of current spot FX', () => {
    // Infosys FY2024 Revenue was $18,560 Million
    const resFy24 = PeriodNormalizationEngine.convertHistoricalFx({
      value: 18560,
      fromCurrency: 'USD',
      toCurrency: 'INR',
      fiscalYearOrPeriod: 'FY2024',
    });

    expect(resFy24.exchangeRate).toBe(82.78); // FY24 RBI average rate
    expect(resFy24.normalizedValue).toBe(1536396.8); // 18560 * 82.78
    expect(resFy24.rateType).toBe('HISTORICAL_PERIOD_AVERAGE');
  });

  it('normalizes financial unit scales accurately', () => {
    // 5000 Lakhs == 50 Crores
    const inCrores = PeriodNormalizationEngine.normalizeUnitScale(5000, 'INR_LAKH', 'INR_CRORE');
    expect(inCrores).toBe(50.0);
  });
});
