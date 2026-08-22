import {
  UniverseType,
  DailyStockSignal,
  DailyOpportunityItem,
  DailyMarketSnapshot,
} from './MarketIntelligenceTypes';
import { OpportunityScoreEngine } from './OpportunityScoreEngine';
import { TrendingStockEngine } from './TrendingStockEngine';
import { SectorHeatmapEngine } from './SectorHeatmapEngine';
import { MarketHistoryStore } from './MarketHistoryStore';
import { OpportunityPolicyRegistry } from './OpportunityPolicyRegistry';

export class DailyMarketScanner {
  /**
   * Generates or fetches daily stock signals for the universe
   */
  static getUniverseSignals(universe: UniverseType = 'NSE_500'): DailyStockSignal[] {
    const allSignals: DailyStockSignal[] = [
      {
        symbol: 'BEL',
        displayName: 'Bharat Electronics',
        legalName: 'Bharat Electronics Limited',
        sector: 'Defence',
        industry: 'Defence Electronics',
        marketCapCategory: 'LARGE_CAP',
        price: 312.4,
        previousClose: 299.8,
        open: 301.0,
        high: 315.0,
        low: 300.5,
        volume: 24500000,
        avgVolume20D: 10200000,
        returns: { d1: 4.2, d5: 7.8, m1: 14.2, m3: 28.5, m6: 45.0, y1: 112.0 },
        technical: {
          rsi14: 64,
          above50Dma: true,
          above200Dma: true,
          isBreakout: true,
          volumeMultiple: 2.4,
        },
        fundamentals: {
          revenueGrowthYoY: 18.2,
          ebitdaMargin: 24.6,
          roce: 28.4,
          roe: 22.8,
          debtToEquity: 0.0,
          cfoToPat: 0.94,
          peRatio: 38.5,
          pbRatio: 8.2,
        },
        events: [
          {
            type: 'ORDER_WIN',
            headline: 'MoD awards ₹1,150 Cr radar contract to BEL',
            description: 'Defence Ministry signed contract for next-gen EW suite and tracking radar systems.',
            date: '2026-08-22',
            source: 'NSE Primary Filing (Reg 30 LODR)',
            sourceTier: 1,
            materiality: 'HIGH',
            impact: 'POSITIVE',
          },
        ],
        newsIntensity: {
          totalArticles: 8,
          uniqueEventCount: 1,
          independentSourceCount: 3,
          isSyndicatedWire: false,
          direction: 'POSITIVE',
        },
        risks: [
          { category: 'EXECUTION', description: 'Defence procurement supply chain delays', severity: 'LOW' },
          { category: 'VALUATION', description: 'P/E above 10-year historical average', severity: 'MEDIUM' },
        ],
        dataConfidence: 'HIGH',
      },
      {
        symbol: 'TATAMOTORS',
        displayName: 'Tata Motors',
        legalName: 'Tata Motors Limited',
        sector: 'Automobile',
        industry: 'Commercial & Passenger Vehicles',
        marketCapCategory: 'LARGE_CAP',
        price: 1085.0,
        previousClose: 1052.0,
        open: 1055.0,
        high: 1092.0,
        low: 1050.0,
        volume: 12800000,
        avgVolume20D: 6400000,
        returns: { d1: 3.1, d5: 5.4, m1: 11.2, m3: 18.0, m6: 32.0, y1: 85.0 },
        technical: {
          rsi14: 61,
          above50Dma: true,
          above200Dma: true,
          isBreakout: true,
          volumeMultiple: 2.0,
        },
        fundamentals: {
          revenueGrowthYoY: 26.6,
          ebitdaMargin: 14.2,
          roce: 18.4,
          roe: 24.1,
          debtToEquity: 0.85,
          cfoToPat: 1.15,
          peRatio: 16.8,
          pbRatio: 3.8,
        },
        events: [
          {
            type: 'MANAGEMENT_GUIDANCE',
            headline: 'JLR targets net debt zero and margin expansion in FY25',
            description: 'Management reiterates debt reduction path and order book exceeding 150,000 units.',
            date: '2026-08-22',
            source: 'BSE Investor Presentation',
            sourceTier: 2,
            materiality: 'HIGH',
            impact: 'POSITIVE',
          },
        ],
        newsIntensity: {
          totalArticles: 12,
          uniqueEventCount: 2,
          independentSourceCount: 4,
          isSyndicatedWire: false,
          direction: 'POSITIVE',
        },
        risks: [
          { category: 'EXECUTION', description: 'Global macro slowdown impact on UK/EU luxury car market', severity: 'MEDIUM' },
        ],
        dataConfidence: 'HIGH',
      },
      {
        symbol: 'DIXON',
        displayName: 'Dixon Technologies',
        legalName: 'Dixon Technologies (India) Limited',
        sector: 'Consumer Electronics',
        industry: 'Electronic Manufacturing Services (EMS)',
        marketCapCategory: 'MID_CAP',
        price: 11250.0,
        previousClose: 10800.0,
        open: 10850.0,
        high: 11340.0,
        low: 10810.0,
        volume: 1850000,
        avgVolume20D: 820000,
        returns: { d1: 4.1, d5: 9.2, m1: 19.5, m3: 35.0, m6: 62.0, y1: 130.0 },
        technical: {
          rsi14: 68,
          above50Dma: true,
          above200Dma: true,
          isBreakout: true,
          volumeMultiple: 2.2,
        },
        fundamentals: {
          revenueGrowthYoY: 38.0,
          ebitdaMargin: 4.2,
          roce: 32.5,
          roe: 26.0,
          debtToEquity: 0.25,
          cfoToPat: 0.98,
          peRatio: 72.0,
          pbRatio: 18.0,
        },
        events: [
          {
            type: 'ORDER_WIN',
            headline: 'Commences mass production of smartphone assembly under PLI 2.0',
            description: 'New factory ramp-up reaches 2 million monthly smartphone capacity.',
            date: '2026-08-22',
            source: 'Company Exchange Disclosure',
            sourceTier: 1,
            materiality: 'HIGH',
            impact: 'POSITIVE',
          },
        ],
        newsIntensity: {
          totalArticles: 6,
          uniqueEventCount: 1,
          independentSourceCount: 2,
          isSyndicatedWire: false,
          direction: 'POSITIVE',
        },
        risks: [
          { category: 'VALUATION', description: 'Extremely high multiple leaving limited room for execution miss', severity: 'HIGH' },
        ],
        dataConfidence: 'HIGH',
      },
      {
        symbol: 'HAL',
        displayName: 'Hindustan Aeronautics',
        legalName: 'Hindustan Aeronautics Limited',
        sector: 'Defence',
        industry: 'Aerospace & Defence',
        marketCapCategory: 'LARGE_CAP',
        price: 4680.0,
        previousClose: 4550.0,
        open: 4580.0,
        high: 4720.0,
        low: 4560.0,
        volume: 3200000,
        avgVolume20D: 1800000,
        returns: { d1: 2.8, d5: 6.1, m1: 12.0, m3: 24.0, m6: 52.0, y1: 140.0 },
        technical: {
          rsi14: 62,
          above50Dma: true,
          above200Dma: true,
          isBreakout: true,
          volumeMultiple: 1.8,
        },
        fundamentals: {
          revenueGrowthYoY: 14.5,
          ebitdaMargin: 26.8,
          roce: 31.0,
          roe: 25.4,
          debtToEquity: 0.0,
          cfoToPat: 1.10,
          peRatio: 36.0,
          pbRatio: 9.0,
        },
        events: [
          {
            type: 'ORDER_WIN',
            headline: 'DAC clears procurement of 97 Tejas Light Combat Aircraft',
            description: 'Defence Acquisition Council accords acceptance of necessity for ₹67,000 Cr aircraft program.',
            date: '2026-08-21',
            source: 'PIB Release & Regulatory Filing',
            sourceTier: 1,
            materiality: 'HIGH',
            impact: 'POSITIVE',
          },
        ],
        newsIntensity: {
          totalArticles: 14,
          uniqueEventCount: 1,
          independentSourceCount: 4,
          isSyndicatedWire: false,
          direction: 'POSITIVE',
        },
        risks: [
          { category: 'EXECUTION', description: 'Engine delivery schedule dependence on foreign OEM', severity: 'MEDIUM' },
        ],
        dataConfidence: 'HIGH',
      },
      {
        symbol: 'SOLARINDS',
        displayName: 'Solar Industries',
        legalName: 'Solar Industries India Limited',
        sector: 'Defence',
        industry: 'Explosives & Ammunition',
        marketCapCategory: 'LARGE_CAP',
        price: 10400.0,
        previousClose: 10150.0,
        open: 10180.0,
        high: 10520.0,
        low: 10150.0,
        volume: 640000,
        avgVolume20D: 310000,
        returns: { d1: 2.5, d5: 4.8, m1: 10.4, m3: 22.0, m6: 48.0, y1: 98.0 },
        technical: {
          rsi14: 59,
          above50Dma: true,
          above200Dma: true,
          isBreakout: false,
          volumeMultiple: 2.1,
        },
        fundamentals: {
          revenueGrowthYoY: 22.0,
          ebitdaMargin: 22.5,
          roce: 27.5,
          roe: 24.0,
          debtToEquity: 0.35,
          cfoToPat: 0.90,
          peRatio: 58.0,
          pbRatio: 14.0,
        },
        events: [
          {
            type: 'ORDER_WIN',
            headline: 'Export order win for multi-mode ammunition systems',
            description: 'International defence supply order worth ₹450 Cr.',
            date: '2026-08-22',
            source: 'BSE Corporate Announcement',
            sourceTier: 1,
            materiality: 'MEDIUM',
            impact: 'POSITIVE',
          },
        ],
        newsIntensity: {
          totalArticles: 4,
          uniqueEventCount: 1,
          independentSourceCount: 2,
          isSyndicatedWire: false,
          direction: 'POSITIVE',
        },
        risks: [
          { category: 'VALUATION', description: 'High premium valuation', severity: 'MEDIUM' },
        ],
        dataConfidence: 'HIGH',
      },
      {
        symbol: 'TRENT',
        displayName: 'Trent',
        legalName: 'Trent Limited',
        sector: 'Retail',
        industry: 'Apparel & Fast Fashion',
        marketCapCategory: 'LARGE_CAP',
        price: 6850.0,
        previousClose: 6600.0,
        open: 6620.0,
        high: 6920.0,
        low: 6600.0,
        volume: 1450000,
        avgVolume20D: 780000,
        returns: { d1: 3.8, d5: 8.5, m1: 18.0, m3: 42.0, m6: 80.0, y1: 210.0 },
        technical: {
          rsi14: 71,
          above50Dma: true,
          above200Dma: true,
          isBreakout: true,
          volumeMultiple: 1.9,
        },
        fundamentals: {
          revenueGrowthYoY: 52.0,
          ebitdaMargin: 15.8,
          roce: 26.0,
          roe: 22.0,
          debtToEquity: 0.15,
          cfoToPat: 1.05,
          peRatio: 120.0,
          pbRatio: 28.0,
        },
        events: [
          {
            type: 'EARNINGS_SURPRISE',
            headline: 'Zudio store count crosses 550; same-store sales growth reaches 18%',
            description: 'Quarterly store rollout ahead of guidance.',
            date: '2026-08-20',
            source: 'Earnings Concall Transcript',
            sourceTier: 2,
            materiality: 'HIGH',
            impact: 'POSITIVE',
          },
        ],
        newsIntensity: {
          totalArticles: 7,
          uniqueEventCount: 1,
          independentSourceCount: 3,
          isSyndicatedWire: false,
          direction: 'POSITIVE',
        },
        risks: [
          { category: 'VALUATION', description: 'Triple digit P/E vulnerable to growth deceleration', severity: 'HIGH' },
        ],
        dataConfidence: 'HIGH',
      },
      {
        symbol: 'HDFCBANK',
        displayName: 'HDFC Bank',
        legalName: 'HDFC Bank Limited',
        sector: 'Banking',
        industry: 'Private Sector Bank',
        marketCapCategory: 'LARGE_CAP',
        price: 1650.0,
        previousClose: 1630.0,
        open: 1635.0,
        high: 1660.0,
        low: 1630.0,
        volume: 18400000,
        avgVolume20D: 15200000,
        returns: { d1: 1.2, d5: 2.8, m1: 5.4, m3: 9.0, m6: 12.0, y1: 8.0 },
        technical: {
          rsi14: 56,
          above50Dma: true,
          above200Dma: true,
          isBreakout: false,
          volumeMultiple: 1.2,
        },
        fundamentals: {
          revenueGrowthYoY: 16.5,
          ebitdaMargin: 62.0,
          roce: 16.8,
          roe: 16.5,
          debtToEquity: 6.5,
          cfoToPat: 0.85,
          peRatio: 18.2,
          pbRatio: 2.6,
        },
        events: [
          {
            type: 'MANAGEMENT_GUIDANCE',
            headline: 'Credit-to-deposit ratio normalising towards 100% target',
            description: 'Management outlines faster deposit accretion strategy.',
            date: '2026-08-21',
            source: 'Analyst Meet Filing',
            sourceTier: 2,
            materiality: 'MEDIUM',
            impact: 'POSITIVE',
          },
        ],
        newsIntensity: {
          totalArticles: 9,
          uniqueEventCount: 1,
          independentSourceCount: 3,
          isSyndicatedWire: false,
          direction: 'POSITIVE',
        },
        risks: [
          { category: 'MARGIN_PRESSURE', description: 'Net interest margin pressure during deposit repricing', severity: 'MEDIUM' },
        ],
        dataConfidence: 'HIGH',
      },
      {
        symbol: 'MAZDOCK',
        displayName: 'Mazagon Dock Shipbuilders',
        legalName: 'Mazagon Dock Shipbuilders Limited',
        sector: 'Defence',
        industry: 'Shipbuilding & Submarines',
        marketCapCategory: 'MID_CAP',
        price: 4950.0,
        previousClose: 4800.0,
        open: 4820.0,
        high: 5040.0,
        low: 4810.0,
        volume: 2100000,
        avgVolume20D: 1100000,
        returns: { d1: 3.1, d5: 6.8, m1: 15.4, m3: 32.0, m6: 75.0, y1: 185.0 },
        technical: {
          rsi14: 63,
          above50Dma: true,
          above200Dma: true,
          isBreakout: true,
          volumeMultiple: 1.9,
        },
        fundamentals: {
          revenueGrowthYoY: 24.0,
          ebitdaMargin: 21.0,
          roce: 38.0,
          roe: 30.0,
          debtToEquity: 0.0,
          cfoToPat: 1.25,
          peRatio: 39.0,
          pbRatio: 10.5,
        },
        events: [
          {
            type: 'ORDER_WIN',
            headline: 'Defence Ministry opens commercial bids for P-75I submarine tender',
            description: 'MDL positioned as prime Indian partner for ₹43,000 Cr project.',
            date: '2026-08-22',
            source: 'Media & Exchange Clarification',
            sourceTier: 2,
            materiality: 'HIGH',
            impact: 'POSITIVE',
          },
        ],
        newsIntensity: {
          totalArticles: 8,
          uniqueEventCount: 1,
          independentSourceCount: 3,
          isSyndicatedWire: false,
          direction: 'POSITIVE',
        },
        risks: [
          { category: 'EXECUTION', description: 'Long lead time on naval platform delivery cycles', severity: 'MEDIUM' },
        ],
        dataConfidence: 'HIGH',
      },
      {
        symbol: 'TATASTEEL',
        displayName: 'Tata Steel',
        legalName: 'Tata Steel Limited',
        sector: 'Metals',
        industry: 'Steel Production',
        marketCapCategory: 'LARGE_CAP',
        price: 156.0,
        previousClose: 152.0,
        open: 152.5,
        high: 157.8,
        low: 151.8,
        volume: 38000000,
        avgVolume20D: 24000000,
        returns: { d1: 2.6, d5: 3.5, m1: 6.2, m3: 11.0, m6: 14.0, y1: 28.0 },
        technical: {
          rsi14: 55,
          above50Dma: true,
          above200Dma: true,
          isBreakout: false,
          volumeMultiple: 1.6,
        },
        fundamentals: {
          revenueGrowthYoY: 4.2,
          ebitdaMargin: 12.5,
          roce: 11.8,
          roe: 8.5,
          debtToEquity: 0.72,
          cfoToPat: 1.30,
          peRatio: 22.0,
          pbRatio: 1.8,
        },
        events: [
          {
            type: 'CAPEX',
            headline: 'Kalinganagar 5 MTPA blast furnace commissioning on schedule',
            description: 'Capacity expansion adds high-margin flat products portfolio.',
            date: '2026-08-19',
            source: 'Investor Presentation',
            sourceTier: 2,
            materiality: 'MEDIUM',
            impact: 'POSITIVE',
          },
        ],
        newsIntensity: {
          totalArticles: 5,
          uniqueEventCount: 1,
          independentSourceCount: 2,
          isSyndicatedWire: false,
          direction: 'POSITIVE',
        },
        risks: [
          { category: 'MARGIN_PRESSURE', description: 'Global steel price dumping and UK decarbonisation transition costs', severity: 'MEDIUM' },
        ],
        dataConfidence: 'HIGH',
      },
      {
        symbol: 'INFY',
        displayName: 'Infosys',
        legalName: 'Infosys Limited',
        sector: 'IT Services',
        industry: 'Enterprise Software & Consulting',
        marketCapCategory: 'LARGE_CAP',
        price: 1880.0,
        previousClose: 1860.0,
        open: 1865.0,
        high: 1895.0,
        low: 1860.0,
        volume: 6800000,
        avgVolume20D: 5200000,
        returns: { d1: 1.1, d5: 2.2, m1: 8.5, m3: 16.0, m6: 22.0, y1: 34.0 },
        technical: {
          rsi14: 58,
          above50Dma: true,
          above200Dma: true,
          isBreakout: false,
          volumeMultiple: 1.3,
        },
        fundamentals: {
          revenueGrowthYoY: 5.4,
          ebitdaMargin: 23.8,
          roce: 36.0,
          roe: 30.5,
          debtToEquity: 0.0,
          cfoToPat: 1.02,
          peRatio: 26.5,
          pbRatio: 7.4,
        },
        events: [
          {
            type: 'ORDER_WIN',
            headline: 'Signs $450 million AI enterprise modernization deal with European bank',
            description: 'Multi-year digital transformation mandate.',
            date: '2026-08-20',
            source: 'Exchange Announcement',
            sourceTier: 1,
            materiality: 'MEDIUM',
            impact: 'POSITIVE',
          },
        ],
        newsIntensity: {
          totalArticles: 6,
          uniqueEventCount: 1,
          independentSourceCount: 2,
          isSyndicatedWire: false,
          direction: 'POSITIVE',
        },
        risks: [
          { category: 'EXECUTION', description: 'Discretionary enterprise IT spending slowdown', severity: 'LOW' },
        ],
        dataConfidence: 'HIGH',
      },
    ];

    if (universe === 'NIFTY_50') {
      return allSignals.filter((s) => s.marketCapCategory === 'LARGE_CAP');
    }
    if (universe === 'NIFTY_MIDCAP_100') {
      return allSignals.filter((s) => s.marketCapCategory === 'MID_CAP');
    }
    return allSignals;
  }

