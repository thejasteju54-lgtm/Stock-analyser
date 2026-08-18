/**
 * TechnicalAnalysisEngine.ts
 * Master orchestrator for Phase 10 — Technical Analysis & Price-Action Intelligence.
 * Executes 8 primary analytical pipelines plus 2 synthesis layers.
 */

import {
  OHLCVCandle,
  TechnicalDataset,
  BenchmarkDataset,
  TechnicalAnalysisReport,
  MovingAverageItem,
  MovingAverageRegime,
  MovingAverageAlignment,
  RsiAssessment,
  MacdAssessment,
  MomentumAssessment,
  VolumeAssessment,
  VolatilityRegime,
  RelativeStrengthAssessment,
  BenchmarkComparisonItem,
  ScreenshotTechnicalObservation,
  TechnicalSignal,
} from './TechnicalTypes';
import { TechnicalPolicyRegistry } from './TechnicalPolicyRegistry';
import { IndicatorCalculations } from './IndicatorCalculations';
import { MarketStructureEngine } from './MarketStructureEngine';
import { DivergenceDetector } from './DivergenceDetector';

export class TechnicalAnalysisEngine {
  /**
   * Main analysis execution entry point for Phase 10.
   */
  public static analyze(
    projectId: string,
    companySymbol: string,
    exchange: string,
    dataset: TechnicalDataset,
    candles: OHLCVCandle[],
    niftyBenchmark?: BenchmarkDataset,
    sectorBenchmark?: BenchmarkDataset,
    screenshotObservations: ScreenshotTechnicalObservation[] = []
  ): TechnicalAnalysisReport {
    // 0. Sort and validate candles point-in-time
    const sortedCandles = [...candles].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const candleCount = sortedCandles.length;
    const latestCandle = sortedCandles[candleCount - 1] || {
      timestamp: new Date().toISOString().split('T')[0],
      open: 0,
      high: 0,
      low: 0,
      close: 0,
      volume: 0,
    };

    const currentPrice = latestCandle.close;
    const priceDate = latestCandle.timestamp;
    const closes = sortedCandles.map((c) => c.close);
    const volumes = sortedCandles.map((c) => c.volume);
    const hasVolume = volumes.some((v) => v > 0);

    // =========================================================================
    // PIPELINE 5: VOLATILITY & DRAWDOWN (Computed early for ATR-normalization)
    // =========================================================================
    const { atr } = IndicatorCalculations.calculateATR(sortedCandles, 14);
    const latestAtr = atr[atr.length - 1] || null;
    const atrPercent = latestAtr && currentPrice > 0 ? Math.round((latestAtr / currentPrice) * 1000) / 10 : null;

    // 52-Week High / Low & Max Drawdown (Last ~250 trading sessions)
    const tradingYearCandles = sortedCandles.slice(-250);
    let high52W: number | null = null;
    let low52W: number | null = null;
    let dist52wHigh: number | null = null;
    let dist52wLow: number | null = null;
    let maxDrawdown: number | null = null;

    if (tradingYearCandles.length >= 50) {
      high52W = Math.max(...tradingYearCandles.map((c) => c.high));
      low52W = Math.min(...tradingYearCandles.map((c) => c.low));
      dist52wHigh = currentPrice > 0 && high52W > 0 ? Math.round(((currentPrice - high52W) / high52W) * 1000) / 10 : null;
      dist52wLow = currentPrice > 0 && low52W > 0 ? Math.round(((currentPrice - low52W) / low52W) * 1000) / 10 : null;

      // Max historical drawdown in window
      let peak = tradingYearCandles[0].high;
      let maxDd = 0;
      for (const c of tradingYearCandles) {
        if (c.high > peak) peak = c.high;
        const dd = peak > 0 ? ((c.low - peak) / peak) * 100 : 0;
        if (dd < maxDd) maxDd = dd;
      }
      maxDrawdown = Math.round(maxDd * 10) / 10;
    }

    let volRegimeType: 'LOW' | 'NORMAL' | 'ELEVATED' | 'EXTREME' | 'NOT_ASSESSABLE' = 'NOT_ASSESSABLE';
    if (atrPercent !== null) {
      if (atrPercent < 1.5) volRegimeType = 'LOW';
      else if (atrPercent <= 3.0) volRegimeType = 'NORMAL';
      else if (atrPercent <= 5.0) volRegimeType = 'ELEVATED';
      else volRegimeType = 'EXTREME';
    }

    const volatilityReport: VolatilityRegime = {
      atr14: latestAtr,
      atrPercent,
      regime: volRegimeType,
      volatilityTrend: atrPercent && atrPercent > 3.0 ? 'EXPANDING' : 'STABLE',
      high52Week: high52W,
      low52Week: low52W,
      distance52wHighPercent: dist52wHigh,
      distance52wLowPercent: dist52wLow,
      maxHistoricalDrawdownPercent: maxDrawdown,
      status: candleCount >= 14 ? 'CALCULATED' : 'INSUFFICIENT_HISTORY',
    };

    // =========================================================================
    // PIPELINE 1: TREND & MARKET STRUCTURE
    // =========================================================================
    const { swingHighs, swingLows } = MarketStructureEngine.detectSwings(sortedCandles, atr);
    const marketStructure = MarketStructureEngine.analyzeMarketStructure(swingHighs, swingLows, sortedCandles);

    // =========================================================================
    // PIPELINE 2: MOVING AVERAGE & REGIME (20, 50, 100, 200 SMA/EMA)
    // =========================================================================
    const sma20 = IndicatorCalculations.calculateSMA(closes, 20);
    const sma50 = IndicatorCalculations.calculateSMA(closes, 50);
    const sma100 = IndicatorCalculations.calculateSMA(closes, 100);
    const sma200 = IndicatorCalculations.calculateSMA(closes, 200);

    const latestSma20 = sma20[sma20.length - 1];
    const latestSma50 = sma50[sma50.length - 1];
    const latestSma100 = sma100[sma100.length - 1];
    const latestSma200 = sma200[sma200.length - 1];

    const maItems: MovingAverageItem[] = [
      this.buildMaItem(20, 'SMA', latestSma20, currentPrice, sma20),
      this.buildMaItem(50, 'SMA', latestSma50, currentPrice, sma50),
      this.buildMaItem(100, 'SMA', latestSma100, currentPrice, sma100),
      this.buildMaItem(200, 'SMA', latestSma200, currentPrice, sma200),
    ];

    let maAlignment: MovingAverageAlignment = 'MIXED_ALIGNMENT';
    if (candleCount < 200) {
      maAlignment = 'INSUFFICIENT_DATA';
    } else if (
      latestSma20 && latestSma50 && latestSma100 && latestSma200 &&
      currentPrice > latestSma20 &&
      latestSma20 > latestSma50 &&
      latestSma50 > latestSma100 &&
      latestSma100 > latestSma200
    ) {
      maAlignment = 'BULLISH_ALIGNMENT';
    } else if (
      latestSma20 && latestSma50 && latestSma100 && latestSma200 &&
      currentPrice < latestSma20 &&
      latestSma20 < latestSma50 &&
      latestSma50 < latestSma100 &&
      latestSma100 < latestSma200
    ) {
      maAlignment = 'BEARISH_ALIGNMENT';
    }

    const goldenCross = latestSma50 !== null && latestSma200 !== null && latestSma50 > latestSma200;
    const deathCross = latestSma50 !== null && latestSma200 !== null && latestSma50 < latestSma200;

    const movingAveragesReport: MovingAverageRegime = {
      alignment: maAlignment,
      items: maItems,
      goldenCross50_200: goldenCross,
      deathCross50_200: deathCross,
      status: candleCount >= 20 ? 'CALCULATED' : 'INSUFFICIENT_HISTORY',
    };

    // Evaluate Trend Assessment
    const priceVs200 = maItems.find((m) => m.period === 200)?.priceRelationship || 'NOT_ASSESSABLE';
    const priceVs50 = maItems.find((m) => m.period === 50)?.priceRelationship || 'NOT_ASSESSABLE';
    const ma20Item = maItems.find((m) => m.period === 20);
    const slope = ma20Item?.slope === 'RISING' ? 1.2 : ma20Item?.slope === 'FALLING' ? -1.2 : 0;

    const trendClassification = TechnicalPolicyRegistry.classifyTrend(
      marketStructure.direction,
      priceVs200,
      priceVs50,
      maAlignment,
      slope
    );

    const trendReport = {
      primaryTrend: trendClassification.trend,
      intermediateTrend: maItems[1]?.priceRelationship === 'ABOVE' ? 'UPTREND' : 'DOWNTREND',
      shortTermTrend: maItems[0]?.priceRelationship === 'ABOVE' ? 'UPTREND' : 'DOWNTREND',
      trendSlope: ma20Item?.slope || 'FLAT',
      trendConfidence: trendClassification.confidence,
      rationale: trendClassification.rationale,
      status: candleCount >= 20 ? 'CALCULATED' : 'INSUFFICIENT_HISTORY',
    } as any;

    // =========================================================================
    // PIPELINE 3: MOMENTUM (RSI 14 & MACD 12,26,9 & ROC 14)
    // =========================================================================
    const rsiSeries = IndicatorCalculations.calculateRSI(closes, 14);
    const latestRsi = (rsiSeries.length > 0 ? rsiSeries[rsiSeries.length - 1] : null) ?? null;

    let rsiZone: 'OVERSOLD_ZONE' | 'NEUTRAL' | 'OVERBOUGHT_ZONE' | 'NOT_ASSESSABLE' = 'NOT_ASSESSABLE';
    if (latestRsi !== null) {
      if (latestRsi >= 70) rsiZone = 'OVERBOUGHT_ZONE';
      else if (latestRsi <= 30) rsiZone = 'OVERSOLD_ZONE';
      else rsiZone = 'NEUTRAL';
    }

    const rsiReport: RsiAssessment = {
      period: 14,
      currentValue: latestRsi,
      zone: rsiZone,
      status: latestRsi !== null ? 'CALCULATED' : 'INSUFFICIENT_HISTORY',
      historicalElevatedContext:
        rsiZone === 'OVERBOUGHT_ZONE'
          ? 'RSI is in an historically elevated momentum zone (>70); does not imply immediate reversal without structural trigger.'
          : rsiZone === 'OVERSOLD_ZONE'
          ? 'RSI is in an historically depressed momentum zone (<30); reflects severe downward momentum pressure.'
          : 'RSI is operating within normal equilibrium oscillator bands (30–70).',
      limitations: ['RSI can remain extended in strong directional trends.'],
    };

    const macdData = IndicatorCalculations.calculateMACD(closes, 12, 26, 9);
    const latestMacd = (macdData.macdLine.length > 0 ? macdData.macdLine[macdData.macdLine.length - 1] : null) ?? null;
    const latestSignal = (macdData.signalLine.length > 0 ? macdData.signalLine[macdData.signalLine.length - 1] : null) ?? null;
    const latestHist = (macdData.histogram.length > 0 ? macdData.histogram[macdData.histogram.length - 1] : null) ?? null;

    let macdClassification: 'BULLISH_MOMENTUM' | 'BEARISH_MOMENTUM' | 'MIXED' | 'NEUTRAL' | 'NOT_ASSESSABLE' = 'NOT_ASSESSABLE';
    if (latestMacd !== null && latestSignal !== null) {
      if (latestMacd > latestSignal && latestMacd > 0) {
        macdClassification = 'BULLISH_MOMENTUM';
      } else if (latestMacd < latestSignal && latestMacd < 0) {
        macdClassification = 'BEARISH_MOMENTUM';
      } else {
        macdClassification = 'MIXED';
      }
    }

    const macdReport: MacdAssessment = {
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      macdLine: latestMacd,
      signalLine: latestSignal,
      histogram: latestHist,
      momentumClassification: macdClassification,
      crossoverEvent: latestHist !== null && latestHist > 0 ? 'BULLISH_CROSSOVER' : 'NONE',
      status: latestMacd !== null ? 'CALCULATED' : 'INSUFFICIENT_HISTORY',
    };

    const rocSeries = IndicatorCalculations.calculateROC(closes, 14);
    const latestRoc = (rocSeries.length > 0 ? rocSeries[rocSeries.length - 1] : null) ?? null;

    let momentumRegime: 'BULLISH' | 'BEARISH' | 'MIXED_MOMENTUM' | 'NEUTRAL' | 'NOT_ASSESSABLE' = 'NOT_ASSESSABLE';
    if (rsiZone === 'OVERBOUGHT_ZONE' && macdClassification === 'BULLISH_MOMENTUM') {
      momentumRegime = 'BULLISH';
    } else if (rsiZone === 'OVERSOLD_ZONE' && macdClassification === 'BEARISH_MOMENTUM') {
      momentumRegime = 'BEARISH';
    } else if (rsiZone !== 'NOT_ASSESSABLE' && macdClassification !== 'NOT_ASSESSABLE') {
      momentumRegime = 'MIXED_MOMENTUM';
    }

    const momentumReport: MomentumAssessment = {
      rsi: rsiReport,
      macd: macdReport,
      rateOfChange14: latestRoc,
      momentumRegime,
      diagnosticExplanation: `Momentum Regime: ${momentumRegime}. RSI(14) at ${latestRsi?.toFixed(1) || '—'} with MACD histogram at ${latestHist?.toFixed(2) || '—'}.`,
      status: candleCount >= 26 ? 'CALCULATED' : 'INSUFFICIENT_HISTORY',
    };

    // =========================================================================
    // PIPELINE 4: VOLUME ANALYSIS (Strict Up/Down Volume & RVOL 20)
    // =========================================================================
    const rvolSeries = hasVolume ? IndicatorCalculations.calculateRVOL(volumes, 20) : [];
    const latestRvol = hasVolume && rvolSeries.length > 0 ? rvolSeries[rvolSeries.length - 1] : null;
    const volMaSeries = hasVolume ? IndicatorCalculations.calculateSMA(volumes, 20) : [];
    const latestVolMa = hasVolume && volMaSeries.length > 0 ? volMaSeries[volMaSeries.length - 1] : null;
    const upDownData = hasVolume ? IndicatorCalculations.calculateUpDownVolume(sortedCandles, 20) : {
      upVolumeTotal: 0,
      downVolumeTotal: 0,
      unchangedVolumeTotal: 0,
      upDownRatio: null,
    };

    let volumeStatus: 'CONFIRMING' | 'WEAK_CONFIRMATION' | 'DIVERGING' | 'NEUTRAL' | 'NOT_ASSESSABLE' = 'NOT_ASSESSABLE';
    let accumDistStatus: 'POTENTIAL_ACCUMULATION' | 'POTENTIAL_DISTRIBUTION' | 'NEUTRAL' | 'NOT_ASSESSABLE' = 'NOT_ASSESSABLE';

    if (hasVolume && latestRvol !== null) {
      if (latestRvol >= 1.4 && trendClassification.trend.includes('UPTREND')) {
        volumeStatus = 'CONFIRMING';
        accumDistStatus = 'POTENTIAL_ACCUMULATION';
      } else if (latestRvol >= 1.4 && trendClassification.trend.includes('DOWNTREND')) {
        volumeStatus = 'DIVERGING';
        accumDistStatus = 'POTENTIAL_DISTRIBUTION';
      } else {
        volumeStatus = 'NEUTRAL';
        accumDistStatus = 'NEUTRAL';
      }
    }

    const volumeReport: VolumeAssessment = {
      status: hasVolume ? volumeStatus : 'NOT_ASSESSABLE',
      relativeVolume20: latestRvol,
      volumeMovingAverage20: latestVolMa,
      latestVolume: hasVolume ? latestCandle.volume : null,
      upDownVolumeRatio20: upDownData.upDownRatio,
      upVolumeTotal20: upDownData.upVolumeTotal,
      downVolumeTotal20: upDownData.downVolumeTotal,
      unchangedVolumeTotal20: upDownData.unchangedVolumeTotal,
      volumeTrend: latestRvol && latestRvol > 1.2 ? 'EXPANDING' : 'STABLE',
      accumulationDistributionStatus: accumDistStatus,
      evidenceNotes: hasVolume
        ? [
            `20-Day Up/Down Volume Ratio: ${upDownData.upDownRatio ? upDownData.upDownRatio.toFixed(2) + 'x' : '—'}`,
            `Relative Volume (RVOL 20): ${latestRvol ? latestRvol.toFixed(2) + 'x' : '—'}`,
            TechnicalPolicyRegistry.getVolumePolicy().highVolumeWarningDescription,
          ]
        : ['Volume data unavailable in technical feed; volume analysis marked NOT_ASSESSABLE.'],
      calculationStatus: hasVolume ? 'CALCULATED' : 'MISSING_INPUT',
    };

    // =========================================================================
    // PIPELINE 6: SUPPORT / RESISTANCE & BREAKOUTS
    // =========================================================================
    const zones = MarketStructureEngine.clusterSupportResistanceZones(
      swingHighs,
      swingLows,
      sortedCandles,
      latestAtr || 10.0,
      'DAILY'
    );
    const breakouts = MarketStructureEngine.evaluateBreakouts(zones, sortedCandles, rvolSeries);

    // =========================================================================
    // PIPELINE 7: DIVERGENCE SENTINEL
    // =========================================================================
    const divergences = DivergenceDetector.detectDivergences(
      swingHighs,
      swingLows,
      rsiSeries,
      macdData.macdLine
    );

    // =========================================================================
    // PIPELINE 8: RELATIVE STRENGTH (vs NIFTY 50 and Sector Benchmark)
    // =========================================================================
    const relativeStrengthReport = this.evaluateRelativeStrength(
      sortedCandles,
      niftyBenchmark,
      sectorBenchmark
    );

    // =========================================================================
    // SYNTHESIS LAYER 1: MARKET CYCLE PHASE
    // =========================================================================
    const marketCycle = TechnicalPolicyRegistry.classifyMarketCycle(
      trendClassification.trend,
      marketStructure.direction,
      rsiZone,
      upDownData.upDownRatio,
      atrPercent
    );

    // =========================================================================
    // SYNTHESIS LAYER 2: TECHNICAL RISK (Setup Fragility)
    // =========================================================================
    const breakdownsCount = breakouts.filter((b) => b.type.includes('BREAKDOWN')).length;
    const below200 = priceVs200 === 'BELOW';
    const bearishStruct = marketStructure.direction === 'BEARISH_STRUCTURE';
    const failedBos = breakouts.filter((b) => b.type === 'FAILED_BREAKOUT').length;
    const hasBearDiv = divergences.some((d) => d.type === 'BEARISH_DIVERGENCE');
    const isVolElevated = volRegimeType === 'ELEVATED' || volRegimeType === 'EXTREME';
    const isUnderperforming = relativeStrengthReport.broadMarketComparison?.classification === 'UNDERPERFORMING';

    const technicalRisk = TechnicalPolicyRegistry.classifyTechnicalRisk(
      breakdownsCount,
      below200,
      bearishStruct,
      failedBos,
      hasBearDiv,
      isVolElevated,
      isUnderperforming
    );

    // =========================================================================
    // SIGNALS, COMPOSITE SCORE & CONFIDENCE
    // =========================================================================
    const signals = this.extractTechnicalSignals(
      trendReport,
      marketStructure,
      movingAveragesReport,
      momentumReport,
      volumeReport,
      zones,
      breakouts,
      divergences
    );

    const { score, components } = this.calculateCompositeScore(
      trendReport,
      marketStructure,
      movingAveragesReport,
      momentumReport,
      volumeReport,
      relativeStrengthReport
    );

    const confidenceScore = this.calculateConfidenceScore(
      dataset.dataQuality,
      candleCount,
      hasVolume,
      niftyBenchmark !== undefined
    );

    return {
      reportId: `tech_${companySymbol}_${Date.now()}`,
      projectId,
      companySymbol,
      exchange,
      dataset,
      currentPrice,
      priceDate,
      dataTimestamp: new Date().toISOString(),
      isAdjusted: dataset.adjusted,
      adjustmentDescription: dataset.adjusted ? 'Price series adjusted for corporate actions (splits/bonuses).' : 'Unadjusted raw exchange price series.',
      trend: trendReport,
      marketStructure,
      movingAverages: movingAveragesReport,
      momentum: momentumReport,
      volume: volumeReport,
      volatility: volatilityReport,
      supportResistance: {
        zones,
        breakouts,
      },
      divergences,
      relativeStrength: relativeStrengthReport,
      marketCycle: {
        phase: marketCycle.phase,
        rationale: marketCycle.rationale,
        supportingSignals: marketCycle.supportingSignals,
        confidence: confidenceScore,
      },
      technicalRisk,
      screenshotObservations,
      technicalScore: score,
      technicalScoreComponents: components,
      technicalConfidenceScore: confidenceScore,
      signals,
      invalidatingConditions: technicalRisk.invalidatingConditions,
      limitations: [
        'Technical analysis represents historical price-action structure and probability modeling, not deterministic forward forecasting.',
        'Zero fundamental or valuation data (PE, EPS, ROE, DCF) is incorporated into technical signal generation.',
        'Zero news causality is inferred; all sharp price reactions are attributed to market dynamics only.',
      ],
      disclaimers: [
        'Analytical Research Platform: This technical assessment does NOT constitute an investment recommendation or BUY/HOLD/AVOID verdict.',
        'Layer Decoupling: Technical risk measures setup fragility and does not predict future share price decline or financial distress.',
      ],
      analysisTimestamp: new Date().toISOString(),
    };
  }

