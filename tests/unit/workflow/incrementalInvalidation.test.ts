import { describe, it, expect } from 'vitest';
import { AnalysisDependencyGraph, UpstreamInputCategory } from '../../../src/domain/orchestration/AnalysisDependencyGraph';

describe('Phase 15 — Incremental Invalidation Engine', () => {
  const testCases: { input: UpstreamInputCategory; expectedInvalidated: string[]; expectedUntouched: string[] }[] = [
    {
      input: 'ANNUAL_REPORT_FILING',
      expectedInvalidated: ['PHASE_5_CALCULATIONS', 'PHASE_6_FUNDAMENTAL', 'PHASE_7_FORENSIC', 'PHASE_8_MANAGEMENT', 'PHASE_9_VALUATION', 'PHASE_12_CATALYSTS_RISKS', 'PHASE_13_SCENARIOS', 'PHASE_14_VERDICT', 'PHASE_15_REPORT'],
      expectedUntouched: ['PHASE_10_TECHNICAL', 'PHASE_11_NEWS_INDUSTRY'],
    },
    {
      input: 'CONCALL_TRANSCRIPT',
      expectedInvalidated: ['PHASE_8_MANAGEMENT', 'PHASE_12_CATALYSTS_RISKS', 'PHASE_13_SCENARIOS', 'PHASE_14_VERDICT', 'PHASE_15_REPORT'],
      expectedUntouched: ['PHASE_5_CALCULATIONS', 'PHASE_6_FUNDAMENTAL', 'PHASE_7_FORENSIC', 'PHASE_9_VALUATION', 'PHASE_10_TECHNICAL'],
    },
    {
      input: 'MARKET_PRICE_TICK',
      expectedInvalidated: ['PHASE_9_VALUATION', 'PHASE_10_TECHNICAL', 'PHASE_13_SCENARIOS', 'PHASE_14_VERDICT', 'PHASE_15_REPORT'],
      expectedUntouched: ['PHASE_5_CALCULATIONS', 'PHASE_6_FUNDAMENTAL', 'PHASE_7_FORENSIC', 'PHASE_8_MANAGEMENT'],
    },
    {
      input: 'TECHNICAL_CHART_OHLCV',
      expectedInvalidated: ['PHASE_10_TECHNICAL', 'PHASE_14_VERDICT', 'PHASE_15_REPORT'],
      expectedUntouched: ['PHASE_5_CALCULATIONS', 'PHASE_6_FUNDAMENTAL', 'PHASE_7_FORENSIC', 'PHASE_8_MANAGEMENT', 'PHASE_9_VALUATION', 'PHASE_13_SCENARIOS'],
    },
    {
      input: 'CORPORATE_NEWS_EVENT',
      expectedInvalidated: ['PHASE_11_NEWS_INDUSTRY', 'PHASE_12_CATALYSTS_RISKS', 'PHASE_13_SCENARIOS', 'PHASE_14_VERDICT', 'PHASE_15_REPORT'],
      expectedUntouched: ['PHASE_5_CALCULATIONS', 'PHASE_6_FUNDAMENTAL', 'PHASE_7_FORENSIC', 'PHASE_8_MANAGEMENT', 'PHASE_9_VALUATION', 'PHASE_10_TECHNICAL'],
    },
    {
      input: 'REGULATORY_FILING',
      expectedInvalidated: ['PHASE_7_FORENSIC', 'PHASE_11_NEWS_INDUSTRY', 'PHASE_12_CATALYSTS_RISKS', 'PHASE_13_SCENARIOS', 'PHASE_14_VERDICT', 'PHASE_15_REPORT'],
      expectedUntouched: ['PHASE_5_CALCULATIONS', 'PHASE_6_FUNDAMENTAL', 'PHASE_10_TECHNICAL'],
    },
    {
      input: 'SHAREHOLDING_PATTERN',
      expectedInvalidated: ['PHASE_7_FORENSIC', 'PHASE_8_MANAGEMENT', 'PHASE_12_CATALYSTS_RISKS', 'PHASE_13_SCENARIOS', 'PHASE_14_VERDICT', 'PHASE_15_REPORT'],
      expectedUntouched: ['PHASE_5_CALCULATIONS', 'PHASE_6_FUNDAMENTAL', 'PHASE_10_TECHNICAL'],
    },
    {
      input: 'VALUATION_ASSUMPTION_OVERRIDE',
      expectedInvalidated: ['PHASE_9_VALUATION', 'PHASE_13_SCENARIOS', 'PHASE_14_VERDICT', 'PHASE_15_REPORT'],
      expectedUntouched: ['PHASE_5_CALCULATIONS', 'PHASE_6_FUNDAMENTAL', 'PHASE_7_FORENSIC', 'PHASE_8_MANAGEMENT', 'PHASE_10_TECHNICAL'],
    },
    {
      input: 'MANAGEMENT_GUIDANCE_UPDATE',
      expectedInvalidated: ['PHASE_8_MANAGEMENT', 'PHASE_12_CATALYSTS_RISKS', 'PHASE_13_SCENARIOS', 'PHASE_14_VERDICT', 'PHASE_15_REPORT'],
      expectedUntouched: ['PHASE_5_CALCULATIONS', 'PHASE_6_FUNDAMENTAL', 'PHASE_7_FORENSIC', 'PHASE_9_VALUATION', 'PHASE_10_TECHNICAL'],
    },
    {
      input: 'INDUSTRY_SECTOR_DATA',
      expectedInvalidated: ['PHASE_11_NEWS_INDUSTRY', 'PHASE_12_CATALYSTS_RISKS', 'PHASE_13_SCENARIOS', 'PHASE_14_VERDICT', 'PHASE_15_REPORT'],
      expectedUntouched: ['PHASE_5_CALCULATIONS', 'PHASE_6_FUNDAMENTAL', 'PHASE_7_FORENSIC', 'PHASE_8_MANAGEMENT', 'PHASE_9_VALUATION', 'PHASE_10_TECHNICAL'],
    },
  ];

  testCases.forEach(({ input, expectedInvalidated, expectedUntouched }) => {
    it(`correctly invalidates downstream dependencies for ${input}`, () => {
      const invalidated = AnalysisDependencyGraph.getInvalidatedPhasesForInput(input);

      for (const phase of expectedInvalidated) {
        expect(invalidated, `Expected ${phase} to be invalidated for ${input}`).toContain(phase);
      }

      for (const phase of expectedUntouched) {
        expect(invalidated, `Expected ${phase} to remain untouched for ${input}`).not.toContain(phase);
      }
    });
  });
});
