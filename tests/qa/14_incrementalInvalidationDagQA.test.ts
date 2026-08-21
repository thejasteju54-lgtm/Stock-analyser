/**
 * 14_incrementalInvalidationDagQA.test.ts
 * QA Track: Phase 15 Single DAG Upstream Dirty-State Invalidation.
 */

import { describe, it, expect } from 'vitest';
import { AnalysisDependencyGraph } from '../../src/domain/orchestration/AnalysisDependencyGraph';

describe('Incremental Invalidation DAG QA', () => {
  it('correctly calculates invalidated downstream phases when market price ticks change', () => {
    const invalidated = AnalysisDependencyGraph.getInvalidatedPhasesForInput('MARKET_PRICE_TICK');
    expect(invalidated).toContain('PHASE_9_VALUATION');
    expect(invalidated).toContain('PHASE_13_SCENARIOS');
    expect(invalidated).toContain('PHASE_14_VERDICT');
    // Financial calculations should NOT be invalidated by a price tick
    expect(invalidated).not.toContain('PHASE_5_CALCULATIONS');
  });

  it('correctly invalidates entire downstream pipeline when annual report changes', () => {
    const invalidated = AnalysisDependencyGraph.getInvalidatedPhasesForInput('ANNUAL_REPORT_FILING');
    expect(invalidated).toContain('PHASE_5_CALCULATIONS');
    expect(invalidated).toContain('PHASE_6_FUNDAMENTAL');
    expect(invalidated).toContain('PHASE_7_FORENSIC');
    expect(invalidated).toContain('PHASE_9_VALUATION');
    expect(invalidated).toContain('PHASE_14_VERDICT');
  });
});
