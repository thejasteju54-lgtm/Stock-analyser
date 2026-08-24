/**
 * DataSourceTypes.ts
 * Phase 16 — Live Data Integration, Real-Company Validation & Source Reliability Domain Types.
 */

import { FinancialUnit } from '../extraction/FinancialFactTypes';
import { StableSourceReference } from '../extraction/FinancialFactTypes';

export type DataSourceCategory =
  | 'MARKET_DATA'
  | 'EXCHANGE_FILINGS'
  | 'COMPANY_DISCLOSURES'
  | 'FINANCIAL_STATEMENTS'
  | 'SHAREHOLDING'
  | 'CORPORATE_ACTIONS'
  | 'NEWS'
  | 'INDUSTRY_DATA'
  | 'MANAGEMENT_DISCLOSURES'
  | 'REFERENCE_DATA';

export type DataSourceTier =
  | 'TIER_1_PRIMARY'             // Statutory exchange filings, MCA, audited reports
  | 'TIER_2_VERIFIED_SECONDARY'  // Bloomberg, Reuters, Mint, CRISIL, ICRA
  | 'TIER_3_CONTEXTUAL'          // Broker reports, regional news, industry portals
  | 'TIER_4_DISCOVERY';          // Social media, unverified rumors, blogs

export type DataSourceAdapterMode =
  | 'REQUEST_RESPONSE'
  | 'POLLING'
  | 'STREAM'
  | 'BATCH_FILE';

export interface DataSourceMetadata {
  sourceId: string;
  sourceName: string;
  sourceTier: DataSourceTier;
  category: DataSourceCategory;
  coverage: string[];
  publisher: string;
  sourceUrl?: string;
  licenseStatus: 'COMMERCIAL' | 'OPEN_DATA' | 'STATUTORY_PUBLIC' | 'RESTRICTED';
  usageRestrictions?: string;
  attributionRequirement?: string;
  redistributionAllowed: boolean;
  rateLimitPerMinute: number;
  rateLimitPerDay?: number;
  authenticationRequired: boolean;
  availabilityStatus: 'CONNECTED' | 'DEGRADED' | 'UNAVAILABLE' | 'NOT_CONFIGURED' | 'SCHEMA_CHANGED';
}

export interface CanonicalDataPointKey {
  companyId: string;
  securityId: string;           // e.g. "INE155A01022" or "NSE:TATAMOTORS"
  metric: string;               // e.g. "PAT", "REVENUE", "NII", "CASA"
  periodStart: string;          // "YYYY-MM-DD"
  periodEnd: string;            // "YYYY-MM-DD"
  periodType: 'ANNUAL_FY' | 'QUARTERLY' | 'HALF_YEARLY' | 'TTM' | 'LTM';
  statementBasis: 'STANDALONE' | 'CONSOLIDATED';
  currency: 'INR' | 'USD';
  unit: FinancialUnit;
  adjustmentBasis: 'RAW_AS_REPORTED' | 'LATEST_RESTATED';
}

export function generateCanonicalDataPointKey(key: CanonicalDataPointKey): string {
  return [
    key.companyId.trim().toUpperCase(),
    key.securityId.trim().toUpperCase(),
    key.metric.trim().toUpperCase(),
    key.periodStart,
    key.periodEnd,
    key.periodType,
    key.statementBasis,
    key.currency,
    key.unit,
    key.adjustmentBasis,
  ].join('::');
}

