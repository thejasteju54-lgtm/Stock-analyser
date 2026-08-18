/**
 * Phase 10 — Technical Analysis & Price-Action Intelligence Domain Types
 * Production-grade domain models for Indian Equity Technical Intelligence.
 */

export type Timeframe = 'INTRADAY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

export type DataQualityTier = 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT';

export type IndicatorCalculationStatus =
  | 'CALCULATED'
  | 'NOT_ASSESSABLE'
  | 'INSUFFICIENT_HISTORY'
  | 'MISSING_INPUT'
  | 'STALE_DATA';

export interface OHLCVCandle {
  timestamp: string; // ISO 8601 or YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose?: number;
}

export interface TechnicalDataset {
  datasetId: string;
  symbol: string;
  exchange: 'NSE' | 'BSE' | 'MCX' | string;
  timeframe: Timeframe;
  startDate: string;
  endDate: string;
  candleCount: number;
  adjusted: boolean;
  source: string;
  sourceTimestamp: string;
  dataQuality: DataQualityTier;
  evidenceReference?: string;
  isStale: boolean;
  freshnessThresholdHours: number;
}

export type BenchmarkType = 'BROAD_MARKET' | 'SECTOR';

export interface BenchmarkDataset {
  benchmarkId: string;
  symbol: string; // e.g., NIFTY 50, NIFTY AUTO, NIFTY BANK
  benchmarkName: string;
  benchmarkType: BenchmarkType;
  timeframe: Timeframe;
  startDate: string;
  endDate: string;
  candles: OHLCVCandle[];
  source: string;
  sourceTimestamp: string;
  adjusted: boolean;
  dataQuality: DataQualityTier;
}

// =============================================================================
// 1. SWINGS & MARKET STRUCTURE
// =============================================================================

export type SwingType = 'SWING_HIGH' | 'SWING_LOW';
export type SwingStatus = 'CANDIDATE_SWING' | 'CONFIRMED_SWING';

export interface SwingPoint {
  swingId: string;
  index: number;
  candidateTimestamp: string;
  confirmationTimestamp?: string;
  price: number;
  type: SwingType;
  status: SwingStatus;
  atrProminence: number;
}

export type MarketStructureDirection =
  | 'BULLISH_STRUCTURE'
  | 'BEARISH_STRUCTURE'
  | 'MIXED_STRUCTURE'
  | 'RANGE_STRUCTURE'
  | 'INSUFFICIENT_DATA';

export interface StructureBreakEvent {
  breakId: string;
  type: 'BOS_BULLISH' | 'BOS_BEARISH' | 'CHOCH_BULLISH' | 'CHOCH_BEARISH';
  brokenSwingPrice: number;
  breakTimestamp: string;
  closePrice: number;
  volumeMultiplier?: number;
  description: string;
}

export interface MarketStructure {
  direction: MarketStructureDirection;
  swingHighs: SwingPoint[];
  swingLows: SwingPoint[];
  higherHighsCount: number;
  higherLowsCount: number;
  lowerHighsCount: number;
  lowerLowsCount: number;
  structureBreaks: StructureBreakEvent[];
  confidence: number;
  status: IndicatorCalculationStatus;
}

// =============================================================================
// 2. TREND CLASSIFICATION
// =============================================================================

export type TrendDirection =
  | 'STRONG_UPTREND'
  | 'UPTREND'
  | 'SIDEWAYS'
  | 'DOWNTREND'
  | 'STRONG_DOWNTREND'
  | 'INSUFFICIENT_DATA';

export interface TrendAssessment {
  primaryTrend: TrendDirection;
  intermediateTrend: TrendDirection;
  shortTermTrend: TrendDirection;
  trendSlope: 'RISING' | 'FLAT' | 'FALLING';
  trendConfidence: number;
  rationale: string;
  status: IndicatorCalculationStatus;
}

// =============================================================================
// 3. MOVING AVERAGES & REGIME
// =============================================================================

export type MovingAverageType = 'SMA' | 'EMA';

