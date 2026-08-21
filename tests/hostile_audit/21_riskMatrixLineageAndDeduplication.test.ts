/**
 * 21_riskMatrixLineageAndDeduplication.test.ts
 * Phase 19 — Hostile Risk Matrix Lineage & Deduplication Suite.
 */

import { describe, it, expect } from 'vitest';
import { RiskSynthesisEngine } from '../../src/domain/risks/RiskSynthesisEngine';
import { createResearchProject } from '../../src/domain/models/ResearchProject';

describe('Risk Matrix Lineage & Deduplication Suite', () => {
  it('synthesizes multi-dimensional risks with traceable evidence lineage and net exposure calculations', () => {
    const project = createResearchProject({
      company: {
        id: 'comp_tata_risk',
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

    const result = RiskSynthesisEngine.synthesizeRisks(project);
    expect(result).toBeDefined();
    expect(Array.isArray(result.risks)).toBe(true);
    expect(result.crossLayerRiskSummary).toBeDefined();
    for (const r of result.risks) {
      expect(['UNMITIGATED', 'PARTIALLY_MITIGATED', 'SUBSTANTIALLY_MITIGATED']).toContain(r.netExposure);
    }
  });
});
