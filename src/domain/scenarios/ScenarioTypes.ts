/**
 * ScenarioTypes.ts
 * Phase 13 — Institutional Domain Schemas and Type Definitions for
 * Scenario Modeling & Forward Financial Projection Engine.
 */

export type ScenarioType = 'BASE' | 'BULL' | 'BEAR';

export type AssumptionStatus =
  | 'VERIFIED'
  | 'DERIVED'
  | 'ESTIMATED'
  | 'USER_DEFINED'
  | 'NOT_ASSESSABLE';

export type AssumptionSourceType =
  | 'COMPANY_DISCLOSURE'
  | 'HISTORICAL_DATA'
  | 'INDUSTRY_DATA'
  | 'MANAGEMENT_GUIDANCE'
  | 'NEWS_INTELLIGENCE'
  | 'CATALYST_RISK_SIGNAL'
  | 'MODEL_DERIVED'
  | 'USER_DEFINED';

export type ForecastHorizon = 'YEAR_1' | 'YEAR_3' | 'YEAR_5' | 'TERMINAL';

export interface UserOverrideRecord {
  systemValue: number;
  userValue: number;
  variancePercent: number;
  userRationale: string;
  overriddenAt: string;
  impactOnValuationPercent: number;
}

export interface ScenarioAssumption {
  assumptionId: string;
  scenarioId: ScenarioType;
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
  confidence: number;
  isUserEditable: boolean;
  userOverride?: UserOverrideRecord;
  isDerived: boolean;
  derivationMethod?: {
    inputAssumptionIds: string[];
    formula: string;
    description: string;
  };
  status: AssumptionStatus;
}

export interface SegmentProjection {
  segmentId: string;
  segmentName: string;
  historicalRevenue: number;
  historicalGrowthPercent: number;
  projectedRevenue: number;
  projectedGrowthPercent: number;
  historicalMarginPercent: number;
  projectedMarginPercent: number;
  capexAllocation: number;
  workingCapitalAllocation: number;
  evidenceReferences: string[];
  confidence: number;
}

export interface RevenueBridgeItem {
  driverType:
    | 'VOLUME'
    | 'PRICE'
    | 'PRODUCT_MIX'
    | 'MARKET_SHARE'
    | 'CAPACITY'
    | 'AUM'
    | 'HEADCOUNT'
    | 'ARPU'
    | 'ORDER_BOOK';
  contributionPercent: number;
  description: string;
  sourceReferences: string[];
}

export interface MarginProjection {
  grossMarginPercent: number;
  ebitdaMarginPercent: number;
  ebitMarginPercent: number;
  patMarginPercent: number;
  costBreakdown: {
    rawMaterialPercent: number;
    employeeCostPercent: number;
    energyAndFreightPercent: number;
    otherFixedCostPercent: number;
    otherVariableCostPercent: number;
  };
  operatingLeverageFactor: number;
  incrementalMarginPercent: number | null;
  confidence: number;
}

export interface WorkingCapitalProjection {
  receivableDays: number;
  inventoryDays: number;
  payableDays: number;
  cashConversionCycleDays: number;
  workingCapitalToRevenuePercent: number;
  workingCapitalChange: number; // in INR Cr
  historicalMedianDays: number;
  normalizationRationale: string;
  status: 'VERIFIED' | 'ESTIMATED' | 'NOT_ASSESSABLE';
}

export type CapexClassification =
  | 'MAINTENANCE_CAPEX'
  | 'GROWTH_CAPEX'
  | 'MIXED'
  | 'NOT_ASSESSABLE';

export interface CapexProjection {
  classification: CapexClassification;
  maintenanceCapex: number; // in INR Cr
  growthCapex: number; // in INR Cr
  totalCapex: number; // in INR Cr
  capexToRevenuePercent: number;
  capacityExpansionMilestone?: string;
  sourceReferences: string[];
  confidence: number;
}

export interface DebtScheduleProjection {
  openingDebt: number; // INR Cr
  newBorrowing: number; // INR Cr
  repayment: number; // INR Cr
  closingDebt: number; // INR Cr
  interestExpense: number; // INR Cr
  averageBorrowingCostPercent: number;
  closingCashBalance: number; // INR Cr
  netDebt: number; // INR Cr
  interestCoverageRatio: number;
  sequencingMethod: 'NON_CIRCULAR_DETERMINISTIC';
}

export interface CashFlowProjection {
  ebitda: number;
  ebit: number;
  taxExpense: number;
  effectiveTaxRatePercent: number;
  workingCapitalChange: number;
  operatingCashFlow: number;
  capex: number;
  freeCashFlow: number;
  cashConversionStatus: 'STRONG' | 'NORMAL' | 'WEAK';
  ocfToEbitdaRatio: number;
  ocfToPatRatio: number;
  fcfToPatRatio: number;
}

export interface BalanceSheetProjection {
  investedCapital: number;
  netWorkingCapital: number;
  netFixedAssets: number;
  netDebt: number;
  netWorth: number;
  sharesOutstanding: number; // Cr
  dilutedSharesOutstanding: number; // Cr
}

export interface ReturnMetricsProjection {
  roePercent: number | null;
  rocePercent: number | null;
  roicPercent: number | null;
  denominatorDistortionStatus: 'NORMAL' | 'DISTORTED_NEGATIVE_EQUITY' | 'NOT_ASSESSABLE';
}

