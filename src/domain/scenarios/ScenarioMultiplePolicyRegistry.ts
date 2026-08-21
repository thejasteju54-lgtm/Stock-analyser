/**
 * ScenarioMultiplePolicyRegistry.ts
 * Phase 13 — Deterministic Policy for Scenario Valuation Multiples
 * (P/E, EV/EBITDA, P/B) based on historical percentiles, peer benchmarking,
 * ROE/ROCE spreads, and cash conversion ratios.
 */

export interface MultipleSelectionInputs {
  primaryMethod: 'PE' | 'EV_EBITDA' | 'PB';
  historicalMedian?: number;
  historical25thPercentile?: number;
  historical75thPercentile?: number;
  peerMedian?: number;
  projectedRoe?: number; // in %
  projectedRoce?: number; // in %
  projectedFcfToPat?: number; // Cash conversion ratio
  hasForensicFlags?: boolean;
}

export interface ScenarioMultipleResult {
  baseMultiple: number;
  bullMultiple: number;
  bearMultiple: number;
  selectedRange: { low: number; base: number; high: number };
  rationale: string;
  adjustments: string[];
  confidence: number;
}

export class ScenarioMultiplePolicyRegistry {
  /**
   * Deterministically calculates justifiable multiple intervals across Base, Bull, and Bear.
   */
  public static evaluateMultiples(inputs: MultipleSelectionInputs): ScenarioMultipleResult {
    const adjustments: string[] = [];

    // Fallback sector baseline if history/peers unavailable
    const defaultBaseline = inputs.primaryMethod === 'PE' ? 18.0 : inputs.primaryMethod === 'EV_EBITDA' ? 11.0 : 2.5;

    const histMed = inputs.historicalMedian ?? defaultBaseline;
    const peerMed = inputs.peerMedian ?? histMed;
    const p25 = inputs.historical25thPercentile ?? histMed * 0.8;
    const p75 = inputs.historical75thPercentile ?? histMed * 1.25;

    // 1. Base Multiple calculation
    // Weighted blend: 60% historical median + 40% peer median
    let base = Math.round((histMed * 0.6 + peerMed * 0.4) * 10) / 10;

    // Quality adjustments
    if (inputs.projectedRoe && inputs.projectedRoe > 20) {
      base = Math.round(base * 1.08 * 10) / 10;
      adjustments.push('ROE > 20% premium (+8%)');
    } else if (inputs.projectedRoe && inputs.projectedRoe < 10) {
      base = Math.round(base * 0.90 * 10) / 10;
      adjustments.push('ROE < 10% discount (-10%)');
    }

    if (inputs.hasForensicFlags) {
      base = Math.round(base * 0.88 * 10) / 10;
      adjustments.push('Forensic red flag governance discount (-12%)');
    }

    // 2. Bull Multiple calculation
    // Bull caps at p75 with cash conversion requirement (FCF/PAT >= 0.70)
    const fcfPat = inputs.projectedFcfToPat ?? 0.75;
    let bull = Math.min(p75 * 1.1, base * 1.22);
    if (fcfPat < 0.5) {
      bull = Math.min(bull, base * 1.10); // Clamp multiple expansion if cash conversion is weak
      adjustments.push('Weak cash conversion (FCF/PAT < 0.50) clamped Bull multiple expansion');
    }
    bull = Math.round(bull * 10) / 10;

    // 3. Bear Multiple calculation
    // Bear aligns with p25 or base * 0.78
    let bear = Math.max(p25 * 0.9, base * 0.76);
    bear = Math.round(bear * 10) / 10;

    // Ensure strict ordering: Bear <= Base <= Bull
    if (bear > base) bear = Math.round(base * 0.85 * 10) / 10;
    if (bull < base) bull = Math.round(base * 1.15 * 10) / 10;

    const rationale = `Base multiple (${base.toFixed(1)}x) anchored on historical median (${histMed.toFixed(1)}x) & peer median (${peerMed.toFixed(1)}x); Bull (${bull.toFixed(1)}x) bounded by 75th percentile; Bear (${bear.toFixed(1)}x) bounded by 25th percentile.`;

    const confidence = inputs.historicalMedian !== undefined && inputs.peerMedian !== undefined ? 85 : 65;

    return {
      baseMultiple: base,
      bullMultiple: bull,
      bearMultiple: bear,
      selectedRange: { low: bear, base, high: bull },
      rationale,
      adjustments,
      confidence,
    };
  }
}
