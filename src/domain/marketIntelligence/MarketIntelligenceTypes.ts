export type UniverseType =
  | 'NSE_500'
  | 'NIFTY_50'
  | 'NIFTY_MIDCAP_100'
  | 'NIFTY_SMALLCAP_100'
  | 'CUSTOM_WATCHLIST';

export type OpportunityType =
  | 'MOMENTUM'
  | 'BREAKOUT'
  | 'EARNINGS'
  | 'VALUE'
  | 'GROWTH'
  | 'TURNAROUND'
  | 'ORDER_BOOK'
  | 'SECTOR_TAILWIND'
  | 'SPECIAL_SITUATION'
  | 'EVENT_DRIVEN'
  | 'QUALITY_COMPOUNDER';

export type TrendType =
  | 'POSITIVE'
  | 'NEGATIVE'
  | 'MIXED'
  | 'EVENT_DRIVEN'
  | 'TECHNICAL'
  | 'SPECULATIVE'
  | 'UNKNOWN';

export type MarketCutoff = 'PRE_MARKET' | 'INTRADAY' | 'POST_MARKET';

export interface MarketIndexData {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface MarketBreadth {
  advancers: number;
  decliners: number;
  unchanged: number;
  highs52W: number;
  lows52W: number;
}

export interface DailyStockSignal {
  symbol: string;
  displayName: string;
  legalName: string;
  sector: string;
  industry: string;
  marketCapCategory: 'LARGE_CAP' | 'MID_CAP' | 'SMALL_CAP';
  price: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  avgVolume20D: number;
  returns: {
    d1: number;
    d5: number;
    m1: number;
    m3: number;
    m6: number;
    y1: number;
  };
  technical: {
    rsi14: number;
    above50Dma: boolean;
    above200Dma: boolean;
    isBreakout: boolean;
    volumeMultiple: number; // e.g. 2.4x
  };
  fundamentals: {
    revenueGrowthYoY: number;
    ebitdaMargin: number;
    roce: number;
    roe: number;
    debtToEquity: number;
    cfoToPat: number;
    peRatio: number;
    pbRatio: number;
  };
  events: {
    type: 'ORDER_WIN' | 'EARNINGS_SURPRISE' | 'CAPEX' | 'MANAGEMENT_GUIDANCE' | 'CREDIT_RATING' | 'REGULATORY' | 'GOVERNANCE_FLAG';
    headline: string;
    description: string;
    date: string;
    source: string;
    sourceTier: number;
    materiality: 'HIGH' | 'MEDIUM' | 'LOW';
    impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  }[];
  newsIntensity: {
    totalArticles: number;
    uniqueEventCount: number;
    independentSourceCount: number;
    isSyndicatedWire: boolean;
    direction: 'POSITIVE' | 'NEGATIVE' | 'MIXED' | 'NEUTRAL';
  };
  risks: {
    category: 'DEBT' | 'VALUATION' | 'GOVERNANCE' | 'EXECUTION' | 'MARGIN_PRESSURE';
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }[];
  dataConfidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_ASSESSABLE';
}

export interface OpportunityScoreBreakdown {
  momentumScore: number;       // Max 15
  fundamentalsScore: number;   // Max 20
  catalystsScore: number;      // Max 20
  valuationScore: number;      // Max 15
  technicalScore: number;      // Max 10
  sectorScore: number;         // Max 5
  newsScore: number;           // Max 5
  volumeScore: number;         // Max 5
  confidenceScore: number;     // Max 5
  rawTotal: number;            // 0 - 100
  riskPenalty: number;         // Deducted (0 - 40)
  finalOpportunityScore: number; // 0 - 100
}

export interface DailyOpportunityItem {
  rank: number;
  symbol: string;
  displayName: string;
  sector: string;
  price: number;
  changePercent: number;
  volumeMultiple: number;
  opportunityScore: number;
  scoreBreakdown: OpportunityScoreBreakdown;
  trendScore: number;
  trendType: TrendType;
  opportunityType: OpportunityType;
  whyTodayBullets: string[];
  keyCatalysts: string[];
  keyRisks: string[];
  dataConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
  sourceProvenanceCount: number;
  rankDeltaFromYesterday?: {
    type: 'NEW_ENTRY' | 'UP' | 'DOWN' | 'UNCHANGED';
    places?: number;
    reason: string;
  };
  microResearch: {
    businessSummary: string;
    whyToday: string;
    fundamentalsSummary: string;
    valuationSummary: string;
    catalystsSummary: string;
    risksSummary: string;
    thesisBreakers: string[];
  };
}

export interface SectorHeatmapItem {
  sector: string;
  performance1D: number;
  performance5D: number;
  volumeMultiple: number;
  newsIntensity: 'HIGH' | 'MEDIUM' | 'LOW';
  topMovers: { symbol: string; changePercent: number }[];
  opportunityCount: number;
}

export interface DailyMarketSnapshot {
  snapshotId: string;
  date: string; // e.g. "2026-08-22"
  asOfTime: string; // e.g. "15:30 IST (Post-Market Close)"
  cutoff: MarketCutoff;
  universe: UniverseType;
  universeScannedCount: number;
  indices: MarketIndexData[];
  breadth: MarketBreadth;
  top10Opportunities: DailyOpportunityItem[];
  trendingStocks: {
    symbol: string;
    displayName: string;
    price: number;
    changePercent: number;
    volumeMultiple: number;
    trendScore: number;
    trendType: TrendType;
    reason: string;
  }[];
  sectorHeatmap: SectorHeatmapItem[];
  eventsRadar: {
    symbol: string;
    company: string;
    eventType: string;
    headline: string;
    date: string;
    materiality: 'HIGH' | 'MEDIUM';
    source: string;
    sourceTier: number;
  }[];
  riskRadar: {
    symbol: string;
    company: string;
    riskCategory: string;
    riskDescription: string;
    severity: 'HIGH' | 'CRITICAL';
    action: string;
  }[];
  dataQuality: {
    scannedCount: number;
    financialCoveragePercent: number;
    newsCoveragePercent: number;
    marketDataCoveragePercent: number;
    sourceConflictsCount: number;
    criticalMissingDataCount: number;
    calculationIntegrity: 'PASS' | 'WARN';
  };
  policyVersion: string;
}
