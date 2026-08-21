/**
 * MarginOfSafetyPolicyRegistry.ts
 * Phase 14 — Deterministic Policy Registry for Archetype-Aware Margin of Safety.
 */

import { EconomicArchetype } from '../taxonomy/SectorTaxonomyRegistry';
import {
  MarginOfSafetyAssessment,
  MarginOfSafetyStatus,
} from './VerdictTypes';

export interface MarginOfSafetyInputs {
  currentPrice: number;
  economicArchetype: EconomicArchetype;
  conservativeIntrinsicValue: number | null;
  conservativeReferenceMethod: string;
  bearValuation: number | null;
  baseValuation: number | null;
  bullValuation: number | null;
  valuationConfidenceScore: number; // 0-100
  forensicWatchApplied: boolean;
}

export class MarginOfSafetyPolicyRegistry {
  // Base required margin of safety by economic archetype
  public static readonly BASE_MOS_BY_ARCHETYPE: Record<EconomicArchetype, number> = {
    UTILITY_REGULATED: 10.0,      // Regulated utilities, defensive infrastructure
    NON_LENDING_FINANCIAL: 12.5,  // Asset managers, exchanges, brokers
    LENDING_FINANCIAL: 15.0,      // Commercial banks, NBFCs
    OPERATING_INDUSTRIAL: 15.0,   // Capital Goods, Auto, Consumer, Chemicals
    INFRASTRUCTURE_TRUST: 15.0,   // InvITs, REITs
    CONGLOMERATE: 20.0,           // Diversified conglomerates (holding company discount)
  };

  /**
   * Evaluates the Margin of Safety deterministically.
   */
  public static evaluateMarginOfSafety(inputs: MarginOfSafetyInputs): MarginOfSafetyAssessment {
    const archetype = inputs.economicArchetype || 'OPERATING_INDUSTRIAL';
    const baseRequiredMoS = this.BASE_MOS_BY_ARCHETYPE[archetype] ?? 15.0;

    // 1. Dynamic Adjustments
    let dynamicAdjustment = 0;

    // Valuation confidence penalty: +5.0% if confidence < 65%
    if (inputs.valuationConfidenceScore < 65) {
      dynamicAdjustment += 5.0;
    }

    // Scenario downside penalty: +5.0% if Bear downside > 30%
    const currentPrice = inputs.currentPrice;
    let downsideToBearPercent: number | null = null;
    if (inputs.bearValuation !== null && inputs.bearValuation > 0 && currentPrice > 0) {
      downsideToBearPercent = Math.round(((inputs.bearValuation - currentPrice) / currentPrice) * 1000) / 10;
      if (downsideToBearPercent < -30.0) {
        dynamicAdjustment += 5.0;
      }
    }

    // Forensic watch penalty: +3.0%
    if (inputs.forensicWatchApplied) {
      dynamicAdjustment += 3.0;
    }

    const requiredMoS = Math.round((baseRequiredMoS + dynamicAdjustment) * 10) / 10;

    // 2. Upside Spreads
    let upsideToBasePercent: number | null = null;
    if (inputs.baseValuation !== null && inputs.baseValuation > 0 && currentPrice > 0) {
      upsideToBasePercent = Math.round(((inputs.baseValuation - currentPrice) / currentPrice) * 1000) / 10;
    }

    let upsideToBullPercent: number | null = null;
    if (inputs.bullValuation !== null && inputs.bullValuation > 0 && currentPrice > 0) {
      upsideToBullPercent = Math.round(((inputs.bullValuation - currentPrice) / currentPrice) * 1000) / 10;
    }

    // 3. Conservative Intrinsic Value and Actual MoS
    const conservativeValue = inputs.conservativeIntrinsicValue;
    if (conservativeValue === null || conservativeValue <= 0 || currentPrice <= 0) {
      return {
        actualMarginOfSafetyPercent: null,
        requiredMarginOfSafetyPercent: requiredMoS,
        status: 'NOT_ASSESSABLE',
        conservativeIntrinsicValue: null,
        conservativeReferenceMethod: inputs.conservativeReferenceMethod || 'UNAVAILABLE',
        downsideToBearPercent,
        upsideToBasePercent,
        upsideToBullPercent,
        archetypeApplied: archetype,
        confidence: 0,
      };
    }

    const actualMoS = Math.round(((conservativeValue - currentPrice) / conservativeValue) * 1000) / 10;

    // 4. Status Classification
    let status: MarginOfSafetyStatus = 'NONE';
    if (actualMoS >= requiredMoS) {
      status = 'ADEQUATE';
    } else if (actualMoS >= 0) {
      status = 'LIMITED';
    } else if (actualMoS >= -10.0) {
      status = 'NONE';
    } else {
      status = 'NEGATIVE';
    }

    return {
      actualMarginOfSafetyPercent: actualMoS,
      requiredMarginOfSafetyPercent: requiredMoS,
      status,
      conservativeIntrinsicValue: conservativeValue,
      conservativeReferenceMethod: inputs.conservativeReferenceMethod,
      downsideToBearPercent,
      upsideToBasePercent,
      upsideToBullPercent,
      archetypeApplied: archetype,
      confidence: inputs.valuationConfidenceScore,
    };
  }
}
