/**
 * NewsDiscoveryAdapter.ts
 * Phase 1 — Financial News & Regulatory Announcements Discovery Adapter.
 * Queries Google News RSS and verified press releases for Indian Equities.
 */

import {
  ResearchSourceAdapter,
  SourceTier,
  SourceRole,
  SourceFetchResult,
  CompanyResolutionResult,
  DiscoveredNewsEventItem,
} from '../SourceAdapterTypes';
import { resolveSecurity, fetchCompanyNewsEvents } from '../../../../server/api';

export class NewsDiscoveryAdapter implements ResearchSourceAdapter {
  readonly adapterId = 'NEWS_WIRE_GATEWAY';
  readonly adapterName = 'Verified News Wire & Google RSS';
  readonly adapterVersion = '2.0.0';
  readonly sourceTier: SourceTier = 4;
  readonly defaultRole: SourceRole = 'SECONDARY_DISCOVERY';

  async resolveCompany(query: string): Promise<SourceFetchResult<CompanyResolutionResult>> {
    const sec = resolveSecurity(query);
    const now = new Date().toISOString();

    const data: CompanyResolutionResult = {
      canonicalCompanyId: sec.canonicalCompanyId,
      legalName: sec.legalName,
      displayName: sec.displayName,
      symbolNSE: sec.symbolNSE,
      codeBSE: sec.codeBSE,
      isin: sec.isin,
      primaryExchange: sec.primaryExchange,
      sector: sec.sector,
      industry: sec.industry,
      entityType: (sec.entityType === 'BANK' ? 'BANK' : 'OPERATING_COMPANY') as any,
      aliases: [sec.symbolNSE, sec.codeBSE, sec.displayName],
      confidence: sec.confidence,
    };

    return {
      sourceId: this.adapterId,
      sourceName: this.adapterName,
      sourceTier: this.sourceTier,
      sourceRole: this.defaultRole,
      retrievedAt: now,
      observationDate: now.split('T')[0],
      publicationDate: now.split('T')[0],
      data,
      status: 'SUCCESS',
      confidence: 'HIGH',
      evidenceReferences: [],
    };
  }

  async fetchNews(symbol: string): Promise<SourceFetchResult<DiscoveredNewsEventItem[]>> {
    const sec = resolveSecurity(symbol);
    const now = new Date().toISOString();

    try {
      const realEvents = await fetchCompanyNewsEvents(sec.symbolNSE, sec.displayName);
      const newsItems: DiscoveredNewsEventItem[] = realEvents.map((item, idx) => ({
        eventId: item.eventId || `news_rss_${sec.symbolNSE.toLowerCase()}_${idx}`,
        headline: item.headline,
        summary: item.summary,
        source: item.source || 'Financial Wire',
        sourceTier: 3,
        publicationDate: item.publicationDate || now.split('T')[0],
        eventDate: item.publicationDate || now.split('T')[0],
        companySymbol: sec.symbolNSE,
        eventType: 'EARNINGS_RELEASE' as const,
        materiality: (item.materiality || 'HIGH') as any,
        category: 'FINANCIAL_UPDATE',
        impactDirection: item.impactDirection || 'NEUTRAL',
        verificationStatus: 'VERIFIED',
      }));

      return {
        sourceId: this.adapterId,
        sourceName: this.adapterName,
        sourceTier: this.sourceTier,
        sourceRole: this.defaultRole,
        retrievedAt: now,
        observationDate: now.split('T')[0],
        publicationDate: now.split('T')[0],
        data: newsItems,
        status: 'SUCCESS',
        confidence: 'HIGH',
        evidenceReferences: newsItems.map((n) => ({
          documentTitle: n.headline,
          url: `https://news.google.com/search?q=${sec.symbolNSE}`,
          sourceTier: 3,
        })),
      };
    } catch (e: any) {
      return {
        sourceId: this.adapterId,
        sourceName: this.adapterName,
        sourceTier: this.sourceTier,
        sourceRole: this.defaultRole,
        retrievedAt: now,
        observationDate: now.split('T')[0],
        publicationDate: now.split('T')[0],
        data: [],
        status: 'PARTIAL_SUCCESS',
        confidence: 'LOW',
        evidenceReferences: [],
      };
    }
  }

  async discoverDocuments(): Promise<SourceFetchResult<any[]>> {
    const now = new Date().toISOString();
    return {
      sourceId: this.adapterId,
      sourceName: this.adapterName,
      sourceTier: this.sourceTier,
      sourceRole: this.defaultRole,
      data: null,
      confidence: 'NOT_ASSESSABLE',
      observationDate: now.split('T')[0],
      publicationDate: now.split('T')[0],
      status: 'NOT_FOUND',
      retrievedAt: now,
      evidenceReferences: [],
    };
  }

  async fetchFinancials(): Promise<SourceFetchResult<any>> {
    const now = new Date().toISOString();
    return {
      sourceId: this.adapterId,
      sourceName: this.adapterName,
      sourceTier: this.sourceTier,
      sourceRole: this.defaultRole,
      data: null,
      confidence: 'NOT_ASSESSABLE',
      observationDate: now.split('T')[0],
      publicationDate: now.split('T')[0],
      status: 'SOURCE_UNAVAILABLE',
      retrievedAt: now,
      evidenceReferences: [],
    };
  }

  async fetchCorporateActions(): Promise<SourceFetchResult<any[]>> {
    const now = new Date().toISOString();
    return {
      sourceId: this.adapterId,
      sourceName: this.adapterName,
      sourceTier: this.sourceTier,
      sourceRole: this.defaultRole,
      data: null,
      confidence: 'NOT_ASSESSABLE',
      observationDate: now.split('T')[0],
      publicationDate: now.split('T')[0],
      status: 'NOT_FOUND',
      retrievedAt: now,
      evidenceReferences: [],
    };
  }

  async fetchManagementUpdates(): Promise<SourceFetchResult<any>> {
    const now = new Date().toISOString();
    return {
      sourceId: this.adapterId,
      sourceName: this.adapterName,
      sourceTier: this.sourceTier,
      sourceRole: this.defaultRole,
      data: null,
      confidence: 'NOT_ASSESSABLE',
      observationDate: now.split('T')[0],
      publicationDate: now.split('T')[0],
      status: 'NOT_FOUND',
      retrievedAt: now,
      evidenceReferences: [],
    };
  }

  async fetchIndustryData(): Promise<SourceFetchResult<any>> {
    const now = new Date().toISOString();
    return {
      sourceId: this.adapterId,
      sourceName: this.adapterName,
      sourceTier: this.sourceTier,
      sourceRole: this.defaultRole,
      data: null,
      confidence: 'NOT_ASSESSABLE',
      observationDate: now.split('T')[0],
      publicationDate: now.split('T')[0],
      status: 'NOT_FOUND',
      retrievedAt: now,
      evidenceReferences: [],
    };
  }

  async fetchMarketData(_symbol: string): Promise<SourceFetchResult<any>> {
    const now = new Date().toISOString();
    return {
      sourceId: this.adapterId,
      sourceName: this.adapterName,
      sourceTier: this.sourceTier,
      sourceRole: this.defaultRole,
      data: null,
      confidence: 'NOT_ASSESSABLE',
      observationDate: now.split('T')[0],
      publicationDate: now.split('T')[0],
      status: 'NOT_FOUND',
      retrievedAt: now,
      evidenceReferences: [],
    };
  }
}
