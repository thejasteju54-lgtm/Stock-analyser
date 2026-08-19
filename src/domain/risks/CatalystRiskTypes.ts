/**
 * CatalystRiskTypes.ts
 * Phase 12 — Catalysts, Thesis Breakers & Multi-Dimensional Risk Matrix Engine Domain Types.
 */

import { FinancialChannel } from '../news/NewsAndIndustryTypes';

export type CatalystType =
  | 'EARNINGS_GROWTH'
  | 'CAPACITY_EXPANSION'
  | 'ORDER_BOOK_WIN'
  | 'MARGIN_EXPANSION'
  | 'DELEVERAGING'
  | 'NEW_PRODUCT_LAUNCH'
  | 'MARKET_SHARE_GAIN'
  | 'INDUSTRY_TAILWIND'
  | 'REGULATORY_RELAXATION'
  | 'VALUATION_RERATING'
  | 'MANAGEMENT_CHANGE'
  | 'OTHER';

export type CatalystHorizon =
  | 'IMMEDIATE_0_3M'
  | 'SHORT_TERM_3_6M'
  | 'MEDIUM_TERM_6_12M'
  | 'LONG_TERM_12M_PLUS'
  | 'STRUCTURAL';

export type CatalystLikelihood = 'HIGH' | 'MEDIUM' | 'LOW' | 'CONDITIONAL';
export type CatalystImpactMagnitude = 'MATERIAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type CatalystVerificationStatus =
  | 'VERIFIED_EVIDENCE'
  | 'MANAGEMENT_CLAIM'
  | 'ANALYST_INFERENCE'
  | 'NOT_ASSESSABLE';

export interface HistoricalPrecedentAssessment {
  metric: string;
  historicalPeriods: string[];
  observedOutcome: string;
  missCount: number;
  successCount: number;
  totalPeriods: number;
  frequency: number; // 0.0 to 1.0
  sourceReferences: string[];
  confidence: number;
}

export interface CatalystItem {
  catalystId: string;
  title: string;
  description: string;
  type: CatalystType;
  expectedHorizon: CatalystHorizon;
  likelihood: CatalystLikelihood;
  likelihoodScore: number; // 1-5
  impactMagnitude: CatalystImpactMagnitude;
  impactScore: number; // 1-10 (determined deterministically)
  financialChannels: FinancialChannel[];
  businessDrivers: string[];
  evidenceReferences: string[];
  supportingFactIds: string[];
  sourceLayer: 'FUNDAMENTAL' | 'MANAGEMENT' | 'VALUATION' | 'TECHNICAL' | 'NEWS_INDUSTRY' | 'SYNTHESIZED';
  verificationStatus: CatalystVerificationStatus;
  historicalPrecedent?: HistoricalPrecedentAssessment;
  confidence: number; // 0-100
}

export type RiskCategory =
  | 'SECTOR_COMPETITIVE'
  | 'COMPANY_EXECUTION'
  | 'BALANCE_SHEET_LEVERAGE'
  | 'EARNINGS_QUALITY_FORENSIC'
  | 'MANAGEMENT_GOVERNANCE'
  | 'VALUATION_MULTIPLE_COMPRESSION'
  | 'REGULATORY_LEGAL'
  | 'MACRO_COMMODITY_CURRENCY'
  | 'TECHNICAL_PRICE_STRUCTURE';

export type RiskProbability = 'REMOTE' | 'LOW' | 'MODERATE' | 'HIGH' | 'ALMOST_CERTAIN';
export type RiskImpact = 'NEGLIGIBLE' | 'MINOR' | 'MODERATE' | 'SEVERE' | 'CATASTROPHIC';
export type RiskSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type RiskVelocity = 'IMMEDIATE_SHOCK' | 'RAPID_DEVELOPMENT' | 'SLOW_EROSION' | 'TRIGGER_DEPENDENT';
export type NetRiskExposure = 'UNMITIGATED' | 'PARTIALLY_MITIGATED' | 'SUBSTANTIALLY_MITIGATED';
export type MitigationStatus = 'MITIGATION_VERIFIED' | 'MITIGATION_PARTIAL' | 'MITIGATION_UNVERIFIED';

export interface MitigationAssessment {
  mitigationId: string;
  description: string;
  status: MitigationStatus;
  mitigationStrength: number; // 0.0 to 1.0 (factor reduction)
  evidenceReferences: string[];
  confidence: number;
}

export type RiskRelationshipType =
  | 'SAME_UNDERLYING_RISK'
  | 'RELATED_RISK'
  | 'INDEPENDENT_RISK'
  | 'UNKNOWN';

