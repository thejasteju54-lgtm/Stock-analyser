/**
 * Phase 7 — Forensic Accounting & Earnings-Quality Investigation Types
 * Pure domain schemas and types for evidence-driven forensic analysis.
 */

export type ForensicCategory =
  | 'REVENUE_QUALITY'
  | 'PROFIT_VS_CASH_FLOW'
  | 'WORKING_CAPITAL_FORENSICS'
  | 'CAPITALIZATION_AND_EXPENSE_QUALITY'
  | 'EXCEPTIONAL_ITEMS'
  | 'RELATED_PARTY_TRANSACTIONS'
  | 'CONTINGENT_LIABILITIES'
  | 'AUDITOR_DISCLOSURES'
  | 'ACCOUNTING_POLICY_CHANGES'
  | 'RESTATEMENTS'
  | 'DEBT_AND_FINANCING'
  | 'PROMOTER_OWNERSHIP'
  | 'CASH_AND_BALANCE_SHEET_QUALITY'
  | 'CROSS_STATEMENT_CONSISTENCY';

export type ForensicFindingSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ForensicFindingStatus =
  | 'OBSERVED'
  | 'POTENTIAL_CONCERN'
  | 'REQUIRES_INVESTIGATION'
  | 'MATERIAL_CONCERN'
  | 'RESOLVED'
  | 'UNRESOLVED';

export type ForensicRiskTier = 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH';

export type SourceIndependenceType =
  | 'SINGLE_SOURCE'
  | 'MULTI_SOURCE_CORROBORATED'
  | 'INDEPENDENT_EXTERNAL';

export interface ForensicEvidenceReference {
  documentId: string;
  documentName: string;
  pageId?: string;
  pageNumber?: number;
  sourceType:
    | 'PRIMARY_AUDITED_FILING'
    | 'STATUTORY_DISCLOSURE'
    | 'AUDITOR_REPORT'
    | 'EXCHANGE_FILING'
    | 'SHAREHOLDING_PATTERN'
    | 'MANAGEMENT_DISCLOSURE'
    | 'SECONDARY_VERIFIED';
  sourceSnippet?: string;
  confidence: number;
}

export interface ForensicFinding {
  findingId: string;
  category: ForensicCategory;
  categoryName: string;
  title: string;
  observation: string; // Objective numerical / disclosure fact
  signal: string; // Deterministic rule code (e.g. RECEIVABLE_GROWTH_DIVERGENCE_SIGNAL)
  context: string; // Business model & baseline context
  severity: ForensicFindingSeverity;
  status: ForensicFindingStatus;
  confidence: number; // 0-100
  materialityScore: number; // 0-100 relative to capital base
  isPersistent: boolean; // Mult-year pattern vs one-off
  sourceIndependence: SourceIndependenceType;
  supportingFactIds: string[];
  supportingMetricIds: string[];
  evidenceReferences: ForensicEvidenceReference[];
  possibleExplanations: string[];
  alternativeExplanations: string[]; // Plausible non-malicious operational causes
  investigationQuestions: string[]; // Actionable forensic questions for analyst research
  requiresManagementClarification: boolean; // Feed-forward flag for Phase 8
  requiresFurtherEvidence: boolean;
}

// =============================================================================
// SPECIALIZED FORENSIC DISCLOSURE MODELS WITH DIRECT PROVENANCE
// =============================================================================

export interface RelatedPartyTransactionItem {
  transactionId: string;
  counterparty: string;
  relationship: string;
  transactionType:
    | 'SALE_OF_GOODS'
    | 'PURCHASE_OF_GOODS'
    | 'LOAN_GIVEN'
    | 'LOAN_TAKEN'
    | 'GUARANTEE_PROVIDED'
    | 'ADVANCES'
    | 'INVESTMENT'
    | 'MANAGEMENT_REMUNERATION'
    | 'ROYALTY_BRAND_FEES'
    | 'OTHER';
  amount: number; // INR Crore
  currency: string;
  period: string;
  percentOfRevenue?: number;
  percentOfNetWorth?: number;
  materialityAssessment: 'IMMATERIAL' | 'NOTABLE' | 'MATERIAL_TRANSACTION';
  materialityMethodology: string;
  disclosureStatus: 'ADEQUATELY_DISCLOSED' | 'PARTIAL_DISCLOSURE' | 'OMISSION_SUSPECTED';
  isPromoterEntity: boolean;
  evidenceReferences: ForensicEvidenceReference[];
}

