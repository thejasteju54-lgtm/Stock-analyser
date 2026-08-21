/**
 * CompletenessPolicyRegistry.ts
 * Phase 15 — Independent Pillar Completeness Policies & Criticality Tiers.
 * Replaces generic overall averaging with deterministic pillar-level gating.
 */

export type CompletenessCriticalityTier = 'CRITICAL' | 'HIGH' | 'OPTIONAL' | 'NON_BLOCKING';

export interface PillarCompletenessRule {
  pillarId: string;
  name: string;
  criticality: CompletenessCriticalityTier;
  minimumCompletenessScore: number;
  blocksPipelineIfMissing: boolean;
  blocksDecisionIfMissing: boolean;
  fallbackStatus: 'NOT_ASSESSABLE' | 'NEUTRAL_BENCHMARK' | 'WATCH';
}

export class CompletenessPolicyRegistry {
  public static readonly PILLARS: Record<string, PillarCompletenessRule> = {
    FINANCIAL_STATEMENTS: {
      pillarId: 'FINANCIAL_STATEMENTS',
      name: 'Financial Statements (P5)',
      criticality: 'CRITICAL',
      minimumCompletenessScore: 70,
      blocksPipelineIfMissing: true,
      blocksDecisionIfMissing: true,
      fallbackStatus: 'NOT_ASSESSABLE',
    },
    FUNDAMENTAL_HEALTH: {
      pillarId: 'FUNDAMENTAL_HEALTH',
      name: 'Fundamental Health (P6)',
      criticality: 'CRITICAL',
      minimumCompletenessScore: 65,
      blocksPipelineIfMissing: false,
      blocksDecisionIfMissing: true,
      fallbackStatus: 'NOT_ASSESSABLE',
    },
    FORENSIC_ACCOUNTING: {
      pillarId: 'FORENSIC_ACCOUNTING',
      name: 'Forensic Accounting (P7)',
      criticality: 'CRITICAL',
      minimumCompletenessScore: 60,
      blocksPipelineIfMissing: false,
      blocksDecisionIfMissing: true,
      fallbackStatus: 'WATCH',
    },
    SECTOR_VALUATION: {
      pillarId: 'SECTOR_VALUATION',
      name: 'Sector Valuation (P9)',
      criticality: 'CRITICAL',
      minimumCompletenessScore: 60,
      blocksPipelineIfMissing: false,
      blocksDecisionIfMissing: true,
      fallbackStatus: 'NOT_ASSESSABLE',
    },
    SCENARIO_MODELING: {
      pillarId: 'SCENARIO_MODELING',
      name: 'Scenario Modeling (P13)',
      criticality: 'HIGH',
      minimumCompletenessScore: 50,
      blocksPipelineIfMissing: false,
      blocksDecisionIfMissing: false,
      fallbackStatus: 'NOT_ASSESSABLE',
    },
    MANAGEMENT_DNA: {
      pillarId: 'MANAGEMENT_DNA',
      name: 'Management DNA (P8)',
      criticality: 'HIGH',
      minimumCompletenessScore: 50,
      blocksPipelineIfMissing: false,
      blocksDecisionIfMissing: false,
      fallbackStatus: 'NEUTRAL_BENCHMARK',
    },
    CATALYSTS_AND_RISKS: {
      pillarId: 'CATALYSTS_AND_RISKS',
      name: 'Catalysts & Risks (P12)',
      criticality: 'HIGH',
      minimumCompletenessScore: 50,
      blocksPipelineIfMissing: false,
      blocksDecisionIfMissing: false,
      fallbackStatus: 'NEUTRAL_BENCHMARK',
    },
    INDUSTRY_MOAT: {
      pillarId: 'INDUSTRY_MOAT',
      name: 'Industry & Peer Moat (P11)',
      criticality: 'HIGH',
      minimumCompletenessScore: 50,
      blocksPipelineIfMissing: false,
      blocksDecisionIfMissing: false,
      fallbackStatus: 'NEUTRAL_BENCHMARK',
    },
    TECHNICAL_STRUCTURE: {
      pillarId: 'TECHNICAL_STRUCTURE',
      name: 'Technical Structure (P10)',
      criticality: 'OPTIONAL',
      minimumCompletenessScore: 40,
      blocksPipelineIfMissing: false,
      blocksDecisionIfMissing: false,
      fallbackStatus: 'NOT_ASSESSABLE',
    },
    REAL_TIME_NEWS: {
      pillarId: 'REAL_TIME_NEWS',
      name: 'Real-Time News (P11)',
      criticality: 'OPTIONAL',
      minimumCompletenessScore: 30,
      blocksPipelineIfMissing: false,
      blocksDecisionIfMissing: false,
      fallbackStatus: 'NEUTRAL_BENCHMARK',
    },
    DECISION_SYNTHESIS: {
      pillarId: 'DECISION_SYNTHESIS',
      name: 'Decision Synthesis (P14)',
      criticality: 'CRITICAL',
      minimumCompletenessScore: 70,
      blocksPipelineIfMissing: false,
      blocksDecisionIfMissing: true,
      fallbackStatus: 'NOT_ASSESSABLE',
    },
  };

  public static getRule(pillarId: string): PillarCompletenessRule {
    return (
      this.PILLARS[pillarId] || {
        pillarId,
        name: pillarId,
        criticality: 'HIGH',
        minimumCompletenessScore: 50,
        blocksPipelineIfMissing: false,
        blocksDecisionIfMissing: false,
        fallbackStatus: 'NOT_ASSESSABLE',
      }
    );
  }
}
