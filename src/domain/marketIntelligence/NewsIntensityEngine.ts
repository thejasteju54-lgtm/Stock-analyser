import { DailyStockSignal } from './MarketIntelligenceTypes';

export interface NewsIntensityResult {
  intensityScore: number; // 0 - 100
  uniqueEvents: number;
  independentSources: number;
  isSyndicatedWire: boolean;
  direction: 'POSITIVE' | 'NEGATIVE' | 'MIXED' | 'NEUTRAL';
  summary: string;
}

export class NewsIntensityEngine {
  /**
   * Evaluates news intensity for a stock signal.
   * Ensures syndicated wire copy is deduplicated and not counted as independent proof.
   */
  static evaluateNewsIntensity(signal: DailyStockSignal): NewsIntensityResult {
    const events = signal.events || [];
    const news = signal.newsIntensity || {
      totalArticles: 0,
      uniqueEventCount: 0,
      independentSourceCount: 0,
      isSyndicatedWire: false,
      direction: 'NEUTRAL',
    };

    if (events.length === 0 && news.totalArticles === 0) {
      return {
        intensityScore: 20,
        uniqueEvents: 0,
        independentSources: 0,
        isSyndicatedWire: false,
        direction: 'NEUTRAL',
        summary: 'No material news flow today.',
      };
    }

    // Material event bonus
    const highMaterialEvents = events.filter((e) => e.materiality === 'HIGH');
    const positiveEvents = events.filter((e) => e.impact === 'POSITIVE');
    const negativeEvents = events.filter((e) => e.impact === 'NEGATIVE');

    let baseScore = 40;
    baseScore += highMaterialEvents.length * 20;
    baseScore += Math.min(news.independentSourceCount * 10, 30);

    // If only syndicated wire copy exists, discount confirmation strength
    if (news.isSyndicatedWire && news.independentSourceCount <= 1) {
      baseScore = Math.min(baseScore, 65);
    }

    const finalScore = Math.min(Math.max(baseScore, 0), 100);

    let direction: 'POSITIVE' | 'NEGATIVE' | 'MIXED' | 'NEUTRAL' = 'NEUTRAL';
    if (positiveEvents.length > 0 && negativeEvents.length === 0) {
      direction = 'POSITIVE';
    } else if (negativeEvents.length > 0 && positiveEvents.length === 0) {
      direction = 'NEGATIVE';
    } else if (positiveEvents.length > 0 && negativeEvents.length > 0) {
      direction = 'MIXED';
    }

    return {
      intensityScore: finalScore,
      uniqueEvents: news.uniqueEventCount || events.length,
      independentSources: news.independentSourceCount || 1,
      isSyndicatedWire: news.isSyndicatedWire,
      direction,
      summary: `${events.length} material event(s) across ${news.independentSourceCount || 1} independent source(s).`,
    };
  }
}
