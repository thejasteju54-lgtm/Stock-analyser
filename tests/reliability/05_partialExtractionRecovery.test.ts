/**
 * 05_partialExtractionRecovery.test.ts
 * Phase 17 — Partial Statement Extraction & Downstream Gating Suite.
 */

import { describe, it, expect } from 'vitest';
import { StressWorkloadHarness } from '../../src/domain/reliability/StressWorkloadHarness';
import { FinancialCalculationEngine } from '../../src/domain/calculations/FinancialCalculationEngine';

describe('Partial Extraction Recovery & Downstream Gating Suite', () => {
  it('preserves usable financial facts when Cash Flow statement is missing without substituting 0 for CFO or FCF', () => {
    // Missing Cash Flow statement
    const facts = StressWorkloadHarness.generatePartialExtractionScenario('INFY', 'CASH_FLOW');

    const metrics = FinancialCalculationEngine.calculateAllMetrics(
      'proj_infy',
      'INFY',
      'NON_FINANCIAL_OPERATING',
      facts
    );

    const fcfMetric = metrics.find((m) => m.metricCode === 'FREE_CASH_FLOW' || m.metricCode === 'FCF');
    const cfoMetric = metrics.find((m) => m.metricCode === 'CFO_TO_PAT');

    // Neither CFO nor FCF should be silently converted to 0
    if (fcfMetric) {
      expect(fcfMetric.status === 'MISSING_INPUT' || fcfMetric.status === 'NOT_CALCULABLE' || fcfMetric.value === undefined || fcfMetric.value === null).toBe(true);
    }
    if (cfoMetric) {
      expect(cfoMetric.status === 'MISSING_INPUT' || cfoMetric.status === 'NOT_CALCULABLE' || cfoMetric.value === undefined || cfoMetric.value === null).toBe(true);
    }

    // Revenue & PAT calculations should remain valid
    const patMargin = metrics.find((m) => m.metricCode === 'PAT_MARGIN');
    expect(patMargin).toBeDefined();
    if (patMargin && patMargin.value !== null && patMargin.value !== undefined) {
      expect(patMargin.value).toBe(12); // (6000 / 50000) * 100 = 12%
    }
  });
});
