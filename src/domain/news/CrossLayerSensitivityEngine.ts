/**
 * CrossLayerSensitivityEngine.ts
 * Phase 11 — Cross-Layer Sensitivity & Evidence Correlation Engine.
 * Strictly non-mutating: provides analytical observation linkages to Phases 5–10 without altering any underlying state.
 */

import {
  NewsEvent,
  IndustryProfile,
  CrossLayerSensitivityItem,
} from './NewsAndIndustryTypes';

export class CrossLayerSensitivityEngine {
  /**
   * Generates cross-layer sensitivity items connecting external events to earlier analytical layers.
   */
  public static generateSensitivities(
    newsEvents: NewsEvent[],
    industryProfile: IndustryProfile
  ): CrossLayerSensitivityItem[] {
    const items: CrossLayerSensitivityItem[] = [];

    // 1. Link to Phase 5 / Phase 6 (Financials & Margins)
    const commodityEvents = newsEvents.filter((e) => e.eventCategory === 'COMMODITY' || e.eventCategory === 'SUPPLY_CHAIN');
    if (commodityEvents.length > 0 || industryProfile.inputCosts.length > 0) {
      items.push({
        linkageId: 'link_phase5_margins',
        targetPhase: 'PHASE_5_FINANCIALS',
        shockEventHeadline: commodityEvents[0]?.headline || 'Input Commodity Price Fluctuations',
        businessChannel: 'Raw Material Bill-of-Materials Cost Pass-Through',
        financialChannel: 'MARGINS',
        observationNote: 'External commodity trend presents potential gross margin sensitivity (historical RM intensity ~65% of revenue). Analytical observation only; Phase 5 metrics remain unmodified.',
        isCausalityProven: false,
        status: 'OBSERVATION_ONLY',
      });
    }

    // 2. Link to Phase 7 (Forensics & Contingent Liabilities)
    const legalEvents = newsEvents.filter((e) => e.eventCategory === 'LEGAL' || e.eventCategory === 'LITIGATION' || e.eventCategory === 'REGULATORY');
    if (legalEvents.length > 0) {
      items.push({
        linkageId: 'link_phase7_forensics',
        targetPhase: 'PHASE_7_FORENSICS',
        shockEventHeadline: legalEvents[0].headline,
        businessChannel: 'Regulatory Compliance & Dispute Resolution',
        financialChannel: 'REGULATORY_COST',
        observationNote: `Active regulatory/legal event (${legalEvents[0].headline}) links to Phase 7 contingent liability monitoring queue without altering forensic severity score.`,
        isCausalityProven: false,
        status: 'OBSERVATION_ONLY',
      });
    }

    // 3. Link to Phase 8 (Management Commitment Verification)
    const capexEvents = newsEvents.filter((e) => e.eventCategory === 'CAPEX' || e.eventCategory === 'EXPANSION' || e.eventCategory === 'ORDER_WIN');
    if (capexEvents.length > 0) {
      items.push({
        linkageId: 'link_phase8_management',
        targetPhase: 'PHASE_8_MANAGEMENT',
        shockEventHeadline: capexEvents[0].headline,
        businessChannel: 'Strategic Project Execution Timeline',
        financialChannel: 'CAPEX',
        observationNote: `External development (${capexEvents[0].headline}) aligns with management capacity expansion commitments; tracked for delivery milestone verification.`,
        isCausalityProven: false,
        status: 'OBSERVATION_ONLY',
      });
    }

    // 4. Link to Phase 9 (Valuation Assumptions)
    if (industryProfile.growthHistory.some((g) => g.growthType === 'FORECAST')) {
      const forecast = industryProfile.growthHistory.find((g) => g.growthType === 'FORECAST');
      items.push({
        linkageId: 'link_phase9_valuation',
        targetPhase: 'PHASE_9_VALUATION',
        shockEventHeadline: `Industry 5-Year Forecast Growth (${forecast?.growthRatePercent}% CAGR)`,
        businessChannel: 'Long-Term Industry Volume Trajectory',
        financialChannel: 'REVENUE',
        observationNote: `Industry forecast CAGR (${forecast?.growthRatePercent}%) provides an external benchmark context for Phase 9 DCF revenue growth assumptions. Phase 9 DCF scenarios remain intact.`,
        isCausalityProven: false,
        status: 'OBSERVATION_ONLY',
      });
    }

    // 5. Link to Phase 10 (Technical Price-Event Correlation)
    const materialEvents = newsEvents.filter((e) => e.impactAssessment.magnitude === 'MATERIAL');
    if (materialEvents.length > 0) {
      items.push({
        linkageId: 'link_phase10_technical',
        targetPhase: 'PHASE_10_TECHNICAL',
        shockEventHeadline: materialEvents[0].headline,
        businessChannel: 'Market Reaction on Event Announcement Date',
        financialChannel: 'VALUATION_MULTIPLE',
        observationNote: `Announcement date (${materialEvents[0].eventDate}) corresponds to point-in-time trading session; correlation context logged without asserting unproven causality.`,
        isCausalityProven: false,
        correlationContext: `Event Date: ${materialEvents[0].eventDate}`,
        status: 'OBSERVATION_ONLY',
      });
    }

    return items;
  }
}
