import { describe, it, expect } from 'vitest';
import { PipelineReadinessGate } from '../../../src/domain/readiness/PipelineReadinessGate';
import { DecisionReadinessGate } from '../../../src/domain/readiness/DecisionReadinessGate';
import { createResearchProject } from '../../../src/domain/models/ResearchProject';
import { CompanyIdentity } from '../../../src/domain/models/Company';

describe('Phase 15 — Two Decoupled Readiness Gates', () => {
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

  it('PipelineReadinessGate allows pipeline to proceed when documents exist even if technical chart is missing', () => {
    const project = createResearchProject({ company });
    project.documents = [
      {
        id: 'doc_1',
        filename: 'Tata Motors FY24 Annual Report.pdf',
        documentType: 'ANNUAL_REPORT',
        processingStatus: 'READY',
        provenanceSourceType: 'PRIMARY_SOURCE_DERIVED',
        uploadedAt: new Date().toISOString(),
      } as any,
    ];

    const report = PipelineReadinessGate.evaluatePipelineReadiness(project);
    expect(report.isReadyForExecution).toBe(true);
    expect(report.gateStatus).toBe('WARNINGS_PRESENT'); // Warning for missing technical/news, but NOT blocked
    expect(report.blockers).toHaveLength(0);
  });

  it('DecisionReadinessGate blocks final BUY/HOLD/AVOID verdict when market price is critically stale (> 5 days)', () => {
    const project = createResearchProject({ company });
    project.facts = [{ id: 'f1', metric: 'REVENUE', value: 100000, reportingPeriod: { fiscalYear: 'FY24', rawPeriodString: 'FY24' } } as any];
    project.calculatedMetrics = [{ metricId: 'REVENUE_GROWTH', value: 12.5, period: 'FY24' } as any];

    // Set critically stale market price
    const staleDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    project.valuationAnalysis = {
      marketSnapshot: {
        currentPrice: 950,
        priceDate: staleDate,
      },
    } as any;

    const report = DecisionReadinessGate.evaluateDecisionReadiness(project);
    expect(report.isReadyForDecision).toBe(false);
    expect(report.gateStatus).toBe('BLOCKED');
    expect(report.blockers[0]).toContain('Market price is critically stale');
  });
});
