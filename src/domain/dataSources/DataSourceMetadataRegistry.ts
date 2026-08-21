/**
 * DataSourceMetadataRegistry.ts
 * Phase 16 — Candidate Provider Registry, Licensing, Rate Limits & Tier Classifications.
 */

import { DataSourceMetadata } from './DataSourceTypes';

export class DataSourceMetadataRegistry {
  private static readonly REGISTRY: Record<string, DataSourceMetadata> = {
    NSE_OFFICIAL_FEED: {
      sourceId: 'NSE_OFFICIAL_FEED',
      sourceName: 'National Stock Exchange of India Official Real-Time & EOD Feed',
      sourceTier: 'TIER_1_PRIMARY',
      category: 'MARKET_DATA',
      coverage: ['NSE_EQUITY', 'NSE_DERIVATIVES', 'NSE_INDICES'],
      publisher: 'National Stock Exchange of India Ltd',
      sourceUrl: 'https://www.nseindia.com',
      licenseStatus: 'STATUTORY_PUBLIC',
      usageRestrictions: 'Non-commercial statutory research usage; real-time redistributions subject to exchange licensing.',
      attributionRequirement: 'Source: National Stock Exchange of India Ltd (NSE)',
      redistributionAllowed: true,
      rateLimitPerMinute: 60,
      rateLimitPerDay: 5000,
      authenticationRequired: false,
      availabilityStatus: 'CONNECTED',
    },
    BSE_CORPORATE_DISCLOSURES: {
      sourceId: 'BSE_CORPORATE_DISCLOSURES',
      sourceName: 'BSE India Corporate Announcements & Regulatory Disclosures',
      sourceTier: 'TIER_1_PRIMARY',
      category: 'EXCHANGE_FILINGS',
      coverage: ['BSE_LISTED_EQUITY', 'CORPORATE_ACTIONS', 'SHAREHOLDING_PATTERNS', 'FINANCIAL_RESULTS'],
      publisher: 'BSE Ltd',
      sourceUrl: 'https://www.bseindia.com',
      licenseStatus: 'STATUTORY_PUBLIC',
      usageRestrictions: 'Official public regulatory filing archive.',
      attributionRequirement: 'Source: BSE India Regulatory Filings',
      redistributionAllowed: true,
      rateLimitPerMinute: 60,
      rateLimitPerDay: 5000,
      authenticationRequired: false,
      availabilityStatus: 'CONNECTED',
    },
    MCA_XBRL_FINANCIALS: {
      sourceId: 'MCA_XBRL_FINANCIALS',
      sourceName: 'Ministry of Corporate Affairs (MCA) XBRL Audited Annual Accounts',
      sourceTier: 'TIER_1_PRIMARY',
      category: 'FINANCIAL_STATEMENTS',
      coverage: ['AUDITED_BALANCE_SHEET', 'AUDITED_INCOME_STATEMENT', 'AUDITED_CASH_FLOW', 'AUDITOR_REPORTS'],
      publisher: 'Ministry of Corporate Affairs, Government of India',
      sourceUrl: 'https://www.mca.gov.in',
      licenseStatus: 'STATUTORY_PUBLIC',
      usageRestrictions: 'Official sovereign statutory financial repository.',
      attributionRequirement: 'Source: Ministry of Corporate Affairs (MCA) XBRL',
      redistributionAllowed: true,
      rateLimitPerMinute: 30,
      rateLimitPerDay: 1000,
      authenticationRequired: true,
      availabilityStatus: 'CONNECTED',
    },
    BLOOMBERG_REUTERS_AGGREGATOR: {
      sourceId: 'BLOOMBERG_REUTERS_AGGREGATOR',
      sourceName: 'Institutional Consensus & Financial Database Aggregator',
      sourceTier: 'TIER_2_VERIFIED_SECONDARY',
      category: 'MARKET_DATA',
      coverage: ['GLOBAL_MACRO', 'CONSENSUS_ESTIMATES', 'PEER_VALUATION_MULTIPLES'],
      publisher: 'Financial Data Provider',
      licenseStatus: 'COMMERCIAL',
      usageRestrictions: 'Licensed institutional analytics feed.',
      attributionRequirement: 'Source: Verified Financial Secondary Database',
      redistributionAllowed: false,
      rateLimitPerMinute: 120,
      authenticationRequired: true,
      availabilityStatus: 'CONNECTED',
    },
    PTI_WIRE_NEWS: {
      sourceId: 'PTI_WIRE_NEWS',
      sourceName: 'Press Trust of India & Corporate News Wire Feed',
      sourceTier: 'TIER_2_VERIFIED_SECONDARY',
      category: 'NEWS',
      coverage: ['INDIAN_CORPORATE_NEWS', 'REGULATORY_ALERTS', 'POLICY_ANNOUNCEMENTS'],
      publisher: 'Press Trust of India',
      licenseStatus: 'COMMERCIAL',
      attributionRequirement: 'Source: Press Trust of India / Verified Wire Services',
      redistributionAllowed: false,
      rateLimitPerMinute: 100,
      authenticationRequired: true,
      availabilityStatus: 'CONNECTED',
    },
    MOSPI_INDUSTRY_STATS: {
      sourceId: 'MOSPI_INDUSTRY_STATS',
      sourceName: 'Ministry of Statistics and Programme Implementation (MOSPI) & RBI Bulletins',
      sourceTier: 'TIER_1_PRIMARY',
      category: 'INDUSTRY_DATA',
      coverage: ['IIP_GROWTH', 'CPI_WPI_INFLATION', 'SECTORAL_BANK_CREDIT', 'GVA_GROWTH'],
      publisher: 'Government of India / Reserve Bank of India',
      sourceUrl: 'https://www.mospi.gov.in',
      licenseStatus: 'OPEN_DATA',
      attributionRequirement: 'Source: MOSPI / Reserve Bank of India Statistics',
      redistributionAllowed: true,
      rateLimitPerMinute: 60,
      authenticationRequired: false,
      availabilityStatus: 'CONNECTED',
    },
  };

  public static getMetadata(sourceId: string): DataSourceMetadata {
    const meta = this.REGISTRY[sourceId];
    if (!meta) {
      return {
        sourceId,
        sourceName: `Custom Provider (${sourceId})`,
        sourceTier: 'TIER_3_CONTEXTUAL',
        category: 'REFERENCE_DATA',
        coverage: ['CUSTOM'],
        publisher: 'Unknown Provider',
        licenseStatus: 'RESTRICTED',
        redistributionAllowed: false,
        rateLimitPerMinute: 30,
        authenticationRequired: true,
        availabilityStatus: 'NOT_CONFIGURED',
      };
    }
    return meta;
  }

  public static getAllMetadata(): DataSourceMetadata[] {
    return Object.values(this.REGISTRY);
  }

  public static isSourceEnabled(sourceId: string): boolean {
    const meta = this.REGISTRY[sourceId];
    return !!meta && meta.availabilityStatus !== 'NOT_CONFIGURED' && meta.availabilityStatus !== 'UNAVAILABLE';
  }
}
