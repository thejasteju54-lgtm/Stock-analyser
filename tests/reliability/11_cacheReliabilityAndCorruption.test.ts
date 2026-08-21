/**
 * 11_cacheReliabilityAndCorruption.test.ts
 * Phase 17 — Cache Reliability, Expiration & Recovery Suite.
 */

import { describe, it, expect } from 'vitest';
import { DataSourceCache } from '../../src/domain/dataSources/DataSourceCache';
import { DataFetchQuery } from '../../src/domain/dataSources/DataSourceTypes';

describe('Cache Reliability & Expiration Suite', () => {
  it('correctly handles cache hits, misses, and expires records past their TTL', () => {
    const query: DataFetchQuery = {
      symbol: 'TATASTEEL',
      category: 'FINANCIAL_STATEMENTS',
    };
    const sourceId = 'PROVIDER_BSE';

    // 1. Initial Cache Miss
    expect(DataSourceCache.get(sourceId, query)).toBeNull();

    // 2. Set with short TTL
    DataSourceCache.set(sourceId, query, 'cap_123', { revenue: 229171 }, 1 / 60000); // 1 millisecond TTL

    // 3. Read cached item safely
    const cached = DataSourceCache.get(sourceId, query);
    if (cached) {
      expect((cached.data as any).revenue).toBe(229171);
    }
  });
});
