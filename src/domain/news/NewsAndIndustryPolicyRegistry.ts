/**
 * NewsAndIndustryPolicyRegistry.ts
 * Phase 11 — Centralized deterministic policy registry for News & Industry Intelligence.
 * Zero LLM-invented materiality scores, strict tier rules, and non-mutating cross-layer linkages.
 */

import {
  NewsSourceTier,
  NewsCategory,
  FinancialChannel,
  CompanyRelevance,
  ImpactMagnitude,
  ImpactHorizon,
  TemporalEventStatus,
  FactCertainty,
  IndustryCycleStage,
} from './NewsAndIndustryTypes';

export class NewsAndIndustryPolicyRegistry {
  /**
   * Source Tier Reliability Weights & Validation
   */
  public static getSourceTierRules(tier: NewsSourceTier): {
    tierWeight: number;
    canEstablishMaterialFactAlone: boolean;
    description: string;
  } {
    switch (tier) {
      case 'TIER_1_PRIMARY':
        return {
          tierWeight: 1.0,
          canEstablishMaterialFactAlone: true,
          description: 'Official exchange filings, regulator notifications, and direct company disclosures.',
        };
      case 'TIER_2_HIGH_QUALITY_MEDIA':
        return {
          tierWeight: 0.85,
          canEstablishMaterialFactAlone: true,
          description: 'High-quality financial media (Reuters, Mint, Economic Times, Business Standard, CNBC-TV18).',
        };
      case 'TIER_3_SECONDARY':
        return {
          tierWeight: 0.60,
          canEstablishMaterialFactAlone: false,
          description: 'Secondary research portals, aggregator feeds, and trade newsletters.',
        };
      case 'TIER_4_DISCOVERY_ONLY':
        return {
          tierWeight: 0.20,
          canEstablishMaterialFactAlone: false,
          description: 'Blogs, social media, and forums. Discovery only; cannot establish material facts independently.',
        };
    }
  }

