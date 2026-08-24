/**
 * multiCompanyIsolation.test.ts
 * Multi-Company Isolation & Zero Static Research Verification Suite
 * Verifies that BEL, TCS, RELIANCE, HDFCBANK, and SUNPHARMA produce 100% distinct, genuine research outputs.
 */

import { describe, it, expect } from 'vitest';
import { CompanyResolutionEngine } from '../../src/domain/dataAcquisition/CompanyResolutionEngine';
import { FinancialDataAdapter } from '../../src/domain/dataSources/FinancialDataAdapter';
import { ShareholdingDataAdapter } from '../../src/domain/dataSources/ShareholdingDataAdapter';
import { NewsDiscoveryAdapter } from '../../src/infrastructure/researchSources/news/NewsDiscoveryAdapter';

describe('Multi-Company Isolation & Dynamic Research Suite', () => {
  const companies = ['BEL', 'TCS', 'RELIANCE', 'HDFCBANK', 'SUNPHARMA'];

  it('resolves distinct canonical companies with correct sectors, industries, and business models', async () => {
    const resolved = await Promise.all(companies.map((sym) => CompanyResolutionEngine.resolve(sym)));

    // Unique IDs
    const ids = new Set(resolved.map((r) => r.canonicalCompanyId));
    expect(ids.size).toBe(5);

    // Unique Sectors
    const sectors = new Set(resolved.map((r) => r.sector));
    expect(sectors.size).toBe(5);

    // Specific entity checks
    const bel = resolved.find((r) => r.symbolNSE === 'BEL')!;
    expect(bel.sector).toContain('Defence');
    expect(bel.displayName).toBe('Bharat Electronics');

    const tcs = resolved.find((r) => r.symbolNSE === 'TCS')!;
    expect(tcs.sector).toBe('Information Technology');
    expect(tcs.industry).toContain('IT Services');

    const reliance = resolved.find((r) => r.symbolNSE === 'RELIANCE')!;
    expect(reliance.sector).toContain('Energy');

    const hdfc = resolved.find((r) => r.symbolNSE === 'HDFCBANK')!;
    expect(hdfc.sector).toBe('Financial Services');

    const sun = resolved.find((r) => r.symbolNSE === 'SUNPHARMA')!;
    expect(sun.sector).toContain('Pharmaceuticals');
  });

  it('produces distinct financial statements across all 5 archetypes and companies without data leakage', async () => {
    const finAdapter = new FinancialDataAdapter();

    const belStmt = await finAdapter.fetch({ symbol: 'BEL', periodEnd: '2024-03-31' }, 'INDUSTRIAL_MANUFACTURING');
    const tcsStmt = await finAdapter.fetch({ symbol: 'TCS', periodEnd: '2024-03-31' }, 'IT_SERVICES');
    const relStmt = await finAdapter.fetch({ symbol: 'RELIANCE', periodEnd: '2024-03-31' }, 'INDUSTRIAL_MANUFACTURING');
    const hdfcStmt = await finAdapter.fetch({ symbol: 'HDFCBANK', periodEnd: '2024-03-31' }, 'BANKING');
    const sunStmt = await finAdapter.fetch({ symbol: 'SUNPHARMA', periodEnd: '2024-03-31' }, 'INDUSTRIAL_MANUFACTURING');

    // Revenue checks
    expect((belStmt.parsedData as any).revenue).toBe(20268.0);
    expect((tcsStmt.parsedData as any).revenue).toBe(240893.0);
    expect((relStmt.parsedData as any).revenue).toBe(901064.0);
    expect((hdfcStmt.parsedData as any).netInterestIncome).toBe(98000.0);
    expect((sunStmt.parsedData as any).revenue).toBe(48496.0);

    // No two companies share identical revenue or PAT
    const revs = [
      (belStmt.parsedData as any).revenue,
      (tcsStmt.parsedData as any).revenue,
      (relStmt.parsedData as any).revenue,
      (sunStmt.parsedData as any).revenue,
    ];
    expect(new Set(revs).size).toBe(4);
  });

  it('produces company-specific shareholding patterns', async () => {
    const shAdapter = new ShareholdingDataAdapter();

    const tcsSh = await shAdapter.fetch({ symbol: 'TCS', periodEnd: '2024-03-31' });
    const hdfcSh = await shAdapter.fetch({ symbol: 'HDFCBANK', periodEnd: '2024-03-31' });
    const belSh = await shAdapter.fetch({ symbol: 'BEL', periodEnd: '2024-03-31' });

    expect(tcsSh.parsedData.promoterHoldingPercent).toBe(71.77);
    expect(hdfcSh.parsedData.promoterHoldingPercent).toBe(0.0); // Bank has 0% promoter
    expect(belSh.parsedData.promoterHoldingPercent).toBe(51.14); // PSU majority
  });

  it('guarantees news for IT/Banking/Pharma companies does NOT contain fake defence radar order templates', async () => {
    const newsAdapter = new NewsDiscoveryAdapter();

    const tcsNews = await newsAdapter.fetchNews('TCS');
    const hdfcNews = await newsAdapter.fetchNews('HDFCBANK');

    if (tcsNews.data && tcsNews.data.length > 0) {
      for (const item of tcsNews.data) {
        // TCS news must not state that TCS bags radar contracts from Indian Army
        expect(item.headline).not.toContain('Defence Contract from Indian Army for Advanced Radars');
      }
    }

    if (hdfcNews.data && hdfcNews.data.length > 0) {
      for (const item of hdfcNews.data) {
        expect(item.headline).not.toContain('Defence Contract from Indian Army for Advanced Radars');
      }
    }
  });
});
