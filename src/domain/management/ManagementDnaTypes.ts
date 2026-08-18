/**
 * Phase 8 — Management DNA, Concall & Execution Credibility Types
 * Pure domain schemas and types for evidence-driven management analysis.
 */

import { ForensicEvidenceReference } from '../forensics/ForensicAnalysisTypes';

// =============================================================================
// 1. CLAIM CATEGORIES & LINGUISTIC STRENGTH
// =============================================================================

export type ManagementClaimCategory =
  | 'GUIDANCE'
  | 'REVENUE_OUTLOOK'
  | 'MARGIN_OUTLOOK'
  | 'CAPEX_PLAN'
  | 'CAPACITY_PLAN'
  | 'ORDER_BOOK'
  | 'DEMAND_OUTLOOK'
  | 'MARKET_OUTLOOK'
  | 'PRODUCT_PLAN'
  | 'EXPANSION_PLAN'
  | 'COST_REDUCTION'
  | 'DELEVERAGING'
  | 'ACQUISITION'
  | 'DIVESTMENT'
  | 'MARKET_SHARE'
  | 'PROFITABILITY'
  | 'CASH_FLOW'
  | 'WORKING_CAPITAL'
  | 'STRATEGIC_INITIATIVE'
  | 'TIMELINE_COMMITMENT'
  | 'OTHER';

export type ClaimStrength =
  | 'EXPLICIT_COMMITMENT'
  | 'QUANTIFIED_GUIDANCE'
  | 'QUALIFIED_GUIDANCE'
  | 'INTENTION'
  | 'ASPIRATION'
  | 'EXPECTATION'
  | 'GENERAL_COMMENTARY';

// Observable Linguistic Certainty (Zero Psychological Meaning)
export type StatementCommitmentCertainty =
  | 'HIGH_CERTAINTY'
  | 'MODERATE_CERTAINTY'
  | 'QUALIFIED'
  | 'SPECULATIVE'
  | 'NON_COMMITTAL';

// =============================================================================
// 2. CANDIDATE EXTRACTION VS VERIFIED STATEMENT
// =============================================================================

export interface CandidateManagementStatement {
  candidateId: string;
  rawText: string;
  speaker: string;
  role?: string;
  sourceDocumentId: string;
  pageId?: string;
  pageNumber?: number;
  sourceType:
    | 'CONCALL_TRANSCRIPT'
    | 'INVESTOR_PRESENTATION'
    | 'ANNUAL_REPORT_MDA'
    | 'EXCHANGE_FILING'
    | 'SECONDARY_TRANSCRIPT';
  section?: string;
  tentativeCategory: ManagementClaimCategory;
  tentativeStrength: ClaimStrength;
  confidence: number;
}

export interface ManagementStatement {
  statementId: string;
  companyId: string;
  companySymbol: string;
  managementPerson: string;
  role: string;
  statementDate: string;
  periodReferenced: string;
  sourceDocumentId: string;
  pageId: string;
  pageNumber: number;
  sourceType:
    | 'CONCALL_TRANSCRIPT'
    | 'INVESTOR_PRESENTATION'
    | 'ANNUAL_REPORT_MDA'
    | 'EXCHANGE_FILING'
    | 'SECONDARY_TRANSCRIPT';
  section: string;
  rawStatement: string;
  normalizedClaim: string;
  claimCategory: ManagementClaimCategory;
  claimStrength: ClaimStrength;
  certaintyLevel: StatementCommitmentCertainty;
  confidence: number;
  evidenceReference: ForensicEvidenceReference;
}

// =============================================================================
// 3. COMMITMENTS & PROMISE REGISTER
// =============================================================================

export type ManagementCommitmentStatus =
  | 'OPEN'
  | 'ON_TRACK'
  | 'ACHIEVED'
  | 'ABOVE_GUIDANCE'
  | 'PARTIALLY_ACHIEVED'
  | 'MISSED'
  | 'REVISED'
  | 'WITHDRAWN'
  | 'UNVERIFIABLE';

export type CommitmentMateriality = 'LOW' | 'MEDIUM' | 'HIGH' | 'STRATEGIC';

export const COMMITMENT_MATERIALITY_WEIGHTS: Record<CommitmentMateriality, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 4,
  STRATEGIC: 6,
};

export type OutcomeAttribution =
  | 'MANAGEMENT_CONTROLLED'
  | 'PARTIALLY_MANAGEMENT_CONTROLLED'
  | 'EXTERNAL_FACTOR'
  | 'UNDETERMINED';

