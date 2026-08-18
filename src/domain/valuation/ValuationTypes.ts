/**
 * Phase 9 — Sector-Aware Valuation Engine Types
 * Pure domain schemas and types for evidence-driven valuation analysis.
 */

import { ForensicEvidenceReference } from '../forensics/ForensicAnalysisTypes';

// =============================================================================
// VALUATION METHODOLOGIES & ASSUMPTIONS
// =============================================================================

export type ValuationMethodId =
  | 'PE'
  | 'TTM_PE'
  | 'FORWARD_PE'
  | 'PB'
  | 'EV_EBITDA'
  | 'EV_SALES'
  | 'PRICE_TO_SALES'
  | 'FCF_YIELD'
  | 'DIVIDEND_YIELD'
  | 'PEG'
  | 'FCFF_DCF'
  | 'FCFE_DCF'
  | 'DIVIDEND_DISCOUNT_MODEL'
  | 'GORDON_GROWTH'
  | 'NAV'
  | 'SOTP';

export type AssumptionClassification =
  | 'HISTORICAL_FACT'
  | 'MANAGEMENT_GUIDANCE'
  | 'EXTERNAL_ESTIMATE'
  | 'ANALYST_ASSUMPTION'
  | 'MODEL_DERIVED';

export interface ValuationAssumption {
  assumptionId: string;
  name: string;
  value: number;
  unit: string;
  classification: AssumptionClassification;
  source: string;
  sourceDate: string;
  rationale: string;
  confidence: number;
  evidenceReference?: ForensicEvidenceReference;
}

// =============================================================================
// SHARE CAPITAL & ENTERPRISE VALUE SNAPSHOTS
// =============================================================================

export interface ShareCapitalSnapshot {
  basicShares: number; // in Crores
  dilutedShares: number; // in Crores
  weightedAverageShares: number; // in Crores
  faceValue: number; // in INR
  effectiveDate: string;
  corporateActionAdjustments: string[]; // e.g. "2:1 Split on 2023-09-15"
  source: string;
  confidence: number;
}

export interface EnterpriseValueBridge {
  marketCapitalization: number; // in INR Cr
  plusTotalDebt: number; // in INR Cr
  plusPreferredEquity: number; // in INR Cr
  plusMinorityInterest: number; // in INR Cr
  lessCashAndEquivalents: number; // in INR Cr
  lessLiquidInvestments: number; // in INR Cr
  netDebt: number; // in INR Cr
  enterpriseValue: number; // in INR Cr
  formulaDescription: string;
  accountingBasis: 'CONSOLIDATED' | 'STANDALONE';
  financialPeriod: string;
}

export interface MarketValuationSnapshot {
  currentPrice: number; // INR
  priceDate: string;
  marketDataTimestamp: string;
  currency: string;
  shareCapital: ShareCapitalSnapshot;
  evBridge: EnterpriseValueBridge;
  isStale: boolean;
  freshnessThresholdHours: number;
  source: string;
  confidence: number;
}

// =============================================================================
// RELATIVE & HISTORICAL VALUATION
// =============================================================================

export type MultipleCalculationStatus =
  | 'CALCULATED'
  | 'NOT_MEANINGFUL' // e.g. Negative EPS or EBITDA
  | 'NOT_APPLICABLE' // Gated by business model (e.g. EV/EBITDA on Banks)
  | 'NOT_ASSESSABLE'; // Missing inputs

export interface RelativeMultipleItem {
  multipleCode: ValuationMethodId;
  multipleName: string;
  currentValue: number | null;
  status: MultipleCalculationStatus;
  statusExplanation?: string;
  peerMedian: number | null;
  historicalMedian: number | null;
  premiumToPeersPercent: number | null;
  premiumToHistoryPercent: number | null;
  formula: string;
  limitations: string[];
}

export type HistoricalDataCoverageStatus =
  | 'HISTORICAL_DATA_SUFFICIENT'
  | 'HISTORICAL_DATA_LIMITED'
  | 'HISTORICAL_DATA_UNAVAILABLE';

