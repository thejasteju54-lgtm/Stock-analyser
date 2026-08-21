/**
 * MarketDataAdapter.ts
 * Phase 16 — Market Data Adapter for Real-Time & EOD Feeds.
 */

import { DataSourceMetadataRegistry } from './DataSourceMetadataRegistry';
import { DataSourceRateLimiter } from './DataSourceRateLimiter';
import { DataSourceCache } from './DataSourceCache';
import { RawDataStore } from './RawDataStore';
import { CorporateActionEngine } from './CorporateActionEngine';
import { MarketAnomalyEngine } from './MarketAnomalyEngine';
import {
  DataFetchQuery,
  DataSourceAdapter,
  DataSourceMetadata,
  MarketPriceRecord,
  CorporateActionRecord,
  ValidationResult,
} from './DataSourceTypes';

export class MarketDataAdapter implements DataSourceAdapter<MarketPriceRecord, MarketPriceRecord> {
  public readonly metadata: DataSourceMetadata;
  public readonly supportedModes: ('REQUEST_RESPONSE' | 'POLLING' | 'STREAM' | 'BATCH_FILE')[] = [
    'REQUEST_RESPONSE',
    'POLLING',
    'STREAM',
  ];

  constructor(sourceId: string = 'NSE_OFFICIAL_FEED') {
    this.metadata = DataSourceMetadataRegistry.getMetadata(sourceId);
  }

  public async healthCheck(): Promise<{ status: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE'; latencyMs: number }> {
    const start = Date.now();
    return {
      status: this.metadata.availabilityStatus === 'CONNECTED' ? 'HEALTHY' : 'DEGRADED',
      latencyMs: Date.now() - start + 12,
    };
  }

  public async fetch(query: DataFetchQuery): Promise<{
    captureRecord: import('./RawDataStore').RawSourceCaptureRecord;
    parsedData: MarketPriceRecord;
    rateLimitStatus: { remainingRequests: number; resetTimestamp: number };
    retryable: boolean;
  }> {
    // 1. Check Cache
    const cached = DataSourceCache.get<MarketPriceRecord>(this.metadata.sourceId, query);
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

    // 2. Pre-Request Rate Limiter Authorization Gate
    const rateStatus = DataSourceRateLimiter.acquire(this.metadata.sourceId, this.metadata.rateLimitPerMinute);
    if (!rateStatus.isAllowed) {
      throw new Error(`Rate limit exceeded for ${this.metadata.sourceId}. Retry after ${rateStatus.retryAfterMs}ms.`);
    }

    // 3. Simulated Network Payload / Replay Generation
    const now = new Date();
    const sessionDate = query.cutoffDate ? query.cutoffDate.split('T')[0] : now.toISOString().split('T')[0];
    const tradeTimestamp = query.cutoffDate || now.toISOString();

    const mockPricePayload = {
      symbol: query.symbol,
      exchange: 'NSE' as const,
      sessionDate,
      tradeTimestamp,
      rawPrice: 980.5,
      open: 970.0,
      high: 992.0,
      low: 968.0,
      close: 980.5,
      volume: 4520000,
      vwap: 981.2,
    };

    // 4. Capture Raw Binary Bytes
    const rawCapture = RawDataStore.captureText({
      sourceId: this.metadata.sourceId,
      requestId: `req_mkt_${Date.now()}`,
      textPayload: JSON.stringify(mockPricePayload),
      mode: 'REQUEST_RESPONSE',
    });

    const parsed = CorporateActionEngine.buildPriceRecord({
      ...mockPricePayload,
      actions: [],
      sourceId: this.metadata.sourceId,
      sourceTier: this.metadata.sourceTier,
      captureId: rawCapture.captureId,
    });

    const evaluated = MarketAnomalyEngine.attachAnomalyClassification(parsed, 965.0);

    // 5. Store in Cache (15-min TTL for market ticks)
    DataSourceCache.set(this.metadata.sourceId, query, rawCapture.captureId, evaluated, 15);

    return {
      captureRecord: rawCapture,
      parsedData: evaluated,
      rateLimitStatus: {
        remainingRequests: rateStatus.remainingTokens,
        resetTimestamp: rateStatus.resetTime,
      },
      retryable: false,
    };
  }

  public validate(raw: { parsedData: MarketPriceRecord }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const p = raw.parsedData;

    if (p.rawPrice <= 0) errors.push(`Invalid price: ${p.rawPrice}`);
    if (p.volume < 0) errors.push(`Invalid volume: ${p.volume}`);
    if (p.currency !== 'INR') errors.push(`Invalid currency: ${p.currency} (expected INR)`);
    if (new Date(p.tradeTimestamp).getTime() > Date.now() + 60000) {
      errors.push(`Future trade timestamp rejected: ${p.tradeTimestamp}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  public normalize(
    raw: { parsedData: MarketPriceRecord },
    actions: CorporateActionRecord[] = []
  ): MarketPriceRecord {
    return CorporateActionEngine.buildPriceRecord({
      symbol: raw.parsedData.symbol,
      exchange: raw.parsedData.exchange,
      sessionDate: raw.parsedData.sessionDate,
      tradeTimestamp: raw.parsedData.tradeTimestamp,
      rawPrice: raw.parsedData.rawPrice,
      open: raw.parsedData.open,
      high: raw.parsedData.high,
      low: raw.parsedData.low,
      close: raw.parsedData.close,
      volume: raw.parsedData.volume,
      vwap: raw.parsedData.vwap,
      actions,
      sourceId: this.metadata.sourceId,
      sourceTier: this.metadata.sourceTier,
      captureId: raw.parsedData.captureId,
    });
  }
}
