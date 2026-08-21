import { describe, it, expect } from 'vitest';
import { AnalysisDependencyGraph } from '../../../src/domain/orchestration/AnalysisDependencyGraph';

describe('Phase 15 — Canonical Analysis Dependency Graph', () => {
  it('validates graph topology against phase contracts with zero cycles and zero unreachable nodes', () => {
    const val = AnalysisDependencyGraph.validateDependencyGraphAgainstPhaseContracts();

    expect(val.isValid).toBe(true);
    expect(val.cycleDetected).toBe(false);
    expect(val.unreachablePhases).toHaveLength(0);
    expect(val.errors).toHaveLength(0);
    expect(val.totalEdges).toBeGreaterThanOrEqual(18);
  });

  it('correctly computes direct upstream and downstream dependencies', () => {
    const p5Downstream = AnalysisDependencyGraph.getDirectDownstreamPhases('PHASE_5_CALCULATIONS');
    expect(p5Downstream).toContain('PHASE_6_FUNDAMENTAL');
    expect(p5Downstream).toContain('PHASE_7_FORENSIC');
    expect(p5Downstream).toContain('PHASE_9_VALUATION');
    expect(p5Downstream).toContain('PHASE_13_SCENARIOS');

    const verdictUpstream = AnalysisDependencyGraph.getDirectUpstreamPhases('PHASE_14_VERDICT');
    expect(verdictUpstream).toContain('PHASE_6_FUNDAMENTAL');
    expect(verdictUpstream).toContain('PHASE_7_FORENSIC');
    expect(verdictUpstream).toContain('PHASE_8_MANAGEMENT');
    expect(verdictUpstream).toContain('PHASE_9_VALUATION');
    expect(verdictUpstream).toContain('PHASE_10_TECHNICAL');
    expect(verdictUpstream).toContain('PHASE_11_NEWS_INDUSTRY');
    expect(verdictUpstream).toContain('PHASE_12_CATALYSTS_RISKS');
    expect(verdictUpstream).toContain('PHASE_13_SCENARIOS');
  });
});