export interface HistoricalValuationRange {
  multipleCode: ValuationMethodId;
  periodYears: 3 | 5;
  current: number | null;
  min: number | null;
  max: number | null;
  median: number | null;
  lowerQuartile: number | null;
  upperQuartile: number | null;
  currentPercentile: number | null; // 0-100%
  status: HistoricalDataCoverageStatus;
  pointInTimeObservationsCount: number;
}

export interface PointInTimeHistoricalObservation {
  valuationDate: string;
  marketPrice: number;
  reportReleaseDate: string;
  financialPeriod: string;
  metricType: 'EPS' | 'BOOK_VALUE' | 'EBITDA' | 'SALES' | 'FCF';
  metricValue: number;
  derivedMultiple: number;
  source: string;
}

// =============================================================================
// PEER BENCHMARKING
// =============================================================================

export interface PeerValuationRecord {
  peerId: string;
  companyName: string;
  symbol: string;
  businessModel: string;
  sector: string;
  marketCap: number; // INR Cr
  revenue: number;
  revenueGrowthYoY: number; // %
  ebitdaMargin: number; // %
  roe: number; // %
  roce: number; // %
  debtToEquity: number;
  pe: number | null;
  pb: number | null;
  evEbitda: number | null;
  fcfYield: number | null;
  relevanceScore: number; // 0-100
  inclusionRationale: string;
  isOutlierExcluded: boolean;
  exclusionReason?: string;
  priceDate: string;
  financialPeriod: string;
  isStale: boolean;
  source: string;
}

export interface PeerBenchmarkSummary {
  multipleCode: ValuationMethodId;
  mean: number | null;
  median: number | null;
  min: number | null;
  max: number | null;
  lowerQuartile: number | null;
  upperQuartile: number | null;
  peerCount: number;
  excludedOutliersCount: number;
}

// =============================================================================
// DCF INTRINSIC VALUATION & SENSITIVITY
// =============================================================================

export interface DcfScenario {
  scenarioName: 'BEAR' | 'BASE' | 'BULL';
  forecastYears: number; // 5 years
  revenueCagr: number; // %
  terminalEbitMargin: number; // %
  taxRate: number; // %
  wacc: number; // %
  terminalGrowthRate: number; // %
  projectedCashFlows: number[]; // INR Cr
  pvCashFlows: number;
  terminalValue: number;
  pvTerminalValue: number;
  enterpriseValue: number;
  equityValue: number;
  valuePerShare: number; // INR
  marginOfSafetyPercent: number; // %
  upsideDownsidePercent: number; // %
  assumptions: ValuationAssumption[];
}

export interface DcfSensitivityMatrix {
  waccRange: number[]; // e.g. [10.5, 11.5, 12.5]
  terminalGrowthRange: number[]; // e.g. [4.5, 5.0, 5.5]
  valuesPerShare: number[][]; // 2D matrix [waccIdx][growthIdx]
  baseWaccIndex: number;
  baseGrowthIndex: number;
}

// =============================================================================
// REVERSE DCF (EMBEDDED EXPECTATIONS)
// =============================================================================

export type ReverseDCFSolveVariable =
  | 'REVENUE_CAGR'
  | 'EBIT_MARGIN'
  | 'REINVESTMENT_RATE'
  | 'ROIC'
  | 'TERMINAL_GROWTH';

export type ImpliedExpectationStatus =
  | 'BELOW_HISTORICAL_RANGE'
  | 'WITHIN_HISTORICAL_RANGE'
  | 'ABOVE_HISTORICAL_RANGE'
  | 'BELOW_MANAGEMENT_GUIDANCE'
  | 'WITHIN_MANAGEMENT_GUIDANCE'
  | 'ABOVE_MANAGEMENT_GUIDANCE'
  | 'NOT_COMPARABLE';

export interface EmbeddedExpectations {
  currentPrice: number;
  solvedVariable: ReverseDCFSolveVariable;
  impliedRevenueCagr: number; // %
  impliedEbitMargin: number; // %
  impliedRoce: number | null; // % or null if not uniquely determined
  impliedFcf5YearSum: number; // INR Cr
  convergenceTolerance: number;
  fixedAssumptions: Record<string, number>;
  revenueGrowthComparison: ImpliedExpectationStatus;
  marginComparison: ImpliedExpectationStatus;
  diagnosticExplanation: string;
}

