import { describe, it, expect } from 'vitest';
import { IndustryAnalysisEngine } from '../../src/domain/industry/IndustryAnalysisEngine';

describe('Phase 11 — Competitor Peer Benchmarking & Value Chain Tests', () => {
  it('builds competitor matrix with reporting period disclosures and verified market shares', () => {
    const competitors = IndustryAnalysisEngine.getCompetitors('TATAMOTORS');

    expect(competitors.length).toBeGreaterThan(0);
    const maruti = competitors.find((c) => c.symbol === 'MARUTI');

    expect(maruti).toBeDefined();
    expect(maruti?.revenuePeriod).toBe('FY24');
    expect(maruti?.growthPeriod).toBe('FY24 YoY');
    expect(maruti?.marketShare).toBe(41.5);
    expect(maruti?.sources.length).toBeGreaterThan(0);
  });

  it('maps complete 5-stage value chain highlighting company active presence and risks', () => {
    const profile = IndustryAnalysisEngine.generateIndustryProfile('Automobile', 'Automotive OEM', 'TATAMOTORS');

    expect(profile.valueChain.length).toBe(5);

    const oemStage = profile.valueChain.find((s) => s.stageName === 'MANUFACTURING');
    expect(oemStage).toBeDefined();
    expect(oemStage?.isCompanyPresent).toBe(true);
    expect(oemStage?.marginCaptureEstimatedPercent).toBe(14);
    expect(oemStage?.upstreamRisks.length).toBeGreaterThan(0);
  });

  it('evaluates company industry position relative to peers and sector benchmarks', () => {
    const competitors = IndustryAnalysisEngine.getCompetitors('TATAMOTORS');
    const position = IndustryAnalysisEngine.evaluateCompanyPosition('TATAMOTORS', competitors);

    expect(position.marketPosition).toBe('STRONG');
    expect(position.growthRelativeToIndustry).toBe('ABOVE_AVERAGE');
    expect(position.pricingPower).toBe('MODERATE');
  });
});
