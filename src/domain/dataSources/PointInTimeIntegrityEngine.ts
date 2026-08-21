/**
 * PointInTimeIntegrityEngine.ts
 * Phase 16 — Point-in-Time Temporal Gate & Look-Ahead Bias Sentinel.
 * Strictly enforces category-specific temporal cutoff rules for historical research replay.
 */

import { DataSourceCategory } from './DataSourceTypes';

export interface TemporalDataPoint {
  category: DataSourceCategory;
  publicationDate?: string;
  retrievalDate?: string;
  eventDate?: string;
  announcementDate?: string;
  effectiveDate?: string;
  periodStart?: string;
  periodEnd?: string;
  tradeTimestamp?: string;
  sessionDate?: string;
  restatementDate?: string;
}

export interface PointInTimeEvaluationResult {
  isEligible: boolean;
  effectiveCutoffField: string;
  effectiveTimestamp: string;
  isLookAheadBias: boolean;
  reason?: string;
}

export class PointInTimeIntegrityEngine {
  /**
   * Evaluates whether a data item is eligible under the given analysisCutoffDate.
   */
  public static evaluateEligibility(
    item: TemporalDataPoint,
    cutoffDateIso?: string
  ): PointInTimeEvaluationResult {
    if (!cutoffDateIso) {
      return {
        isEligible: true,
        effectiveCutoffField: 'NONE',
        effectiveTimestamp: new Date().toISOString(),
        isLookAheadBias: false,
      };
    }

    const cutoffTime = new Date(cutoffDateIso).getTime();

    switch (item.category) {
      case 'MARKET_DATA': {
        const tradeTime = new Date(item.tradeTimestamp || item.sessionDate || item.retrievalDate || 0).getTime();
        const isEligible = tradeTime <= cutoffTime;
        return {
          isEligible,
          effectiveCutoffField: item.tradeTimestamp ? 'tradeTimestamp' : 'sessionDate',
          effectiveTimestamp: item.tradeTimestamp || item.sessionDate || '',
          isLookAheadBias: !isEligible,
          reason: isEligible ? undefined : `Market tick (${item.tradeTimestamp || item.sessionDate}) occurs after cutoff (${cutoffDateIso}).`,
        };
      }

      case 'NEWS': {
        const pubTime = new Date(item.publicationDate || item.eventDate || 0).getTime();
        const isEligible = pubTime <= cutoffTime;
        return {
          isEligible,
          effectiveCutoffField: item.publicationDate ? 'publicationDate' : 'eventDate',
          effectiveTimestamp: item.publicationDate || item.eventDate || '',
          isLookAheadBias: !isEligible,
          reason: isEligible ? undefined : `News publication (${item.publicationDate}) occurs after cutoff (${cutoffDateIso}).`,
        };
      }

      case 'EXCHANGE_FILINGS':
      case 'COMPANY_DISCLOSURES':
      case 'SHAREHOLDING': {
        const filingTime = new Date(item.publicationDate || item.announcementDate || 0).getTime();
        const isEligible = filingTime <= cutoffTime;
        return {
          isEligible,
          effectiveCutoffField: 'publicationDate',
          effectiveTimestamp: item.publicationDate || '',
          isLookAheadBias: !isEligible,
          reason: isEligible ? undefined : `Filing date (${item.publicationDate}) occurs after cutoff (${cutoffDateIso}).`,
        };
      }

      case 'FINANCIAL_STATEMENTS': {
        const periodEndTime = new Date(item.periodEnd || 0).getTime();
        const pubTime = new Date(item.publicationDate || item.periodEnd || 0).getTime();
        // Mandatory check: Period must have ended AND the filing must have been legally published by the cutoff date!
        const isPeriodEnded = periodEndTime <= cutoffTime;
        const isPublished = pubTime <= cutoffTime;
        const isEligible = isPeriodEnded && isPublished;

        return {
          isEligible,
          effectiveCutoffField: 'periodEnd + publicationDate',
          effectiveTimestamp: item.publicationDate || item.periodEnd || '',
          isLookAheadBias: !isEligible,
          reason: isEligible
            ? undefined
            : `Financial statement (Period End: ${item.periodEnd}, Published: ${item.publicationDate}) was not publicly available on cutoff date (${cutoffDateIso}).`,
        };
      }

      case 'CORPORATE_ACTIONS': {
        const effTime = new Date(item.effectiveDate || item.announcementDate || 0).getTime();
        const isEligible = effTime <= cutoffTime;
        return {
          isEligible,
          effectiveCutoffField: 'effectiveDate',
          effectiveTimestamp: item.effectiveDate || item.announcementDate || '',
          isLookAheadBias: !isEligible,
          reason: isEligible ? undefined : `Corporate action effective on (${item.effectiveDate}) occurs after cutoff (${cutoffDateIso}).`,
        };
      }

      default: {
        const generalTime = new Date(item.publicationDate || item.retrievalDate || 0).getTime();
        const isEligible = generalTime <= cutoffTime;
        return {
          isEligible,
          effectiveCutoffField: 'publicationDate',
          effectiveTimestamp: item.publicationDate || item.retrievalDate || '',
          isLookAheadBias: !isEligible,
        };
      }
    }
  }

  /**
   * Filters an array of temporal items, suppressing post-cutoff look-ahead records.
   */
  public static filterPointInTime<T extends TemporalDataPoint>(
    items: T[],
    cutoffDateIso?: string
  ): { eligibleItems: T[]; suppressedCount: number; lookAheadBiasDetected: boolean } {
    if (!cutoffDateIso) {
      return { eligibleItems: items, suppressedCount: 0, lookAheadBiasDetected: false };
    }

    const eligibleItems: T[] = [];
    let suppressedCount = 0;

    for (const item of items) {
      const res = this.evaluateEligibility(item, cutoffDateIso);
      if (res.isEligible) {
        eligibleItems.push(item);
      } else {
        suppressedCount++;
      }
    }

    return {
      eligibleItems,
      suppressedCount,
      lookAheadBiasDetected: suppressedCount > 0,
    };
  }
}