export interface EPSProjection {
  pat: number; // INR Cr
  basicShares: number; // Cr
  dilutedShares: number; // Cr
  dilutionEffectPercent: number;
  basicEps: number;
  dilutedEps: number;
}

export interface HorizonFinancialStatement {
  horizon: ForecastHorizon;
  yearLabel: string;
  revenue: number;
  revenueGrowthPercent: number;
  grossProfit: number;
  ebitda: number;
  ebit: number;
  pbt: number;
  pat: number;
  eps: number;
  ocf: number;
  capex: number;
  fcf: number;
  netDebt: number;
  roePercent: number | null;
  rocePercent: number | null;
  confidence: number;
}

export interface ScenarioValuationRange {
  scenarioType: ScenarioType;
  primaryMethod: 'PE' | 'EV_EBITDA' | 'FCFF_DCF' | 'PB' | 'SOTP';
  selectedMultipleRange: { low: number; base: number; high: number } | null;
  lowValuePerShare: number; // INR
  baseValuePerShare: number; // INR
  highValuePerShare: number; // INR
  valueIntervalDisplay: string; // e.g. "₹1,250 – ₹1,450"
  dcfWaccPercent?: number;
  terminalGrowthPercent?: number;
  terminalNominalGdpPercent?: number;
  assumptions: ScenarioAssumption[];
  valuationConsistencyStatus: 'CONSISTENT' | 'SCENARIO_VALUATION_INVERSION' | 'DCF_INVALID';
  confidence: number;
}

export interface AssumptionElasticityItem {
  assumptionId: string;
  metric: string;
  baseValue: number;
  shockStep: number;
  shockedOutputValue: number;
  valuationElasticityPercent: number;
  impactClassification: 'HIGH_IMPACT' | 'MEDIUM_IMPACT' | 'LOW_IMPACT';
  rationale: string;
}

export interface TwoWaySensitivityGrid {
  rowMetric: string; // e.g. "Revenue CAGR"
  rowValues: number[];
  colMetric: string; // e.g. "EBITDA Margin"
  colValues: number[];
  valuationMatrix: number[][]; // 2D grid
  baseRowIndex: number;
  baseColIndex: number;
}

export interface ScenarioInvalidationCondition {
  conditionId: string;
  scenarioType: ScenarioType;
  metric: string;
  operator: 'GREATER_THAN' | 'LESS_THAN' | 'EQUALS' | 'CHANGE_BY';
  thresholdValue: number | boolean;
  baselineValue: number | boolean;
  currentValue: number | boolean | null;
  distanceToTriggerPercent: number | null;
  status: 'VALID' | 'APPROACHING_TRIGGER' | 'INVALIDATED' | 'NOT_ASSESSABLE';
  thesisBreakerReferenceId?: string;
  rationale: string;
}

export interface ScenarioModel {
  scenarioType: ScenarioType;
  scenarioTitle: string;
  description: string;
  probabilityPercent: number;
  probabilityStatus: 'ASSESSABLE' | 'NOT_ASSESSABLE';
  isDisplayPlaceholder: boolean;
  probabilityDerivation: {
    histWeight: number;
    mgmtWeight: number;
    indWeight: number;
    p12TransWeight: number;
    formula: string;
  };
  horizonConfidence: Record<ForecastHorizon, number>;
  assumptions: ScenarioAssumption[];
  segments: SegmentProjection[];
  revenueBridge: RevenueBridgeItem[];
  marginProjection: MarginProjection;
  workingCapitalProjection: WorkingCapitalProjection;
  capexProjection: CapexProjection;
  debtSchedule: DebtScheduleProjection;
  cashFlowProjection: CashFlowProjection;
  balanceSheetProjection: BalanceSheetProjection;
  returnMetrics: ReturnMetricsProjection;
  epsProjection: EPSProjection;
  horizonStatements: HorizonFinancialStatement[];
  valuationRange: ScenarioValuationRange;
  elasticityRanking: AssumptionElasticityItem[];
  invalidationConditions: ScenarioInvalidationCondition[];
  reconciliationStatus: 'RECONCILED' | 'SCENARIO_INCONSISTENCY' | 'MODEL_ERROR';
  createdAt: string;
  updatedAt: string;
}

export interface ScenarioComparison {
  revenueCagr3Yr: Record<ScenarioType, number>;
  ebitdaMarginAvg: Record<ScenarioType, number>;
  patYear3: Record<ScenarioType, number>;
  epsYear3: Record<ScenarioType, number>;
  fcfYear3: Record<ScenarioType, number>;
  netDebtYear3: Record<ScenarioType, number>;
  roceYear3: Record<ScenarioType, number | null>;
  valuationRangeDisplay: Record<ScenarioType, string>;
  scenarioProbabilityDisplay: Record<ScenarioType, string>;
}

export interface ScenarioReport {
  projectId: string;
  companySymbol: string;
  asOfDate: string;
  scenarios: Record<ScenarioType, ScenarioModel>;
  comparison: ScenarioComparison;
  twoWaySensitivity: TwoWaySensitivityGrid;
  overallModelConfidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_ASSESSABLE';
  reconciliationAudit: {
    isFullyReconciled: boolean;
    brokenLinkCount: number;
    flags: string[];
  };
  generatedAt: string;
}