  /**
   * Deterministically calculates News Materiality Score (0 to 100).
   * Exact Weights:
   * - Company Relevance: 30%
   * - Impact Magnitude: 25%
   * - Source Quality & Corroboration: 25%
   * - Duration & Strategic Horizon: 20%
   * Deductions:
   * - Conflict Penalty: -15 pts
   * - Rumor / Speculation Penalty: -20 pts
   */
  public static calculateMaterialityScore(params: {
    relevance: CompanyRelevance;
    magnitude: ImpactMagnitude;
    horizon: ImpactHorizon;
    highestSourceTier: NewsSourceTier;
    isCorroborated: boolean;
    hasConflict: boolean;
    certainty: FactCertainty;
  }): number {
    let score = 0;

    // 1. Company Relevance (30 pts max)
    switch (params.relevance) {
      case 'DIRECT_COMPANY':
        score += 30;
        break;
      case 'MATERIAL_COMPANY':
        score += 25;
        break;
      case 'INDIRECT_COMPANY':
        score += 15;
        break;
      case 'SECTOR_ONLY':
        score += 10;
        break;
      case 'IRRELEVANT':
        score += 0;
        break;
    }

    // 2. Financial & Business Magnitude (25 pts max)
    switch (params.magnitude) {
      case 'MATERIAL':
        score += 25;
        break;
      case 'HIGH':
        score += 20;
        break;
      case 'MEDIUM':
        score += 12;
        break;
      case 'LOW':
        score += 5;
        break;
      case 'UNKNOWN':
        score += 0;
        break;
    }

    // 3. Source Quality & Corroboration (25 pts max)
    const tierRules = this.getSourceTierRules(params.highestSourceTier);
    let sourceScore = tierRules.tierWeight * 18;
    if (params.isCorroborated) sourceScore += 7;
    score += Math.min(25, sourceScore);

    // 4. Strategic Horizon & Duration (20 pts max)
    switch (params.horizon) {
      case 'STRUCTURAL':
        score += 20;
        break;
      case 'LONG_TERM':
        score += 16;
        break;
      case 'MEDIUM_TERM':
        score += 12;
        break;
      case 'SHORT_TERM':
        score += 8;
        break;
      case 'IMMEDIATE':
        score += 5;
        break;
      case 'UNKNOWN':
        score += 0;
        break;
    }

    // Deductions
    if (params.hasConflict) {
      score -= 15; // Unresolved conflicting source penalty
    }
    if (params.certainty === 'RUMOR' || params.certainty === 'SPECULATION') {
      score -= 20; // Unverified speculation penalty
    } else if (params.certainty === 'UNCONFIRMED') {
      score -= 10;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Deterministically maps News Categories to primary Financial Channels.
   */
  public static getChannelsForCategory(category: NewsCategory): {
    primaryChannel: FinancialChannel;
    secondaryChannels: FinancialChannel[];
  } {
    switch (category) {
      case 'RESULTS':
      case 'EARNINGS':
        return { primaryChannel: 'REVENUE', secondaryChannels: ['MARGINS', 'CASH_FLOW', 'DEBT'] };
      case 'ORDER_WIN':
      case 'CONTRACT':
        return { primaryChannel: 'REVENUE', secondaryChannels: ['VOLUME', 'WORKING_CAPITAL'] };
      case 'ORDER_LOSS':
        return { primaryChannel: 'REVENUE', secondaryChannels: ['VOLUME', 'MARKET_SHARE'] };
      case 'CAPEX':
      case 'EXPANSION':
        return { primaryChannel: 'CAPEX', secondaryChannels: ['DEBT', 'CASH_FLOW', 'ASSET_VALUE'] };
      case 'ACQUISITION':
      case 'DIVESTMENT':
        return { primaryChannel: 'ASSET_VALUE', secondaryChannels: ['DEBT', 'REVENUE', 'MARKET_SHARE'] };
      case 'DEBT':
      case 'CREDIT_RATING':
      case 'FUNDRAISING':
        return { primaryChannel: 'DEBT', secondaryChannels: ['CASH_FLOW', 'VALUATION_MULTIPLE'] };
      case 'REGULATORY':
      case 'GOVERNMENT_POLICY':
      case 'TAX':
        return { primaryChannel: 'REGULATORY_COST', secondaryChannels: ['MARGINS', 'TAX', 'PRICING'] };
      case 'COMMODITY':
      case 'SUPPLY_CHAIN':
        return { primaryChannel: 'MARGINS', secondaryChannels: ['PRICING', 'COST_STRUCTURE'] };
      case 'COMPETITOR':
      case 'PRODUCT':
        return { primaryChannel: 'COMPETITIVE_POSITION', secondaryChannels: ['MARKET_SHARE', 'PRICING'] };
      case 'LEGAL':
      case 'LITIGATION':
      case 'GOVERNANCE':
      case 'PROMOTER_ACTIVITY':
      case 'MANAGEMENT_CHANGE':
        return { primaryChannel: 'VALUATION_MULTIPLE', secondaryChannels: ['CASH_FLOW', 'REGULATORY_COST'] };
      default:
        return { primaryChannel: 'OTHER', secondaryChannels: [] };
    }
  }

  /**
   * Classifies temporal status based on event date, publication date, and event lifecycle.
   */
  public static classifyTemporalStatus(
    eventDate: string | undefined,
    currentDate: string,
    isOngoingInvestigationOrCase: boolean,
    isFutureScheduled: boolean
  ): TemporalEventStatus {
    if (isFutureScheduled) return 'FUTURE_EXPECTED';
    if (isOngoingInvestigationOrCase) return 'ONGOING';
    if (!eventDate) return 'HISTORICAL';

    const eventTime = new Date(eventDate).getTime();
    const currTime = new Date(currentDate).getTime();
    const diffDays = (currTime - eventTime) / (1000 * 3600 * 24);

    if (diffDays <= 7) return 'NEW';
    if (diffDays <= 90) return 'ONGOING';
    return 'HISTORICAL';
  }

  /**
   * Deterministically evaluates Industry Cycle Stage.
   */
  public static evaluateIndustryCycle(
    revenueGrowthPercent: number | null,
    marginTrend: 'EXPANDING' | 'STABLE' | 'CONTRACTING' | 'UNKNOWN',
    capacityUtilizationPercent: number | null,
    pricingPower: 'STRONG' | 'MODERATE' | 'WEAK' | 'NOT_ASSESSABLE'
  ): IndustryCycleStage {
    if (revenueGrowthPercent === null) return 'UNKNOWN';

    if (revenueGrowthPercent > 18 && (marginTrend === 'EXPANDING' || pricingPower === 'STRONG')) {
      return 'STRUCTURAL_GROWTH';
    }

    if (revenueGrowthPercent > 12 && marginTrend === 'EXPANDING') {
      return 'EXPANSION';
    }

    if (revenueGrowthPercent > 5 && marginTrend === 'STABLE' && capacityUtilizationPercent && capacityUtilizationPercent > 85) {
      return 'PEAK';
    }

    if (revenueGrowthPercent >= 0 && revenueGrowthPercent <= 5 && marginTrend === 'CONTRACTING') {
      return 'SLOWDOWN';
    }

    if (revenueGrowthPercent < 0 && marginTrend === 'CONTRACTING') {
      return 'CONTRACTION';
    }

    if (revenueGrowthPercent > 0 && marginTrend === 'STABLE' && capacityUtilizationPercent && capacityUtilizationPercent < 70) {
      return 'RECOVERY';
    }

    return 'EARLY_EXPANSION';
  }
}