  private static buildMaItem(
    period: number,
    type: 'SMA' | 'EMA',
    value: number | null,
    currentPrice: number,
    series: (number | null)[]
  ): MovingAverageItem {
    if (value === null) {
      return {
        period,
        type,
        value: null,
        priceDistancePercent: null,
        slope: 'FLAT',
        priceRelationship: 'NOT_ASSESSABLE',
        status: 'INSUFFICIENT_HISTORY',
      };
    }

    const dist = Math.round(((currentPrice - value) / value) * 1000) / 10;
    const prev5Val = series[series.length - 6];
    let slope: 'RISING' | 'FLAT' | 'FALLING' = 'FLAT';
    if (prev5Val !== null && prev5Val !== undefined) {
      const diff = value - prev5Val;
      if (diff > value * 0.005) slope = 'RISING';
      else if (diff < -value * 0.005) slope = 'FALLING';
    }

    return {
      period,
      type,
      value,
      priceDistancePercent: dist,
      slope,
      priceRelationship: currentPrice >= value ? 'ABOVE' : 'BELOW',
      status: 'CALCULATED',
    };
  }

  private static evaluateRelativeStrength(
    stockCandles: OHLCVCandle[],
    niftyBenchmark?: BenchmarkDataset,
    sectorBenchmark?: BenchmarkDataset
  ): RelativeStrengthAssessment {
    const notes: string[] = [];

    const broadComp = niftyBenchmark
      ? this.calculateBenchmarkAlpha(stockCandles, niftyBenchmark.candles, 'BROAD_MARKET', niftyBenchmark.symbol, niftyBenchmark.benchmarkName)
      : undefined;

    const sectorComp = sectorBenchmark
      ? this.calculateBenchmarkAlpha(stockCandles, sectorBenchmark.candles, 'SECTOR', sectorBenchmark.symbol, sectorBenchmark.benchmarkName)
      : undefined;

    if (!sectorBenchmark) {
      notes.push('Sector benchmark dataset unavailable; sector relative strength marked NOT_ASSESSABLE without substitution.');
    }

    return {
      broadMarketComparison: broadComp,
      sectorComparison: sectorComp,
      status: broadComp ? 'CALCULATED' : 'MISSING_INPUT',
      diagnosticNotes: notes,
    };
  }

