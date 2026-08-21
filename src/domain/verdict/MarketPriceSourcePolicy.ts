/**
 * MarketPriceSourcePolicy.ts
 * Phase 14 — Deterministic Policy for Market Price Intake, Freshness & Integrity.
 */

import {
  MarketPriceSnapshot,
  MarketPriceFreshnessStatus,
  MarketPriceSourceTier,
} from './VerdictTypes';
import { MarketValuationSnapshot } from '../valuation/ValuationTypes';

export interface PriceIntakeParams {
  symbol: string;
  price?: number;
  currency?: string;
  exchange?: string;
  priceDate?: string;
  priceTime?: string;
  source?: string;
  sourceTier?: MarketPriceSourceTier;
  isAdjustedForCorporateActions?: boolean;
  corporateActionNotes?: string;
  nowIso?: string;
}

export class MarketPriceSourcePolicy {
  /**
   * Resolves and normalizes the MarketPriceSnapshot from valuation snapshot or direct intake.
   */
  public static resolveMarketPrice(
    intake: PriceIntakeParams,
    existingValuationSnapshot?: MarketValuationSnapshot
  ): MarketPriceSnapshot {
    const now = intake.nowIso ? new Date(intake.nowIso) : new Date();
    const symbol = intake.symbol || 'TATAMOTORS';
    const price = intake.price ?? existingValuationSnapshot?.currentPrice ?? 0;
    const currency = intake.currency ?? existingValuationSnapshot?.currency ?? 'INR';
    const exchange = intake.exchange ?? 'NSE';
    const priceDate = intake.priceDate ?? existingValuationSnapshot?.priceDate ?? now.toISOString().substring(0, 10);
    const priceTime = intake.priceTime ?? '15:30:00 IST';
    const source = intake.source ?? existingValuationSnapshot?.source ?? 'NSE Official Bounded Feed';
    const sourceTier: MarketPriceSourceTier = intake.sourceTier ?? 'PRIMARY';
    const isAdjusted = intake.isAdjustedForCorporateActions ?? true;
    const corporateActionNotes = intake.corporateActionNotes;

    // 1. Missing or Zero Price Check
    if (price <= 0) {
      return {
        symbol,
        price: 0,
        currency,
        exchange,
        priceDate,
        priceTime,
        marketStatus: 'CLOSED',
        source: 'UNAVAILABLE',
        sourceTier: 'DISCOVERY',
        retrievedAt: now.toISOString(),
        freshnessStatus: 'NOT_ASSESSABLE',
        isAdjustedForCorporateActions: false,
        corporateActionNotes: 'Price is zero or unavailable from verified sources.',
      };
    }

    // 2. Corporate Action Adjustment Check
    if (!isAdjusted) {
      return {
        symbol,
        price,
        currency,
        exchange,
        priceDate,
        priceTime,
        marketStatus: 'CLOSED',
        source,
        sourceTier,
        retrievedAt: now.toISOString(),
        freshnessStatus: 'CORPORATE_ACTION_UNADJUSTED',
        isAdjustedForCorporateActions: false,
        corporateActionNotes: corporateActionNotes || 'Unadjusted corporate action detected (Split/Bonus/Rights).',
      };
    }

    // 3. Freshness Calculation
    const priceDateTime = new Date(`${priceDate}T15:30:00Z`).getTime();
    const currentMs = now.getTime();
    const diffHours = Math.max(0, (currentMs - priceDateTime) / (1000 * 60 * 60));

    let freshnessStatus: MarketPriceFreshnessStatus = 'CURRENT';

    if (diffHours > 120) { // > 5 calendar days (120 hours)
      freshnessStatus = 'CRITICALLY_STALE';
    } else if (diffHours > 48) {
      // Check if diff is explainable by weekend (Saturday/Sunday) or public holiday
      const dayOfWeek = now.getUTCDay(); // 0 is Sunday, 1 is Monday
      const isWeekendContext = (dayOfWeek === 0 || dayOfWeek === 1) && diffHours <= 72;

      if (!isWeekendContext) {
        freshnessStatus = 'STALE';
      }
    }

    // Determine Market Open / Closed status
    const istHours = (now.getUTCHours() + 5.5) % 24;
    const isWeekday = now.getUTCDay() >= 1 && now.getUTCDay() <= 5;
    const isMarketHours = isWeekday && istHours >= 9.25 && istHours <= 15.5;

    return {
      symbol,
      price: Math.round(price * 100) / 100,
      currency,
      exchange,
      priceDate,
      priceTime,
      marketStatus: isMarketHours ? 'OPEN' : isWeekday ? 'CLOSED' : 'WEEKEND_OR_HOLIDAY',
      source,
      sourceTier,
      retrievedAt: now.toISOString(),
      freshnessStatus,
      isAdjustedForCorporateActions: true,
      corporateActionNotes,
    };
  }
}
