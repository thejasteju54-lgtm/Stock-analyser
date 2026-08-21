/**
 * 10_staleDataAndExpiryPolicies.test.ts
 * Phase 19 — Hostile Stale Data & Expiry Policies Suite.
 */

import { describe, it, expect } from 'vitest';
import { DataSourceCache } from '../../src/domain/dataSources/DataSourceCache';

describe('Stale Data & Expiry Policies Suite', () => {
  it('automatically invalidates and evicts cache entries that exceed their policy-mandated TTL', () => {
    const query = { symbol: 'TATAMOTORS', category: 'MARKET_DATA' as const };
    const sourceId = 'NSE_OFFICIAL_FEED';

    // Store item with negative/expired TTL
    DataSourceCache.set(sourceId, query, 'cap_expired', { price: 950 }, -1);

    const retrieved = DataSourceCache.get(sourceId, query);
    expect(retrieved).toBeNull();
  });
});
