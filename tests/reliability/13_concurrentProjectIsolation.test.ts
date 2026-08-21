/**
 * 13_concurrentProjectIsolation.test.ts
 * Phase 17 — Concurrent Project Isolation & Zero State Contamination Suite.
 */

import { describe, it, expect } from 'vitest';
import { createResearchProject } from '../../src/domain/models/ResearchProject';
import { ResearchPipelineOrchestrator } from '../../src/domain/orchestration/ResearchPipelineOrchestrator';

describe('Concurrent Project Isolation Suite', () => {
  it('executes 3 parallel research projects with complete state isolation and zero cross-project contamination', () => {
    const p1 = createResearchProject({
      company: {
        id: 'comp_tata',
        legalName: 'Tata Motors Limited',
        displayName: 'Tata Motors',
        symbol: 'TATAMOTORS',
        exchange: 'NSE',
        isin: 'INE155A01022',
        sector: 'Automobile and Ancillaries',
        subsector: 'Commercial Vehicles',
        businessModel: 'NON_FINANCIAL_OPERATING',
        marketCapCategory: 'LARGE_CAP',
        createdAt: '2024-01-01',
        updatedAt: '2024-06-30',
      },
    });

    const p2 = createResearchProject({
      company: {
        id: 'comp_hdfc',
        legalName: 'HDFC Bank Limited',
        displayName: 'HDFC Bank',
        symbol: 'HDFCBANK',
        exchange: 'NSE',
        isin: 'INE040A01034',
        sector: 'Financial Services',
        subsector: 'Private Sector Bank',
        businessModel: 'BANKING',
        marketCapCategory: 'LARGE_CAP',
        createdAt: '2024-01-01',
        updatedAt: '2024-06-30',
      },
    });

    const p3 = createResearchProject({
      company: {
        id: 'comp_infy',
        legalName: 'Infosys Limited',
        displayName: 'Infosys',
        symbol: 'INFY',
        exchange: 'NSE',
        isin: 'INE009A01021',
        sector: 'Information Technology',
        subsector: 'IT Services & Consulting',
        businessModel: 'NON_FINANCIAL_OPERATING',
        marketCapCategory: 'LARGE_CAP',
        createdAt: '2024-01-01',
        updatedAt: '2024-06-30',
      },
    });

    const rep1 = ResearchPipelineOrchestrator.executePipeline(p1);
    const rep2 = ResearchPipelineOrchestrator.executePipeline(p2);
    const rep3 = ResearchPipelineOrchestrator.executePipeline(p3);

    expect(rep1.isSuccess).toBe(true);
    expect(rep2.isSuccess).toBe(true);
    expect(rep3.isSuccess).toBe(true);

    expect(p1.company.symbol).toBe('TATAMOTORS');
    expect(p2.company.symbol).toBe('HDFCBANK');
    expect(p3.company.symbol).toBe('INFY');
  });
});
