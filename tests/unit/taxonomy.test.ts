import { describe, it, expect } from 'vitest';
import {
  getAllSectors,
  getSectorDefinition,
  getSubsectorsForSector,
  isForensicModelApplicable,
  isValuationModelApplicable,
} from '../../src/domain/taxonomy/SectorTaxonomyRegistry';

describe('Phase 2 — SectorTaxonomy Registry', () => {
  it('contains at least 30 distinct Indian industry verticals', () => {
    const sectors = getAllSectors();
    expect(sectors.length).toBeGreaterThanOrEqual(30);
    expect(sectors).toContain('Banking');
    expect(sectors).toContain('NBFC');
    expect(sectors).toContain('Insurance');
    expect(sectors).toContain('IT Services');
    expect(sectors).toContain('Pharma');
    expect(sectors).toContain('Automobile');
    expect(sectors).toContain('FMCG');
    expect(sectors).toContain('Capital Goods');
    expect(sectors).toContain('REIT');
    expect(sectors).toContain('InvIT');
    expect(sectors).toContain('Defence');
  });

  it('correctly maps Banking sector to BANKING business model and credit forensic models', () => {
    const bankingDef = getSectorDefinition('Banking');
    expect(bankingDef).toBeDefined();
    expect(bankingDef?.businessModel).toBe('BANKING');
    expect(bankingDef?.subsectors).toContain('Private Sector Bank');

    // Banking should NOT have Beneish M-Score or Working Capital Cycle
    expect(isForensicModelApplicable('Banking', 'BENEISH_M_SCORE')).toBe(false);
    expect(isForensicModelApplicable('Banking', 'WORKING_CAPITAL_CYCLE')).toBe(false);

    // Banking SHOULD have NPA/PCR quality and Capital Dilution
    expect(isForensicModelApplicable('Banking', 'NPA_PCR_QUALITY')).toBe(true);
    expect(isForensicModelApplicable('Banking', 'REST_ASSET_MONITOR')).toBe(true);

    // Banking Valuation models
    expect(isValuationModelApplicable('Banking', 'PB_ABV')).toBe(true);
    expect(isValuationModelApplicable('Banking', 'PE')).toBe(true);
    expect(isValuationModelApplicable('Banking', 'EV_EBITDA')).toBe(false); // Inappropriate for Banks
  });

  it('correctly maps Non-Financial Operating sectors (Automobile, IT Services) to industrial forensic models', () => {
    const autoDef = getSectorDefinition('Automobile');
    expect(autoDef?.businessModel).toBe('NON_FINANCIAL_OPERATING');
    expect(isForensicModelApplicable('Automobile', 'BENEISH_M_SCORE')).toBe(true);
    expect(isForensicModelApplicable('Automobile', 'ALTMAN_Z_SCORE')).toBe(true);
    expect(isForensicModelApplicable('Automobile', 'WORKING_CAPITAL_CYCLE')).toBe(true);
    expect(isForensicModelApplicable('Automobile', 'CFO_PAT_DIVERGENCE')).toBe(true);

    // Automobile Valuation models
    expect(isValuationModelApplicable('Automobile', 'EV_EBITDA')).toBe(true);
    expect(isValuationModelApplicable('Automobile', 'DCF')).toBe(true);
  });

  it('correctly retrieves subsectors for a given sector', () => {
    const itSubsectors = getSubsectorsForSector('IT Services');
    expect(itSubsectors).toContain('Tier 1 IT Exporters');
    expect(itSubsectors).toContain('Mid-Cap Digital Services');

    const nonExistent = getSubsectorsForSector('CryptoMining');
    expect(nonExistent).toEqual([]);
  });
});
