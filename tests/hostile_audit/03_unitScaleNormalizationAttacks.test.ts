/**
 * 03_unitScaleNormalizationAttacks.test.ts
 * Phase 19 — Hostile Unit & Scale Normalization Attacks Suite.
 */

import { describe, it, expect } from 'vitest';
import { UnitNormalizer } from '../../src/domain/extraction/UnitNormalizer';

describe('Unit & Scale Normalization Attacks Suite', () => {
  it('correctly normalizes equivalent values across Lakhs, Crores, Millions, and Billions into INR Crores', () => {
    // 100 Crore = 100
    const croreRes = UnitNormalizer.normalize({ value: 100, rawUnit: 'CRORES', rawCurrency: 'INR' });
    expect(croreRes.normalizedValue).toBe(100);
    expect(croreRes.normalizedUnit).toBe('INR_CRORE');

    // 1000 Lakhs = 10 Crores
    const lakhRes = UnitNormalizer.normalize({ value: 1000, rawUnit: 'LAKHS', rawCurrency: 'INR' });
    expect(lakhRes.normalizedValue).toBe(10);
    expect(lakhRes.normalizedUnit).toBe('INR_CRORE');

    // 100 Million = 10 Crores (1 Million = 0.1 Crore)
    const millionRes = UnitNormalizer.normalize({ value: 100, rawUnit: 'MILLIONS', rawCurrency: 'INR' });
    expect(millionRes.normalizedValue).toBe(10);
    expect(millionRes.normalizedUnit).toBe('INR_CRORE');
  });

  it('rejects silent currency conversions when foreign conversion is not explicitly allowed', () => {
    const usdRes = UnitNormalizer.normalize({
      value: 50,
      rawUnit: 'MILLIONS',
      rawCurrency: 'USD',
      allowForeignConversion: false,
    });

    expect(usdRes.normalizedCurrency).toBe('USD');
    expect(usdRes.conversionMetadata).toBeUndefined();
  });
});
