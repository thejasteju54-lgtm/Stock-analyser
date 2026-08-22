import { describe, it, expect } from 'vitest';
import { NewsDeduplicationEngine } from '../../../src/domain/dataAcquisition/NewsDeduplicationEngine';
import { SourceIndependenceEngine } from '../../../src/domain/dataAcquisition/SourceIndependenceEngine';
import { DiscoveredNewsEventItem } from '../../../src/infrastructure/researchSources/SourceAdapterTypes';

describe('Phase 21 — News Deduplication & Source Independence', () => {
  it('groups syndicated wire articles under a single duplicateGroupId', () => {
    const articles: DiscoveredNewsEventItem[] = [
      {
        eventId: 'news_1',
        headline: 'BEL bags ₹1,150 crore radar order',
        summary: 'PTI wire summary',
        source: 'PTI Wire',
        sourceTier: 4,
        publicationDate: '2024-06-12',
        eventDate: '2024-06-12',
        companySymbol: 'BEL',
        eventType: 'ORDER_WIN',
        materiality: 'HIGH',
        impactDirection: 'POSITIVE',
        duplicateGroupId: 'wire_order_bel_1',
        isSyndicated: true,
      },
      {
        eventId: 'news_2',
        headline: 'BEL bags ₹1,150 crore radar order from Army',
        summary: 'Reuters wire summary',
        source: 'Reuters',
        sourceTier: 4,
        publicationDate: '2024-06-12',
        eventDate: '2024-06-12',
        companySymbol: 'BEL',
        eventType: 'ORDER_WIN',
        materiality: 'HIGH',
        impactDirection: 'POSITIVE',
        duplicateGroupId: 'wire_order_bel_1',
        isSyndicated: true,
      },
      {
        eventId: 'news_3',
        headline: 'CRISIL reaffirms AAA rating on BEL',
        summary: 'Rating announcement',
        source: 'CRISIL',
        sourceTier: 3,
        publicationDate: '2024-07-18',
        eventDate: '2024-07-18',
        companySymbol: 'BEL',
        eventType: 'CREDIT_RATING',
        materiality: 'MEDIUM',
        impactDirection: 'POSITIVE',
        duplicateGroupId: 'wire_crisil_bel_1',
        isSyndicated: false,
      },
    ];

    const deduplicated = NewsDeduplicationEngine.deduplicateNews(articles);
    expect(deduplicated.length).toBe(2);

    const orderGroup = deduplicated.find((g) => g.duplicateGroupId === 'wire_order_bel_1');
    expect(orderGroup).toBeDefined();
    expect(orderGroup!.totalArticles).toBe(2);
    expect(orderGroup!.sources).toContain('PTI Wire');
    expect(orderGroup!.sources).toContain('Reuters');
    expect(orderGroup!.isSyndicated).toBe(true);
  });

  it('evaluates source independence accurately', () => {
    const exchangeFiling = { name: 'NSE Regulatory Filing', tier: 1 as const };
    const newsQuote = { name: 'Financial Daily', tier: 4 as const };

    const assessment = SourceIndependenceEngine.assessIndependence(exchangeFiling, newsQuote);
    expect(assessment.relationship).toBe('DERIVED');
    expect(assessment.effectiveConfirmationCount).toBe(1);

    const ratingDoc = { name: 'CRISIL Ratings', tier: 3 as const };
    const bankResearch = { name: 'Institutional Research', tier: 3 as const };

    const independentAssessment = SourceIndependenceEngine.assessIndependence(ratingDoc, bankResearch);
    expect(independentAssessment.relationship).toBe('INDEPENDENT');
    expect(independentAssessment.effectiveConfirmationCount).toBe(2);
  });
});
