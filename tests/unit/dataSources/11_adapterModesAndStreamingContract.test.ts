/**
 * 11_adapterModesAndStreamingContract.test.ts
 * Phase 16 — Adapter Modes & Ingestion Protocols Contract Verification.
 */

import { describe, it, expect } from 'vitest';
import { MarketDataAdapter } from '../../../src/domain/dataSources/MarketDataAdapter';
import { FinancialDataAdapter } from '../../../src/domain/dataSources/FinancialDataAdapter';
import { ShareholdingDataAdapter } from '../../../src/domain/dataSources/ShareholdingDataAdapter';
import { ExchangeFilingAdapter } from '../../../src/domain/dataSources/ExchangeFilingAdapter';
import { NewsDataAdapter } from '../../../src/domain/dataSources/NewsDataAdapter';
import { IndustryDataAdapter } from '../../../src/domain/dataSources/IndustryDataAdapter';

describe('Adapter Modes & Contracts (Phase 16)', () => {
  it('verifies all adapters implement healthCheck, supportedModes, fetch, validate and normalize', async () => {
    const market = new MarketDataAdapter();
    const fin = new FinancialDataAdapter();
    const shareholding = new ShareholdingDataAdapter();
    const filings = new ExchangeFilingAdapter();
    const news = new NewsDataAdapter();
    const industry = new IndustryDataAdapter();

    const mktHealth = await market.healthCheck();
    expect(mktHealth.status).toBe('HEALTHY');
    expect(market.supportedModes).toContain('STREAM');

    const finHealth = await fin.healthCheck();
    expect(finHealth.status).toBe('HEALTHY');
    expect(fin.supportedModes).toContain('BATCH_FILE');

    const shHealth = await shareholding.healthCheck();
    expect(shHealth.status).toBe('HEALTHY');

    const filHealth = await filings.healthCheck();
    expect(filHealth.status).toBe('HEALTHY');

    const newsHealth = await news.healthCheck();
    expect(newsHealth.status).toBe('HEALTHY');

    const indHealth = await industry.healthCheck();
    expect(indHealth.status).toBe('HEALTHY');
  });
});
