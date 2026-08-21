/**
 * 28_cachePoisoningAndCollision.test.ts
 * Phase 19 — Hostile Cache Poisoning & Namespace Collision Suite.
 */

import { describe, it, expect } from 'vitest';
import { DataSourceCache } from '../../src/domain/dataSources/DataSourceCache';

describe('Cache Poisoning & Namespace Collision Suite', () => {
  it('strictly isolates cache records across distinct company symbols and categories, preventing cross-symbol contamination', () => {
    const queryTata = { symbol: 'TATAMOTORS', category: 'FINANCIAL_STATEMENTS' as const, periodEnd: '2024-03-31' };
    const queryHdfc = { symbol: 'HDFCBANK', category: 'FINANCIAL_STATEMENTS' as const, periodEnd: '2024-03-31' };

    DataSourceCache.set('MCA_XBRL_FINANCIALS', queryTata, 'cap_tata', { revenue: 437928 }, 60);
    DataSourceCache.set('MCA_XBRL_FINANCIALS', queryHdfc, 'cap_hdfc', { netInterestIncome: 90000 }, 60);

    const retrievedTata = DataSourceCache.get<any>('MCA_XBRL_FINANCIALS', queryTata);
    const retrievedHdfc = DataSourceCache.get<any>('MCA_XBRL_FINANCIALS', queryHdfc);

    expect(retrievedTata?.data.revenue).toBe(437928);
    expect(retrievedTata?.data.netInterestIncome).toBeUndefined();

    expect(retrievedHdfc?.data.netInterestIncome).toBe(90000);
    expect(retrievedHdfc?.data.revenue).toBeUndefined();
  });
});
