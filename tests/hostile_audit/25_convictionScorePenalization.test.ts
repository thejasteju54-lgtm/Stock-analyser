/**
 * 25_convictionScorePenalization.test.ts
 * Phase 19 — Hostile Conviction Score Penalization Suite.
 */

import { describe, it, expect } from 'vitest';
import { ConvictionPolicyRegistry } from '../../src/domain/verdict/ConvictionPolicyRegistry';

describe('Conviction Score Penalization Suite', () => {
  it('penalizes conviction score when stale market price, stale financials, or severe forensic concerns are present', () => {
    const unpenalized = ConvictionPolicyRegistry.evaluateConviction({
      evidenceQualityNormalized: 0.9,
      crossLayerAgreementNormalized: 0.9,
      valuationConfidenceNormalized: 0.9,
      scenarioConfidenceNormalized: 0.9,
    });

    const penalized = ConvictionPolicyRegistry.evaluateConviction({
      evidenceQualityNormalized: 0.9,
      crossLayerAgreementNormalized: 0.9,
      valuationConfidenceNormalized: 0.9,
      scenarioConfidenceNormalized: 0.9,
      isPriceStale: true,
      isFinancialsStale: true,
      forensicStatus: 'SEVERE_CONCERN',
      unresolvedConflictCount: 3,
    });

    expect(penalized.convictionScore).toBeLessThan(unpenalized.convictionScore);
    expect(penalized.totalPenalties).toBeGreaterThan(0);
    expect(penalized.penaltyBreakdown.length).toBeGreaterThanOrEqual(3);
  });
});
