/**
 * FreshnessEngine.ts
 * Rigorous Data Freshness & Expiry Lifecycle Engine
 * Classifies data freshness across market quotes, news, quarterly filings, and annual reports.
 */

export type FreshnessCategory = 'MARKET_PRICE' | 'NEWS_EVENT' | 'QUARTERLY_FILING' | 'ANNUAL_REPORT' | 'MACRO_DATA';

export type FreshnessStatus = 'LIVE' | 'FRESH' | 'AGING' | 'STALE' | 'UNAVAILABLE';

export interface FreshnessAssessment {
  status: FreshnessStatus;
  category: FreshnessCategory;
  observedAt: string;
  ageInHours: number;
  thresholdHours: number;
  label: string;
  isActionable: boolean;
}

export class FreshnessEngine {
  private static TTL_HOURS: Record<FreshnessCategory, { liveMax: number; freshMax: number; agingMax: number }> = {
    MARKET_PRICE: { liveMax: 0.25, freshMax: 24, agingMax: 72 }, // 15 mins live, 24h fresh (EOD)
    NEWS_EVENT: { liveMax: 2, freshMax: 48, agingMax: 168 }, // 2h breaking, 48h fresh, 7d aging
    QUARTERLY_FILING: { liveMax: 24, freshMax: 24 * 95, agingMax: 24 * 135 }, // ~90 days
    ANNUAL_REPORT: { liveMax: 24 * 30, freshMax: 24 * 380, agingMax: 24 * 450 }, // ~1 year
    MACRO_DATA: { liveMax: 24 * 30, freshMax: 24 * 180, agingMax: 24 * 365 },
  };

  /**
   * Evaluates freshness of a specific observation.
   */
  static assessFreshness(
    category: FreshnessCategory,
    observedAtIso?: string,
    isExchangeSessionOpen: boolean = false
  ): FreshnessAssessment {
    if (!observedAtIso || isNaN(Date.parse(observedAtIso))) {
      return {
        status: 'UNAVAILABLE',
        category,
        observedAt: observedAtIso || 'NONE',
        ageInHours: Infinity,
        thresholdHours: 0,
        label: 'Observation Unavailable',
        isActionable: false,
      };
    }

    const observedTime = new Date(observedAtIso).getTime();
    const now = Date.now();
    const ageInHours = Math.max(0, (now - observedTime) / (1000 * 60 * 60));
    const limits = this.TTL_HOURS[category];

    if (category === 'MARKET_PRICE' && isExchangeSessionOpen && ageInHours <= limits.liveMax) {
      return {
        status: 'LIVE',
        category,
        observedAt: observedAtIso,
        ageInHours,
        thresholdHours: limits.liveMax,
        label: `LIVE (${Math.round(ageInHours * 60)}m ago)`,
        isActionable: true,
      };
    }

    if (ageInHours <= limits.freshMax) {
      return {
        status: 'FRESH',
        category,
        observedAt: observedAtIso,
        ageInHours,
        thresholdHours: limits.freshMax,
        label: ageInHours < 24 ? `Fresh (${Math.round(ageInHours)}h ago)` : `Fresh (${Math.round(ageInHours / 24)}d ago)`,
        isActionable: true,
      };
    }

    if (ageInHours <= limits.agingMax) {
      return {
        status: 'AGING',
        category,
        observedAt: observedAtIso,
        ageInHours,
        thresholdHours: limits.agingMax,
        label: `Aging (${Math.round(ageInHours / 24)}d ago)`,
        isActionable: true,
      };
    }

    return {
      status: 'STALE',
      category,
      observedAt: observedAtIso,
      ageInHours,
      thresholdHours: limits.agingMax,
      label: `STALE (${Math.round(ageInHours / 24)}d ago)`,
      isActionable: false,
    };
  }
}
