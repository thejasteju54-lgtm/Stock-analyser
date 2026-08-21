import { describe, it, expect } from 'vitest';
import { ConvictionPolicyRegistry } from '../../../src/domain/verdict/ConvictionPolicyRegistry';

describe('Phase 14 — ConvictionPolicyRegistry', () => {
  it('calculates clean high conviction for verified evidence', () => {
    const result = ConvictionPolicyRegistry.evaluateConviction({
      evidenceQualityNormalized: 0.9,
      crossLayerAgreementNormalized: 0.95,
      valuationConfidenceNormalized: 0.85,
      scenarioConfidenceNormalized: 0.85,
      isPriceStale: false,
      isFinancialsStale: false,
      isNewsStale: false,
      areScenarioProbabilitiesPlaceholders: false,
      forensicStatus: 'NO_MATERIAL_CONCERN',
      unresolvedConflictCount: 0,
      isThesisBreakerApproaching: false,
    });

    // Base: 0.35*0.9 + 0.25*0.95 + 0.20*0.85 + 0.20*0.85 = 0.315 + 0.2375 + 0.17 + 0.17 = 0.8925 -> 8.9
    expect(result.rawConviction).toBe(8.9);
    expect(result.convictionScore).toBe(8.9);
    expect(result.convictionBand).toBe('HIGH');
    expect(result.totalPenalties).toBe(0.0);
  });

  it('applies penalties for stale price, placeholder probabilities, and forensic watch', () => {
    const penalized = ConvictionPolicyRegistry.evaluateConviction({
      evidenceQualityNormalized: 0.8,
      crossLayerAgreementNormalized: 0.8,
      valuationConfidenceNormalized: 0.8,
      scenarioConfidenceNormalized: 0.8, // Base = 0.8 -> Raw = 8.0
      isPriceStale: true, // -1.5
      areScenarioProbabilitiesPlaceholders: true, // -2.0
      forensicStatus: 'WATCH', // -1.0
      unresolvedConflictCount: 1, // -1.0
      isThesisBreakerApproaching: true, // -1.0
    });

    // Total penalties = 1.5 + 2.0 + 1.0 + 1.0 + 1.0 = 6.5
    // Final = clamp(0, 10, 8.0 - 6.5) = 1.5
    expect(penalized.rawConviction).toBe(8.0);
    expect(penalized.totalPenalties).toBe(6.5);
    expect(penalized.convictionScore).toBe(1.5);
    expect(penalized.convictionBand).toBe('VERY_LOW');
  });

  it('sets 10/10 decision certainty for critical override AVOID', () => {
    const override = ConvictionPolicyRegistry.evaluateConviction({
      evidenceQualityNormalized: 0.5,
      crossLayerAgreementNormalized: 0.5,
      valuationConfidenceNormalized: 0.5,
      scenarioConfidenceNormalized: 0.5,
      isOverridingAvoid: true,
      forensicStatus: 'CRITICAL_OVERRIDE',
    });

    expect(override.convictionScore).toBe(10.0);
    expect(override.decisionConfidenceScore).toBe(10.0);
    expect(override.convictionBand).toBe('VERY_HIGH');
  });
});
