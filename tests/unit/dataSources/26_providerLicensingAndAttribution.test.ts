/**
 * 26_providerLicensingAndAttribution.test.ts
 * Phase 16 — Provider Licensing, Attribution & Usage Policy Verification.
 */

import { describe, it, expect } from 'vitest';
import { DataSourceMetadataRegistry } from '../../../src/domain/dataSources/DataSourceMetadataRegistry';

describe('Provider Licensing & Attribution (Phase 16)', () => {
  it('verifies statutory and open data providers have explicit attribution and license metadata', () => {
    const bse = DataSourceMetadataRegistry.getMetadata('BSE_CORPORATE_DISCLOSURES');
    expect(bse.licenseStatus).toBe('STATUTORY_PUBLIC');
    expect(bse.redistributionAllowed).toBe(true);
    expect(bse.attributionRequirement).toContain('BSE India');

    const mospi = DataSourceMetadataRegistry.getMetadata('MOSPI_INDUSTRY_STATS');
    expect(mospi.licenseStatus).toBe('OPEN_DATA');
    expect(mospi.attributionRequirement).toContain('MOSPI');
  });
});
