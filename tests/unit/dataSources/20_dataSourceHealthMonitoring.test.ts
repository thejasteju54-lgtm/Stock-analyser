/**
 * 20_dataSourceHealthMonitoring.test.ts
 * Phase 16 — Data Source Health & Availability Monitoring Verification.
 */

import { describe, it, expect } from 'vitest';
import { DataSourceMetadataRegistry } from '../../../src/domain/dataSources/DataSourceMetadataRegistry';
import { MarketDataAdapter } from '../../../src/domain/dataSources/MarketDataAdapter';

describe('Data Source Health Monitoring (Phase 16)', () => {
  it('retrieves configured provider metadata with active connected status', () => {
    const all = DataSourceMetadataRegistry.getAllMetadata();
    expect(all.length).toBeGreaterThanOrEqual(5);

    const nse = DataSourceMetadataRegistry.getMetadata('NSE_OFFICIAL_FEED');
    expect(nse.availabilityStatus).toBe('CONNECTED');
    expect(nse.sourceTier).toBe('TIER_1_PRIMARY');
  });

  it('runs health checks on live adapters and reports latency', async () => {
    const market = new MarketDataAdapter();
    const health = await market.healthCheck();
    expect(health.status).toBe('HEALTHY');
    expect(health.latencyMs).toBeGreaterThan(0);
  });
});
