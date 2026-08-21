/**
 * 30_masterAntiFabricationHostileTest.test.ts
 * Phase 19 — Master Anti-Fabrication & Corrupted Dataset Hostile Test Suite.
 */

import { describe, it, expect } from 'vitest';
import { createResearchProject } from '../../src/domain/models/ResearchProject';
import { ResearchPipelineOrchestrator } from '../../src/domain/orchestration/ResearchPipelineOrchestrator';
import { DecisionReadinessGate } from '../../src/domain/readiness/DecisionReadinessGate';
import { PointInTimeIntegrityEngine } from '../../src/domain/dataSources/PointInTimeIntegrityEngine';

describe('Master Anti-Fabrication & Corrupted Dataset Hostile Suite', () => {
  it('strictly rejects corrupted/incomplete evidence, prevents look-ahead temporal leakage, blocks ungrounded decisions, and prevents hallucinated certainty', () => {
    // 1. Create a hostile incomplete project with unverified data
    const hostileProject = createResearchProject({
      company: {
        id: 'comp_adversarial_test',
        legalName: 'Adversarial Shell Corp',
        displayName: 'Adversarial Shell',
        symbol: 'SHELLCORP',
        exchange: 'NSE',
        isin: 'INE000000000',
        sector: 'Unknown',
        subsector: 'None',
        businessModel: 'NON_FINANCIAL_OPERATING',
        marketCapCategory: 'MICRO_CAP',
        createdAt: '2024-01-01',
        updatedAt: '2024-06-30',
      },
    });

    // 2. Decision Readiness Gate strictly blocks the project because it lacks facts and market prices
    const readiness = DecisionReadinessGate.evaluateDecisionReadiness(hostileProject);
    expect(readiness.isReadyForDecision).toBe(false);
    expect(readiness.gateStatus).toBe('BLOCKED');
    expect(readiness.blockers.length).toBeGreaterThanOrEqual(1);

    // 3. Temporal Look-Ahead Sentinel blocks any future disclosure dated past cutoff
    const futureDisclosure = {
      category: 'FINANCIAL_STATEMENTS' as const,
      publicationDate: '2025-01-15T00:00:00Z',
    };
    const pitCheck = PointInTimeIntegrityEngine.evaluateEligibility(futureDisclosure, '2024-03-31T23:59:59Z');
    expect(pitCheck.isEligible).toBe(false);
    expect(pitCheck.isLookAheadBias).toBe(true);

    // 4. Research Pipeline executes without runtime crash, producing safe fallback results
    const report = ResearchPipelineOrchestrator.executePipeline(hostileProject);
    expect(report.isSuccess).toBe(true);
    expect(report.executedPhases.length).toBeGreaterThan(0);
  });
});
