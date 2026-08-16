import { ReportingPeriod, ProvenanceSourceType } from '../ingestion/DocumentTypes';

export type FactCategory =
  | 'INCOME_STATEMENT'
  | 'BALANCE_SHEET'
  | 'CASH_FLOW'
  | 'OWNERSHIP'
  | 'SEGMENT_DATA'
  | 'BUSINESS_METRIC';

export type FactAvailabilityStatus =
  | 'AVAILABLE'
  | 'NOT_DISCLOSED'
  | 'NOT_FOUND'
  | 'UNREADABLE'
  | 'REQUIRES_REVIEW';

export type FinancialUnit =
  | 'INR_CRORE'
  | 'INR_LAKH'
  | 'INR'
  | 'USD_MILLION'
  | 'USD'
  | 'FOREIGN_CURRENCY'
  | 'PERCENT'
  | 'COUNT'
  | 'PER_SHARE';

export type AccountingBasis = 'CONSOLIDATED' | 'STANDALONE';

export type ExtractionMethod =
  | 'STRUCTURED_TABLE'
  | 'TEXT_INLINE'
  | 'OCR_DERIVED'
  | 'SCREENSHOT_DERIVED'
  | 'MANUAL';

export type FactVerificationStatus =
  | 'VERIFIED'
  | 'REQUIRES_REVIEW'
  | 'FLAGGED_CONTRADICTION'
  | 'UNVERIFIED';

export type FactConfidenceTier = 'HIGH' | 'MEDIUM' | 'LOW';

export interface StableSourceReference {
  documentId: string;
  documentTitle: string;
  pageId?: string;
  pageNumber?: number;
  tableHeader?: string;
  rawSnippet?: string;
}

export interface CurrencyConversionMetadata {
  conversionRate: number;
  conversionDate: string;
  conversionSource: string;
}

export interface FinancialFact {
  factId: string;
  projectId: string;
  companyId: string;
  companySymbol: string;
  documentId: string;
  documentName: string;
  pageId?: string;
  pageNumber?: number;
  category: FactCategory;
  metric: string;
  metricLabel: string;
  segmentName?: string;
  availabilityStatus: FactAvailabilityStatus;
  value?: number;
  originalValue?: number;
  unit: FinancialUnit;
  originalUnit: string;
  normalizedUnit: FinancialUnit;
  originalCurrency: string;
  normalizedCurrency: string;
  currencyConversion?: CurrencyConversionMetadata;
  reportingPeriod: ReportingPeriod;
  accountingBasis: AccountingBasis;
  extractionMethod: ExtractionMethod;
  provenanceSourceType: ProvenanceSourceType;
  sourceReference: StableSourceReference;
  confidence: number;
  confidenceTier: FactConfidenceTier;
  verificationStatus: FactVerificationStatus;
  reviewReason?: string;
  extractedAt: string;
}

export type ManagementClaimCategory =
  | 'GUIDANCE'
  | 'CAPEX_PLAN'
  | 'MARKET_OUTLOOK'
  | 'DELEVERAGING'
  | 'PRODUCT_LAUNCH'
  | 'OPERATIONAL_UPDATE';

export interface ManagementClaim {
  claimId: string;
  projectId: string;
  documentId: string;
  documentName: string;
  pageId?: string;
  pageNumber?: number;
  speaker: string;
  speakerTitle?: string;
  claimText: string;
  category: ManagementClaimCategory;
  reportingPeriod: ReportingPeriod;
  sourceReference: StableSourceReference;
  confidence: number;
  verificationStatus: 'RECORDED' | 'REQUIRES_REVIEW';
  extractedAt: string;
}

export type DiscrepancyClassification =
  | 'MATCH'
  | 'ROUNDING_VARIANCE'
  | 'UNIT_VARIANCE'
  | 'PERIOD_VARIANCE'
  | 'ACCOUNTING_BASIS_VARIANCE'
  | 'RESTATEMENT'
  | 'SOURCE_DEFINITION_VARIANCE'
  | 'MATERIAL_CONFLICT'
  | 'UNRESOLVED';

export interface ContradictionRecord {
  id: string;
  projectId: string;
  metric: string;
  metricLabel: string;
  reportingPeriod: string;
  discrepancyType: DiscrepancyClassification;
  factA: FinancialFact;
  factB: FinancialFact;
  difference?: number;
  percentageDiff?: number;
  explanation: string;
  resolutionStatus:
    | 'OPEN'
    | 'RESOLVED_PREFER_PRIMARY'
    | 'RESOLVED_RESTATED'
    | 'RESOLVED_STANDALONE'
    | 'RESOLVED_CONSOLIDATED'
    | 'REQUIRES_ANALYST_CHOICE';
  resolvedFactId?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface TwoYearReconciliationRecord {
  metric: string;
  metricLabel: string;
  category: FactCategory;
  accountingBasis: AccountingBasis;
  fy1Fact?: FinancialFact;
  fy0Fact?: FinancialFact;
  isComparable: boolean;
  comparabilityNotes?: string;
}