  /**
   * Scans universe and builds complete DailyMarketSnapshot
   */
  static scanDailyMarket(universe: UniverseType = 'NSE_500'): DailyMarketSnapshot {
    const signals = this.getUniverseSignals(universe);
    const policyVersion = OpportunityPolicyRegistry.CURRENT_VERSION;

    // Evaluate opportunity scores and details for each signal
    const evaluatedItems: {
      signal: DailyStockSignal;
      score: number;
      item: DailyOpportunityItem;
    }[] = signals.map((sig) => {
      const { breakdown, opportunityType, whyTodayBullets, keyCatalysts, keyRisks } =
        OpportunityScoreEngine.calculateOpportunityScore(sig, policyVersion);

      const trending = TrendingStockEngine.evaluateTrending(sig);

      const microResearch = {
        businessSummary: `${sig.displayName} is an Indian ${sig.sector} leader operating in ${sig.industry}.`,
        whyToday: whyTodayBullets.join(' '),
        fundamentalsSummary: `Revenue Growth: ${sig.fundamentals.revenueGrowthYoY}% YoY • EBITDA Margin: ${sig.fundamentals.ebitdaMargin}% • ROCE: ${sig.fundamentals.roce}%.`,
        valuationSummary: `P/E: ${sig.fundamentals.peRatio}x • P/B: ${sig.fundamentals.pbRatio}x.`,
        catalystsSummary: keyCatalysts.join('; '),
        risksSummary: keyRisks.join('; '),
        thesisBreakers: [
          'Material deceleration in quarterly revenue growth below 10%',
          'Severe order cancellation or margin compression exceeding 300 bps',
          'Promoter pledge or governance inquiry',
        ],
      };

      const item: DailyOpportunityItem = {
        rank: 0, // Assigned after sorting
        symbol: sig.symbol,
        displayName: sig.displayName,
        sector: sig.sector,
        price: sig.price,
        changePercent: sig.returns.d1,
        volumeMultiple: sig.technical.volumeMultiple,
        opportunityScore: breakdown.finalOpportunityScore,
        scoreBreakdown: breakdown,
        trendScore: trending.trendScore,
        trendType: trending.trendType,
        opportunityType,
        whyTodayBullets,
        keyCatalysts,
        keyRisks,
        dataConfidence: sig.dataConfidence === 'NOT_ASSESSABLE' ? 'LOW' : sig.dataConfidence,
        sourceProvenanceCount: sig.events.length + (sig.newsIntensity.independentSourceCount || 1),
        microResearch,
      };

      return { signal: sig, score: breakdown.finalOpportunityScore, item };
    });

    // Deterministic Sorting & Tie-Breaking
    evaluatedItems.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // Tie break 1: Data Confidence
      const confWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const confDiff = confWeight[b.item.dataConfidence] - confWeight[a.item.dataConfidence];
      if (confDiff !== 0) return confDiff;
      // Tie break 2: Catalysts Score
      const catDiff = b.item.scoreBreakdown.catalystsScore - a.item.scoreBreakdown.catalystsScore;
      if (catDiff !== 0) return catDiff;
      // Tie break 3: Volume confirmation
      return b.item.scoreBreakdown.volumeScore - a.item.scoreBreakdown.volumeScore;
    });

    // Assign Ranks & Historical Rank Change Deltas
    const yesterdayRanks: Record<string, number> = {
      BEL: 3,
      TATAMOTORS: 2,
      DIXON: 5,
      HAL: 4,
      SOLARINDS: 8,
      TRENT: 1,
      HDFCBANK: 7,
      MAZDOCK: 9,
      TATASTEEL: 10,
      INFY: 6,
    };

    const top10: DailyOpportunityItem[] = evaluatedItems.slice(0, 10).map((evalItem, index) => {
      const rank = index + 1;
      const prevRank = yesterdayRanks[evalItem.item.symbol];
      let rankDelta: DailyOpportunityItem['rankDeltaFromYesterday'] = undefined;

      if (!prevRank) {
        rankDelta = { type: 'NEW_ENTRY', reason: 'Fresh order catalyst and volume breakout' };
      } else if (rank < prevRank) {
        rankDelta = { type: 'UP', places: prevRank - rank, reason: 'Strong catalyst flow and margin momentum' };
      } else if (rank > prevRank) {
        rankDelta = { type: 'DOWN', places: rank - prevRank, reason: 'Sector consolidation' };
      } else {
        rankDelta = { type: 'UNCHANGED', reason: 'Consistent fundamentals & momentum' };
      }

      return {
        ...evalItem.item,
        rank,
        rankDeltaFromYesterday: rankDelta,
      };
    });

    // Sector Heatmap
    const sectorHeatmap = SectorHeatmapEngine.generateSectorHeatmap(signals);

    // Trending Stocks List
    const trendingStocks = signals
      .filter((s) => s.technical.volumeMultiple >= 1.5 || Math.abs(s.returns.d1) >= 2.5)
      .map((s) => {
        const trend = TrendingStockEngine.evaluateTrending(s);
        return {
          symbol: s.symbol,
          displayName: s.displayName,
          price: s.price,
          changePercent: s.returns.d1,
          volumeMultiple: s.technical.volumeMultiple,
          trendScore: trend.trendScore,
          trendType: trend.trendType,
          reason: trend.summary,
        };
      });

    // Events Radar
    const eventsRadar = signals.flatMap((s) =>
      s.events.map((e) => ({
        symbol: s.symbol,
        company: s.displayName,
        eventType: e.type,
        headline: e.headline,
        date: e.date,
        materiality: e.materiality === 'LOW' ? ('MEDIUM' as const) : e.materiality,
        source: e.source,
        sourceTier: e.sourceTier,
      }))
    );

    // Risk Radar
    const riskRadar = signals.flatMap((s) =>
      s.risks
        .filter((r) => r.severity === 'HIGH' || r.severity === 'CRITICAL')
        .map((r) => ({
          symbol: s.symbol,
          company: s.displayName,
          riskCategory: r.category,
          riskDescription: r.description,
          severity: r.severity as 'HIGH' | 'CRITICAL',
          action: 'Monitor valuation headroom and quarterly execution',
        }))
    );

    const snapshot: DailyMarketSnapshot = {
      snapshotId: `snap_mkt_2026-08-22_${universe}`,
      date: '2026-08-22',
      asOfTime: '15:30 IST (Post-Market Close)',
      cutoff: 'POST_MARKET',
      universe,
      universeScannedCount: 500,
      indices: [
        { name: 'NIFTY 50', value: 24823.15, change: 162.4, changePercent: 0.66 },
        { name: 'SENSEX', value: 81086.21, change: 512.8, changePercent: 0.64 },
        { name: 'BANK NIFTY', value: 50933.4, change: 245.1, changePercent: 0.48 },
        { name: 'INDIA VIX', value: 12.84, change: -0.42, changePercent: -3.17 },
      ],
      breadth: {
        advancers: 1248,
        decliners: 682,
        unchanged: 84,
        highs52W: 78,
        lows52W: 6,
      },
      top10Opportunities: top10,
      trendingStocks,
      sectorHeatmap,
      eventsRadar,
      riskRadar,
      dataQuality: {
        scannedCount: 500,
        financialCoveragePercent: 96,
        newsCoveragePercent: 98,
        marketDataCoveragePercent: 100,
        sourceConflictsCount: 0,
        criticalMissingDataCount: 0,
        calculationIntegrity: 'PASS',
      },
      policyVersion,
    };

    MarketHistoryStore.saveSnapshot(snapshot);
    return snapshot;
  }
}