export type ContingentOutcomeStatus =
  | 'OUTCOME_UNCERTAIN'
  | 'DISCLOSED_PROVISION_MADE'
  | 'REMOTE_RISK_CLAIMED'
  | 'SUB_JUDICE_TAX_DISPUTE'
  | 'SETTLED_POST_BALANCE_SHEET';

export interface ContingentLiabilityItem {
  liabilityId: string;
  category:
    | 'TAX_DISPUTE_DIRECT'
    | 'TAX_DISPUTE_INDIRECT_GST'
    | 'LEGAL_CLAIMS_CUSTOMERS'
    | 'CORPORATE_GUARANTEES_SUBSIDIARIES'
    | 'CAPITAL_COMMITMENTS'
    | 'OTHER_CONTINGENCIES';
  description: string;
  amount: number; // INR Crore
  period: string;
  percentOfNetWorth?: number;
  percentOfRevenue?: number;
  percentOfEBITDA?: number;
  percentOfCash?: number;
  percentOfTotalDebt?: number;
  materialityTier: 'LOW' | 'MODERATE' | 'SIGNIFICANT' | 'CRITICAL';
  outcomeStatus: ContingentOutcomeStatus;
  evidenceReferences: ForensicEvidenceReference[];
}

export type AuditOpinionType = 'UNMODIFIED' | 'QUALIFIED' | 'ADVERSE' | 'DISCLAIMER';

export type AuditReportMatterType =
  | 'EMPHASIS_OF_MATTER'
  | 'MATERIAL_UNCERTAINTY_GOING_CONCERN'
  | 'KEY_AUDIT_MATTER';

export interface AuditorDisclosureItem {
  disclosureId: string;
  auditorFirm: string;
  reportingPeriod: string;
  auditOpinion: AuditOpinionType;
  reportMatters: AuditReportMatterType[];
  observationsSummary: string;
  keyAuditMattersCount: number;
  keyAuditMatterTopics: string[];
  internalControlObservation?: string;
  hasGoingConcernWarning: boolean;
  isAuditorTenureShort: boolean;
  evidenceReferences: ForensicEvidenceReference[];
}

export interface AccountingPolicyChangeItem {
  changeId: string;
  accountingArea:
    | 'REVENUE_RECOGNITION'
    | 'DEPRECIATION_AMORTIZATION'
    | 'INVENTORY_VALUATION'
    | 'CAPITALIZATION_OF_DEVELOPMENT'
    | 'PROVISIONS_EXPECTED_CREDIT_LOSS'
    | 'LEASES_IND_AS_116'
    | 'FINANCIAL_INSTRUMENTS_FAIR_VALUE';
  previousPolicy: string;
  newPolicy: string;
  effectivePeriod: string;
  disclosedReason: string;
  disclosedQuantitativeImpact?: string; // e.g. "Increased PAT by 42 Cr"
  impactDirection: 'PAT_POSITIVE' | 'PAT_NEGATIVE' | 'NEUTRAL_OR_DISCLOSED_NIL' | 'UNDISCLOSED';
  evidenceReferences: ForensicEvidenceReference[];
}

export type RestatementType =
  | 'RESTATEMENT'
  | 'RECLASSIFICATION'
  | 'ERROR_CORRECTION'
  | 'ACCOUNTING_POLICY_CHANGE';

export interface RestatementItem {
  restatementId: string;
  metricOrLineItem: string;
  periodAffected: string;
  filingYearDisclosed: string;
  originalValue: number;
  restatedValue: number;
  varianceAmount: number;
  variancePct: number;
  restatementType: RestatementType;
  disclosedReason: string;
  evidenceReferences: ForensicEvidenceReference[];
}

export interface PromoterOwnershipSignalItem {
  signalId: string;
  reportingPeriod: string;
  totalShares: number; // In Crore / absolute count
  promoterShares: number; // In Crore / absolute count
  promoterPledgedShares: number; // In Crore / absolute count
  promoterHoldingPct: number; // % of total share capital
  promoterHoldingChangeYoY: number; // Percentage point change (e.g. -2.5% YoY)
  pledgeAsPctOfPromoterHolding: number; // Primary pledge ratio (Pledged / Promoter Shares)
  pledgeAsPctOfTotalShareCapital: number; // Secondary pledge ratio (Pledged / Total Shares)
  pledgeChangeBpsYoY: number; // Basis points change in pledge
  isPledgeHighPriority: boolean; // Flagged when pledge > 10% of holding
  institutionalHoldingPct?: number; // DII + FII holding
  evidenceReferences: ForensicEvidenceReference[];
}

