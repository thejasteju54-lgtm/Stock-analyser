/**
 * VerdictTypes.ts
 * Phase 14 — Domain Models and Types for Final Investment Synthesis & Decision Engine.
 */

import { EconomicArchetype } from '../taxonomy/SectorTaxonomyRegistry';
import { FinancialChannel } from '../news/NewsAndIndustryTypes';

// =============================================================================
// 1. VERDICT CLASSIFICATIONS & DECISION STATES
// =============================================================================

export type InvestmentVerdict = 'BUY' | 'HOLD' | 'AVOID' | 'DECISION_NOT_ASSESSABLE';

export type ConvictionRatingTier =
  | 'VERY_HIGH' // 9.0 - 10.0
  | 'HIGH'      // 7.0 - 8.9
  | 'MODERATE'  // 5.0 - 6.9
  | 'LOW'       // 3.0 - 4.9
  | 'VERY_LOW'; // 0.0 - 2.9

export type MarketPriceFreshnessStatus =
  | 'CURRENT'
  | 'STALE'
  | 'CRITICALLY_STALE'
  | 'CORPORATE_ACTION_UNADJUSTED'
  | 'NOT_ASSESSABLE';

export type MarketPriceSourceTier = 'PRIMARY' | 'SECONDARY' | 'DISCOVERY';

export interface MarketPriceSnapshot {
  symbol: string;
  price: number;
  currency: string;
  exchange: string;
  priceDate: string;
  priceTime: string;
  marketStatus: 'OPEN' | 'CLOSED' | 'WEEKEND_OR_HOLIDAY';
  source: string;
  sourceTier: MarketPriceSourceTier;
  retrievedAt: string;
  freshnessStatus: MarketPriceFreshnessStatus;
  isAdjustedForCorporateActions: boolean;
  corporateActionNotes?: string;
}

// =============================================================================
// 2. DECISION EVIDENCE & QUALITY POLICY
// =============================================================================

export type DecisionImpactMagnitude = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface DecisionEvidence {
  evidenceId: string;
  sourcePhase:
    | 'PHASE_5_CALCULATIONS'
    | 'PHASE_6_FUNDAMENTALS'
    | 'PHASE_7_FORENSICS'
    | 'PHASE_8_MANAGEMENT'
    | 'PHASE_9_VALUATION'
    | 'PHASE_10_TECHNICAL'
    | 'PHASE_11_NEWS_INDUSTRY'
    | 'PHASE_12_CATALYSTS_RISKS'
    | 'PHASE_13_SCENARIOS'
    | 'EXTERNAL_MARKET_PRICE';
  metric: string;
  value: number | string | boolean;
  unit?: string;
  direction: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  confidence: number; // 0-100
  sourceReferences: string[];
  dataDate: string;
  retrievedAt: string;
  freshnessStatus: 'CURRENT' | 'STALE' | 'UNKNOWN';
  impact: DecisionImpactMagnitude;
  rationale: string;
}

export type EvidenceQualityTier = 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_ASSESSABLE';

export interface DecisionEvidenceQualityReport {
  overallQuality: EvidenceQualityTier;
  qualityScoreNormalized: number; // 0.0 to 1.0
  sourceReliabilityScore: number; // 0.0 to 1.0
  freshnessScore: number; // 0.0 to 1.0
  corroborationScore: number; // 0.0 to 1.0
  completenessScore: number; // 0.0 to 1.0
  evidenceCount: number;
  staleItemCount: number;
  notes: string[];
}

// =============================================================================
// 3. DECISION BLOCKERS & OVERRIDES
// =============================================================================

export type DecisionBlockerType =
  | 'CRITICAL_FORENSIC'
  | 'THESIS_INVALIDATION'
  | 'VALUATION_EXTREME'
  | 'BALANCE_SHEET_DISTRESS'
  | 'DATA_INTEGRITY';

export interface DecisionBlocker {
  blockerId: string;
  type: DecisionBlockerType;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
  sourcePhase: string;
  evidenceReferences: string[];
  requiredResolution: string;
  currentStatus: 'ACTIVE' | 'PARTIALLY_RESOLVED' | 'RESOLVED';
  createdAt: string;
  resolvedAt?: string;
  resolutionAuditNote?: string;
}

// =============================================================================
// 4. CROSS-LAYER CONFLICTS & RESOLUTION
// =============================================================================

export type ConflictResolutionStatus =
  | 'RESOLVED_BY_PRIMARY_SOURCE'
  | 'RESOLVED_BY_FRESHER_DATA'
  | 'RESOLVED_BY_POLICY'
  | 'UNRESOLVED'
  | 'NOT_MATERIAL';

