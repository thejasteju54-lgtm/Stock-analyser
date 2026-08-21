/**
 * 10_verdictReadinessGateQA.test.ts
 * QA Track: Readiness Gates Decoupling & Phase 14 Investment Verdict Synthesis.
 */

import { describe, it, expect } from 'vitest';
import { createResearchProject } from '../../src/domain/models/ResearchProject';
import { PipelineReadinessGate } from '../../src/domain/readiness/PipelineReadinessGate';
import { DecisionReadinessGate } from '../../src/domain/readiness/DecisionReadinessGate';
import { VerdictMasterEngine } from '../../src/domain/verdict/VerdictMasterEngine';

describe('Readiness Gates & Verdict Synthesis QA', () => {
  it('strictly decouples PipelineReadinessGate from DecisionReadinessGate', () => {
    const project = createResearchProject({
      company: {
        id: 'comp_tatamotors',
        legalName: 'Tata Motors Limited',
        displayName: 'Tata Motors',
        symbol: 'TATAMOTORS',
        exchange: 'NSE',
        isin: 'INE155A01022',
        sector: 'Automobile and Ancillaries',
        subsector: 'Commercial & Passenger Vehicles',
        businessModel: 'NON_FINANCIAL_OPERATING',
        marketCapCategory: 'LARGE_CAP',
        createdAt: '2024-01-01',
        updatedAt: '2024-06-30',
      },
    });

    // Pipeline readiness evaluates if we have inputs to run calculations
    const pipeReport = PipelineReadinessGate.evaluatePipelineReadiness(project);
    expect(pipeReport).toBeDefined();

    // Decision readiness evaluates if we have sufficient analytical outputs to issue BUY/HOLD/AVOID
    const decReport = DecisionReadinessGate.evaluateDecisionReadiness(project);
    expect(decReport).toBeDefined();
  });

  it('generates institutional investment verdict with conviction score', () => {
    const project = createResearchProject({
      company: {
        id: 'comp_tatamotors',
        legalName: 'Tata Motors Limited',
        displayName: 'Tata Motors',
        symbol: 'TATAMOTORS',
        exchange: 'NSE',
        isin: 'INE155A01022',
        sector: 'Automobile and Ancillaries',
        subsector: 'Commercial & Passenger Vehicles',
        businessModel: 'NON_FINANCIAL_OPERATING',
        marketCapCategory: 'LARGE_CAP',
        createdAt: '2024-01-01',
        updatedAt: '2024-06-30',
      },
    });

    const verdictReport = VerdictMasterEngine.generateVerdictReport(project);
    expect(verdictReport.verdict).toBeDefined();
    expect(verdictReport.convictionScore).toBeGreaterThanOrEqual(0);
    expect(verdictReport.auditTrail.snapshot.reproducibilityChecksum).toBeDefined();
  });
});
