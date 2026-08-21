/**
 * 19_externalProviderReadiness.test.ts
 * Phase 18 — External Data Provider Readiness & Circuit Breaker Suite.
 */

import { describe, it, expect } from 'vitest';
import { DataSourceMetadataRegistry } from '../../src/domain/dataSources/DataSourceMetadataRegistry';

describe('External Provider Readiness Suite', () => {
  it('verifies all 6 primary and secondary data providers maintain valid metadata, statutory licensing, and rate limits', () => {
    const allProviders = DataSourceMetadataRegistry.getAllMetadata();
    expect(allProviders.length).toBe(6);

    for (const p of allProviders) {
      expect(p.sourceId).toBeDefined();
      expect(p.availabilityStatus).toBe('CONNECTED');
      expect(p.rateLimitPerMinute).toBeGreaterThan(0);
      expect(p.licenseStatus).toBeDefined();
    }
  });
});
