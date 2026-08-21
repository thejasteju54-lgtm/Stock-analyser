/**
 * ExchangeFilingAdapter.ts
 * Phase 16 — Exchange Filing & Regulatory Disclosure Ingestion Adapter.
 */

import { DataSourceMetadataRegistry } from './DataSourceMetadataRegistry';
import { DataSourceRateLimiter } from './DataSourceRateLimiter';
import { DataSourceCache } from './DataSourceCache';
import { RawDataStore } from './RawDataStore';
import {
  DataFetchQuery,
  DataSourceAdapter,
  DataSourceMetadata,
  DataSourceTier,
  ValidationResult,
} from './DataSourceTypes';

export interface ExchangeFilingRecord {
  filingId: string;
  companyId: string;
  symbol: string;
  filingType: 'ANNUAL_REPORT' | 'QUARTERLY_RESULTS' | 'SHAREHOLDING' | 'BOARD_MEETING' | 'PRESS_RELEASE' | 'CREDIT_RATING';
  title: string;
  filingDate: string; // ISO DateTime
  periodEnd?: string;
  sourceUrl: string;
  sourceId: string;
  sourceTier: DataSourceTier;
  rawPayloadHash: string;
  isAudited: boolean;
}

export class ExchangeFilingAdapter implements DataSourceAdapter<ExchangeFilingRecord[], ExchangeFilingRecord[]> {
  public readonly metadata: DataSourceMetadata;
  public readonly supportedModes: ('REQUEST_RESPONSE' | 'POLLING' | 'STREAM' | 'BATCH_FILE')[] = [
    'REQUEST_RESPONSE',
    'POLLING',
  ];

  constructor(sourceId: string = 'BSE_CORPORATE_DISCLOSURES') {
    this.metadata = DataSourceMetadataRegistry.getMetadata(sourceId);
  }

  public async healthCheck(): Promise<{ status: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE'; latencyMs: number }> {
    return {
      status: this.metadata.availabilityStatus === 'CONNECTED' ? 'HEALTHY' : 'DEGRADED',
      latencyMs: 35,
    };
  }

  public async fetch(query: DataFetchQuery): Promise<{
    captureRecord: import('./RawDataStore').RawSourceCaptureRecord;
    parsedData: ExchangeFilingRecord[];
    rateLimitStatus: { remainingRequests: number; resetTimestamp: number };
    retryable: boolean;
  }> {
    const cached = DataSourceCache.get<ExchangeFilingRecord[]>(this.metadata.sourceId, query);
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

    const mockFilings: ExchangeFilingRecord[] = [
      {
        filingId: `fil_${query.symbol.toLowerCase()}_ar24`,
        companyId: `comp_${query.symbol.toLowerCase()}`,
        symbol: query.symbol,
        filingType: 'ANNUAL_REPORT',
        title: `${query.symbol} Annual Report for FY2023-24`,
        filingDate: '2024-06-12T14:30:00Z',
        periodEnd: '2024-03-31',
        sourceUrl: `https://www.bseindia.com/xml-data/corpfiling/AttachLive/${query.symbol}_AR24.pdf`,
        sourceId: this.metadata.sourceId,
        sourceTier: this.metadata.sourceTier,
        rawPayloadHash: '',
        isAudited: true,
      },
      {
        filingId: `fil_${query.symbol.toLowerCase()}_q324`,
        companyId: `comp_${query.symbol.toLowerCase()}`,
        symbol: query.symbol,
        filingType: 'QUARTERLY_RESULTS',
        title: `${query.symbol} Financial Results for Q3 FY24`,
        filingDate: '2024-01-28T16:00:00Z',
        periodEnd: '2023-12-31',
        sourceUrl: `https://www.bseindia.com/xml-data/corpfiling/AttachLive/${query.symbol}_Q324.pdf`,
        sourceId: this.metadata.sourceId,
        sourceTier: this.metadata.sourceTier,
        rawPayloadHash: '',
        isAudited: false,
      },
    ];

    const rawCapture = RawDataStore.captureText({
      sourceId: this.metadata.sourceId,
      requestId: `req_fil_${Date.now()}`,
      textPayload: JSON.stringify(mockFilings),
      mode: 'REQUEST_RESPONSE',
    });

    mockFilings.forEach((f) => (f.rawPayloadHash = rawCapture.rawBytesSha256));
    DataSourceCache.set(this.metadata.sourceId, query, rawCapture.captureId, mockFilings, 720);

    return {
      captureRecord: rawCapture,
      parsedData: mockFilings,
      rateLimitStatus: {
        remainingRequests: rateStatus.remainingTokens,
        resetTimestamp: rateStatus.resetTime,
      },
      retryable: false,
    };
  }

  public validate(raw: { parsedData: ExchangeFilingRecord[] }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(raw.parsedData)) {
      errors.push('Filings response must be an array.');
    } else {
      raw.parsedData.forEach((f, idx) => {
        if (!f.filingId) errors.push(`Filing at index ${idx} missing filingId.`);
        if (!f.filingDate) errors.push(`Filing at index ${idx} missing filingDate.`);
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  public normalize(raw: { parsedData: ExchangeFilingRecord[] }): ExchangeFilingRecord[] {
    return raw.parsedData;
  }
}
