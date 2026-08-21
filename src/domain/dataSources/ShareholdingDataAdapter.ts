/**
 * ShareholdingDataAdapter.ts
 * Phase 16 — Shareholding Pattern & Promoter Pledge Normalization Adapter.
 * Features multi-tier ownership sum reconciliation and reporting period preservation.
 */

import { DataSourceMetadataRegistry } from './DataSourceMetadataRegistry';
import { DataSourceRateLimiter } from './DataSourceRateLimiter';
import { DataSourceCache } from './DataSourceCache';
import { RawDataStore } from './RawDataStore';
import {
  DataFetchQuery,
  DataSourceAdapter,
  DataSourceMetadata,
  ShareholdingRecord,
  ShareholdingReconciliationStatus,
  ValidationResult,
} from './DataSourceTypes';

export class ShareholdingDataAdapter implements DataSourceAdapter<ShareholdingRecord, ShareholdingRecord> {
  public readonly metadata: DataSourceMetadata;
  public readonly supportedModes: ('REQUEST_RESPONSE' | 'POLLING' | 'STREAM' | 'BATCH_FILE')[] = [
    'REQUEST_RESPONSE',
    'BATCH_FILE',
  ];

  constructor(sourceId: string = 'BSE_CORPORATE_DISCLOSURES') {
    this.metadata = DataSourceMetadataRegistry.getMetadata(sourceId);
  }

  public async healthCheck(): Promise<{ status: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE'; latencyMs: number }> {
    return {
      status: this.metadata.availabilityStatus === 'CONNECTED' ? 'HEALTHY' : 'DEGRADED',
      latencyMs: 30,
    };
  }

  public async fetch(query: DataFetchQuery): Promise<{
    captureRecord: import('./RawDataStore').RawSourceCaptureRecord;
    parsedData: ShareholdingRecord;
    rateLimitStatus: { remainingRequests: number; resetTimestamp: number };
    retryable: boolean;
  }> {
    const cached = DataSourceCache.get<ShareholdingRecord>(this.metadata.sourceId, query);
    if (cached) {
      const capture = RawDataStore.getCapture(cached.captureId);
      if (capture) {
        return {
          captureRecord: capture,
          parsedData: cached.data,
          rateLimitStatus: { remainingRequests: 50, resetTimestamp: Date.now() + 60000 },
          retryable: false,
        };
      }
    }

    const rateStatus = DataSourceRateLimiter.acquire(this.metadata.sourceId, this.metadata.rateLimitPerMinute);
    if (!rateStatus.isAllowed) {
      throw new Error(`Rate limit exceeded for ${this.metadata.sourceId}. Retry after ${rateStatus.retryAfterMs}ms.`);
    }

    const mockRaw = {
      recordId: `sh_${query.symbol.toLowerCase()}_20240331`,
      companyId: `comp_${query.symbol.toLowerCase()}`,
      quarterEnd: '2024-03-31',
      filingDate: '2024-04-14',
      promoterHoldingPercent: 46.36,
      promoterPledgePercentOfPromoterHolding: 0.0,
      fiiHoldingPercent: 19.20,
      diiHoldingPercent: 15.42,
      mutualFundHoldingPercent: 9.80,
      insuranceHoldingPercent: 5.62,
      publicRetailHoldingPercent: 18.52,
      otherHoldingPercent: 0.50,
    };

    const rawCapture = RawDataStore.captureText({
      sourceId: this.metadata.sourceId,
      requestId: `req_sh_${Date.now()}`,
      textPayload: JSON.stringify(mockRaw),
      mode: 'REQUEST_RESPONSE',
    });

    const parsed = this.reconcileShareholding(mockRaw, rawCapture.rawBytesSha256);
    DataSourceCache.set(this.metadata.sourceId, query, rawCapture.captureId, parsed, 1440);

    return {
      captureRecord: rawCapture,
      parsedData: parsed,
      rateLimitStatus: {
        remainingRequests: rateStatus.remainingTokens,
        resetTimestamp: rateStatus.resetTime,
      },
      retryable: false,
    };
  }

  public validate(raw: { parsedData: ShareholdingRecord }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const sh = raw.parsedData;

    if (sh.promoterHoldingPercent < 0 || sh.promoterHoldingPercent > 100) {
      errors.push(`Invalid promoter holding: ${sh.promoterHoldingPercent}%`);
    }
    if (sh.promoterPledgePercentOfPromoterHolding < 0 || sh.promoterPledgePercentOfPromoterHolding > 100) {
      errors.push(`Invalid promoter pledge percentage: ${sh.promoterPledgePercentOfPromoterHolding}%`);
    }
    if (sh.reconciliationStatus === 'MATERIAL_CONFLICT') {
      errors.push(`Shareholding total (${sh.totalOwnershipSumPercent}%) materially differs from 100%.`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  public normalize(raw: { parsedData: ShareholdingRecord }): ShareholdingRecord {
    return raw.parsedData;
  }

  public reconcileShareholding(
    raw: {
      recordId: string;
      companyId: string;
      quarterEnd: string;
      filingDate: string;
      promoterHoldingPercent: number;
      promoterPledgePercentOfPromoterHolding: number;
      fiiHoldingPercent: number;
      diiHoldingPercent: number;
      mutualFundHoldingPercent?: number;
      insuranceHoldingPercent?: number;
      publicRetailHoldingPercent: number;
      otherHoldingPercent: number;
    },
    rawPayloadHash: string
  ): ShareholdingRecord {
    const totalSum =
      raw.promoterHoldingPercent +
      raw.fiiHoldingPercent +
      raw.diiHoldingPercent +
      raw.publicRetailHoldingPercent +
      raw.otherHoldingPercent;

    const roundedSum = Number(totalSum.toFixed(2));
    const variance = Number(Math.abs(roundedSum - 100.0).toFixed(2));

    let reconciliationStatus: ShareholdingReconciliationStatus = 'RECONCILED';

    if (variance === 0 || Math.abs(totalSum - 100.0) < 0.05) {
      reconciliationStatus = 'RECONCILED';
    } else if (variance <= 0.5) {
      reconciliationStatus = 'MINOR_ROUNDING_VARIANCE';
    } else if (
      raw.promoterHoldingPercent === 0 &&
      raw.fiiHoldingPercent === 0 &&
      raw.diiHoldingPercent === 0
    ) {
      reconciliationStatus = 'INCOMPLETE';
    } else if (variance > 1.0) {
      reconciliationStatus = 'MATERIAL_CONFLICT';
    } else {
      reconciliationStatus = 'MINOR_ROUNDING_VARIANCE';
    }

    return {
      recordId: raw.recordId,
      companyId: raw.companyId,
      quarterEnd: raw.quarterEnd,
      filingDate: raw.filingDate,
      promoterHoldingPercent: raw.promoterHoldingPercent,
      promoterPledgePercentOfPromoterHolding: raw.promoterPledgePercentOfPromoterHolding,
      fiiHoldingPercent: raw.fiiHoldingPercent,
      diiHoldingPercent: raw.diiHoldingPercent,
      mutualFundHoldingPercent: raw.mutualFundHoldingPercent,
      insuranceHoldingPercent: raw.insuranceHoldingPercent,
      publicRetailHoldingPercent: raw.publicRetailHoldingPercent,
      otherHoldingPercent: raw.otherHoldingPercent,
      totalOwnershipSumPercent: roundedSum,
      reconciliationStatus,
      reconciliationVariancePercent: variance,
      sourceId: this.metadata.sourceId,
      sourceTier: this.metadata.sourceTier,
      rawPayloadHash,
    };
  }
}
