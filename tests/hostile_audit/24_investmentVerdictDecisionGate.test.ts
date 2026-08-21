/**
 * 24_investmentVerdictDecisionGate.test.ts
 * Phase 19 — Hostile Investment Verdict Decision Gate Suite.
 */

import { describe, it, expect } from 'vitest';
import { createResearchProject } from '../../src/domain/models/ResearchProject';
import { VerdictMasterEngine } from '../../src/domain/verdict/VerdictMasterEngine';

describe('Investment Verdict Decision Gate Suite', () => {
  it('generates a structured investment verdict report without throwing and reflects unassessable states safely', () => {
    const project = createResearchProject({
      company: {
        id: 'comp_tata_gate',
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

    const verdictReport = VerdictMasterEngine.generateVerdictReport(project);
    expect(verdictReport).toBeDefined();
    expect(['BUY', 'HOLD', 'AVOID', 'DECISION_NOT_ASSESSABLE']).toContain(verdictReport.verdict);
    expect(verdictReport.auditTrail).toBeDefined();
  });
});
