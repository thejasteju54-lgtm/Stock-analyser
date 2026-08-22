import {
  ResearchSourceAdapter,
  SourceTier,
  SourceRole,
  SourceFetchResult,
  CompanyResolutionResult,
  DiscoveredDocumentItem,
  NormalizedFinancialStatementItem,
  DiscoveredNewsEventItem,
  DiscoveredManagementStatementItem,
} from './SourceAdapterTypes';

export abstract class BaseSourceAdapter implements ResearchSourceAdapter {
  abstract readonly adapterId: string;
  abstract readonly adapterName: string;
  abstract readonly adapterVersion: string;
  abstract readonly sourceTier: SourceTier;
  abstract readonly defaultRole: SourceRole;

  protected failureCount = 0;
  protected lastFailureTime = 0;
  protected isCircuitOpen = false;
  protected readonly failureThreshold = 5;
  protected readonly resetTimeoutMs = 60000;

  protected checkCircuitBreaker(): boolean {
    if (this.isCircuitOpen) {
      if (Date.now() - this.lastFailureTime > this.resetTimeoutMs) {
        this.isCircuitOpen = false;
        this.failureCount = 0;
        return true;
      }
      return false;
    }
    return true;
  }

  protected recordSuccess(): void {
    this.failureCount = 0;
    this.isCircuitOpen = false;
  }

  protected recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.isCircuitOpen = true;
    }
  }

  abstract resolveCompany(query: string): Promise<SourceFetchResult<CompanyResolutionResult>>;
  abstract discoverDocuments(symbol: string): Promise<SourceFetchResult<DiscoveredDocumentItem[]>>;
  abstract fetchFinancials(symbol: string, basis?: 'CONSOLIDATED' | 'STANDALONE'): Promise<SourceFetchResult<NormalizedFinancialStatementItem[]>>;
  abstract fetchCorporateActions(symbol: string): Promise<SourceFetchResult<any[]>>;
  abstract fetchNews(symbol: string): Promise<SourceFetchResult<DiscoveredNewsEventItem[]>>;
  abstract fetchManagementUpdates(symbol: string): Promise<SourceFetchResult<DiscoveredManagementStatementItem[]>>;
  abstract fetchIndustryData(sector: string): Promise<SourceFetchResult<any>>;
  abstract fetchMarketData(symbol: string): Promise<SourceFetchResult<{ price: number; marketCapCr: number; pe: number; pb: number; closeDate: string }>>;
}
