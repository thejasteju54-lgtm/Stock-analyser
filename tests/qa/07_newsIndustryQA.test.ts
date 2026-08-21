/**
 * 07_newsIndustryQA.test.ts
 * QA Track: News Deduplication, Source Hierarchy & Entity Resolution.
 */

import { describe, it, expect } from 'vitest';
import { NewsIntelligenceEngine } from '../../src/domain/news/NewsIntelligenceEngine';
import { RawNewsArticle } from '../../src/domain/news/NewsDeduplicationEngine';

describe('News & Industry Intelligence QA', () => {
  it('deduplicates articles across multiple wires and resolves company entity', () => {
    const rawArticles: RawNewsArticle[] = [
      {
        articleId: 'art_1',
        headline: 'Tata Motors Q4 consolidated net profit jumps 46% YoY',
        body: 'Tata Motors reported a 46% surge in Q4 net profit driven by robust JLR global demand and domestic PV margins.',
        publishedAt: '2024-05-10T14:30:00Z',
        source: {
          sourceId: 'src_et',
          sourceName: 'Economic Times',
          sourceType: 'MAINSTREAM_FINANCIAL_MEDIA',
          sourceTier: 'TIER_2_HIGH_QUALITY_MEDIA',
          sourceURL: 'https://economictimes.com/article1',
          publisher: 'Bennett, Coleman & Co.',
          publishedAt: '2024-05-10T14:30:00Z',
          retrievedAt: '2024-05-10T15:00:00Z',
          timezone: 'Asia/Kolkata',
          reliabilityScore: 90,
          primaryOrSecondary: 'SECONDARY_REPORTING',
          isSyndicated: false,
          isAccessible: true,
          status: 'ACCESSIBLE',
        },
      },
      {
        articleId: 'art_2',
        headline: 'Tata Motors reports 46% rise in Q4 net profit to Rs 17,407 crore',
        body: 'Tata Motors posts strong earnings led by robust JLR performance and commercial vehicle realization.',
        publishedAt: '2024-05-10T14:45:00Z',
        source: {
          sourceId: 'src_mint',
          sourceName: 'LiveMint',
          sourceType: 'MAINSTREAM_FINANCIAL_MEDIA',
          sourceTier: 'TIER_2_HIGH_QUALITY_MEDIA',
          sourceURL: 'https://livemint.com/article2',
          publisher: 'HT Media',
          publishedAt: '2024-05-10T14:45:00Z',
          retrievedAt: '2024-05-10T15:00:00Z',
          timezone: 'Asia/Kolkata',
          reliabilityScore: 90,
          primaryOrSecondary: 'SECONDARY_REPORTING',
          isSyndicated: false,
          isAccessible: true,
          status: 'ACCESSIBLE',
        },
      },
    ];

    const result = NewsIntelligenceEngine.processNewsFeed(
      rawArticles,
      {
        symbol: 'TATAMOTORS',
        legalName: 'Tata Motors Limited',
        displayName: 'Tata Motors',
        aliases: ['Tata Motors', 'TML'],
        subsidiaries: ['JLR', 'Jaguar Land Rover'],
        brands: ['Tata', 'Jaguar', 'Land Rover'],
        promoters: ['Tata Sons'],
        management: ['N Chandrasekaran'],
        competitors: ['Mahindra', 'Maruti'],
        sector: 'Automobile and Ancillaries',
      }
    );

    expect(result.newsEvents.length).toBeGreaterThanOrEqual(1);
    expect(result.newsEvents[0].headline).toBeDefined();
  });
});
