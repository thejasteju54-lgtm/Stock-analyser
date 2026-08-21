import { describe, it, expect } from 'vitest';
import { InterestingPricePolicyRegistry } from '../../../src/domain/verdict/InterestingPricePolicyRegistry';

describe('Phase 14 — InterestingPricePolicyRegistry', () => {
  it('calculates accumulation bracket from base intrinsic value and required MoS', () => {
    const res = InterestingPricePolicyRegistry.calculateInterestingPriceRange({
      conservativeIntrinsicValue: 1000,
      requiredMarginOfSafetyPercent: 15.0,
      bearValuation: 800,
      referenceMethod: 'DCF Base',
      valuationSource: 'Phase 9 Valuation',
    });

    // highPrice = 1000 * (1 - 0.15) = 850
    // lowPrice = bearValuation = 800
    expect(res.highPrice).toBe(850);
    expect(res.lowPrice).toBe(800);
    expect(res.impliedMarginOfSafetyPercent).toBe(15.0);
    expect(res.displayRange).toBe('₹800 – ₹850');
    expect(res.isAssessable).toBe(true);
  });

  it('returns unassessable status when intrinsic value is unavailable', () => {
    const res = InterestingPricePolicyRegistry.calculateInterestingPriceRange({
      conservativeIntrinsicValue: null,
      requiredMarginOfSafetyPercent: 15.0,
      bearValuation: null,
      referenceMethod: 'UNAVAILABLE',
      valuationSource: 'UNAVAILABLE',
    });

    expect(res.highPrice).toBeNull();
    expect(res.lowPrice).toBeNull();
    expect(res.isAssessable).toBe(false);
  });
});