export interface DecisionConflict {
  conflictId: string;
  sourceLayers: string[];
  metric: string;
  conflictingValues: Array<{
    source: string;
    value: number | string;
    period: string;
    date: string;
    tier: number;
  }>;
  preferredEvidence?: string;
  resolutionStatus: ConflictResolutionStatus;
  resolutionReason: string;
  confidence: number;
  isMaterial: boolean;
}

// =============================================================================
// 5. BUSINESS QUALITY VS INVESTMENT ATTRACTIVENESS
// =============================================================================

export interface FundamentalDecisionAssessment {
  businessQualityScore: number; // 0.0 to 100.0
  revenueQualityTier: 'STRONG' | 'MODERATE' | 'WEAK';
  marginTrajectory: 'EXPANDING' | 'STABLE' | 'CONTRACTING';
  cashConversionQuality: 'EXCELLENT' | 'ADEQUATE' | 'POOR';
  balanceSheetStrength: 'FORTRESS' | 'ADEQUATE' | 'LEVERAGED' | 'DISTRESSED';
  returnRatioQuality: 'SUPERIOR' | 'ABOVE_COST_OF_CAPITAL' | 'SUB_PAR';
  strengths: string[];
  watchItems: string[];
  confidence: number;
}

export type ForensicDecisionState =
  | 'NO_MATERIAL_CONCERN'
  | 'WATCH'
  | 'MATERIAL_CONCERN'
  | 'SEVERE_CONCERN'
  | 'CRITICAL_OVERRIDE'
  | 'NOT_ASSESSABLE';

export interface ForensicDecisionAdjustment {
  forensicState: ForensicDecisionState;
  severityAdjustmentApplied: boolean;
  requiredMoSBufferPercent: number; // e.g. +3% for WATCH
  activeRedFlagCount: number;
  criticalRedFlagCount: number;
  cashDivergenceRatio: number | null;
  auditorQualificationNotes?: string;
  confidenceCap: number; // 0.0 to 10.0
  decisionImpactSummary: string;
}

export type ManagementDecisionState =
  | 'EXCELLENT'
  | 'GOOD'
  | 'MIXED'
  | 'WEAK'
  | 'SEVERE_CONCERN'
  | 'NOT_ASSESSABLE';

export interface ManagementDecisionAssessment {
  managementState: ManagementDecisionState;
  credibilityScore: number | null; // 0-100
  promoterPledgePercent: number;
  promoterPledgeStatus: 'CLEAN' | 'LOW' | 'ELEVATED' | 'HIGH_RISK';
  stakeChangeTrajectory: 'INCREASING' | 'STABLE' | 'UNEXPLAINED_REDUCTION' | 'NOT_ASSESSABLE';
  guidanceDeliveryReliability: 'CONSISTENT' | 'OCCASIONAL_MISS' | 'CHRONIC_MISS' | 'NOT_ASSESSABLE';
  governanceSummary: string;
}

// =============================================================================
// 6. VALUATION, MARGIN OF SAFETY & SCENARIO SYNTHESIS
// =============================================================================

export type ValuationDecisionStatus =
  | 'VERY_UNDERVALUED'
  | 'UNDERVALUED'
  | 'FAIRLY_VALUED'
  | 'PREMIUM'
  | 'SEVERELY_OVERVALUED'
  | 'NOT_ASSESSABLE';

export type MarginOfSafetyStatus =
  | 'ADEQUATE'
  | 'LIMITED'
  | 'NONE'
  | 'NEGATIVE'
  | 'NOT_ASSESSABLE';

export interface MarginOfSafetyAssessment {
  actualMarginOfSafetyPercent: number | null; // % relative to conservative intrinsic value
  requiredMarginOfSafetyPercent: number; // derived from policy
  status: MarginOfSafetyStatus;
  conservativeIntrinsicValue: number | null; // INR
  conservativeReferenceMethod: string;
  downsideToBearPercent: number | null;
  upsideToBasePercent: number | null;
  upsideToBullPercent: number | null;
  archetypeApplied: EconomicArchetype;
  confidence: number;
}

export interface InterestingPriceRange {
  lowPrice: number | null;
  highPrice: number | null;
  displayRange: string; // e.g. "₹820 – ₹880"
  referenceMethod: string;
  valuationSource: string;
  impliedMarginOfSafetyPercent: number;
  isAssessable: boolean;
  rationale: string;
}

export interface ScenarioSynthesisAssessment {
  bearValuation: number | null;
  baseValuation: number | null;
  bullValuation: number | null;
  bearProbabilityPercent: number | null;
  baseProbabilityPercent: number | null;
  bullProbabilityPercent: number | null;
  isProbabilityAssessable: boolean;
  areProbabilitiesPlaceholders: boolean;
  expectedScenarioValue: number | null;
  expectedValueStatus: 'CALCULATED' | 'EXPECTED_VALUE_NOT_ASSESSABLE';
  downsideProtectionStatus: 'STRONG' | 'MODERATE' | 'WEAK' | 'NONE' | 'NOT_ASSESSABLE';
  scenarioSpreadRatio: number | null; // Bull / Bear spread
  summary: string;
}