export type ReasonCode =
  | 'EXTERNAL_FACTOR'
  | 'EXECUTION_FACTOR'
  | 'CAPACITY_DELAY'
  | 'DEMAND_CHANGE'
  | 'COMMODITY_CHANGE'
  | 'REGULATORY_CHANGE'
  | 'MACRO_FACTOR'
  | 'ACQUISITION_DELAY'
  | 'STRATEGIC_CHANGE'
  | 'ASSUMPTION_CHANGE'
  | 'TIMELINE_CHANGE'
  | 'FUNDING_CONSTRAINT'
  | 'UNEXPLAINED';

export type ReasonVerificationStatus =
  | 'SUPPORTED'
  | 'PARTIALLY_SUPPORTED'
  | 'UNSUPPORTED'
  | 'UNVERIFIABLE';

export interface GuidanceRange {
  min?: number;
  max?: number;
  target?: number;
  unit: string; // e.g. "PERCENT", "INR_CRORE", "BPS", "COUNT"
}

export interface RevisedGuidanceEntry {
  revisionId: string;
  revisionDate: string;
  revisedPeriod: string;
  revisedRange?: GuidanceRange;
  revisedTargetValue?: number;
  revisedText: string;
  managementStatedReason: string;
  reasonCodes: ReasonCode[];
  evidenceSupportedReason?: string;
  reasonVerificationStatus: ReasonVerificationStatus;
  sourceDocumentId: string;
  pageId?: string;
  pageNumber?: number;
}

export interface ManagementCommitment {
  commitmentId: string;
  statementId: string;
  companyId: string;
  managementPerson: string;
  commitmentType: ManagementClaimCategory;
  commitmentText: string;
  targetMetric: string;
  targetValue?: number;
  targetRange?: GuidanceRange;
  targetDate?: string;
  targetPeriod: string;
  commitmentStrength: ClaimStrength;
  certaintyLevel: StatementCommitmentCertainty;
  materiality: CommitmentMateriality;
  materialityWeight: number; // 1, 2, 4, or 6

  // Status & Delivery
  status: ManagementCommitmentStatus;
  actualOutcomeValue?: number;
  actualOutcomeSummary?: string;
  outcomeAttribution: OutcomeAttribution;
  variance?: number;
  variancePercent?: number;

  // Separate Management-Stated vs Evidence-Supported Reason
  managementStatedReason?: string;
  reasonCodes: ReasonCode[];
  evidenceSupportedReason?: string;
  reasonVerificationStatus: ReasonVerificationStatus;

  // Revised Guidance Tracking (Original Preserved)
  isRevised: boolean;
  originalGuidanceText?: string;
  revisedGuidanceHistory: RevisedGuidanceEntry[];

  // Multi-Hop Outcome Provenance
  outcomeMetricIds: string[];
  outcomeFactIds: string[];
  evidenceReferences: ForensicEvidenceReference[];
  confidence: number;
}

// =============================================================================
// 4. LANGUAGE SHIFT & MANAGEMENT-DATA TENSION MODELS
// =============================================================================

export type LanguageShiftType =
  | 'GUIDANCE_SPECIFICITY_DECREASED'
  | 'GUIDANCE_SPECIFICITY_INCREASED'
  | 'INCREASED_CERTAINTY'
  | 'INCREASED_QUALIFIERS'
  | 'DECREASED_QUALIFIERS'
  | 'TIMELINE_EXTENSION'
  | 'TARGET_REDUCTION'
  | 'NO_MATERIAL_SHIFT';

export interface LanguageShiftItem {
  shiftId: string;
  topic: string; // Demand, Margins, Capex, Debt, Expansion, Orders, etc.
  previousPeriodStatement: string;
  currentPeriodStatement: string;
  previousPeriod: string;
  currentPeriod: string;
  shiftType: LanguageShiftType;
  shiftObservation: string;
  isMaterialShift: boolean;
  disclosedReason?: string;
  actualOutcome?: string;
  previousEvidence: ForensicEvidenceReference;
  currentEvidence: ForensicEvidenceReference;
}

export type DataTensionStatus = 'TENSION' | 'CONTRADICTION' | 'CONSISTENT' | 'UNVERIFIABLE';

export interface ManagementDataTension {
  tensionId: string;
  topic: string;
  managementStatementText: string;
  statementPeriod: string;
  statementSource: ForensicEvidenceReference;

  // Financial Metric / Fact Benchmark
  financialMetricCode: string;
  financialMetricName: string;
  financialMetricValue: number;
  financialMetricUnit: string;
  financialMetricPeriod: string;
  financialMetricSource: ForensicEvidenceReference;

