/**
 * IndustryDataAdapter.ts
 * Phase 16 — Industry Benchmarks, Macro Indicators & Peer Moat Ingestion Adapter.
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

export interface IndustryMetricRecord {
  metricId: string;
  sector: string;
  industry: string;
  metricName: string;
  metricValue: number;
  unit: string;
  period: string;
  isForecast: boolean;
  forecastPeriod?: string;
  source: string;
  sourceTier: DataSourceTier;
  publicationDate: string;
  confidence: number;
}

export class IndustryDataAdapter implements DataSourceAdapter<IndustryMetricRecord[], IndustryMetricRecord[]> {
  public readonly metadata: DataSourceMetadata;
  public readonly supportedModes: ('REQUEST_RESPONSE' | 'BATCH_FILE')[] = ['REQUEST_RESPONSE', 'BATCH_FILE'];

  constructor(sourceId: string = 'MOSPI_INDUSTRY_STATS') {
    this.metadata = DataSourceMetadataRegistry.getMetadata(sourceId);
  }

  public async healthCheck(): Promise<{ status: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE'; latencyMs: number }> {
    return {
      status: this.metadata.availabilityStatus === 'CONNECTED' ? 'HEALTHY' : 'DEGRADED',
      latencyMs: 40,
    };
  }

  public async fetch(query: DataFetchQuery): Promise<{
    captureRecord: import('./RawDataStore').RawSourceCaptureRecord;
    parsedData: IndustryMetricRecord[];
    rateLimitStatus: { remainingRequests: number; resetTimestamp: number };
    retryable: boolean;
  }> {
    const cached = DataSourceCache.get<IndustryMetricRecord[]>(this.metadata.sourceId, query);
    if (cached) {
      const capture = RawDataStore.getCapture(cached.captureId);
      if (capture) {
        return {
          captureRecord: capture,
          parsedData: cached.data,
          rateLimitStatus: { remainingRequests: 60, resetTimestamp: Date.now() + 60000 },
          retryable: false,
        };
      }
    }

    const rateStatus = DataSourceRateLimiter.acquire(this.metadata.sourceId, this.metadata.rateLimitPerMinute);
    if (!rateStatus.isAllowed) {
      throw new Error(`Rate limit exceeded for ${this.metadata.sourceId}. Retry after ${rateStatus.retryAfterMs}ms.`);
    }

    const mockIndustryMetrics: IndustryMetricRecord[] = [
      {
        metricId: `ind_growth_${query.symbol.toLowerCase()}`,
        sector: 'Automobile and Ancillaries',
        industry: 'Commercial & Passenger Vehicles',
        metricName: 'Sector 3-Year Historical Volume CAGR',
        metricValue: 8.4,
        unit: 'PERCENT',
        period: 'FY21-FY24',
        isForecast: false,
        source: 'MOSPI Annual Survey of Industries',
        sourceTier: this.metadata.sourceTier,
        publicationDate: '2024-04-10',
        confidence: 90,
      },
      {
        metricId: `ind_forecast_${query.symbol.toLowerCase()}`,
        sector: 'Automobile and Ancillaries',
        industry: 'Commercial & Passenger Vehicles',
        metricName: 'Projected Domestic Industry Growth',
        metricValue: 7.2,
        unit: 'PERCENT',
        period: 'FY25-FY27',
        isForecast: true,
        forecastPeriod: '3-Year Forward',
        source: 'RBI Macroeconomic Survey',
        sourceTier: this.metadata.sourceTier,
        publicationDate: '2024-05-02',
        confidence: 80,
      },
    ];

    const rawCapture = RawDataStore.captureText({
      sourceId: this.metadata.sourceId,
      requestId: `req_ind_${Date.now()}`,
      textPayload: JSON.stringify(mockIndustryMetrics),
      mode: 'REQUEST_RESPONSE',
    });

    DataSourceCache.set(this.metadata.sourceId, query, rawCapture.captureId, mockIndustryMetrics, 4320); // 3-day TTL

    return {
      captureRecord: rawCapture,
      parsedData: mockIndustryMetrics,
      rateLimitStatus: {
        remainingRequests: rateStatus.remainingTokens,
        resetTimestamp: rateStatus.resetTime,
      },
      retryable: false,
    };
  }

  public validate(raw: { parsedData: IndustryMetricRecord[] }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(raw.parsedData)) {
      errors.push('Industry payload must be an array.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  public normalize(raw: { parsedData: IndustryMetricRecord[] }): IndustryMetricRecord[] {
    return raw.parsedData;
  }
}
