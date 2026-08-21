/**
 * workingCapitalPolicy.test.ts
 * Phase 13 — Working Capital Policy & Outlier Removal Tests.
 * Verifies median lookback, IQR outlier filtering, structural shift detection,
 * and refusal to invent arbitrary working capital normalization.
 */

import { describe, it, expect } from 'vitest';
import { WorkingCapitalPolicyRegistry } from '../../src/domain/scenarios/WorkingCapitalPolicyRegistry';

describe('Phase 13 — Working Capital Policy & Structural Shifts', () => {
  it('computes median days and filters abnormal outlier periods using IQR', () => {
    const values = [55, 60, 62, 58, 140]; // 140 is an outlier
    const filtered = WorkingCapitalPolicyRegistry.filterIqrOutliers(values);
    expect(filtered).not.toContain(140);
    const median = WorkingCapitalPolicyRegistry.calculateMedian(filtered);
    expect(median).toBeCloseTo(59, 1);
  });

  it('detects structural lengthening in latest period and adjusts days accordingly', () => {
    const observations = [
      { period: 'FY22', receivableDays: 50, inventoryDays: 50, payableDays: 50, revenue: 8000 },
      { period: 'FY23', receivableDays: 52, inventoryDays: 52, payableDays: 50, revenue: 9000 },
      { period: 'FY24', receivableDays: 80, inventoryDays: 55, payableDays: 50, revenue: 10000 }, // > 25% lengthening
    ];

    const res = WorkingCapitalPolicyRegistry.evaluateWorkingCapital(observations, 11000, 'BASE');
    expect(res.status).toBe('VERIFIED');
    expect(res.receivableDays).toBeGreaterThan(52); // Weighted upwards due to structural shift
    expect(res.normalizationRationale).toContain('Structural lengthening detected');
  });

  it('returns NOT_ASSESSABLE with default fallbacks when historical observations are empty', () => {
    const res = WorkingCapitalPolicyRegistry.evaluateWorkingCapital([], 10000, 'BASE');
    expect(res.status).toBe('NOT_ASSESSABLE');
    expect(res.normalizationRationale).toContain('NOT_ASSESSABLE');
  });
});
