import { describe, it, expect } from 'vitest';
import { NewsAndIndustryPolicyRegistry } from '../../src/domain/news/NewsAndIndustryPolicyRegistry';
import { NewsIntelligenceEngine } from '../../src/domain/news/NewsIntelligenceEngine';
import { RawNewsArticle } from '../../src/domain/news/NewsDeduplicationEngine';

describe('Phase 11 — Catalysts, Upcoming Events & Materiality Scoring Tests', () => {
  it('calculates deterministic materiality scores using exact mathematical weights', () => {
    // High materiality case: DIRECT_COMPANY (30), MATERIAL (25), TIER_1 (18+7=25), STRUCTURAL (20) = 100
    const maxScore = NewsAndIndustryPolicyRegistry.calculateMaterialityScore({
      relevance: 'DIRECT_COMPANY',
      magnitude: 'MATERIAL',
      horizon: 'STRUCTURAL',
      highestSourceTier: 'TIER_1_PRIMARY',
      isCorroborated: true,
      hasConflict: false,
      certainty: 'CONFIRMED',
    });

    expect(maxScore).toBe(100);

    // Minor sector case: SECTOR_ONLY (10), LOW (5), TIER_3 (0.6*18=11), SHORT_TERM (8) = ~34
    const minorScore = NewsAndIndustryPolicyRegistry.calculateMaterialityScore({
      relevance: 'SECTOR_ONLY',
      magnitude: 'LOW',
      horizon: 'SHORT_TERM',
      highestSourceTier: 'TIER_3_SECONDARY',
      isCorroborated: false,
      hasConflict: false,
      certainty: 'CONFIRMED',
    });

    expect(minorScore).toBe(34);
  });

  it('correctly maps material positive order win to CatalystEvent structure', () => {
    const articles: RawNewsArticle[] = [
      {
        articleId: 'art_cat',
        headline: 'Tata Motors bags ₹3,500 Cr EV bus contract from DTC',
        body: 'Substantial commercial vehicle EV expansion.',
        publishedAt: '2024-04-12T10:00:00Z',
        source: {
          sourceId: 'src_cat_1',
          sourceName: 'NSE Disclosures',
          sourceType: 'EXCHANGE_FILING',
          sourceTier: 'TIER_1_PRIMARY',
          publisher: 'NSE India',
          publishedAt: '2024-04-12T10:00:00Z',
          retrievedAt: '2024-04-12T10:05:00Z',
          timezone: 'Asia/Kolkata',
          reliabilityScore: 99,
          primaryOrSecondary: 'PRIMARY_SOURCE',
          isSyndicated: false,
          isAccessible: true,
          status: 'ACCESSIBLE',
        },
      },
    ];

    const companyProfile = {
      symbol: 'TATAMOTORS',
      legalName: 'Tata Motors Limited',
      displayName: 'Tata Motors',
      aliases: [],
      subsidiaries: [],
      brands: [],
      promoters: [],
      management: [],
      competitors: [],
      sector: 'Automobile',
    };

    const res = NewsIntelligenceEngine.processNewsFeed(articles, companyProfile);

    expect(res.catalysts.length).toBeGreaterThan(0);
    const cat = res.catalysts[0];
    expect(cat.financialChannel).toBe('REVENUE');
    expect(cat.status).toBe('COMPLETED');
  });
});