  private static calculateBenchmarkAlpha(
    stockCandles: OHLCVCandle[],
    benchCandles: OHLCVCandle[],
    type: 'BROAD_MARKET' | 'SECTOR',
    symbol: string,
    name: string
  ): BenchmarkComparisonItem {
    const stock1M = this.getReturnInBars(stockCandles, 21);
    const bench1M = this.getReturnInBars(benchCandles, 21);
    const alpha1M = stock1M !== null && bench1M !== null ? Math.round((stock1M - bench1M) * 10) / 10 : null;

    const stock3M = this.getReturnInBars(stockCandles, 63);
    const bench3M = this.getReturnInBars(benchCandles, 63);
    const alpha3M = stock3M !== null && bench3M !== null ? Math.round((stock3M - bench3M) * 10) / 10 : null;

    const stock6M = this.getReturnInBars(stockCandles, 126);
    const bench6M = this.getReturnInBars(benchCandles, 126);
    const alpha6M = stock6M !== null && bench6M !== null ? Math.round((stock6M - bench6M) * 10) / 10 : null;

    const stock1Y = this.getReturnInBars(stockCandles, 252);
    const bench1Y = this.getReturnInBars(benchCandles, 252);
    const alpha1Y = stock1Y !== null && bench1Y !== null ? Math.round((stock1Y - bench1Y) * 10) / 10 : null;

    let classification: 'OUTPERFORMING' | 'IN_LINE' | 'UNDERPERFORMING' | 'NOT_ASSESSABLE' = 'NOT_ASSESSABLE';
    if (alpha3M !== null) {
      if (alpha3M >= 3.0) classification = 'OUTPERFORMING';
      else if (alpha3M <= -3.0) classification = 'UNDERPERFORMING';
      else classification = 'IN_LINE';
    }

    return {
      benchmarkSymbol: symbol,
      benchmarkName: name,
      benchmarkType: type,
      stockReturn1M: stock1M,
      benchmarkReturn1M: bench1M,
      relativeReturn1M: alpha1M,
      stockReturn3M: stock3M,
      benchmarkReturn3M: bench3M,
      relativeReturn3M: alpha3M,
      stockReturn6M: stock6M,
      benchmarkReturn6M: bench6M,
      relativeReturn6M: alpha6M,
      stockReturn1Y: stock1Y,
      benchmarkReturn1Y: bench1Y,
      relativeReturn1Y: alpha1Y,
      classification,
      status: stockCandles.length >= 21 ? 'CALCULATED' : 'INSUFFICIENT_HISTORY',
    };
  }