export interface MovingAverageItem {
  period: number; // 20, 50, 100, 200
  type: MovingAverageType;
  value: number | null;
  priceDistancePercent: number | null;
  slope: 'RISING' | 'FLAT' | 'FALLING';
  priceRelationship: 'ABOVE' | 'BELOW' | 'AT' | 'NOT_ASSESSABLE';
  status: IndicatorCalculationStatus;
}

export type MovingAverageAlignment =
  | 'BULLISH_ALIGNMENT' // Price > 20 > 50 > 100 > 200
  | 'BEARISH_ALIGNMENT' // Price < 20 < 50 < 100 < 200
  | 'MIXED_ALIGNMENT'
  | 'TRANSITION'
  | 'INSUFFICIENT_DATA';

export interface MovingAverageRegime {
  alignment: MovingAverageAlignment;
  items: MovingAverageItem[];
  goldenCross50_200: boolean;
  deathCross50_200: boolean;
  goldenCrossDate?: string;
  deathCrossDate?: string;
  status: IndicatorCalculationStatus;
}

// =============================================================================
// 4. MOMENTUM (RSI, MACD, ROC)
// =============================================================================

export type RsiZone = 'OVERSOLD_ZONE' | 'NEUTRAL' | 'OVERBOUGHT_ZONE' | 'NOT_ASSESSABLE';

export interface RsiAssessment {
  period: number; // 14
  currentValue: number | null;
  zone: RsiZone;
  status: IndicatorCalculationStatus;
  historicalElevatedContext: string;
  limitations: string[];
}

export type MacdMomentumClassification =
  | 'BULLISH_MOMENTUM'
  | 'BEARISH_MOMENTUM'
  | 'MIXED'
  | 'NEUTRAL'
  | 'NOT_ASSESSABLE';

export interface MacdAssessment {
  fastPeriod: number; // 12
  slowPeriod: number; // 26
  signalPeriod: number; // 9
  macdLine: number | null;
  signalLine: number | null;
  histogram: number | null;
  momentumClassification: MacdMomentumClassification;
  crossoverEvent: 'BULLISH_CROSSOVER' | 'BEARISH_CROSSOVER' | 'NONE';
  crossoverDate?: string;
  status: IndicatorCalculationStatus;
}

export type MomentumRegime = 'BULLISH' | 'BEARISH' | 'MIXED_MOMENTUM' | 'NEUTRAL' | 'NOT_ASSESSABLE';

export interface MomentumAssessment {
  rsi: RsiAssessment;
  macd: MacdAssessment;
  rateOfChange14: number | null;
  momentumRegime: MomentumRegime;
  diagnosticExplanation: string;
  status: IndicatorCalculationStatus;
}

// =============================================================================
// 5. VOLUME & ACCUMULATION / DISTRIBUTION
// =============================================================================

export type VolumeAssessmentStatus =
  | 'CONFIRMING'
  | 'WEAK_CONFIRMATION'
  | 'DIVERGING'
  | 'NEUTRAL'
  | 'NOT_ASSESSABLE';

export type AccumulationDistributionStatus =
  | 'POTENTIAL_ACCUMULATION'
  | 'POTENTIAL_DISTRIBUTION'
  | 'NEUTRAL'
  | 'NOT_ASSESSABLE';

export interface VolumeAssessment {
  status: VolumeAssessmentStatus;
  relativeVolume20: number | null; // RVOL 20
  volumeMovingAverage20: number | null;
  latestVolume: number | null;
  upDownVolumeRatio20: number | null; // UpVolume / DownVolume
  upVolumeTotal20: number | null;
  downVolumeTotal20: number | null;
  unchangedVolumeTotal20: number | null;
  volumeTrend: 'EXPANDING' | 'CONTRACTING' | 'STABLE' | 'NOT_ASSESSABLE';
  accumulationDistributionStatus: AccumulationDistributionStatus;
  evidenceNotes: string[];
  calculationStatus: IndicatorCalculationStatus;
}

// =============================================================================
// 6. VOLATILITY & DRAWDOWN
// =============================================================================

