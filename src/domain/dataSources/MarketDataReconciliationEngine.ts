/**
 * MarketDataReconciliationEngine.ts
 * Phase 16 — Multi-Source Market Price Cross-Feed Reconciliation Engine.
 */

import { MarketPriceRecord } from './DataSourceTypes';

export type PriceReconciliationStatus =
  | 'MATCHED'
  | 'MINOR_DIFFERENCE'
  | 'MATERIAL_CONFLICT'
  | 'NOT_ASSESSABLE';

export interface PriceReconciliationReport {
  symbol: string;
  sessionDate: string;
  selectedRecord: MarketPriceRecord | null;
  status: PriceReconciliationStatus;
  primaryPrice?: number;
  secondaryPrice?: number;
  variancePercent: number;
  explanation: string;
  isAssessable: boolean;
}

export class MarketDataReconciliationEngine {
  public static reconcileFeeds(
    primaryFeed?: MarketPriceRecord,
    secondaryFeed?: MarketPriceRecord,
    tolerancePercent: number = 0.5
  ): PriceReconciliationReport {
    if (!primaryFeed && !secondaryFeed) {
      return {
        symbol: 'UNKNOWN',
        sessionDate: new Date().toISOString().split('T')[0],
        selectedRecord: null,
        status: 'NOT_ASSESSABLE',
        variancePercent: 0,
        explanation: 'No market price feeds provided for reconciliation.',
        isAssessable: false,
      };
    }

    if (primaryFeed && !secondaryFeed) {
      return {
        symbol: primaryFeed.symbol,
        sessionDate: primaryFeed.sessionDate,
        selectedRecord: primaryFeed,
        status: 'MATCHED',
        primaryPrice: primaryFeed.rawPrice,
        variancePercent: 0,
        explanation: 'Single primary exchange feed available and accepted.',
        isAssessable: true,
      };
    }

    if (!primaryFeed && secondaryFeed) {
      return {
        symbol: secondaryFeed.symbol,
        sessionDate: secondaryFeed.sessionDate,
        selectedRecord: secondaryFeed,
        status: 'MATCHED',
        secondaryPrice: secondaryFeed.rawPrice,
        variancePercent: 0,
        explanation: 'Single secondary feed accepted with contextual verification.',
        isAssessable: true,
      };
    }

    const pPrice = primaryFeed!.rawPrice;
    const sPrice = secondaryFeed!.rawPrice;
    const diff = Math.abs(pPrice - sPrice);
    const maxP = Math.max(pPrice, sPrice, 1);
    const variancePercent = Number(((diff / maxP) * 100).toFixed(2));

    if (variancePercent <= tolerancePercent) {
      return {
        symbol: primaryFeed!.symbol,
        sessionDate: primaryFeed!.sessionDate,
        selectedRecord: primaryFeed!,
        status: 'MATCHED',
        primaryPrice: pPrice,
        secondaryPrice: sPrice,
        variancePercent,
        explanation: `Primary and secondary feeds corroborated within ${variancePercent}% tolerance.`,
        isAssessable: true,
      };
    }

    if (variancePercent <= 2.0) {
      return {
        symbol: primaryFeed!.symbol,
        sessionDate: primaryFeed!.sessionDate,
        selectedRecord: primaryFeed!,
        status: 'MINOR_DIFFERENCE',
        primaryPrice: pPrice,
        secondaryPrice: sPrice,
        variancePercent,
        explanation: `Minor timing variance of ${variancePercent}% between primary (₹${pPrice}) and secondary (₹${sPrice}). Primary statutory feed selected.`,
        isAssessable: true,
      };
    }

    // Material conflict (> 2.0%)
    return {
      symbol: primaryFeed!.symbol,
      sessionDate: primaryFeed!.sessionDate,
      selectedRecord: primaryFeed!, // Primary preferred by statutory hierarchy with conflict warning
      status: 'MATERIAL_CONFLICT',
      primaryPrice: pPrice,
      secondaryPrice: sPrice,
      variancePercent,
      explanation: `Material conflict (${variancePercent}%) between primary feed (₹${pPrice}) and secondary feed (₹${sPrice}). Flagged for review.`,
      isAssessable: true,
    };
  }
}
