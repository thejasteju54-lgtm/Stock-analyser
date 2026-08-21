import { describe, it, expect } from 'vitest';
import { createResearchProject } from '../../../src/domain/models/ResearchProject';
import { CompanyIdentity } from '../../../src/domain/models/Company';
import { ResearchPipelineOrchestrator } from '../../../src/domain/orchestration/ResearchPipelineOrchestrator';
import { ResearchSnapshotEngine } from '../../../src/domain/snapshots/ResearchSnapshotEngine';
import { InvestmentResearchReportEngine } from '../../../src/domain/reports/InvestmentResearchReportEngine';

describe('Phase 15 — Real Company Frozen Fixture End-to-End Test', () => {
  const tataMotorsCompany: CompanyIdentity = {
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

  it('runs complete deterministic end-to-end analytical workflow from ingestion to final 22-section report delivery', () => {
    // 1. Initialize project with frozen real-company documentary facts (Tata Motors FY23/FY24)
    const project = createResearchProject({ company: tataMotorsCompany });
    project.facts = [
      { id: 'f_rev_24', metric: 'REVENUE', value: 437928, unit: 'INR Cr', reportingPeriod: { fiscalYear: 'FY24', rawPeriodString: 'FY24' }, accountingBasis: 'CONSOLIDATED' },
      { id: 'f_rev_23', metric: 'REVENUE', value: 345967, unit: 'INR Cr', reportingPeriod: { fiscalYear: 'FY23', rawPeriodString: 'FY23' }, accountingBasis: 'CONSOLIDATED' },
      { id: 'f_ebitda_24', metric: 'EBITDA', value: 62450, unit: 'INR Cr', reportingPeriod: { fiscalYear: 'FY24', rawPeriodString: 'FY24' }, accountingBasis: 'CONSOLIDATED' },
      { id: 'f_ebitda_23', metric: 'EBITDA', value: 37011, unit: 'INR Cr', reportingPeriod: { fiscalYear: 'FY23', rawPeriodString: 'FY23' }, accountingBasis: 'CONSOLIDATED' },
      { id: 'f_pat_24', metric: 'PAT', value: 31807, unit: 'INR Cr', reportingPeriod: { fiscalYear: 'FY24', rawPeriodString: 'FY24' }, accountingBasis: 'CONSOLIDATED' },
      { id: 'f_pat_23', metric: 'PAT', value: 2690, unit: 'INR Cr', reportingPeriod: { fiscalYear: 'FY23', rawPeriodString: 'FY23' }, accountingBasis: 'CONSOLIDATED' },
      { id: 'f_cfo_24', metric: 'CFO', value: 58500, unit: 'INR Cr', reportingPeriod: { fiscalYear: 'FY24', rawPeriodString: 'FY24' }, accountingBasis: 'CONSOLIDATED' },
      { id: 'f_cfo_23', metric: 'CFO', value: 35000, unit: 'INR Cr', reportingPeriod: { fiscalYear: 'FY23', rawPeriodString: 'FY23' }, accountingBasis: 'CONSOLIDATED' },
      { id: 'f_debt_24', metric: 'TOTAL_DEBT', value: 85000, unit: 'INR Cr', reportingPeriod: { fiscalYear: 'FY24', rawPeriodString: 'FY24' }, accountingBasis: 'CONSOLIDATED' },
      { id: 'f_debt_23', metric: 'TOTAL_DEBT', value: 125000, unit: 'INR Cr', reportingPeriod: { fiscalYear: 'FY23', rawPeriodString: 'FY23' }, accountingBasis: 'CONSOLIDATED' },
      { id: 'f_cash_24', metric: 'CASH_AND_EQUIVALENTS', value: 40000, unit: 'INR Cr', reportingPeriod: { fiscalYear: 'FY24', rawPeriodString: 'FY24' }, accountingBasis: 'CONSOLIDATED' },
      { id: 'f_cash_23', metric: 'CASH_AND_EQUIVALENTS', value: 30000, unit: 'INR Cr', reportingPeriod: { fiscalYear: 'FY23', rawPeriodString: 'FY23' }, accountingBasis: 'CONSOLIDATED' },
      { id: 'f_nw_24', metric: 'NET_WORTH', value: 88000, unit: 'INR Cr', reportingPeriod: { fiscalYear: 'FY24', rawPeriodString: 'FY24' }, accountingBasis: 'CONSOLIDATED' },
      { id: 'f_nw_23', metric: 'NET_WORTH', value: 55000, unit: 'INR Cr', reportingPeriod: { fiscalYear: 'FY23', rawPeriodString: 'FY23' }, accountingBasis: 'CONSOLIDATED' },
    ] as any;

    project.managementClaims = [
      { id: 'c1', claimCategory: 'DELEVERAGING', originalQuote: 'We are on track to achieve net auto debt zero.', verifiedStatus: 'DELIVERED', reportingPeriod: { fiscalYear: 'FY24', rawPeriodString: 'FY24' } } as any,
    ];

    project.valuationAnalysis = {
      marketSnapshot: { currentPrice: 940, priceDate: '2024-03-31', shareCapital: { basicShares: 332, dilutedShares: 332 } },
      summary: { triangulatedFairValue: 1150, triangulationRationale: 'Sector Triangulation' },
    } as any;

    // 2. Execute Full Analytical Pipeline
    const execution = ResearchPipelineOrchestrator.executePipeline(project);
    expect(execution.isSuccess).toBe(true);
    expect(execution.executedPhases.length).toBeGreaterThanOrEqual(7);

    // 3. Verify Phase 14 Verdict Synthesis
    expect(project.verdictAnalysis).toBeDefined();
    const effectiveVerdict = project.verdictAnalysis?.verdict || (project.verdictAnalysis as any)?.decision;
    expect(effectiveVerdict).toBeDefined();
    expect(project.verdictAnalysis?.convictionScore).toBeGreaterThan(0);

    // 4. Capture Immutable Snapshot
    const snapshot = ResearchSnapshotEngine.createSnapshot(project, undefined, 'Baseline E2E Run');
    expect(snapshot.hash).toHaveLength(64);
    expect(snapshot.decision).toBe(effectiveVerdict);

    // 5. Assemble and Deliver 22-Section Canonical Report
    const report = InvestmentResearchReportEngine.generateReport(project, snapshot.snapshotId);
    expect(report.section1_CompanyOverview.symbol).toBe('TATAMOTORS');
    expect(report.section2_ExecutiveVerdict.verdict).toBe(effectiveVerdict);
    expect(report.section5_MarketPriceTelemetry.price).toBe(940);
    expect(report.section10_Valuation.baseFairValue).toBeGreaterThan(0);
    expect(report.reproducibilityChecksum).toHaveLength(64);
  });
});