  private static getReturnInBars(candles: OHLCVCandle[], bars: number): number | null {
    if (candles.length < bars + 1) return null;
    const start = candles[candles.length - 1 - bars].close;
    const end = candles[candles.length - 1].close;
    if (start <= 0) return null;
    return Math.round(((end - start) / start) * 1000) / 10;
  }

  private static extractTechnicalSignals(
    trend: any,
    structure: any,
    ma: MovingAverageRegime,
    _mom: MomentumAssessment,
    vol: VolumeAssessment,
    _zones: any[],
    _breakouts: any[],
    divergences: any[]
  ): TechnicalSignal[] {
    const signals: TechnicalSignal[] = [];

    if (trend.primaryTrend === 'STRONG_UPTREND' || trend.primaryTrend === 'UPTREND') {
      signals.push({
        signalId: 'sig_trend_up',
        signalType: 'TREND',
        direction: 'BULLISH',
        strength: trend.primaryTrend === 'STRONG_UPTREND' ? 'STRONG' : 'MODERATE',
        timeframe: 'DAILY',
        evidence: trend.rationale,
        confidence: trend.trendConfidence,
        timestamp: new Date().toISOString(),
      });
    }

    if (structure.direction === 'BULLISH_STRUCTURE') {
      signals.push({
        signalId: 'sig_struct_bull',
        signalType: 'STRUCTURE',
        direction: 'BULLISH',
        strength: 'STRONG',
        timeframe: 'DAILY',
        evidence: `Bullish higher-high sequence (${structure.higherHighsCount} HHs, ${structure.higherLowsCount} HLs).`,
        confidence: structure.confidence,
        timestamp: new Date().toISOString(),
      });
    }

    if (ma.goldenCross50_200) {
      signals.push({
        signalId: 'sig_ma_golden',
        signalType: 'TREND',
        direction: 'BULLISH',
        strength: 'STRONG',
        timeframe: 'DAILY',
        evidence: '50-day moving average trading above 200-day moving average (Golden Cross regime).',
        confidence: 85,
        timestamp: new Date().toISOString(),
      });
    }

    if (vol.status === 'CONFIRMING') {
      signals.push({
        signalId: 'sig_vol_confirm',
        signalType: 'VOLUME',
        direction: 'BULLISH',
        strength: 'MODERATE',
        timeframe: 'DAILY',
        evidence: `Above-average relative volume (${vol.relativeVolume20?.toFixed(2)}x) confirming price trajectory.`,
        confidence: 75,
        timestamp: new Date().toISOString(),
      });
    }

    for (const div of divergences) {
      signals.push({
        signalId: div.divergenceId,
        signalType: 'DIVERGENCE',
        direction: div.type === 'BULLISH_DIVERGENCE' ? 'BULLISH' : 'BEARISH',
        strength: div.confidence === 'HIGH' ? 'STRONG' : 'MODERATE',
        timeframe: 'DAILY',
        evidence: div.description,
        confidence: div.confidence === 'HIGH' ? 85 : 70,
        timestamp: new Date().toISOString(),
      });
    }

    return signals;
  }

