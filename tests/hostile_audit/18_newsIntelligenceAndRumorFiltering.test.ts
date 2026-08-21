/**
 * 18_newsIntelligenceAndRumorFiltering.test.ts
 * Phase 19 — Hostile News Intelligence, Syndicated Duplicates & Rumor Filtering Suite.
 */

import { describe, it, expect } from 'vitest';
import { NewsDeduplicationEngine, RawNewsArticle } from '../../src/domain/news/NewsDeduplicationEngine';
import { EntityResolutionEngine, CompanyEntityProfile } from '../../src/domain/news/EntityResolutionEngine';

describe('News Intelligence & Rumor Filtering Suite', () => {
  it('deduplicates identical syndicated wire stories while preserving source lineage', () => {
    const rawArticles: RawNewsArticle[] = [
      {
        articleId: 'art_1',
        headline: 'Tata Motors Q4 Profit surges 46% on strong JLR sales',
        body: 'Tata Motors posted a 46% surge in consolidated net profit.',
        publishedAt: '2024-05-10T14:00:00Z',
        source: {
          sourceId: 'src_et',
          sourceName: 'Economic Times',
          sourceType: 'MAINSTREAM_FINANCIAL_MEDIA',
          sourceTier: 'TIER_2_HIGH_QUALITY_MEDIA',
          sourceURL: 'https://economictimes.indiatimes.com/news/1',
          publisher: 'Economic Times',
          publishedAt: '2024-05-10T14:00:00Z',
          retrievedAt: '2024-05-10T14:10:00Z',
          timezone: 'Asia/Kolkata',
          reliabilityScore: 85,
          primaryOrSecondary: 'SECONDARY_REPORTING',
          isSyndicated: false,
          isAccessible: true,
          status: 'ACCESSIBLE',
        },
      },
      {
        articleId: 'art_2',
        headline: 'Tata Motors Q4 Profit surges 46% on strong JLR sales',
        body: 'Tata Motors posted a 46% surge in consolidated net profit.',
        publishedAt: '2024-05-10T14:05:00Z',
        source: {
          sourceId: 'src_mc',
          sourceName: 'Moneycontrol (PTI Syndicated)',
          sourceType: 'MAINSTREAM_FINANCIAL_MEDIA',
          sourceTier: 'TIER_2_HIGH_QUALITY_MEDIA',
          sourceURL: 'https://moneycontrol.com/news/2',
          publisher: 'Moneycontrol (PTI Syndicated)',
          publishedAt: '2024-05-10T14:05:00Z',
          retrievedAt: '2024-05-10T14:10:00Z',
          timezone: 'Asia/Kolkata',
          reliabilityScore: 80,
          primaryOrSecondary: 'SECONDARY_REPORTING',
          isSyndicated: true,
          isAccessible: true,
          status: 'ACCESSIBLE',
        },
      },
    ];

    const clusters = NewsDeduplicationEngine.clusterArticles(rawArticles);
    expect(clusters.length).toBe(1);
    expect(clusters[0].sources.length).toBe(2);
  });

  it('correctly resolves company aliases and identifies company relevance', () => {
    const profile: CompanyEntityProfile = {
      symbol: 'TATAMOTORS',
      legalName: 'Tata Motors Limited',
      displayName: 'Tata Motors',
      aliases: ['TML'],
      subsidiaries: ['Jaguar Land Rover', 'JLR'],
      brands: ['Harrier', 'Safari', 'Nexon'],
      promoters: ['Tata Sons'],
      management: [],
      competitors: ['Maruti Suzuki'],
      sector: 'Automobile',
    };

    const targetResult = EntityResolutionEngine.resolveEntities(
      'Tata Motors announces new EV lineup in Pune plant',
      'The company announced investments in electric vehicle production.',
      profile
    );
    expect(targetResult.relevance).toBe('DIRECT_COMPANY');

    const competitorResult = EntityResolutionEngine.resolveEntities(
      'Maruti Suzuki opens new dealership in Bangalore',
      'Expansion continues across southern India.',
      profile
    );
    expect(competitorResult.relevance).not.toBe('DIRECT_COMPANY');
  });
});
