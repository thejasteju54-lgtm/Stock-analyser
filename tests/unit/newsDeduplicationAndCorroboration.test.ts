import { describe, it, expect } from 'vitest';
import { NewsDeduplicationEngine, RawNewsArticle } from '../../src/domain/news/NewsDeduplicationEngine';

describe('Phase 11 — News Deduplication & Multi-Source Corroboration Tests', () => {
  const articles: RawNewsArticle[] = [
    {
      articleId: 'art_filing',
      headline: 'Tata Motors bags ₹3,500 Cr EV bus contract from DTC',
      body: 'Official corporate disclosure regarding supply of 2,500 low floor electric buses.',
      publishedAt: '2024-04-12T10:00:00Z',
      source: {
        sourceId: 'src_filing_1',
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
    {
      articleId: 'art_reuters',
      headline: 'Tata Motors wins ₹3,500 Cr electric bus order from DTC',
      body: 'Reuters reports that Tata Motors secured a 2,500 electric bus order from Delhi.',
      publishedAt: '2024-04-12T10:30:00Z',
      source: {
        sourceId: 'src_reuters_1',
        sourceName: 'Reuters',
        sourceType: 'MAINSTREAM_FINANCIAL_MEDIA',
        sourceTier: 'TIER_2_HIGH_QUALITY_MEDIA',
        publisher: 'Reuters',
        publishedAt: '2024-04-12T10:30:00Z',
        retrievedAt: '2024-04-12T10:35:00Z',
        timezone: 'Asia/Kolkata',
        reliabilityScore: 90,
        primaryOrSecondary: 'SECONDARY_REPORTING',
        isSyndicated: true,
        isAccessible: true,
        status: 'ACCESSIBLE',
      },
    },
    {
      articleId: 'art_moneycontrol',
      headline: 'Tata Motors shares rise as firm bags ₹3,500 Cr bus contract',
      body: 'Moneycontrol wire coverage of the DTC electric bus tender award.',
      publishedAt: '2024-04-12T11:00:00Z',
      source: {
        sourceId: 'src_mc_1',
        sourceName: 'Moneycontrol',
        sourceType: 'MAINSTREAM_FINANCIAL_MEDIA',
        sourceTier: 'TIER_2_HIGH_QUALITY_MEDIA',
        publisher: 'Moneycontrol',
        publishedAt: '2024-04-12T11:00:00Z',
        retrievedAt: '2024-04-12T11:05:00Z',
        timezone: 'Asia/Kolkata',
        reliabilityScore: 85,
        primaryOrSecondary: 'SECONDARY_REPORTING',
        isSyndicated: true,
        isAccessible: true,
        status: 'ACCESSIBLE',
      },
    },
    {
      articleId: 'art_separate_event',
      headline: 'Tata Motors launches updated Safari facelift with ADAS Level 2',
      body: 'Product launch event showcasing new safety features in flagship SUV.',
      publishedAt: '2024-04-15T09:00:00Z',
      source: {
        sourceId: 'src_autocar_1',
        sourceName: 'Autocar India',
        sourceType: 'RESEARCH_PORTAL',
        sourceTier: 'TIER_3_SECONDARY',
        publisher: 'Autocar',
        publishedAt: '2024-04-15T09:00:00Z',
        retrievedAt: '2024-04-15T09:05:00Z',
        timezone: 'Asia/Kolkata',
        reliabilityScore: 75,
        primaryOrSecondary: 'PRIMARY_SOURCE',
        isSyndicated: false,
        isAccessible: true,
        status: 'ACCESSIBLE',
      },
    },
  ];

  it('clusters syndicated/rewritten news into a SINGLE canonical event with multi-source confirmations', () => {
    const clusters = NewsDeduplicationEngine.clusterArticles(articles);

    // Should create 2 distinct clusters: 1 for DTC Bus Order, 1 for Safari Product Launch
    expect(clusters.length).toBe(2);

    const busCluster = clusters.find((c) => c.canonicalHeadline.includes('₹3,500 Cr'));
    expect(busCluster).toBeDefined();
    expect(busCluster?.sources.length).toBe(3); // Filing + Reuters + Moneycontrol
    expect(busCluster?.corroborationStatus).toBe('PRIMARY_CONFIRMED');
    expect(busCluster?.primarySourceCount).toBe(1);
    expect(busCluster?.independentSourceCount).toBe(3);
  });

  it('preserves genuinely separate events as independent clusters', () => {
    const clusters = NewsDeduplicationEngine.clusterArticles(articles);
    const productCluster = clusters.find((c) => c.canonicalHeadline.includes('Safari facelift'));

    expect(productCluster).toBeDefined();
    expect(productCluster?.sources.length).toBe(1);
    expect(productCluster?.corroborationStatus).toBe('SECONDARY_ONLY');
  });
});
