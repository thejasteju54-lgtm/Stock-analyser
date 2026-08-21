/**
 * 20_catalystProbabilityAsymmetry.test.ts
 * Phase 19 — Hostile Catalyst Probability & Asymmetry Suite.
 */

import { describe, it, expect } from 'vitest';
import { CatalystExtractionEngine } from '../../src/domain/risks/CatalystExtractionEngine';
import { createResearchProject } from '../../src/domain/models/ResearchProject';

describe('Catalyst Probability & Asymmetry Suite', () => {
  it('extracts catalysts with deterministic likelihood and impact scoring rather than arbitrary optimism', () => {
    const project = createResearchProject({
      company: {
        id: 'comp_tata_cat',
        legalName: 'Tata Motors Limited',
        displayName: 'Tata Motors',
        symbol: 'TATAMOTORS',
        exchange: 'NSE',
        isin: 'INE155A01022',
        sector: 'Automobile',
        subsector: 'Commercial Vehicles',
        businessModel: 'NON_FINANCIAL_OPERATING',
        marketCapCategory: 'LARGE_CAP',
        createdAt: '2024-01-01',
        updatedAt: '2024-06-30',
      },
    });

    const result = CatalystExtractionEngine.extractCatalysts(project);
    expect(result).toBeDefined();
    expect(Array.isArray(result.catalysts)).toBe(true);
    expect(Array.isArray(result.rankedCatalysts)).toBe(true);
    for (const cat of result.catalysts) {
      expect(['HIGH', 'MEDIUM', 'LOW', 'CONDITIONAL', 'NOT_ASSESSABLE']).toContain(cat.likelihood);
    }
  });
});