// =============================================================================
// 7. CATALYSTS, RISKS & THESIS BREAKERS
// =============================================================================

export interface TopCatalystItem {
  rank: number;
  catalystId: string;
  title: string;
  type: string;
  expectedHorizon: string;
  likelihood: string;
  impactScore: number;
  compositeScore: number;
  financialChannels: FinancialChannel[];
  scenarioRelevance: string;
  evidence: string;
}

export interface TopRiskItem {
  rank: number;
  riskId: string;
  title: string;
  category: string;
  probabilityScore: number;
  impactScore: number;
  netRiskScore: number;
  measurableExposure: string;
  mitigationStrength: number;
  isMitigated: boolean;
  scenarioRelevance: string;
  evidence: string;
}

export type ThesisBreakerDecisionStatus =
  | 'SAFE'
  | 'APPROACHING_TRIGGER'
  | 'TRIGGER_BREACHED'
  | 'THESIS_INVALIDATED'
  | 'NOT_ASSESSABLE';

export interface ThesisBreakerDecisionItem {
  breakerId: string;
  premise: string;
  metric: string;
  operator: string;
  threshold: number | string | boolean;
  currentValue: number | string | boolean | null;
  status: ThesisBreakerDecisionStatus;
  distanceToTriggerPercent: number | null;
  isPersistentBreach: boolean;
  recommendationImpact: string;
}

export interface ThesisBreakerDecisionAssessment {
  overallBreakerState: ThesisBreakerDecisionStatus;
  breachedCount: number;
  invalidatedCount: number;
  approachingCount: number;
  breakers: ThesisBreakerDecisionItem[];
  overridingActionRequired: boolean;
}

// =============================================================================
// 8. TECHNICAL TIMING & BEHAVIORAL RISK CONTEXT
// =============================================================================

export type TechnicalTimingStatus =
  | 'OPTIMAL_ENTRY'
  | 'NEUTRAL_ENTRY'
  | 'OVEREXTENDED_ENTRY'
  | 'DOWNTREND_ENTRY'
  | 'TECHNICAL_COUNTER_TREND'
  | 'NOT_ASSESSABLE';

export interface TechnicalDecisionContext {
  timingStatus: TechnicalTimingStatus;
  marketStructure: string;
  trendRegime: string;
  currentPriceVs200DmaPercent: number | null;
  rsiValue: number | null;
  supportZoneDisplay: string;
  resistanceZoneDisplay: string;
  entryDirective: string;
  confidence: number;
}

export interface BehavioralRiskItem {
  biasType:
    | 'NARRATIVE_EXUBERANCE'
    | 'VALUATION_ANCHORING'
    | 'MOMENTUM_CHASING'
    | 'RECENCY_BIAS'
    | 'CONFIRMATION_BIAS'
    | 'FEAR_DRIVEN_OVERSOLD';
  detected: boolean;
  severity: 'HIGH' | 'MODERATE' | 'LOW';
  evidence: string;
  correctiveGuidance: string;
}

export interface BehavioralRiskAssessment {
  detectedBiases: BehavioralRiskItem[];
  exuberanceRiskLevel: 'HIGH' | 'MODERATE' | 'LOW';
  crowdedTradeStatus: 'CROWDED' | 'NORMAL' | 'NEGLECTED';
  summary: string;
}

// =============================================================================
// 9. THESIS, OUTLOOK & DECISION TRANSITIONS
// =============================================================================

export interface ThesisArgument {
  claim: string;
  evidence: string;
  source: string;
  confidence: number;
  materiality: 'PRIMARY' | 'SECONDARY' | 'SUPPORTING';
}

export interface InvestmentThesis {
  thesisId: string;
  summary: string;
  bullishThesis: {
    corePremise: string;
    arguments: ThesisArgument[];
  };
  bearishThesis: {
    corePremise: string;
    arguments: ThesisArgument[];
  };
  keyDrivers: string[];
  thesisQualityScore: 'STRONG' | 'MODERATE' | 'WEAK' | 'NOT_ASSESSABLE';
}

export interface ShortTermOutlook {
  horizon: '1_YEAR';
  businessTrajectory: string;
  earningsDirection: 'ACCELERATING' | 'STEADY' | 'DECELERATING' | 'CYCLICAL_DOWNTURN';
  keyCatalystTriggers: string[];
  keyDownsideRisks: string[];
  valuationExpectation: string;
  timingContext: string;
}

