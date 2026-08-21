/**
 * 15_canonicalTemporalFieldSelection.test.ts
 * Phase 16 — Canonical Temporal Field Selection Verification.
 */

import { describe, it, expect } from 'vitest';
import { PointInTimeIntegrityEngine } from '../../../src/domain/dataSources/PointInTimeIntegrityEngine';

describe('Canonical Temporal Field Selection (Phase 16)', () => {
  it('selects tradeTimestamp for Market Data', () => {
    const res = PointInTimeIntegrityEngine.evaluateEligibility(
      {
        category: 'MARKET_DATA',
        tradeTimestamp: '2024-06-28T15:30:00Z',
      },
      '2024-06-30T23:59:59Z'
    );
    expect(res.effectiveCutoffField).toBe('tradeTimestamp');
    expect(res.isEligible).toBe(true);
  });

  it('selects publicationDate for News Articles', () => {
    const res = PointInTimeIntegrityEngine.evaluateEligibility(
      {
        category: 'NEWS',
        publicationDate: '2024-06-15T10:00:00Z',
      },
      '2024-06-30T23:59:59Z'
    );
    expect(res.effectiveCutoffField).toBe('publicationDate');
    expect(res.isEligible).toBe(true);
  });

  it('requires both periodEnd AND publicationDate for Financial Statements', () => {
    // Period ended on 2024-03-31, but was only published on 2024-05-15
    // If analysis cutoff is 2024-04-30, statement should NOT be eligible (was not yet published!)
    const resPrePublish = PointInTimeIntegrityEngine.evaluateEligibility(
      {
        category: 'FINANCIAL_STATEMENTS',
        periodEnd: '2024-03-31',
        publicationDate: '2024-05-15',
      },
      '2024-04-30T23:59:59Z'
    );

    expect(resPrePublish.isEligible).toBe(false);
    expect(resPrePublish.isLookAheadBias).toBe(true);

    // If analysis cutoff is 2024-05-31, statement IS eligible
    const resPostPublish = PointInTimeIntegrityEngine.evaluateEligibility(
      {
        category: 'FINANCIAL_STATEMENTS',
        periodEnd: '2024-03-31',
        publicationDate: '2024-05-15',
      },
      '2024-05-31T23:59:59Z'
    );

    expect(resPostPublish.isEligible).toBe(true);
  });
});