  // Comparability Verification
  isComparabilityVerified: boolean; // Scope, period, basis, and segment matched
  comparabilityNotes: string;
  status: DataTensionStatus;
  tensionExplanation: string;
  requiresManagementClarification: boolean;
}

export interface ManagementContradiction {
  contradictionId: string;
  topic: string;
  statementA: ManagementStatement;
  statementB: ManagementStatement;
  differenceSummary: string;
  possibleReason?: string;
  status:
    | 'CONSISTENT_AFTER_CONTEXT'
    | 'TIMING_DIFFERENCE'
    | 'SCOPE_DIFFERENCE'
    | 'REVISED_GUIDANCE'
    | 'CONTRADICTION'
    | 'UNRESOLVED';
}

// =============================================================================
// 5. EXECUTION CREDIBILITY & MANAGEMENT DNA MODELS
// =============================================================================

export type CredibilityCategory =
  | 'GUIDANCE_ACCURACY'
  | 'EXECUTION_DELIVERY'
  | 'CAPEX_EXECUTION'
  | 'STRATEGIC_EXECUTION'
  | 'MARGIN_DELIVERY'
  | 'DELEVERAGING_DELIVERY'
  | 'WORKING_CAPITAL_DELIVERY'
  | 'COMMUNICATION_CONSISTENCY';

export type CredibilityRatingTier =
  | 'VERY_HIGH'
  | 'HIGH'
  | 'MODERATE'
  | 'WEAK'
  | 'LOW'
  | 'NOT_ASSESSABLE';

export interface CredibilityCategoryScore {
  category: CredibilityCategory;
  categoryName: string;
  score: number; // 0-100
  weight: number; // Percentage (e.g. 15%)
  eligibleCommitmentsCount: number;
  achievedCount: number;
  aboveGuidanceCount: number;
  missedCount: number;
  externalFactorMissedCount: number;
  revisedCount: number;
  notes: string;
}

export interface ManagementCredibilityAssessment {
  credibilityScore: number | null; // 0-100, null if NOT_ASSESSABLE
  ratingTier: CredibilityRatingTier;
  definitionNotice: string; // "Historical reliability of management's stated plans relative to observed outcomes."
  isAssessable: boolean;
  totalEligibleCommitments: number;
  minimumRequiredCommitments: number; // 3
  categoryScores: CredibilityCategoryScore[];

  // Counts
  achievedCount: number;
  aboveGuidanceCount: number;
  partiallyAchievedCount: number;
  missedCount: number;
  missedDueToExternalFactorsCount: number;
  revisedCount: number;
  withdrawnCount: number;
  unverifiableCount: number;

  scoringMethodologyNotes: string[];
}

export type DnaDimension =
  | 'EXECUTION_DISCIPLINE'
  | 'GUIDANCE_DISCIPLINE'
  | 'CAPITAL_ALLOCATION_DISCIPLINE'
  | 'COMMUNICATION_TRANSPARENCY'
  | 'STRATEGIC_CONSISTENCY'
  | 'RISK_ACKNOWLEDGEMENT'
  | 'DELIVERY_RELIABILITY';

export interface DnaDimensionAssessment {
  dimension: DnaDimension;
  dimensionName: string;
  score: number; // 0-10
  status: 'EXCELLENT' | 'SOLID' | 'MIXED' | 'CONCERN' | 'INSUFFICIENT_DATA';
  observableBehaviorSummary: string; // Strictly behavioral
  supportingEvidencePoints: string[];
}

export interface ManagementDnaProfile {
  companySymbol: string;
  dimensions: DnaDimensionAssessment[];
  strengths: string[];
  watchItems: string[];
  monitoringChecklistForFutureDisclosures: string[];
}

export interface ManagementAnalysisReport {
  analysisId: string;
  projectId: string;
  companyId: string;
  companySymbol: string;
  analysisVersion: string;
  methodologyVersion: string;
  generatedAt: string;

  // Core Sub-Assessments
  statements: ManagementStatement[];
  commitments: ManagementCommitment[];
  guidanceRevisions: RevisedGuidanceEntry[];
  languageShifts: LanguageShiftItem[];
  dataTensions: ManagementDataTension[];
  contradictions: ManagementContradiction[];
  credibilityAssessment: ManagementCredibilityAssessment;
  dnaProfile: ManagementDnaProfile;

  // Citations & Disclaimers
  evidenceReferences: string[];
  limitations: string[];
  disclaimer: string;
}
