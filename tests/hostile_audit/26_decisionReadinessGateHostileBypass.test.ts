/**
 * 26_decisionReadinessGateHostileBypass.test.ts
 * Phase 19 — Hostile Decision Readiness Gate Bypass Suite.
 */

import { describe, it, expect } from 'vitest';
import { DecisionReadinessGate } from '../../src/domain/readiness/DecisionReadinessGate';
import { createResearchProject } from '../../src/domain/models/ResearchProject';

describe('Decision Readiness Gate Hostile Bypass Suite', () => {
  it('strictly blocks decision readiness when market price, facts, or calculations are missing', () => {
    // Project with no facts or market price
    const emptyProject = createResearchProject({
      company: {
        id: 'comp_tata_empty',
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

    const readiness = DecisionReadinessGate.evaluateDecisionReadiness(emptyProject);
    expect(readiness.isReadyForDecision).toBe(false);
    expect(readiness.gateStatus).toBe('BLOCKED');
    expect(readiness.blockers.length).toBeGreaterThanOrEqual(2);
  });
});
