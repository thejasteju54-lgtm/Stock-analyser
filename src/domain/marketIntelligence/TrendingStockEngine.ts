import { DailyStockSignal, TrendType } from './MarketIntelligenceTypes';

export interface TrendingDetectionResult {
  trendScore: number; // 0 - 100
  trendType: TrendType;
  volumeMultiple: number;
  isVolumeShock: boolean;
  isBreakout: boolean;
  summary: string;
}

export class TrendingStockEngine {
  /**
   * Evaluates market activity to detect trending behavior
   */
  static evaluateTrending(signal: DailyStockSignal): TrendingDetectionResult {
    const volMultiple = signal.technical.volumeMultiple || 1.0;
    const d1Return = signal.returns.d1;
    const isBreakout = signal.technical.isBreakout;
    const hasMaterialEvent = signal.events.length > 0;

    let score = 30;

    // Volume expansion component (max 40 pts)
    if (volMultiple >= 3.0) {
      score += 40;
    } else if (volMultiple >= 2.0) {
      score += 30;
    } else if (volMultiple >= 1.5) {
      score += 15;
    }

    // Price acceleration component (max 25 pts)
    if (Math.abs(d1Return) >= 5.0) {
      score += 25;
    } else if (Math.abs(d1Return) >= 3.0) {
      score += 15;
    } else if (Math.abs(d1Return) >= 1.5) {
      score += 10;
    }

    // Breakout bonus (15 pts)
    if (isBreakout) {
      score += 15;
    }

    // Event driven bonus (15 pts)
    if (hasMaterialEvent) {
      score += 15;
    }

    const finalScore = Math.min(Math.max(score, 0), 100);

    // Classify Trend Type
    let trendType: TrendType = 'TECHNICAL';
    if (hasMaterialEvent && d1Return > 0) {
      trendType = 'EVENT_DRIVEN';
    } else if (d1Return >= 3.5 && volMultiple >= 1.8) {
      trendType = 'POSITIVE';
    } else if (d1Return <= -3.5 && volMultiple >= 1.8) {
      trendType = 'NEGATIVE';
    } else if (volMultiple >= 2.5 && Math.abs(d1Return) < 1.0) {
      trendType = 'SPECULATIVE';
    } else if (d1Return > 0) {
      trendType = 'POSITIVE';
    } else {
      trendType = 'MIXED';
    }

    return {
      trendScore: finalScore,
      trendType,
      volumeMultiple: volMultiple,
      isVolumeShock: volMultiple >= 2.0,
      isBreakout,
      summary: `Volume ${volMultiple.toFixed(1)}× 20DMA with ${d1Return >= 0 ? '+' : ''}${d1Return.toFixed(1)}% price move.`,
    };
  }
}
