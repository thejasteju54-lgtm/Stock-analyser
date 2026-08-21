/**
 * ScenarioAssumptionEngine.ts
 * Phase 13 — 8-Tier Assumption Hierarchy, Provenance Tracking,
 * and User Override Management.
 */

import {
  ScenarioAssumption,
  AssumptionSourceType,
  ScenarioType,
  UserOverrideRecord,
} from './ScenarioTypes';

export interface RawAssumptionInput {
  metric: string;
  value: number;
  unit: string;
  period: string;
  direction: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  sourceType: AssumptionSourceType;
  sourceReferences: string[];
  historicalBaseline?: number;
  managementGuidance?: number;
  industryBenchmark?: number;
  phase9Assumption?: number;
  phase12CatalystRef?: string;
  phase12RiskRef?: string;
  confidence?: number;
  isDerived?: boolean;
  derivationMethod?: {
    inputAssumptionIds: string[];
    formula: string;
    description: string;
  };
}

export class ScenarioAssumptionEngine {
  /**
   * Hierarchy priority score: Higher number = Higher authority.
   * Lower-tier assumptions cannot silently override higher-tier ones.
   */
  public static getPriorityScore(sourceType: AssumptionSourceType): number {
    switch (sourceType) {
      case 'COMPANY_DISCLOSURE':
        return 8; // Highest priority
      case 'HISTORICAL_DATA':
        return 7;
      case 'INDUSTRY_DATA':
        return 6;
      case 'MANAGEMENT_GUIDANCE':
        return 5;
      case 'NEWS_INTELLIGENCE':
        return 4;
      case 'CATALYST_RISK_SIGNAL':
        return 3;
      case 'MODEL_DERIVED':
        return 2;
      case 'USER_DEFINED':
        return 1;
      default:
        return 0;
    }
  }

  /**
   * Creates a standardized ScenarioAssumption with complete provenance.
   */
  public static createAssumption(
    scenarioId: ScenarioType,
    input: RawAssumptionInput,
    index: number
  ): ScenarioAssumption {
    const assumptionId = `assump_${scenarioId.toLowerCase()}_${input.metric.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${index}`;
    const confidence = input.confidence ?? (input.sourceType === 'COMPANY_DISCLOSURE' ? 95 : input.sourceType === 'HISTORICAL_DATA' ? 90 : 75);

    return {
      assumptionId,
      scenarioId,
      metric: input.metric,
      value: input.value,
      unit: input.unit,
      period: input.period,
      direction: input.direction,
      sourceType: input.sourceType,
      sourceReferences: input.sourceReferences.length > 0 ? input.sourceReferences : ['Model Baseline Assumption'],
      historicalBaseline: input.historicalBaseline,
      managementGuidance: input.managementGuidance,
      industryBenchmark: input.industryBenchmark,
      phase9Assumption: input.phase9Assumption,
      phase12CatalystRef: input.phase12CatalystRef,
      phase12RiskRef: input.phase12RiskRef,
      confidence,
      isUserEditable: true,
      isDerived: input.isDerived ?? false,
      derivationMethod: input.derivationMethod,
      status: input.sourceType === 'COMPANY_DISCLOSURE' || input.sourceType === 'HISTORICAL_DATA'
        ? 'VERIFIED'
        : input.isDerived
        ? 'DERIVED'
        : 'ESTIMATED',
    };
  }

  /**
   * Applies an explicit user override without mutating immutable source facts.
   */
  public static applyUserOverride(
    assumption: ScenarioAssumption,
    userValue: number,
    userRationale: string
  ): ScenarioAssumption {
    const variance = assumption.value !== 0 ? ((userValue - assumption.value) / assumption.value) * 100 : 0;
    // Approximate elasticity impact: 1% assumption shift ~ 0.8% valuation shift
    const impactOnValuation = Math.round(variance * 0.8 * 10) / 10;

    const overrideRecord: UserOverrideRecord = {
      systemValue: assumption.value,
      userValue,
      variancePercent: Math.round(variance * 10) / 10,
      userRationale: userRationale.trim() || 'Analyst override applied in terminal session',
      overriddenAt: new Date().toISOString(),
      impactOnValuationPercent: impactOnValuation,
    };

    return {
      ...assumption,
      value: userValue,
      sourceType: 'USER_DEFINED',
      userOverride: overrideRecord,
      status: 'USER_DEFINED',
    };
  }
}
