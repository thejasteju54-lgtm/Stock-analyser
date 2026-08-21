/**
 * 14_incrementalDagPerformance.test.ts
 * Phase 17 — Incremental DAG Invalidation & Re-Execution Performance Suite.
 */

import { describe, it, expect } from 'vitest';
import { createResearchProject } from '../../src/domain/models/ResearchProject';
import { ResearchPipelineOrchestrator } from '../../src/domain/orchestration/ResearchPipelineOrchestrator';
import { AnalysisDependencyGraph } from '../../src/domain/orchestration/AnalysisDependencyGraph';
import { PerformanceBenchmarkEngine } from '../../src/domain/reliability/PerformanceBenchmarkEngine';

describe('Incremental DAG Performance Suite', () => {
  it('demonstrates measurable performance gain on incremental invalidation vs full pipeline execution', () => {
    const project = createResearchProject({
      company: {
        id: 'comp_tatamotors',
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

    // Full run
    const fullBenchmark = PerformanceBenchmarkEngine.measureSync(
      'ANALYSIS_EXECUTION',
      () => ResearchPipelineOrchestrator.executePipeline(project)
    );

    // Incremental run on market price update
    const downstreamPhases = AnalysisDependencyGraph.getInvalidatedPhasesForInput('MARKET_PRICE_TICK');
    const incBenchmark = PerformanceBenchmarkEngine.measureSync(
      'ANALYSIS_EXECUTION',
      () => ResearchPipelineOrchestrator.executePipeline(project, downstreamPhases)
    );

    expect(fullBenchmark.result.isSuccess).toBe(true);
    expect(incBenchmark.result.isSuccess).toBe(true);
    expect(fullBenchmark.result.runType).toBe('FULL_RUN');
    expect(incBenchmark.result.runType).toBe('INCREMENTAL_RUN');
    expect(incBenchmark.result.executedPhases.length).toBeLessThan(fullBenchmark.result.executedPhases.length);
  });
});
