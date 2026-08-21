/**
 * OperatingLeveragePolicyRegistry.ts
 * Phase 13 — Deterministic Historical Operating Leverage & Incremental Margin Policy.
 */

export interface HistoricalFinancialPeriod {
  periodLabel: string; // e.g. "FY23", "FY24"
  revenue: number; // INR Cr
  ebitda: number; // INR Cr
}

export interface OperatingLeverageResult {
  incrementalMarginPercent: number | null;
  operatingLeverageFactor: number;
  confidence: number;
  isAssessable: boolean;
  historicalObservationsCount: number;
  explanation: string;
}

export class OperatingLeveragePolicyRegistry {
  /**
   * Deterministically evaluates incremental margin and operating leverage factor.
   * Incremental Margin = delta(EBITDA) / delta(Revenue).
   * Operating Leverage Factor = (% delta EBITDA) / (% delta Revenue).
   * Gating: Requires >= 2 periods with positive delta(Revenue).
   */
  public static calculateOperatingLeverage(
    periods: HistoricalFinancialPeriod[]
  ): OperatingLeverageResult {
    if (!periods || periods.length < 2) {
      return {
        incrementalMarginPercent: null,
        operatingLeverageFactor: 1.0, // Neutral 1.0x baseline
        confidence: 0,
        isAssessable: false,
        historicalObservationsCount: periods ? periods.length : 0,
        explanation: 'NOT_ASSESSABLE: Insufficient historical periods (minimum 2 required) to compute empirical operating leverage.',
      };
    }

    // Sort periods chronologically
    const p1 = periods[0]; // Earlier period
    const p2 = periods[periods.length - 1]; // Later period

    const deltaRev = p2.revenue - p1.revenue;
    const deltaEbitda = p2.ebitda - p1.ebitda;

    if (deltaRev <= 0) {
      return {
        incrementalMarginPercent: null,
        operatingLeverageFactor: 1.0,
        confidence: 30,
        isAssessable: false,
        historicalObservationsCount: periods.length,
        explanation: 'NOT_ASSESSABLE: Non-positive revenue delta across historical lookback. Operating leverage cannot be extrapolated.',
      };
    }

    const incrementalMargin = Math.round((deltaEbitda / deltaRev) * 1000) / 10; // in %
    const pctDeltaRev = deltaRev / (p1.revenue || 1);
    const pctDeltaEbitda = deltaEbitda / (p1.ebitda || 1);
    const rawLeverage = pctDeltaRev > 0 ? pctDeltaEbitda / pctDeltaRev : 1.0;

    // Clamp operating leverage factor between 0.5x and 2.5x to prevent absurd extrapolations
    const operatingLeverageFactor = Math.min(2.5, Math.max(0.5, Math.round(rawLeverage * 100) / 100));

    const confidence = periods.length >= 3 ? 85 : 70;

    return {
      incrementalMarginPercent: incrementalMargin,
      operatingLeverageFactor,
      confidence,
      isAssessable: true,
      historicalObservationsCount: periods.length,
      explanation: `Historical incremental margin of ${incrementalMargin}% observed across ${p1.periodLabel}–${p2.periodLabel} (Revenue +INR ${deltaRev.toFixed(0)} Cr, EBITDA +INR ${deltaEbitda.toFixed(0)} Cr), yielding a ${operatingLeverageFactor}x operating leverage factor.`,
    };
  }
}
