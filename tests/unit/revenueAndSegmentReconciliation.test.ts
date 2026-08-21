/**
 * revenueAndSegmentReconciliation.test.ts
 * Phase 13 — Segment Sum & Revenue Reconciliation Tests.
 * Verifies sum(segments) = consolidated revenue and SCENARIO_INCONSISTENCY error trigger.
 */

import { describe, it, expect } from 'vitest';
import { RevenueDriverPolicyRegistry } from '../../src/domain/scenarios/RevenueDriverPolicyRegistry';
import { SegmentProjection } from '../../src/domain/scenarios/ScenarioTypes';

describe('Phase 13 — Revenue & Segment Sum Reconciliation', () => {
  it('reconciles when sum of segment revenue equals consolidated revenue within 0.5%', () => {
    const segments: SegmentProjection[] = [
      {
        segmentId: 'seg_cv',
        segmentName: 'Commercial Vehicles',
        historicalRevenue: 4000,
        historicalGrowthPercent: 10,
        projectedRevenue: 4400,
        projectedGrowthPercent: 10,
        historicalMarginPercent: 12,
        projectedMarginPercent: 12,
        capexAllocation: 400,
        workingCapitalAllocation: 600,
        evidenceReferences: ['Annual Report Segment Reporting Note 34'],
        confidence: 90,
      },
      {
        segmentId: 'seg_pv',
        segmentName: 'Passenger Vehicles',
        historicalRevenue: 6000,
        historicalGrowthPercent: 15,
        projectedRevenue: 6600,
        projectedGrowthPercent: 10,
        historicalMarginPercent: 8,
        projectedMarginPercent: 8,
        capexAllocation: 600,
        workingCapitalAllocation: 900,
        evidenceReferences: ['Annual Report Segment Reporting Note 34'],
        confidence: 90,
      },
    ];

    const res = RevenueDriverPolicyRegistry.reconcileSegments(segments, 11000);
    expect(res.isReconciled).toBe(true);
    expect(res.sumOfSegments).toBe(11000);
    expect(res.variancePercent).toBe(0);
    expect(res.statusMessage).toContain('RECONCILED');
  });

  it('triggers SCENARIO_INCONSISTENCY when sum of segments differs by > 0.5%', () => {
    const brokenSegments: SegmentProjection[] = [
      {
        segmentId: 'seg_1',
        segmentName: 'Domestic',
        historicalRevenue: 5000,
        historicalGrowthPercent: 5,
        projectedRevenue: 5200,
        projectedGrowthPercent: 4,
        historicalMarginPercent: 10,
        projectedMarginPercent: 10,
        capexAllocation: 200,
        workingCapitalAllocation: 500,
        evidenceReferences: [],
        confidence: 80,
      },
      {
        segmentId: 'seg_2',
        segmentName: 'International',
        historicalRevenue: 5000,
        historicalGrowthPercent: 5,
        projectedRevenue: 5200,
        projectedGrowthPercent: 4,
        historicalMarginPercent: 10,
        projectedMarginPercent: 10,
        capexAllocation: 200,
        workingCapitalAllocation: 500,
        evidenceReferences: [],
        confidence: 80,
      },
    ];

    // Consolidated revenue is 12,000, but sum of segments is 10,400 (variance > 13%)
    const res = RevenueDriverPolicyRegistry.reconcileSegments(brokenSegments, 12000);
    expect(res.isReconciled).toBe(false);
    expect(res.variancePercent).toBeGreaterThan(0.5);
    expect(res.statusMessage).toContain('SCENARIO_INCONSISTENCY');
  });
});
