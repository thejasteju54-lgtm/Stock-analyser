import { describe, it, expect } from 'vitest';
import { NewsIntelligenceEngine } from '../../src/domain/news/NewsIntelligenceEngine';
import { RawNewsArticle } from '../../src/domain/news/NewsDeduplicationEngine';

describe('Phase 11 — Source Conflicts & Rumor / Speculation Handling Tests', () => {
  const companyProfile = {
    symbol: 'TATAMOTORS',
    legalName: 'Tata Motors Limited',
    displayName: 'Tata Motors',
    aliases: ['Tata Motors Ltd'],
    subsidiaries: ['JLR'],
    brands: ['Nexon'],
    promoters: ['Tata Sons'],
    management: ['PB Balaji'],
    competitors: ['Maruti Suzuki'],
    sector: 'Automobile',
  };

  it('detects and logs source conflicts when primary filing contradicts discovery claim', () => {
    const conflictingArticles: RawNewsArticle[] = [
      {
        articleId: 'art_filing_official',
        headline: 'Tata Motors denies EV merger buyout talks in official BSE disclosure',
        body: 'Official BSE disclosure clarifying that company is not pursuing EV division merger.',
        publishedAt: '2024-04-10T10:00:00Z',
        source: {
          sourceId: 'src_bse_1',
          sourceName: 'BSE India Disclosures',
          sourceType: 'EXCHANGE_FILING',
          sourceTier: 'TIER_1_PRIMARY',
          publisher: 'BSE',
          publishedAt: '2024-04-10T10:00:00Z',
          retrievedAt: '2024-04-10T10:05:00Z',
          timezone: 'Asia/Kolkata',
          reliabilityScore: 99,
          primaryOrSecondary: 'PRIMARY_SOURCE',
          isSyndicated: false,
          isAccessible: true,
          status: 'ACCESSIBLE',
        },
      },
      {
        articleId: 'art_blog_rumor',
        headline: 'Tata Motors rumoured for EV merger buyout in social media blog',
        body: 'Unverified blog speculating on multi-billion dollar private equity buyout.',
        publishedAt: '2024-04-10T09:30:00Z',
        source: {
          sourceId: 'src_blog_1',
          sourceName: 'Market Gossip Forum',
          sourceType: 'BLOG_OR_FORUM',
          sourceTier: 'TIER_4_DISCOVERY_ONLY',
          publisher: 'Blog',
          publishedAt: '2024-04-10T09:30:00Z',
          retrievedAt: '2024-04-10T09:35:00Z',
          timezone: 'Asia/Kolkata',
          reliabilityScore: 20,
          primaryOrSecondary: 'SECONDARY_REPORTING',
          isSyndicated: false,
          isAccessible: true,
          status: 'ACCESSIBLE',
        },
      },
    ];

    const res = NewsIntelligenceEngine.processNewsFeed(conflictingArticles, companyProfile);

    expect(res.sourceConflicts.length).toBeGreaterThan(0);
    const conflict = res.sourceConflicts[0];
    expect(conflict.resolution).toBe('RESOLVED_BY_PRIMARY_SOURCE');
    expect(conflict.status).toBe('RESOLVED');
  });

  it('applies rumor penalties to materiality score for unconfirmed/rumoured news', () => {
    const rumorArticles: RawNewsArticle[] = [
      {
        articleId: 'art_rumor',
        headline: 'Tata Motors rumoured to acquire European battery manufacturer',
        body: 'Unconfirmed reports suggest talks are ongoing.',
        publishedAt: '2024-04-18T10:00:00Z',
        source: {
          sourceId: 'src_spec_1',
          sourceName: 'Daily Wire',
          sourceType: 'RESEARCH_PORTAL',
          sourceTier: 'TIER_3_SECONDARY',
          publisher: 'Daily Wire',
          publishedAt: '2024-04-18T10:00:00Z',
          retrievedAt: '2024-04-18T10:05:00Z',
          timezone: 'Asia/Kolkata',
          reliabilityScore: 50,
          primaryOrSecondary: 'SECONDARY_REPORTING',
          isSyndicated: false,
          isAccessible: true,
          status: 'ACCESSIBLE',
        },
      },
    ];

    const res = NewsIntelligenceEngine.processNewsFeed(rumorArticles, companyProfile);
    const event = res.newsEvents[0];

    // Due to rumor deduction (-20 pts), score should be restrained
    expect(event.confidence).toBeLessThan(60);
  });
});
