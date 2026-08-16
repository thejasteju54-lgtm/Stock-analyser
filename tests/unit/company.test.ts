import { describe, it, expect } from 'vitest';
import { validateCompanyIdentity, createCompanyEntity } from '../../src/domain/models/Company';

describe('Phase 2 — Company Entity & Validation', () => {
  it('validates a correct Indian company entity', () => {
    const result = validateCompanyIdentity({
      legalName: 'Infosys Limited',
      symbol: 'INFY',
      exchange: 'NSE',
      sector: 'IT Services',
      subsector: 'Tier 1 IT Exporters',
      isin: 'INE009A01021',
    });

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects empty company legal name and invalid symbols', () => {
    const result = validateCompanyIdentity({
      legalName: '',
      symbol: 'INVALID SYMBOL WITH SPACES!',
      exchange: 'NSE',
      sector: 'IT Services',
      subsector: 'Tier 1 IT Exporters',
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Company legal name is required.');
    expect(result.errors.some((e) => e.includes('Stock symbol must contain only uppercase'))).toBe(true);
  });

  it('rejects unknown sectors and mismatched subsectors', () => {
    const unknownSectorResult = validateCompanyIdentity({
      legalName: 'Test Corp',
      symbol: 'TESTCORP',
      exchange: 'NSE',
      sector: 'SyntheticSectorNotReal',
      subsector: 'Sub',
    });
    expect(unknownSectorResult.isValid).toBe(false);
    expect(unknownSectorResult.errors.some((e) => e.includes('not recognized in the SectorTaxonomy'))).toBe(true);

    const mismatchedSubResult = validateCompanyIdentity({
      legalName: 'Test Corp',
      symbol: 'TESTCORP',
      exchange: 'NSE',
      sector: 'Banking',
      subsector: 'Rolling Stock & Wagons', // Belongs to Railways, not Banking
    });
    expect(mismatchedSubResult.isValid).toBe(false);
    expect(mismatchedSubResult.errors.some((e) => e.includes('is not a valid subsector of "Banking"'))).toBe(true);
  });

  it('creates an immutable CompanyIdentity entity with business model classification', () => {
    const company = createCompanyEntity({
      legalName: 'HDFC Bank Limited',
      displayName: 'HDFC Bank',
      symbol: 'HDFCBANK',
      exchange: 'NSE',
      sector: 'Banking',
      subsector: 'Private Sector Bank',
      marketCapCategory: 'LARGE_CAP',
    });

    expect(company.id).toBe('co_nse_hdfcbank');
    expect(company.legalName).toBe('HDFC Bank Limited');
    expect(company.displayName).toBe('HDFC Bank');
    expect(company.businessModel).toBe('BANKING');
    expect(company.marketCapCategory).toBe('LARGE_CAP');
  });

  it('throws an explicit error when attempting to instantiate an invalid company', () => {
    expect(() =>
      createCompanyEntity({
        legalName: 'Ab', // too short
        symbol: '',
        exchange: 'NSE',
        sector: 'Banking',
        subsector: 'Private Sector Bank',
      })
    ).toThrowError(/Cannot create company entity/i);
  });
});