export interface LongTermOutlook {
  horizon: '5_PLUS_YEARS';
  industryCompetitivePosition: string;
  moatDurability: 'EXPANDING' | 'STABLE' | 'NARROWING' | 'EROSION_RISK';
  marketShareEvolution: string;
  capitalAllocationDiscipline: string;
  terminalRoceAndFcfProfile: string;
  terminalEconomicsSummary: string;
}

export interface DecisionTransitionTrigger {
  fromVerdict: InvestmentVerdict;
  toVerdict: InvestmentVerdict;
  conditionDescription: string;
  measurableMetric: string;
  threshold: string;
  requiredBlockerResolutions?: string[];
  isCurrentlyApproaching: boolean;
}

export interface DecisionChangeConditions {
  potentialTransitions: DecisionTransitionTrigger[];
  currentWatchList: string[];
}

// =============================================================================
// 10. DECISION SNAPSHOT, AUDIT TRAIL & FINAL MASTER REPORT
// =============================================================================

export interface DecisionSnapshot {
  snapshotId: string;
  projectId: string;
  symbol: string;
  decisionTimestamp: string;
  policyVersion: string;
  marketPriceSnapshot: MarketPriceSnapshot;
  upstreamPhaseSnapshotIds: {
    phase5CalculationsId: string;
    phase6FundamentalsId: string;
    phase7ForensicsId: string;
    phase8ManagementId: string;
    phase9ValuationId: string;
    phase10TechnicalId: string;
    phase11NewsIndustryId: string;
    phase12CatalystsRisksId: string;
    phase13ScenariosId: string;
  };
  businessQualityScore: number;
  investmentAttractivenessScore: number;
  appliedDecisionRuleId: string;
  appliedOverrideTier?: string;
  finalVerdict: InvestmentVerdict;
  convictionScore: number; // 0.0 to 10.0
  convictionBand: ConvictionRatingTier;
  decisionConfidenceScore: number; // 0.0 to 10.0 (Decision Soundness)
  activeBlockers: DecisionBlocker[];
  activeConflicts: DecisionConflict[];
  reproducibilityChecksum: string;
}

export interface DecisionAuditTrail {
  snapshot: DecisionSnapshot;
  ruleEvaluationTrace: Array<{
    ruleId: string;
    description: string;
    passed: boolean;
    failingConditions: string[];
  }>;
  overrideTrace?: {
    tierApplied: string;
    overrideReason: string;
    evidence: string;
  };
  conflictAudit: DecisionConflict[];
  freshnessAudit: {
    priceDate: string;
    financialDataDate: string;
    newsDataDate: string;
    technicalDataDate: string;
    scenarioDataDate: string;
    stalenessPenaltiesApplied: number;
  };
}

export interface InvestmentVerdictReport {
  reportId: string;
  projectId: string;
  companySymbol: string;
  companyName: string;
  sector: string;
  businessModel: string;
  economicArchetype: EconomicArchetype;
  asOfDate: string;
  generatedAt: string;

  // 1. Final Classification & Conviction
  verdict: InvestmentVerdict;
  convictionScore: number; // 0.0 to 10.0
  convictionBand: ConvictionRatingTier;
  decisionConfidenceScore: number; // 0.0 to 10.0 (Decision Certainty / Soundness)
  oneLineVerdict: string;

  // 2. Pricing & Valuation
  marketPrice: MarketPriceSnapshot;
  valuationAssessment: {
    valuationStatus: ValuationDecisionStatus;
    triangulatedBasePrice: number | null;
    intrinsicRangeDisplay: string;
    marginOfSafety: MarginOfSafetyAssessment;
    interestingPrice: InterestingPriceRange;
  };

  // 3. Core Business & Governance
  businessQuality: FundamentalDecisionAssessment;
  forensics: ForensicDecisionAdjustment;
  management: ManagementDecisionAssessment;

  // 4. Scenarios & Downside
  scenarios: ScenarioSynthesisAssessment;

  // 5. Catalysts, Risks & Breakers
  topCatalysts: TopCatalystItem[];
  topRisks: TopRiskItem[];
  thesisBreakers: ThesisBreakerDecisionAssessment;

  // 6. Forward Outlook & Context
  thesis: InvestmentThesis;
  shortTermOutlook: ShortTermOutlook;
  longTermOutlook: LongTermOutlook;
  technicalTiming: TechnicalDecisionContext;
  behavioralRisks: BehavioralRiskAssessment;

  // 7. Transitions & Audit Trail
  changeConditions: DecisionChangeConditions;
  activeBlockers: DecisionBlocker[];
  evidenceQuality: DecisionEvidenceQualityReport;
  auditTrail: DecisionAuditTrail;
  disclaimers: string[];
}
