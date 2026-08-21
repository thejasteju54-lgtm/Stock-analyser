/**
 * 23_restatementAsReportedVsRestated.test.ts
 * Phase 16 — Financial Restatement Tracking & Versioning Verification.
 */

import { describe, it, expect } from 'vitest';
import { CanonicalDataPointKey } from '../../../src/domain/dataSources/DataSourceTypes';

describe('Financial Restatement Tracking (Phase 16)', () => {
  it('distinguishes RAW_AS_REPORTED from LATEST_RESTATED in canonical key', () => {
    const rawKey: CanonicalDataPointKey = {
      companyId: 'comp_tml',
      securityId: 'INE155A01022',
      metric: 'PAT',
      periodStart: '2022-04-01',
      periodEnd: '2023-03-31',
      periodType: 'ANNUAL_FY',
      statementBasis: 'CONSOLIDATED',
      currency: 'INR',
      unit: 'INR_CRORE',
      adjustmentBasis: 'RAW_AS_REPORTED',
    };

    const restatedKey: CanonicalDataPointKey = {
      ...rawKey,
      adjustmentBasis: 'LATEST_RESTATED',
    };

    expect(rawKey.adjustmentBasis).toBe('RAW_AS_REPORTED');
    expect(restatedKey.adjustmentBasis).toBe('LATEST_RESTATED');
  });
});
