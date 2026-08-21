import { describe, it, expect } from 'vitest';
import { AnalysisDependencyGraph } from '../../../src/domain/orchestration/AnalysisDependencyGraph';

describe('Phase 15 — Shareholding Change Propagation', () => {
  it('propagates shareholding pattern updates to all actually dependent analytical layers', () => {
    const invalidated = AnalysisDependencyGraph.getInvalidatedPhasesForInput('SHAREHOLDING_PATTERN');

    // Must invalidate Forensics (pledge/governance) and Management (promoter changes)
    expect(invalidated).toContain('PHASE_7_FORENSIC');
    expect(invalidated).toContain('PHASE_8_MANAGEMENT');

    // Must propagate downstream to Catalysts/Risks, Scenarios, Verdict, and Report
    expect(invalidated).toContain('PHASE_12_CATALYSTS_RISKS');
    expect(invalidated).toContain('PHASE_13_SCENARIOS');
    expect(invalidated).toContain('PHASE_14_VERDICT');
    expect(invalidated).toContain('PHASE_15_REPORT');

    // Unrelated upstream calculations must remain unaffected
    expect(invalidated).not.toContain('PHASE_5_CALCULATIONS');
    expect(invalidated).not.toContain('PHASE_10_TECHNICAL');
  });
});
