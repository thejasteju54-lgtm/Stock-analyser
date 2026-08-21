/**
 * ResearchFreshnessPolicyRegistry.ts
 * Phase 15 — Category-Specific Data Freshness Policy Registry.
 */

import { PhaseNodeId } from '../orchestration/AnalysisDependencyGraph';

export interface FreshnessPolicyRule {
  category: string;
  name: string;
  freshThresholdHours: number;
  staleThresholdHours: number;
  criticalStaleThresholdHours: number;
  marketCalendarAware: boolean;
  eventDrivenExceptionAllowed: boolean;
  convictionPenaltyIfStale: number;
  affectedPhases: PhaseNodeId[];
}

export class ResearchFreshnessPolicyRegistry {
  public static readonly POLICIES: Record<string, FreshnessPolicyRule> = {
    MARKET_PRICE: {
      category: 'MARKET_PRICE',
      name: 'Current Market Price',
      freshThresholdHours: 48,
      staleThresholdHours: 48,
      criticalStaleThresholdHours: 120, // 5 calendar days
      marketCalendarAware: true, // Weekends and NSE market holidays are considered fresh
      eventDrivenExceptionAllowed: false,
      convictionPenaltyIfStale: 1.5,
      affectedPhases: ['PHASE_9_VALUATION', 'PHASE_10_TECHNICAL', 'PHASE_14_VERDICT', 'PHASE_15_REPORT'],
    },
    TECHNICAL_DATA: {
      category: 'TECHNICAL_DATA',
      name: 'OHLCV Candlestick Data',
      freshThresholdHours: 48,
      staleThresholdHours: 72,
      criticalStaleThresholdHours: 168, // 7 days
      marketCalendarAware: true,
      eventDrivenExceptionAllowed: false,
      convictionPenaltyIfStale: 0.5,
      affectedPhases: ['PHASE_10_TECHNICAL', 'PHASE_14_VERDICT', 'PHASE_15_REPORT'],
    },
    NEWS: {
      category: 'NEWS',
      name: 'News Intelligence & Filings',
      freshThresholdHours: 168, // 7 days
      staleThresholdHours: 336, // 14 days
      criticalStaleThresholdHours: 720, // 30 days
      marketCalendarAware: false,
      eventDrivenExceptionAllowed: true, // Major corporate action resets freshness requirement
      convictionPenaltyIfStale: 0.5,
      affectedPhases: ['PHASE_11_NEWS_INDUSTRY', 'PHASE_12_CATALYSTS_RISKS', 'PHASE_13_SCENARIOS', 'PHASE_14_VERDICT', 'PHASE_15_REPORT'],
    },
    SHAREHOLDING: {
      category: 'SHAREHOLDING',
      name: 'Shareholding Pattern & Pledge',
      freshThresholdHours: 2520, // 105 days (Quarterly filing cycle)
      staleThresholdHours: 2880, // 120 days
      criticalStaleThresholdHours: 4320, // 180 days
      marketCalendarAware: false,
      eventDrivenExceptionAllowed: true, // Insider trading or bulk deal resets
      convictionPenaltyIfStale: 1.0,
      affectedPhases: ['PHASE_7_FORENSIC', 'PHASE_8_MANAGEMENT', 'PHASE_12_CATALYSTS_RISKS', 'PHASE_13_SCENARIOS', 'PHASE_14_VERDICT', 'PHASE_15_REPORT'],
    },
    FINANCIAL_STATEMENTS: {
      category: 'FINANCIAL_STATEMENTS',
      name: 'Audited Financial Statements',
      freshThresholdHours: 2520, // 105 days (Quarterly/Annual filing cycle)
      staleThresholdHours: 2880, // 120 days
      criticalStaleThresholdHours: 8760, // 365 days
      marketCalendarAware: false,
      eventDrivenExceptionAllowed: false,
      convictionPenaltyIfStale: 2.0,
      affectedPhases: ['PHASE_5_CALCULATIONS', 'PHASE_6_FUNDAMENTAL', 'PHASE_7_FORENSIC', 'PHASE_8_MANAGEMENT', 'PHASE_9_VALUATION', 'PHASE_12_CATALYSTS_RISKS', 'PHASE_13_SCENARIOS', 'PHASE_14_VERDICT', 'PHASE_15_REPORT'],
    },
    MANAGEMENT_GUIDANCE: {
      category: 'MANAGEMENT_GUIDANCE',
      name: 'Concall Guidance & DNA',
      freshThresholdHours: 2520, // 105 days
      staleThresholdHours: 2880,
      criticalStaleThresholdHours: 5760, // 240 days
      marketCalendarAware: false,
      eventDrivenExceptionAllowed: true, // Mid-quarter profit warning or concall
      convictionPenaltyIfStale: 1.0,
      affectedPhases: ['PHASE_8_MANAGEMENT', 'PHASE_12_CATALYSTS_RISKS', 'PHASE_13_SCENARIOS', 'PHASE_14_VERDICT', 'PHASE_15_REPORT'],
    },
    INDUSTRY_DATA: {
      category: 'INDUSTRY_DATA',
      name: 'Industry & Peer Moat Profile',
      freshThresholdHours: 720, // 30 days
      staleThresholdHours: 1440, // 60 days
      criticalStaleThresholdHours: 4320, // 180 days
      marketCalendarAware: false,
      eventDrivenExceptionAllowed: false,
      convictionPenaltyIfStale: 0.5,
      affectedPhases: ['PHASE_11_NEWS_INDUSTRY', 'PHASE_12_CATALYSTS_RISKS', 'PHASE_13_SCENARIOS', 'PHASE_14_VERDICT', 'PHASE_15_REPORT'],
    },
    VALUATION_INPUTS: {
      category: 'VALUATION_INPUTS',
      name: 'Valuation Multiples & Peer Data',
      freshThresholdHours: 48,
      staleThresholdHours: 168,
      criticalStaleThresholdHours: 720,
      marketCalendarAware: true,
      eventDrivenExceptionAllowed: true,
      convictionPenaltyIfStale: 1.0,
      affectedPhases: ['PHASE_9_VALUATION', 'PHASE_13_SCENARIOS', 'PHASE_14_VERDICT', 'PHASE_15_REPORT'],
    },
  };

  public static getRule(category: string): FreshnessPolicyRule {
    return (
      this.POLICIES[category] || {
        category,
        name: category,
        freshThresholdHours: 168,
        staleThresholdHours: 336,
        criticalStaleThresholdHours: 720,
        marketCalendarAware: false,
        eventDrivenExceptionAllowed: false,
        convictionPenaltyIfStale: 0.5,
        affectedPhases: ['PHASE_14_VERDICT', 'PHASE_15_REPORT'],
      }
    );
  }
}
