/**
 * InterestingPricePolicyRegistry.ts
 * Phase 14 — Deterministic Policy for "Interesting Price Range" Derivation.
 */

import { InterestingPriceRange } from './VerdictTypes';

export interface InterestingPriceInputs {
  conservativeIntrinsicValue: number | null;
  requiredMarginOfSafetyPercent: number; // e.g. 15.0%
  bearValuation: number | null;
  referenceMethod: string;
  valuationSource: string;
}

export class InterestingPricePolicyRegistry {
  /**
   * Derives the price interval at which the stock achieves an attractive Margin of Safety.
   */
  public static calculateInterestingPriceRange(
    inputs: InterestingPriceInputs
  ): InterestingPriceRange {
    const conservativeValue = inputs.conservativeIntrinsicValue;
    const requiredMoS = inputs.requiredMarginOfSafetyPercent || 15.0;

    if (conservativeValue === null || conservativeValue <= 0) {
      return {
        lowPrice: null,
        highPrice: null,
        displayRange: 'Valuation data insufficient to establish entry bracket.',
        referenceMethod: inputs.referenceMethod || 'UNAVAILABLE',
        valuationSource: inputs.valuationSource || 'UNAVAILABLE',
        impliedMarginOfSafetyPercent: requiredMoS,
        isAssessable: false,
        rationale: 'Conservative intrinsic value is missing or unassessable.',
      };
    }

    // High entry price is exactly at the required Margin of Safety boundary
    const highPrice = Math.round(conservativeValue * (1.0 - requiredMoS / 100.0) * 10) / 10;

    // Low entry price is anchored either to Bear Case valuation or 15% below the High entry price
    const bearVal = inputs.bearValuation;
    let lowPrice: number;
    if (bearVal !== null && bearVal > 0 && bearVal < highPrice) {
      lowPrice = Math.round(bearVal * 10) / 10;
    } else {
      lowPrice = Math.round(highPrice * 0.85 * 10) / 10;
    }

    const displayRange = `₹${lowPrice.toLocaleString('en-IN')} – ₹${highPrice.toLocaleString('en-IN')}`;

    return {
      lowPrice,
      highPrice,
      displayRange,
      referenceMethod: inputs.referenceMethod,
      valuationSource: inputs.valuationSource,
      impliedMarginOfSafetyPercent: requiredMoS,
      isAssessable: true,
      rationale: `Derived from conservative intrinsic value (₹${conservativeValue.toLocaleString('en-IN')}) incorporating ${requiredMoS}% required Margin of Safety.`,
    };
  }
}