export type VolatilityRegimeType = 'LOW' | 'NORMAL' | 'ELEVATED' | 'EXTREME' | 'NOT_ASSESSABLE';

export interface VolatilityRegime {
  atr14: number | null;
  atrPercent: number | null;
  regime: VolatilityRegimeType;
  volatilityTrend: 'EXPANDING' | 'CONTRACTING' | 'STABLE' | 'NOT_ASSESSABLE';
  high52Week: number | null;
  low52Week: number | null;
  distance52wHighPercent: number | null;
  distance52wLowPercent: number | null;
  maxHistoricalDrawdownPercent: number | null;
  status: IndicatorCalculationStatus;
}

// =============================================================================
// 7. SUPPORT / RESISTANCE & BREAKOUTS
// =============================================================================

export type ZoneType = 'SUPPORT' | 'RESISTANCE';
export type ZoneStrength = 'MAJOR' | 'MODERATE' | 'MINOR';

export interface SupportResistanceZone {
  zoneId: string;
  type: ZoneType;
  lowerBound: number;
  upperBound: number;
  midPrice: number;
  strength: ZoneStrength;
  touchCount: number;
  rejectionCount: number;
  breakoutCount: number;
  timeframe: Timeframe;
  sourceEvidence: string;
  lastTouchDate: string;
  ageBars: number;
  confidence: number;
}

export type BreakoutType =
  | 'POTENTIAL_BREAKOUT'
  | 'CONFIRMED_BREAKOUT'
  | 'FAILED_BREAKOUT'
  | 'POTENTIAL_BREAKDOWN'
  | 'CONFIRMED_BREAKDOWN'
  | 'FAILED_BREAKDOWN';

export type BreakoutConfirmationStatus =
  | 'CONFIRMED'
  | 'PARTIALLY_CONFIRMED'
  | 'UNCONFIRMED'
  | 'FAILED';

export interface BreakoutEvent {
  eventId: string;
  type: BreakoutType;
  levelPrice: number;
  eventDate: string;
  closingPrice: number;
  volumeMultiplier: number | null;
  confirmationStatus: BreakoutConfirmationStatus;
  followThroughVerified: boolean;
  description: string;
  status: IndicatorCalculationStatus;
}

// =============================================================================
// 8. DIVERGENCE SENTINEL
// =============================================================================

export type DivergenceType = 'BULLISH_DIVERGENCE' | 'BEARISH_DIVERGENCE';
export type DivergenceIndicator = 'RSI' | 'MACD' | 'VOLUME';
export type DivergenceConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_ASSESSABLE';

export interface TechnicalDivergence {
  divergenceId: string;
  type: DivergenceType;
  indicator: DivergenceIndicator;
  swingDates: [string, string];
  priceSwing: [number, number];
  indicatorSwing: [number, number];
  confidence: DivergenceConfidence;
  description: string;
  isConfirmed: boolean;
}

// =============================================================================
// 9. RELATIVE STRENGTH (PIPELINE 8)
// =============================================================================

export type RelativeStrengthClassification =
  | 'OUTPERFORMING'
  | 'IN_LINE'
  | 'UNDERPERFORMING'
  | 'NOT_ASSESSABLE';

export interface BenchmarkComparisonItem {
  benchmarkSymbol: string;
  benchmarkName: string;
  benchmarkType: BenchmarkType;
  stockReturn1M: number | null;
  benchmarkReturn1M: number | null;
  relativeReturn1M: number | null;
  stockReturn3M: number | null;
  benchmarkReturn3M: number | null;
  relativeReturn3M: number | null;
  stockReturn6M: number | null;
  benchmarkReturn6M: number | null;
  relativeReturn6M: number | null;
  stockReturn1Y: number | null;
  benchmarkReturn1Y: number | null;
  relativeReturn1Y: number | null;
  classification: RelativeStrengthClassification;
  status: IndicatorCalculationStatus;
}

export interface RelativeStrengthAssessment {
  broadMarketComparison?: BenchmarkComparisonItem;
  sectorComparison?: BenchmarkComparisonItem;
  status: IndicatorCalculationStatus;
  diagnosticNotes: string[];
}