export interface RiskLineage {
  underlyingRiskId: string;
  sourceRiskIds: string[];
  sourceLayers: string[];
  relationshipType: RiskRelationshipType;
  confidence: number;
}

export interface RiskItem {
  riskId: string;
  title: string;
  category: RiskCategory;
  description: string;
  probability: RiskProbability;
  probabilityScore: number; // 1-5
  impact: RiskImpact;
  impactScore: number; // 1-5
  rawRiskScore: number; // P * I (1-25)
  severity: RiskSeverity;
  velocity: RiskVelocity;
  measurableExposure: string; // e.g. "₹450 Cr contingent tax liability (18% of Net Worth)"
  mitigations: MitigationAssessment[];
  netExposure: NetRiskExposure;
  netRiskScore: number; // post-mitigation (1-25)
  falsifiableTriggers: string[];
  evidenceSourceIds: string[];
  sourceLayer: string;
  lineage: RiskLineage;
  confidence: number;
}

export type BreakerOperator =
  | 'GREATER_THAN'
  | 'GREATER_THAN_OR_EQUAL'
  | 'LESS_THAN'
  | 'LESS_THAN_OR_EQUAL'
  | 'EQUALS'
  | 'CHANGE_BY'
  | 'PERCENT_CHANGE_BY';

export type BreakerThresholdType =
  | 'ABSOLUTE'
  | 'PERCENTAGE'
  | 'RATIO'
  | 'COUNT'
  | 'BOOLEAN'
  | 'DATE';

export type BreakerStatus = 'SAFE' | 'APPROACHING_TRIGGER' | 'BREACHED' | 'NOT_ASSESSABLE';
export type DataFreshnessStatus = 'CURRENT' | 'STALE' | 'EXPIRED' | 'UNKNOWN';

export interface ThesisBreaker {
  breakerId: string;
  premise: string;
  invalidationCondition: string;
  metric: string;
  operator: BreakerOperator;
  thresholdValue: number | string | boolean;
  thresholdType: BreakerThresholdType;
  evaluationPeriod: string;
  baselineValue: number | string | boolean;
  currentValue: number | string | boolean | null;
  bufferMarginPercent: number; // e.g. 10% for APPROACHING_TRIGGER
  currentStatus: BreakerStatus;
  sourceReferences: string[];
  sourceDate: string;
  dataDate: string;
  retrievedAt: string;
  freshnessStatus: DataFreshnessStatus;
  monitoringFrequency: 'QUARTERLY' | 'MONTHLY' | 'DAILY' | 'EVENT_DRIVEN';
  recommendationImpactSignal: {
    suggestedVerdictAction: 'REVIEW_FOR_DOWNGRADE' | 'ELEVATE_RISK_CONVICTION' | 'NEUTRAL_MONITORING';
    severity: 'HIGH' | 'CRITICAL' | 'MODERATE';
    rationale: string;
  };
  supportingEvidence: string[];
}

export type AggregateRiskRating = 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'EXTREME';
export type AsymmetryAssessment =
  | 'HIGHLY_FAVORABLE'
  | 'FAVORABLE'
  | 'BALANCED'
  | 'UNFAVORABLE'
  | 'HIGHLY_ASYMMETRIC_DOWNSIDE'
  | 'NOT_ASSESSABLE';

export interface RiskMatrixSummary {
  totalRisksIdentified: number;
  deduplicatedRiskCount: number;
  criticalRiskCount: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  topRiskCategories: { category: RiskCategory; count: number; maxScore: number }[];
  aggregateRiskRating: AggregateRiskRating;
  asymmetryAssessment: AsymmetryAssessment;
  upsidePotentialScore: number; // 0-100
  downsideRiskScore: number; // 0-100
  netAsymmetryRatio: number; // Upside / Downside
  methodologyNote: string;
}

export interface CatalystAndRiskReport {
  projectId: string;
  companySymbol: string;
  asOfDate: string;
  catalysts: CatalystItem[];
  rankedCatalysts: CatalystItem[];
  risks: RiskItem[];
  rankedRisks: RiskItem[];
  thesisBreakers: ThesisBreaker[];
  matrixSummary: RiskMatrixSummary;
  crossLayerRiskSummary: {
    fundamentalRisks: RiskItem[];
    forensicRisks: RiskItem[];
    managementRisks: RiskItem[];
    valuationRisks: RiskItem[];
    technicalRisks: RiskItem[];
    industryRisks: RiskItem[];
  };
  generatedAt: string;
}
