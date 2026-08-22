import { describe, it, expect } from 'vitest';
import { CompanyResolutionEngine } from '../../../src/domain/dataAcquisition/CompanyResolutionEngine';

describe('Phase 21 — Company Resolution Engine', () => {
  it('resolves Bharat Electronics by ticker, legal name, BSE code, and ISIN', async () => {
    const resByTicker = await CompanyResolutionEngine.resolve('BEL');
    expect(resByTicker.symbolNSE).toBe('BEL');
    expect(resByTicker.codeBSE).toBe('500049');
    expect(resByTicker.isin).toBe('INE263A01024');
    expect(resByTicker.legalName).toContain('Bharat Electronics');
    expect(resByTicker.sector).toBe('Capital Goods');
    expect(resByTicker.confidence).toBe('HIGH');

    const resByName = await CompanyResolutionEngine.resolve('Bharat Electronics');
    expect(resByName.symbolNSE).toBe('BEL');

    const resByBse = await CompanyResolutionEngine.resolve('500049');
    expect(resByBse.symbolNSE).toBe('BEL');

    const resByIsin = await CompanyResolutionEngine.resolve('INE263A01024');
    expect(resByIsin.symbolNSE).toBe('BEL');
  });

  it('resolves Tata Motors across aliases', async () => {
    const res = await CompanyResolutionEngine.resolve('TATAMOTORS');
    expect(res.symbolNSE).toBe('TATAMOTORS');
    expect(res.codeBSE).toBe('500570');
    expect(res.sector).toBe('AUTOMOBILE');
  });

  it('creates deterministic fallback canonical company for any valid ticker', async () => {
    const res = await CompanyResolutionEngine.resolve('INFY');
    expect(res.symbolNSE).toBe('INFY');
    expect(res.canonicalCompanyId).toBe('comp_infy');
    expect(res.confidence).toBe('MEDIUM');
  });

  it('throws an error for empty queries', async () => {
    await expect(CompanyResolutionEngine.resolve('')).rejects.toThrow('Company query cannot be empty');
  });
});
