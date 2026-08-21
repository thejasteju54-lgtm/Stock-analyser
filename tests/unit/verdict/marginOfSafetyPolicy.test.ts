import { describe, it, expect } from 'vitest';
import { MarginOfSafetyPolicyRegistry } from '../../../src/domain/verdict/MarginOfSafetyPolicyRegistry';

describe('Phase 14 — MarginOfSafetyPolicyRegistry', () => {
  it('correctly applies base required Margin of Safety by archetype', () => {
    const defensive = MarginOfSafetyPolicyRegistry.evaluateMarginOfSafety({
      currentPrice: 850,
      economicArchetype: 'UTILITY_REGULATED',
      conservativeIntrinsicValue: 1000,
      conservativeReferenceMethod: 'DCF Base',
      bearValuation: 800,
      baseValuation: 1000,
      bullValuation: 1200,
      valuationConfidenceScore: 85,
      forensicWatchApplied: false,
    });
    expect(defensive.requiredMarginOfSafetyPercent).toBe(10.0);
    expect(defensive.actualMarginOfSafetyPercent).toBe(15.0); // (1000 - 850)/1000 = 15%
    expect(defensive.status).toBe('ADEQUATE');

    const conglomerate = MarginOfSafetyPolicyRegistry.evaluateMarginOfSafety({
      currentPrice: 850,
      economicArchetype: 'CONGLOMERATE',
      conservativeIntrinsicValue: 1000,
      conservativeReferenceMethod: 'DCF Base',
      bearValuation: 800,
      baseValuation: 1000,
      bullValuation: 1200,
      valuationConfidenceScore: 85,
      forensicWatchApplied: false,
    });
    expect(conglomerate.requiredMarginOfSafetyPercent).toBe(20.0);
    expect(conglomerate.status).toBe('LIMITED'); // 15% actual < 20% required
  });

  it('applies dynamic penalties for low confidence, extreme downside, and forensic watch', () => {
    const penalized = MarginOfSafetyPolicyRegistry.evaluateMarginOfSafety({
      currentPrice: 1000,
      economicArchetype: 'OPERATING_INDUSTRIAL', // Base: 15.0%
      conservativeIntrinsicValue: 1200,
      conservativeReferenceMethod: 'DCF Base',
      bearValuation: 600, // Downside: -40% (> 30% penalty +5%)
      baseValuation: 1200,
      bullValuation: 1500,
      valuationConfidenceScore: 50, // Low confidence penalty +5%
      forensicWatchApplied: true, // Forensic watch penalty +3%
    });

    // 15.0 + 5.0 + 5.0 + 3.0 = 28.0%
    expect(penalized.requiredMarginOfSafetyPercent).toBe(28.0);
    expect(penalized.actualMarginOfSafetyPercent).toBe(16.7); // (1200 - 1000)/1200 = 16.67%
    expect(penalized.status).toBe('LIMITED');
  });

  it('handles negative margin of safety and unassessable values', () => {
    const extended = MarginOfSafetyPolicyRegistry.evaluateMarginOfSafety({
      currentPrice: 1300,
      economicArchetype: 'OPERATING_INDUSTRIAL',
      conservativeIntrinsicValue: 1000,
      conservativeReferenceMethod: 'DCF Base',
      bearValuation: 800,
      baseValuation: 1000,
      bullValuation: 1200,
      valuationConfidenceScore: 80,
      forensicWatchApplied: false,
    });

    // (1000 - 1300)/1000 = -30.0%
    expect(extended.actualMarginOfSafetyPercent).toBe(-30.0);
    expect(extended.status).toBe('NEGATIVE');

    const unassessable = MarginOfSafetyPolicyRegistry.evaluateMarginOfSafety({
      currentPrice: 0,
      economicArchetype: 'OPERATING_INDUSTRIAL',
      conservativeIntrinsicValue: null,
      conservativeReferenceMethod: 'UNAVAILABLE',
      bearValuation: null,
      baseValuation: null,
      bullValuation: null,
      valuationConfidenceScore: 0,
      forensicWatchApplied: false,
    });
    expect(unassessable.status).toBe('NOT_ASSESSABLE');
    expect(unassessable.actualMarginOfSafetyPercent).toBeNull();
  });
});
