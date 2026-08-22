export type SourceTier = 1 | 2 | 3 | 4 | 5;

export type SourceRole =
  | 'STATUTORY_REGULATORY'
  | 'COMPANY_DISCLOSURE'
  | 'STRUCTURED_MARKET_RESEARCH'
  | 'SECONDARY_DISCOVERY'
  | 'DISCOVERY_ONLY';

export type SourceFetchStatus =
  | 'SUCCESS'
  | 'PARTIAL_SUCCESS'
  | 'SOURCE_UNAVAILABLE'
  | 'RATE_LIMITED'
  | 'SCHEMA_DRIFT'
  | 'SOURCE_CONFLICT'
  | 'NOT_FOUND';

export interface EvidenceReference {
  documentTitle: string;
  url: string;
  pageCitation?: string;
  section?: string;
  reportingPeriod?: string;
  observationDate?: string;
  publicationDate?: string;
  sourceTier: SourceTier;
  checksumSha256?: string;
}

export interface SourceFetchResult<T> {
  sourceId: string;
  sourceName: string;
  sourceTier: SourceTier;
  sourceRole: SourceRole;
  retrievedAt: string;
  observationDate: string;
  publicationDate: string;
  requestUrl?: string;
  documentUrl?: string;
  rawReference?: string;
  data: T | null;
  status: SourceFetchStatus;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_ASSESSABLE';
  limitations?: string[];
  evidenceReferences: EvidenceReference[];
}

export interface NormalizedFinancialStatementItem {
  metricKey: string;
  displayName: string;
  value: number;
  unit: 'INR_CR' | 'INR_LAKH' | 'PERCENT' | 'BPS' | 'RATIO' | 'INR_PER_SHARE' | 'SHARES_COUNT';
  scale: number;
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  fiscalYear: number;
  quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  periodType: 'ANNUAL' | 'QUARTERLY' | 'TTM' | 'LTM';
  reportingBasis: 'STANDALONE' | 'CONSOLIDATED';
  restatementStatus: 'ORIGINAL_AS_REPORTED' | 'RESTATED' | 'RECLASSIFIED';
  sourceTier: SourceTier;
  sourceId: string;
  observationDate: string;
  publicationDate: string;
}

export interface DiscoveredDocumentItem {
  documentId: string;
  title: string;
  companySymbol: string;
  documentType:
    | 'ANNUAL_REPORT'
    | 'QUARTERLY_RESULT'
    | 'INVESTOR_PRESENTATION'
    | 'CONCALL_TRANSCRIPT'
    | 'EXCHANGE_FILING'
    | 'CREDIT_RATING_REPORT'
    | 'CORPORATE_ANNOUNCEMENT';
  period: string;
  fiscalYear: number;
  publicationDate: string;
  retrievalDate: string;
  sourceUrl: string;
  sourceTier: SourceTier;
  fileSizeBytes?: number;
  sha256Hash: string;
  quality: 'VERIFIED' | 'OCR_UNVERIFIED' | 'STALE' | 'NOT_ASSESSABLE';
}

export interface DiscoveredNewsEventItem {
  eventId: string;
  headline: string;
  summary: string;
  source: string;
  sourceTier: SourceTier;
  publicationDate: string;
  eventDate: string;
  companySymbol: string;
  eventType:
    | 'EARNINGS_RELEASE'
    | 'ORDER_WIN'
    | 'CAPEX_EXPANSION'
    | 'REGULATORY_ACTION'
    | 'MANAGEMENT_CHANGE'
    | 'DIVIDEND_OR_BUYBACK'
    | 'CREDIT_RATING'
    | 'ACQUISITION'
    | 'LITIGATION'
    | 'INDUSTRY_TREND';
  materiality: 'HIGH' | 'MEDIUM' | 'LOW';
  impactDirection: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  duplicateGroupId?: string;
  isSyndicated?: boolean;
}

export interface DiscoveredManagementStatementItem {
  statementId: string;
  speaker: string;
  speakerRole: string;
  statementText: string;
  date: string;
  sourceDocument: string;
  sourceTier: SourceTier;
  commitmentType: 'MARGIN_TARGET' | 'REVENUE_GUIDANCE' | 'CAPEX_COMMITMENT' | 'DELEVERAGING' | 'GENERAL_OUTLOOK';
  targetMetric: string;
  targetValue?: string;
  targetPeriod?: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface CompanyResolutionResult {
  canonicalCompanyId: string;
  legalName: string;
  displayName: string;
  symbolNSE: string;
  codeBSE: string;
  isin: string;
  primaryExchange: 'NSE' | 'BSE';
  sector: string;
  industry: string;
  entityType: 'OPERATING_COMPANY' | 'BANK' | 'NBFC' | 'INSURANCE' | 'HOLDING_COMPANY';
  aliases: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_ASSESSABLE';
}

export interface ResearchSourceAdapter {
  readonly adapterId: string;
  readonly adapterName: string;
  readonly adapterVersion: string;
  readonly sourceTier: SourceTier;
  readonly defaultRole: SourceRole;

  resolveCompany(query: string): Promise<SourceFetchResult<CompanyResolutionResult>>;
  discoverDocuments(symbol: string): Promise<SourceFetchResult<DiscoveredDocumentItem[]>>;
  fetchFinancials(symbol: string, basis?: 'CONSOLIDATED' | 'STANDALONE'): Promise<SourceFetchResult<NormalizedFinancialStatementItem[]>>;
  fetchCorporateActions(symbol: string): Promise<SourceFetchResult<any[]>>;
  fetchNews(symbol: string): Promise<SourceFetchResult<DiscoveredNewsEventItem[]>>;
  fetchManagementUpdates(symbol: string): Promise<SourceFetchResult<DiscoveredManagementStatementItem[]>>;
  fetchIndustryData(sector: string): Promise<SourceFetchResult<any>>;
  fetchMarketData(symbol: string): Promise<SourceFetchResult<{ price: number; marketCapCr: number; pe: number; pb: number; closeDate: string }>>;
}