// =============================================================================
// SOTP & NAV ASSET-BASED VALUATION
// =============================================================================

export interface SotpSegmentItem {
  segmentId: string;
  segmentName: string;
  businessModel: string;
  metricType: 'REVENUE' | 'EBITDA' | 'PAT' | 'BOOK_VALUE';
  metricValue: number; // INR Cr
  valuationMultiple: number;
  multipleType: ValuationMethodId;
  enterpriseValue: number; // INR Cr
  peerBenchmarkSource: string;
  confidence: number;
}

export interface SotpValuationReport {
  segments: SotpSegmentItem[];
  sumOfSegmentEV: number;
  lessCorporateCosts: number;
  lessNetDebt: number;
  lessMinorityInterest: number;
  holdingCompanyDiscountPercent: number; // e.g. 20%
  netEquityValue: number;
  valuePerShare: number;
}

export interface NavValuationReport {
  grossAssetValue: number;
  lessTotalLiabilities: number;
  lessDebt: number;
  plusCash: number;
  holdingDiscountPercent: number;
  netAssetValue: number;
  sharesOutstanding: number;
  navPerShare: number;
  assetValuationBasis: string;
}

export interface DdmValuationReport {
  currentDividend: number;
  payoutRatio: number;
  costOfEquity: number;
  growthRate: number;
  terminalGrowthRate: number;
  ddmValuePerShare: number;
  isEligible: boolean;
  notes: string;
}

// =============================================================================
// VALUATION TRIANGULATION & POSITION
// =============================================================================

export type ValuationPosition =
  | 'DEEP_DISCOUNT'
  | 'DISCOUNT'
  | 'AROUND_FAIR_RANGE'
  | 'PREMIUM'
  | 'EXTREME_PREMIUM'
  | 'NOT_ASSESSABLE';

export interface ValuationTriangulationItem {
  methodId: ValuationMethodId;
  methodName: string;
  derivedValuePerShare: number;
  dynamicWeight: number; // 0-100%
  assumptionIntensity: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
  dataQualityStatus: 'VERIFIED' | 'ADJUSTED' | 'ESTIMATED';
  notes: string;
}

export interface ForensicValuationAdjustment {
  adjustmentId: string;
  findingId: string;
  category: string;
  affectedMetric: string;
  reportedValue: number;
  adjustedValue: number;
  adjustmentAmount: number;
  adjustmentReason: string;
  evidence: string;
  confidence: number;
}

// =============================================================================
// COMPLETE SECTOR VALUATION REPORT
// =============================================================================

export interface SectorValuationReport {
  analysisId: string;
  projectId: string;
  companySymbol: string;
  businessModel: string;
  sector: string;
  generatedAt: string;
  marketSnapshot: MarketValuationSnapshot;
  relativeMultiples: RelativeMultipleItem[];
  historicalValuation: HistoricalValuationRange[];
  peerBenchmarking: {
    peers: PeerValuationRecord[];
    peMedian: number | null;
    evEbitdaMedian: number | null;
    pbMedian: number | null;
  };
  dcfModel: {
    scenarios: Record<'BEAR' | 'BASE' | 'BULL', DcfScenario>;
    sensitivityMatrix: DcfSensitivityMatrix;
    waccBridge: { costOfEquity: number; costOfDebt: number; taxRate: number; wacc: number };
  };
  embeddedExpectations: EmbeddedExpectations;
  sotpValuation?: SotpValuationReport;
  navValuation?: NavValuationReport;
  ddmValuation?: DdmValuationReport;
  forensicAdjustments: ForensicValuationAdjustment[];
  triangulation: {
    items: ValuationTriangulationItem[];
    triangulatedBaseValuePerShare: number | null;
    intrinsicRange: { low: number; base: number; high: number } | null;
  };
  marginOfSafety: {
    vsBearValuePercent: number | null;
    vsBaseValuePercent: number | null;
    vsBullValuePercent: number | null;
    downsideToBearPercent: number | null;
    upsideToBasePercent: number | null;
    upsideToBullPercent: number | null;
  };
  valuationPosition: ValuationPosition;
  valuationConfidenceScore: number; // 0-100
  disclaimers: string[];
}