export type CrossStatementCheckStatus =
  | 'CONSISTENT'
  | 'EXPLAINED_VARIANCE'
  | 'POTENTIAL_VARIANCE'
  | 'UNEXPLAINED_DISCREPANCY'
  | 'NOT_ASSESSABLE';

export interface CrossStatementCheck {
  checkId: string;
  checkName: string;
  statementA: 'INCOME_STATEMENT' | 'BALANCE_SHEET' | 'CASH_FLOW_STATEMENT' | 'NOTES';
  statementB: 'INCOME_STATEMENT' | 'BALANCE_SHEET' | 'CASH_FLOW_STATEMENT' | 'NOTES';
  metricA: string;
  valueA?: number;
  metricB: string;
  valueB?: number;
  unit: string;
  rawDifference?: number;
  accountingBridgeExplanation: string; // Explains CWIP, FX, Depreciation, Disposals, Capitalized Interest
  status: CrossStatementCheckStatus;
  evidenceReferences: ForensicEvidenceReference[];
}

// =============================================================================
// BUSINESS-MODEL SPECIFIC FORENSIC SCORING POLICY
// =============================================================================

export interface ForensicPolicyConfig {
  businessModelCode: string;
  policyName: string;
  archetype: 'OPERATING_INDUSTRIAL' | 'LENDING_FINANCIAL' | 'NON_LENDING_FINANCIAL' | 'INFRA_UTILITY' | 'REAL_ESTATE';
  applicableCategories: ForensicCategory[];
  categoryWeights: Partial<Record<ForensicCategory, number>>;
  
  // Heuristic Signal Thresholds
  receivablesVsRevenueMultiplier: number; // e.g. 1.5x
  cfoToPatConcernThreshold: number; // e.g. 0.5x
  contingentLiabilityNetWorthThreshold: number; // e.g. 20%
  promoterPledgeConcernThreshold: number; // e.g. 10% of promoter holding
  promoterStakeReductionConcernThreshold: number; // e.g. 2.0% (200 bps)
  depreciationRateFloor: number; // e.g. 3% on gross block
  
  // Exclusions & Gating Rules
  isWorkingCapitalGated: boolean; // True for Banks/NBFCs
  isCapexGrossBlockGated: boolean; // True for Asset-Light / Financials
  minimumCompletenessThreshold: number; // Percentage (e.g. 35%)
}

// =============================================================================
// TOP-LEVEL FORENSIC ANALYSIS REPORT MODEL
// =============================================================================

export interface ForensicAnalysisReport {
  analysisId: string;
  projectId: string;
  companyId: string;
  companySymbol: string;
  businessModelCode: string;
  analysisVersion: string;
  methodologyVersion: string;
  generatedAt: string;

  // Multi-dimensional Overall Health & Confidence
  overallForensicRisk: ForensicRiskTier; // LOW | MODERATE | ELEVATED | HIGH
  overallForensicRiskScore: number; // 0-100 (0 = Lowest Risk, 100 = Critical Risk)
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_ASSESSABLE';
  dataCompleteness: number; // 0-100%
  isAssessable: boolean;

  // Diagnostic Structured Findings
  findings: ForensicFinding[];
  redFlags: ForensicFinding[];
  positiveEvidence: string[];
  unresolvedQuestions: string[];
  investigationPriorities: ForensicFinding[];

  // Specialized Disclosure Tables
  relatedPartyTransactions: RelatedPartyTransactionItem[];
  contingentLiabilities: ContingentLiabilityItem[];
  auditorDisclosures: AuditorDisclosureItem[];
  accountingPolicyChanges: AccountingPolicyChangeItem[];
  restatements: RestatementItem[];
  promoterSignals: PromoterOwnershipSignalItem[];
  crossStatementChecks: CrossStatementCheck[];

  // Citations & Disclaimers
  evidenceReferences: string[];
  limitations: string[];
  notes: string;
}
