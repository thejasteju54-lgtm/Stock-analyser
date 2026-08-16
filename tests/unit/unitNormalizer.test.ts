import { describe, it, expect } from 'vitest';
import { UnitNormalizer } from '../../src/domain/extraction/UnitNormalizer';

describe('Phase 4 — UnitNormalizer & Currency Tests', () => {
  it('normalizes INR Lakhs to INR Crores (divide by 100) while preserving original values', () => {
    const result = UnitNormalizer.normalize({
      value: 12450,
      rawUnit: 'INR_LAKH',
      rawCurrency: 'INR',
    });

    expect(result.normalizedValue).toBe(124.5);
    expect(result.normalizedUnit).toBe('INR_CRORE');
    expect(result.normalizedCurrency).toBe('INR');
  });

  it('normalizes INR Millions to INR Crores (divide by 10)', () => {
    const result = UnitNormalizer.normalize({
      value: 2800,
      rawUnit: 'INR_MILLION',
      rawCurrency: 'INR',
    });

    expect(result.normalizedValue).toBe(280.0);
    expect(result.normalizedUnit).toBe('INR_CRORE');
  });

  it('normalizes INR Billions to INR Crores (multiply by 100)', () => {
    const result = UnitNormalizer.normalize({
      value: 2.5,
      rawUnit: 'BILLION',
      rawCurrency: 'INR',
    });

    expect(result.normalizedValue).toBe(250.0);
    expect(result.normalizedUnit).toBe('INR_CRORE');
  });

  it('normalizes Absolute INR to INR Crores (divide by 10,000,000)', () => {
    const result = UnitNormalizer.normalize({
      value: 100000000,
      rawUnit: 'INR',
      rawCurrency: 'INR',
    });

    expect(result.normalizedValue).toBe(10.0);
    expect(result.normalizedUnit).toBe('INR_CRORE');
  });

  it('preserves percentage and per-share units without alteration', () => {
    const pctResult = UnitNormalizer.normalize({
      value: 46.36,
      rawUnit: 'PERCENT',
      rawCurrency: 'INR',
    });
    expect(pctResult.normalizedValue).toBe(46.36);
    expect(pctResult.normalizedUnit).toBe('PERCENT');

    const epsResult = UnitNormalizer.normalize({
      value: 82.89,
      rawUnit: 'PER_SHARE',
      rawCurrency: 'INR',
    });
    expect(epsResult.normalizedValue).toBe(82.89);
    expect(epsResult.normalizedUnit).toBe('PER_SHARE');
  });

  it('foreign currency protection: preserves foreign currency without silent conversion', () => {
    const usdResult = UnitNormalizer.normalize({
      value: 500,
      rawUnit: 'USD_MILLION',
      rawCurrency: 'USD',
    });

    expect(usdResult.normalizedValue).toBe(500);
    expect(usdResult.normalizedCurrency).toBe('USD');
    expect(usdResult.warning).toContain('Foreign currency (USD) preserved without conversion');
  });

  it('supports explicit currency conversion when rate, date, and source are provided', () => {
    const result = UnitNormalizer.normalize({
      value: 100, // $100M
      rawUnit: 'USD_MILLION',
      rawCurrency: 'USD',
      explicitConversionRate: {
        rate: 8.35, // Conversion factor to INR Crores
        date: '2024-03-31',
        source: 'RBI Reference Rate',
      },
    });

    expect(result.normalizedValue).toBe(835);
    expect(result.normalizedCurrency).toBe('INR');
    expect(result.conversionMetadata?.conversionSource).toBe('RBI Reference Rate');
    expect(result.conversionMetadata?.conversionRate).toBe(8.35);
  });

  it('handles missing/undefined/NaN values safely without returning zero', () => {
    const undefinedResult = UnitNormalizer.normalize({
      value: undefined,
      rawUnit: 'INR_CRORE',
    });
    expect(undefinedResult.normalizedValue).toBeUndefined();

    const nanResult = UnitNormalizer.normalize({
      value: NaN,
      rawUnit: 'INR_CRORE',
    });
    expect(nanResult.normalizedValue).toBeUndefined();
  });
});