// =============================================================================
// SYNTHESIS LAYER 1: MARKET CYCLE PHASE
// =============================================================================

export type MarketCyclePhase =
  | 'ACCUMULATION'
  | 'MARKUP'
  | 'DISTRIBUTION'
  | 'MARKDOWN'
  | 'RANGE_TRANSITION'
  | 'NOT_ASSESSABLE';

export interface MarketCycleAssessment {
  phase: MarketCyclePhase;
  rationale: string;
  supportingSignals: string[];
  confidence: number;
}

// =============================================================================
// SYNTHESIS LAYER 2: TECHNICAL RISK
// =============================================================================

export type TechnicalRiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' | 'NOT_ASSESSABLE';

export interface TechnicalRiskAssessment {
  level: TechnicalRiskLevel;
  riskScore: number; // 0-100 fragility score
  definition: string; // "Fragility / risk characteristics of the technical setup."
  riskFactors: string[];
  invalidatingConditions: string[];
}

// =============================================================================
// SCREENSHOT-FIRST OBSERVATION MODEL
// =============================================================================

export interface ScreenshotTechnicalObservation {
  observationId: string;
  imageReference: string;
  pageNumber?: number;
  visibleRegion?: string;
  chartTimeframe: Timeframe;
  visibleDateRange: string;
  visiblePriceStructure: string;
  visibleTrend: string;
  visibleSupportResistance: string[];
  visibleMovingAverages: string[];
  visibleVolumeNotes?: string;
  visibleIndicatorsNotes?: string;
  confidence: number;
  calculatedOrVisual: 'VISUAL_OBSERVATION';
  timestamp: string;
}

// =============================================================================
// TECHNICAL SIGNAL MODEL
// =============================================================================

export type TechnicalSignalType =
  | 'TREND'
  | 'STRUCTURE'
  | 'SUPPORT'
  | 'RESISTANCE'
  | 'BREAKOUT'
  | 'BREAKDOWN'
  | 'MOMENTUM'
  | 'VOLUME'
  | 'DIVERGENCE'
  | 'VOLATILITY'
  | 'RELATIVE_STRENGTH';

export interface TechnicalSignal {
  signalId: string;
  signalType: TechnicalSignalType;
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  strength: 'STRONG' | 'MODERATE' | 'WEAK';
  timeframe: Timeframe;
  evidence: string;
  confidence: number;
  timestamp: string;
}

// =============================================================================
// MASTER TECHNICAL ANALYSIS REPORT
// =============================================================================

export interface TechnicalAnalysisReport {
  reportId: string;
  projectId: string;
  companySymbol: string;
  exchange: string;
  dataset: TechnicalDataset;
  currentPrice: number;
  priceDate: string;
  dataTimestamp: string;
  isAdjusted: boolean;
  adjustmentDescription?: string;

  // 8 Primary Analytical Pipelines
  trend: TrendAssessment;
  marketStructure: MarketStructure;
  movingAverages: MovingAverageRegime;
  momentum: MomentumAssessment;
  volume: VolumeAssessment;
  volatility: VolatilityRegime;
  supportResistance: {
    zones: SupportResistanceZone[];
    breakouts: BreakoutEvent[];
  };
  divergences: TechnicalDivergence[];
  relativeStrength: RelativeStrengthAssessment;

  // 2 Synthesis Layers
  marketCycle: MarketCycleAssessment;
  technicalRisk: TechnicalRiskAssessment;

  // Visual Screenshot Observations
  screenshotObservations: ScreenshotTechnicalObservation[];

  // Composite Technical Score & Confidence
  technicalScore: number | null; // 0-100 composite setup score
  technicalScoreComponents: { component: string; weight: number; score: number; contribution: number }[];
  technicalConfidenceScore: number; // 0-100
  signals: TechnicalSignal[];

  // Invalidation & Boundaries
  invalidatingConditions: string[];
  limitations: string[];
  disclaimers: string[];
  analysisTimestamp: string;
}
