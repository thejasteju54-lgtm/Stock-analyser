/**
 * TerminalGrowthPolicyRegistry.ts
 * Phase 13 — Deterministic Terminal Growth Policy, Nominal GDP Anchor,
 * Inflation Context, and DCF WACC Inversion Guards.
 */

export interface TerminalGrowthParameters {
  currency: string; // 'INR', 'USD', 'EUR', etc.
  country: string; // 'INDIA', 'US', etc.
  waccPercent: number; // in %
  industryStructuralGrowthPercent?: number;
  policyCapException?: boolean;
}

export interface TerminalGrowthResult {
  terminalGrowthPercent: number;
  nominalGdpGrowthEstimatePercent: number;
  inflationContextPercent: number;
  referenceEconomy: string;
  isDcfValid: boolean;
  statusMessage: string;
  rationale: string;
  confidence: number;
}

export class TerminalGrowthPolicyRegistry {
  /**
   * Deterministically evaluates terminal growth rate with economic anchors & WACC check.
   * Prevents terminalGrowth >= WACC (which breaks DCF math).
   * Caps terminal growth at Nominal GDP - 2.0%.
   */
  public static evaluateTerminalGrowth(params: TerminalGrowthParameters): TerminalGrowthResult {
    const isIndia = (params.country || '').toUpperCase() === 'INDIA' || params.currency === 'INR';

    // Nominal GDP benchmarks
    const nominalGdp = isIndia ? 10.5 : 5.0; // 6.5% real + 4% inflation for India; 2.5% + 2.5% for US/Global
    const inflation = isIndia ? 4.5 : 2.2;
    const referenceEconomy = isIndia ? 'India (INR-denominated)' : 'Global / Developed Market';

    // Standard long-term terminal growth is clamped at Nominal GDP - 2.0% (e.g. 5.0% for India)
    const maxPermissibleTerminalGrowth = isIndia ? 5.5 : 2.5;
    let selectedGrowth = isIndia ? 5.0 : 2.0;

    if (params.industryStructuralGrowthPercent && params.industryStructuralGrowthPercent > 0) {
      selectedGrowth = Math.min(
        maxPermissibleTerminalGrowth,
        Math.max(1.0, params.industryStructuralGrowthPercent * 0.4)
      );
    }

    // WACC Guard check: Terminal growth must strictly be < WACC
    if (params.waccPercent <= selectedGrowth) {
      return {
        terminalGrowthPercent: selectedGrowth,
        nominalGdpGrowthEstimatePercent: nominalGdp,
        inflationContextPercent: inflation,
        referenceEconomy,
        isDcfValid: false,
        statusMessage: `DCF_INVALID: Terminal growth (${selectedGrowth}%) is greater than or equal to WACC (${params.waccPercent}%). Intrinsic DCF calculation is undefined.`,
        rationale: 'DCF model invalid due to discount rate / growth rate inversion.',
        confidence: 0,
      };
    }

    return {
      terminalGrowthPercent: selectedGrowth,
      nominalGdpGrowthEstimatePercent: nominalGdp,
      inflationContextPercent: inflation,
      referenceEconomy,
      isDcfValid: true,
      statusMessage: `VALID: Terminal growth (${selectedGrowth}%) is safely below WACC (${params.waccPercent}%) and capped within nominal GDP (${nominalGdp}%).`,
      rationale: `Terminal growth rate of ${selectedGrowth}% reflects long-term steady-state economic growth for ${referenceEconomy} (Inflation ${inflation}%, Nominal GDP ${nominalGdp}%).`,
      confidence: 90,
    };
  }
}
