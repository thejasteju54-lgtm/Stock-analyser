/**
 * 16_pointInTimeLookAheadBiasSentinel.test.ts
 * Phase 16 — Look-Ahead Bias Sentinel & Post-Cutoff Suppression Verification.
 */

import { describe, it, expect } from 'vitest';
import { PointInTimeIntegrityEngine } from '../../../src/domain/dataSources/PointInTimeIntegrityEngine';

describe('Point-in-Time Look-Ahead Bias Sentinel (Phase 16)', () => {
  it('filters out post-cutoff items and flags look-ahead bias', () => {
    const items = [
      {
        category: 'NEWS' as const,
        headline: 'Q1 Results robust',
        publicationDate: '2024-05-10T12:00:00Z', // Before cutoff
      },
      {
        category: 'NEWS' as const,
        headline: 'CEO resigns',
        publicationDate: '2024-07-15T12:00:00Z', // After cutoff!
      },
    ];

    const result = PointInTimeIntegrityEngine.filterPointInTime(items, '2024-06-30T23:59:59Z');

    expect(result.eligibleItems.length).toBe(1);
    expect(result.eligibleItems[0].headline).toBe('Q1 Results robust');
    expect(result.suppressedCount).toBe(1);
    expect(result.lookAheadBiasDetected).toBe(true);
  });
});
