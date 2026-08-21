import { describe, it, expect } from 'vitest';
import { ResearchSnapshotEngine } from '../../../src/domain/snapshots/ResearchSnapshotEngine';
import { ResearchChangeDetectionEngine } from '../../../src/domain/snapshots/ResearchChangeDetectionEngine';
import { createResearchProject } from '../../../src/domain/models/ResearchProject';
import { CompanyIdentity } from '../../../src/domain/models/Company';

describe('Phase 15 — Snapshots & Change Detection Engine', () => {
  const company: CompanyIdentity = {
    id: 'comp_1',
    displayName: 'Tata Motors Ltd',
    legalName: 'Tata Motors Limited',
    symbol: 'TATAMOTORS',
    isin: 'INE155A01022',
    exchange: 'NSE',
    sector: 'AUTOMOBILE',
    subsector: 'PASSENGER_CARS',
    marketCapCategory: 'LARGE_CAP',
    businessModel: 'NON_FINANCIAL_OPERATING',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  it('creates immutable ResearchSnapshot with full reproducibility metadata', () => {
    const project = createResearchProject({ company });
    project.verdictAnalysis = {
      decision: 'BUY',
      convictionScore: 8.5,
      convictionBand: 'VERY_HIGH',
      priceAndValuation: {
        currentPrice: 900,
        intrinsicFairValue: 1150,
        actualMarginOfSafetyPercent: 21.7,
        freshnessStatus: 'CURRENT',
        priceDate: '2024-03-31',
        interestingPriceRange: { displayRange: '₹800 - ₹950', lowPrice: 800, highPrice: 950, impliedMarginOfSafetyPercent: 15 },
      },
      scenarios: {
        bearValuation: 750,
        baseValuation: 1150,
        bullValuation: 1450,
        expectedScenarioValue: 1120,
        areProbabilitiesPlaceholders: false,
        expectedValueStatus: 'EXPECTED_VALUE_ASSESSABLE',
      },
    } as any;

    const snapshot = ResearchSnapshotEngine.createSnapshot(project, undefined, 'Baseline research run');

    expect(snapshot.snapshotId).toBeDefined();
    expect(snapshot.codeVersion).toBe('1.0.0');
    expect(snapshot.gitCommit).toBeDefined();
    expect(snapshot.schemaVersion).toBe('v15.0');
    expect(snapshot.decision).toBe('BUY');
    expect(snapshot.convictionScore).toBe(8.5);
    expect(snapshot.hash).toHaveLength(64);
    expect(snapshot.inputHash).toHaveLength(64);
    expect(snapshot.outputHash).toHaveLength(64);
  });

  it('detects and explains verdict change (BUY -> HOLD) deterministically when price moves above fair value', () => {
    const project = createResearchProject({ company });
    project.verdictAnalysis = {
      decision: 'BUY',
      convictionScore: 8.5,
      priceAndValuation: { currentPrice: 850, intrinsicFairValue: 1100, actualMarginOfSafetyPercent: 22.7 },
      scenarios: { bearValuation: 750, baseValuation: 1100, bullValuation: 1400, expectedScenarioValue: 1080, areProbabilitiesPlaceholders: false },
    } as any;

    const snapA = ResearchSnapshotEngine.createSnapshot(project);

    // Update project state: Market price rallies to ₹1200 (MoS becomes negative)
    project.verdictAnalysis = {
      decision: 'HOLD',
      convictionScore: 7.0,
      priceAndValuation: { currentPrice: 1200, intrinsicFairValue: 1100, actualMarginOfSafetyPercent: -9.1 },
      scenarios: { bearValuation: 750, baseValuation: 1100, bullValuation: 1400, expectedScenarioValue: 1080, areProbabilitiesPlaceholders: false },
    } as any;

    const snapB = ResearchSnapshotEngine.createSnapshot(project, snapA.snapshotId);
    const comparison = ResearchChangeDetectionEngine.compareSnapshots(snapA, snapB);

    expect(comparison.decisionChange.isVerdictChanged).toBe(true);
    expect(comparison.decisionChange.fromVerdict).toBe('BUY');
    expect(comparison.decisionChange.toVerdict).toBe('HOLD');
    expect(comparison.decisionChange.priceDeltaPercent).toBeGreaterThan(0);
    expect(comparison.decisionChange.transitionReasonSummary).toContain('transitioned from BUY to HOLD');
  });
});
