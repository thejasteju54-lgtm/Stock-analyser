/**
 * 21_dataSourceCacheTtlAndFreshness.test.ts
 * Phase 16 — Response Cache Invalidation & TTL Verification.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DataSourceCache } from '../../../src/domain/dataSources/DataSourceCache';

describe('Data Source Cache & Freshness (Phase 16)', () => {
  beforeEach(() => {
    DataSourceCache.invalidate();
  });

  it('stores and retrieves cached records before TTL expiry', () => {
    const query = { symbol: 'TATAMOTORS', category: 'MARKET_DATA' as const };
    DataSourceCache.set('NSE_FEED', query, 'cap_1', { price: 980 }, 60);

    const hit = DataSourceCache.get<{ price: number }>('NSE_FEED', query);
    expect(hit).not.toBeNull();
    expect(hit?.data.price).toBe(980);
  });

  it('invalidates cache on demand', () => {
    const query = { symbol: 'TATAMOTORS', category: 'MARKET_DATA' as const };
    DataSourceCache.set('NSE_FEED', query, 'cap_1', { price: 980 }, 60);

    DataSourceCache.invalidate('NSE_FEED');
    const miss = DataSourceCache.get('NSE_FEED', query);
    expect(miss).toBeNull();
  });
});