  private static calculateCompositeScore(
    trend: any,
    structure: any,
    ma: MovingAverageRegime,
    mom: MomentumAssessment,
    vol: VolumeAssessment,
    rs: RelativeStrengthAssessment
  ): { score: number | null; components: { component: string; weight: number; score: number; contribution: number }[] } {
    const components = [
      {
        component: 'Trend Direction',
        weight: 0.25,
        score: trend.primaryTrend === 'STRONG_UPTREND' ? 95 : trend.primaryTrend === 'UPTREND' ? 75 : trend.primaryTrend === 'SIDEWAYS' ? 50 : 20,
        contribution: 0,
      },
      {
        component: 'Market Structure',
        weight: 0.20,
        score: structure.direction === 'BULLISH_STRUCTURE' ? 90 : structure.direction === 'RANGE_STRUCTURE' ? 50 : 20,
        contribution: 0,
      },
      {
        component: 'Moving Average Alignment',
        weight: 0.20,
        score: ma.alignment === 'BULLISH_ALIGNMENT' ? 90 : ma.alignment === 'BEARISH_ALIGNMENT' ? 15 : 50,
        contribution: 0,
      },
      {
        component: 'Momentum Oscillators',
        weight: 0.15,
        score: mom.momentumRegime === 'BULLISH' ? 85 : mom.momentumRegime === 'BEARISH' ? 25 : 50,
        contribution: 0,
      },
      {
        component: 'Volume Confirmation',
        weight: 0.10,
        score: vol.status === 'CONFIRMING' ? 85 : vol.status === 'DIVERGING' ? 30 : 50,
        contribution: 0,
      },
      {
        component: 'Relative Strength (NIFTY)',
        weight: 0.10,
        score: rs.broadMarketComparison?.classification === 'OUTPERFORMING' ? 85 : rs.broadMarketComparison?.classification === 'UNDERPERFORMING' ? 25 : 50,
        contribution: 0,
      },
    ];

    let totalScore = 0;
    for (const c of components) {
      c.contribution = Math.round(c.score * c.weight * 10) / 10;
      totalScore += c.contribution;
    }

    return {
      score: Math.round(totalScore),
      components,
    };
  }

  private static calculateConfidenceScore(
    quality: string,
    candleCount: number,
    hasVolume: boolean,
    hasBenchmark: boolean
  ): number {
    let score = quality === 'HIGH' ? 40 : quality === 'MEDIUM' ? 30 : 15;
    if (candleCount >= 200) score += 30;
    else if (candleCount >= 50) score += 15;
    if (hasVolume) score += 15;
    if (hasBenchmark) score += 15;
    return Math.min(100, score);
  }
}
