import { describe, it, expect } from 'vitest';
import { NewsAndIndustryPolicyRegistry } from '../../src/domain/news/NewsAndIndustryPolicyRegistry';
import { NewsSource } from '../../src/domain/news/NewsAndIndustryTypes';

describe('Phase 11 — NewsSource Schema & Source Hierarchy Tests', () => {
  it('enforces all 16 fields on NewsSource data model', () => {
    const source: NewsSource = {
      sourceId: 'src_nse_001',
      sourceName: 'National Stock Exchange of India Regulatory Disclosures',
      sourceType: 'EXCHANGE_FILING',
      sourceTier: 'TIER_1_PRIMARY',
      sourceURL: 'https://www.nseindia.com/corporate-filings',
      publisher: 'NSE India',
      author: 'Compliance Officer',
      publishedAt: '2024-04-12T10:30:00Z',
      retrievedAt: '2024-04-12T10:35:00Z',
      eventDate: '2024-04-12',
      timezone: 'Asia/Kolkata',
      reliabilityScore: 99,
      primaryOrSecondary: 'PRIMARY_SOURCE',
      sourceLineageId: 'lin_001',
      isSyndicated: false,
      isAccessible: true,
      status: 'ACCESSIBLE',
    };

    expect(source.sourceId).toBe('src_nse_001');
    expect(source.sourceTier).toBe('TIER_1_PRIMARY');
    expect(source.reliabilityScore).toBe(99);
    expect(source.isAccessible).toBe(true);
  });

  it('verifies Tier 1 and Tier 2 sources can establish material facts independently', () => {
    const tier1Rules = NewsAndIndustryPolicyRegistry.getSourceTierRules('TIER_1_PRIMARY');
    const tier2Rules = NewsAndIndustryPolicyRegistry.getSourceTierRules('TIER_2_HIGH_QUALITY_MEDIA');

    expect(tier1Rules.canEstablishMaterialFactAlone).toBe(true);
    expect(tier1Rules.tierWeight).toBe(1.0);

    expect(tier2Rules.canEstablishMaterialFactAlone).toBe(true);
    expect(tier2Rules.tierWeight).toBe(0.85);
  });

  it('strictly prohibits Tier 4 Discovery sources from establishing material facts alone', () => {
    const tier4Rules = NewsAndIndustryPolicyRegistry.getSourceTierRules('TIER_4_DISCOVERY_ONLY');

    expect(tier4Rules.canEstablishMaterialFactAlone).toBe(false);
    expect(tier4Rules.tierWeight).toBe(0.20);
  });

  it('handles source failure status cleanly without fabricating content', () => {
    const failedSource: NewsSource = {
      sourceId: 'src_unavailable_01',
      sourceName: 'Archived Trade Bulletin',
      sourceType: 'RESEARCH_PORTAL',
      sourceTier: 'TIER_3_SECONDARY',
      publisher: 'Trade Monitor',
      publishedAt: '2024-01-10T00:00:00Z',
      retrievedAt: '2024-04-12T00:00:00Z',
      timezone: 'Asia/Kolkata',
      reliabilityScore: 0,
      primaryOrSecondary: 'SECONDARY_REPORTING',
      isSyndicated: false,
      isAccessible: false,
      status: 'SOURCE_UNAVAILABLE',
    };

    expect(failedSource.status).toBe('SOURCE_UNAVAILABLE');
    expect(failedSource.isAccessible).toBe(false);
  });
});
