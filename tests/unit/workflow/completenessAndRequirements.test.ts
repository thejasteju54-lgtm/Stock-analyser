import { describe, it, expect } from 'vitest';
import { ResearchDocumentRequirementPolicy } from '../../../src/domain/documents/ResearchDocumentRequirementPolicy';
import { EvidenceCompletenessEngine } from '../../../src/domain/readiness/EvidenceCompletenessEngine';
import { createResearchProject } from '../../../src/domain/models/ResearchProject';
import { CompanyIdentity } from '../../../src/domain/models/Company';

describe('Phase 15 — Document Requirements & Independent Completeness', () => {
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

  it('evaluates document requirements accurately based on archetype', () => {
    const docs = [
      { id: 'd1', name: 'AR24.pdf', documentType: 'ANNUAL_REPORT' } as any,
      { id: 'd2', name: 'AR23.pdf', documentType: 'ANNUAL_REPORT' } as any,
      { id: 'd3', name: 'Shareholding_Q4.pdf', documentType: 'SHAREHOLDING_PATTERN' } as any,
    ];

    const reqs = ResearchDocumentRequirementPolicy.evaluateRequirements('OPERATING_INDUSTRIAL', docs);
    const arReq = reqs.find((r) => r.documentType === 'ANNUAL_REPORT');
    const shareReq = reqs.find((r) => r.documentType === 'SHAREHOLDING_PATTERN');
    const concallReq = reqs.find((r) => r.documentType === 'CONCALL_TRANSCRIPT');

    expect(arReq?.isSatisfied).toBe(true);
    expect(shareReq?.isSatisfied).toBe(true);
    expect(concallReq?.isSatisfied).toBe(false); // 0/2 available
  });

  it('evaluates completeness independently for all 11 pillars without generic averaging', () => {
    const project = createResearchProject({ company });
    project.facts = new Array(25).fill(null).map((_, i) => ({ id: `f${i}`, metric: `METRIC_${i}` } as any));
    project.fundamentalAnalysis = { overallScore: { score: 78 } } as any;

    const report = EvidenceCompletenessEngine.evaluateProjectCompleteness(project);

    expect(report.pillars['FINANCIAL_STATEMENTS'].status).toBe('COMPLETE');
    expect(report.pillars['FUNDAMENTAL_HEALTH'].status).toBe('COMPLETE');
    expect(report.pillars['TECHNICAL_STRUCTURE'].status).toBe('INSUFFICIENT');
    expect(report.pillars['TECHNICAL_STRUCTURE'].criticality).toBe('OPTIONAL');
  });
});
