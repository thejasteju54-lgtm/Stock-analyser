import { describe, it, expect } from 'vitest';
import { ScreenerAdapter } from '../../../src/infrastructure/researchSources/screener/ScreenerAdapter';
import { TickertapeAdapter } from '../../../src/infrastructure/researchSources/tickertape/TickertapeAdapter';
import { MoneycontrolAdapter } from '../../../src/infrastructure/researchSources/moneycontrol/MoneycontrolAdapter';
import { OfficialExchangeAdapter } from '../../../src/infrastructure/researchSources/official/OfficialExchangeAdapter';
import { NewsDiscoveryAdapter } from '../../../src/infrastructure/researchSources/news/NewsDiscoveryAdapter';

describe('Phase 21 — Source Adapters & 5-Tier Hierarchy', () => {
  it('enforces correct source tier and role assignments across all adapters', () => {
    const official = new OfficialExchangeAdapter();
    const screener = new ScreenerAdapter();
    const tickertape = new TickertapeAdapter();
    const moneycontrol = new MoneycontrolAdapter();
    const news = new NewsDiscoveryAdapter();

    expect(official.sourceTier).toBe(1);
    expect(official.defaultRole).toBe('STATUTORY_REGULATORY');

    expect(screener.sourceTier).toBe(3);
    expect(screener.defaultRole).toBe('STRUCTURED_MARKET_RESEARCH');

    expect(tickertape.sourceTier).toBe(3);
    expect(tickertape.defaultRole).toBe('STRUCTURED_MARKET_RESEARCH');

    expect(moneycontrol.sourceTier).toBe(3);
    expect(moneycontrol.defaultRole).toBe('STRUCTURED_MARKET_RESEARCH');

    expect(news.sourceTier).toBe(4);
    expect(news.defaultRole).toBe('SECONDARY_DISCOVERY');
  });

  it('fetches audited financial statements and document hashes from OfficialExchangeAdapter', async () => {
    const official = new OfficialExchangeAdapter();
    const docs = await official.discoverDocuments('BEL');

    expect(docs.status).toBe('SUCCESS');
    expect(docs.data).toBeDefined();
    expect(docs.data!.length).toBeGreaterThan(0);
    expect(docs.data![0].sourceTier).toBe(1);
    expect(docs.data![0].sha256Hash).toBeDefined();

    const fin = await official.fetchFinancials('BEL', 'CONSOLIDATED');
    expect(fin.status).toBe('SUCCESS');
    expect(fin.data).toBeDefined();
    const revItem = fin.data!.find((i) => i.metricKey === 'REVENUE');
    expect(revItem).toBeDefined();
    expect(revItem!.value).toBe(20268);
    expect(revItem!.reportingBasis).toBe('CONSOLIDATED');
  });

  it('fetches 3-year historical statements from ScreenerAdapter', async () => {
    const screener = new ScreenerAdapter();
    const fin = await screener.fetchFinancials('BEL', 'CONSOLIDATED');

    expect(fin.status).toBe('SUCCESS');
    expect(fin.data!.length).toBeGreaterThanOrEqual(6);
    const fy24Rev = fin.data!.find((i) => i.metricKey === 'REVENUE' && i.periodLabel === 'FY24');
    expect(fy24Rev!.value).toBe(20268);
  });
});
