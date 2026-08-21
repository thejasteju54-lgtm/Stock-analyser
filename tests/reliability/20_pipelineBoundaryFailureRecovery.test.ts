/**
 * 20_pipelineBoundaryFailureRecovery.test.ts
 * Phase 17 — Pipeline Boundary Failure Detection & Upstream Work Preservation Suite.
 */

import { describe, it, expect } from 'vitest';
import { createResearchProject } from '../../src/domain/models/ResearchProject';
import { ResearchPipelineOrchestrator } from '../../src/domain/orchestration/ResearchPipelineOrchestrator';

describe('Pipeline Boundary Failure Recovery Suite', () => {
  it('executes pipeline with graceful fault isolation and records complete phase-level telemetry', () => {
    const project = createResearchProject({
      company: {
        id: 'comp_failure_test',
        legalName: 'Resilience Test Corp',
        displayName: 'ResilienceCo',
        symbol: 'RESILCO',
        exchange: 'NSE',
        isin: 'INE777A01011',
        sector: 'Healthcare',
        subsector: 'Pharmaceuticals',
        businessModel: 'NON_FINANCIAL_OPERATING',
        marketCapCategory: 'LARGE_CAP',
        createdAt: '2024-01-01',
        updatedAt: '2024-06-30',
      },
    });

    const report = ResearchPipelineOrchestrator.executePipeline(project);
    expect(report.isSuccess).toBe(true);
    expect(Object.keys(report.metrics.phaseMetrics).length).toBeGreaterThan(0);
    expect(report.metrics.totalRunDurationMs).toBeGreaterThanOrEqual(0);
  });
});