export interface DataFetchQuery {
  symbol: string;
  isin?: string;
  cin?: string;
  category?: DataSourceCategory;
  periodStart?: string;
  periodEnd?: string;
  cursor?: string;
  pageSize?: number;
  cutoffDate?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DataSourceAdapter<_TRaw = unknown, TParsed = unknown> {
  metadata: DataSourceMetadata;
  supportedModes: DataSourceAdapterMode[];
  healthCheck(): Promise<{ status: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE'; latencyMs: number }>;
  fetch(query: DataFetchQuery): Promise<{
    captureRecord: import('./RawDataStore').RawSourceCaptureRecord;
    parsedData: TParsed;
    rateLimitStatus: { remainingRequests: number; resetTimestamp: number };
    retryable: boolean;
  }>;
  validate(raw: { parsedData: TParsed }): ValidationResult;
  normalize(raw: { parsedData: TParsed }, actions?: CorporateActionRecord[]): TParsed;
}

export interface ExchangeFilingRecord {
  filingId: string;
  companyId: string;
  symbol: string;
  filingType: 'ANNUAL_REPORT' | 'QUARTERLY_RESULTS' | 'SHAREHOLDING' | 'BOARD_MEETING' | 'PRESS_RELEASE' | 'CREDIT_RATING';
  title: string;
  filingDate: string; // ISO DateTime
  periodEnd?: string;
  sourceUrl: string;
  sourceId: string;
  sourceTier: DataSourceTier;
  rawPayloadHash: string;
  isAudited: boolean;
}

export type FinancialSectorArchetype =
  | 'INDUSTRIAL_MANUFACTURING'
  | 'IT_SERVICES'
  | 'BANKING'
  | 'NBFC'
  | 'INSURANCE';

export interface BaseStatementMetadata {
  statementId: string;
  companyId: string;
  reportingPeriod: string;
  periodStart: string;
  periodEnd: string;
  periodType: 'ANNUAL_FY' | 'QUARTERLY' | 'HALF_YEARLY' | 'TTM' | 'LTM';
  statementBasis: 'STANDALONE' | 'CONSOLIDATED';
  auditStatus: 'AUDITED' | 'UNAUDITED_LIMITED_REVIEW' | 'PROVISIONAL';
  publicationDate: string;
  sourceReference: StableSourceReference;
  rawPayloadHash: string;
}

export interface IndustrialFinancialStatement extends BaseStatementMetadata {
  archetype: 'INDUSTRIAL_MANUFACTURING';
  revenue: number;
  rawMaterialCost?: number;
  employeeExpenses: number;
  otherOperatingExpenses: number;
  ebitda: number;
  depreciationAndAmortization: number;
  ebit: number;
  financeCosts: number;
  otherIncome: number;
  pbt: number;
  taxExpense: number;
  pat: number;
  basicEps: number;
  dilutedEps: number;
  cfo: number;
  capex: number;
  fcf: number;
  tradeReceivables: number;
  inventory: number;
  tradePayables: number;
  totalDebt: number;
  cashAndEquivalents: number;
  netWorth: number;
  totalAssets: number;
}

export interface ItServicesFinancialStatement extends BaseStatementMetadata {
  archetype: 'IT_SERVICES';
  revenueInr: number;
  revenueUsd?: number;
  constantCurrencyGrowthYoY?: number;
  softwareDevelopmentExpenses: number;
  employeeBenefitExpenses: number;
  operatingProfit: number;
  operatingMarginPercent: number;
  otherIncome: number;
  pbt: number;
  taxExpense: number;
  pat: number;
  basicEps: number;
  cfo: number;
  fcf: number;
  cashAndLiquidInvestments: number;
  headcount?: number;
  attritionRateLtmPercent?: number;
  utilizationRatePercent?: number;
}

export interface BankingFinancialStatement extends BaseStatementMetadata {
  archetype: 'BANKING';
  interestEarned: number;
  interestExpended: number;
  netInterestIncome: number; // NII
  nonInterestIncome: number;
  totalNetIncome: number;
  operatingExpenses: number;
  preProvisionOperatingProfit: number; // PPOP
  provisionsAndContingencies: number;
  pbt: number;
  taxExpense: number;
  pat: number;
  basicEps: number;
  netInterestMarginPercent: number; // NIM
  grossNpaAmount: number;
  grossNpaRatioPercent: number; // GNPA %
  netNpaAmount: number;
  netNpaRatioPercent: number;   // NNPA %
  provisionCoverageRatioPercent: number; // PCR %
  creditCostPercent: number;
  casaRatioPercent: number;
  totalAdvances: number;
  advancesGrowthYoYPercent: number;
  totalDeposits: number;
  depositsGrowthYoYPercent: number;
  
  // Explicit Capital Adequacy Decomposition
  cet1RatioPercent: number;          // Common Equity Tier 1 Ratio %
  at1RatioPercent: number;           // Additional Tier 1 Ratio %
  tier1CapitalRatioPercent: number;  // Total Tier 1 Capital Ratio % (CET1 + AT1)
  tier2CapitalRatioPercent: number;  // Tier 2 Capital Ratio %
  crarPercent: number;               // Total Capital Adequacy Ratio % (Tier 1 + Tier 2)
  
  returnOnAssetsPercent: number;     // RoA %
  returnOnEquityPercent: number;     // RoE %
}

export interface NbfcFinancialStatement extends BaseStatementMetadata {
  archetype: 'NBFC';
  interestIncome: number;
  financeCost: number;
  netInterestIncome: number;
  feeAndCommissionIncome: number;
  operatingExpenses: number;
  preProvisionProfit: number;
  expectedCreditLossProvisions: number; // ECL
  pbt: number;
  pat: number;
  aum: number;
  aumGrowthYoYPercent: number;
  borrowings: number;
  costOfFundsPercent: number;
  loanSpreadPercent: number;
  stage3AssetsPercent: number;
  stage3ProvisionCoveragePercent: number;
  crarPercent: number;
  tier1RatioPercent: number;
  returnOnAumPercent: number;
}

export interface InsuranceFinancialStatement extends BaseStatementMetadata {
  archetype: 'INSURANCE';
  grossDirectPremiumIncome: number; // GDPI
  netPremiumEarned: number;
  investmentIncome: number;
  claimsIncurred: number;
  commissionExpenses: number;
  operatingExpenses: number;
  combinedRatioPercent?: number;
  underwritingProfitOrLoss?: number;
  valueofNewBusiness?: number;      // VNB
  vnbMarginPercent?: number;
  embeddedValue?: number;           // EV
  operatingRoevPercent?: number;
  solvencyRatioPercent: number;     // Regulatory Solvency Ratio
  pat: number;
}

export type SectorFinancialStatement =
  | IndustrialFinancialStatement
  | ItServicesFinancialStatement
  | BankingFinancialStatement
  | NbfcFinancialStatement
  | InsuranceFinancialStatement;

export type CorporateActionType =
  | 'STOCK_SPLIT'
  | 'BONUS_ISSUE'
  | 'RIGHTS_ISSUE'
  | 'DIVIDEND'
  | 'MERGER'
  | 'DEMERGER'
  | 'BUYBACK'
  | 'FACE_VALUE_SPLIT'
  | 'SYMBOL_CHANGE';

export interface CorporateActionRecord {
  actionId: string;
  companyId: string;
  symbol: string;
  actionType: CorporateActionType;
  announcementDate: string;
  recordDate?: string;
  exDate: string;
  effectiveDate: string;
  ratio?: string; // e.g. "10:1", "1:2"
  multiplier: number; // e.g. 10 for 10:1 split, 1.5 for 1:2 bonus
  dividendAmount?: number; // In INR per share
  source: string;
  sourceTier: DataSourceTier;
  verificationStatus: 'VERIFIED' | 'UNVERIFIED';
}

export interface MarketPriceRecord {
  symbol: string;
  exchange: 'NSE' | 'BSE';
  tradeTimestamp: string;
  sessionDate: string;
  rawPrice: number;
  splitAdjustedPrice: number;
  totalReturnPrice: number;
  cumulativeSplitAdjustmentFactor: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap?: number;
  currency: 'INR';
  anomalyClassification: 'NORMAL' | 'EXPLAINED_ANOMALY' | 'UNEXPLAINED_ANOMALY' | 'MATERIAL_CONFLICT' | 'NOT_ASSESSABLE';
  anomalyReason?: string;
  sourceId: string;
  sourceTier: DataSourceTier;
  captureId: string;
}

export type ShareholdingReconciliationStatus =
  | 'RECONCILED'
  | 'MINOR_ROUNDING_VARIANCE'
  | 'INCOMPLETE'
  | 'MATERIAL_CONFLICT'
  | 'NOT_ASSESSABLE';

export interface ShareholdingRecord {
  recordId: string;
  companyId: string;
  quarterEnd: string;
  filingDate: string;
  promoterHoldingPercent: number;
  promoterPledgePercentOfPromoterHolding: number;
  fiiHoldingPercent: number;
  diiHoldingPercent: number;
  mutualFundHoldingPercent?: number;
  insuranceHoldingPercent?: number;
  publicRetailHoldingPercent: number;
  otherHoldingPercent: number;
  totalOwnershipSumPercent: number;
  reconciliationStatus: ShareholdingReconciliationStatus;
  reconciliationVariancePercent: number;
  sourceId: string;
  sourceTier: DataSourceTier;
  rawPayloadHash: string;
}
