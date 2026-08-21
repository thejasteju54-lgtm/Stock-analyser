/**
 * CanonicalResearchDataStore.ts
 * Phase 16 — Canonical Research Data Store & Normalization Bridge.
 * Serves as the single source of truth for normalized evidence consumed by Phases 5–15.
 */

import {
  SectorFinancialStatement,
  MarketPriceRecord,
  ShareholdingRecord,
  ExchangeFilingRecord,
} from './DataSourceTypes';
import { RawNewsArticle } from './NewsDataAdapter';
import { IndustryMetricRecord } from './IndustryDataAdapter';
import { CanonicalJsonSerializer } from '../audit/CanonicalJsonSerializer';

export interface CanonicalProjectDataSet {
  projectId: string;
  symbol: string;
  cutoffDate?: string;
  financialStatement?: SectorFinancialStatement;
  marketPrice?: MarketPriceRecord;
  shareholding?: ShareholdingRecord;
  filings: ExchangeFilingRecord[];
  news: RawNewsArticle[];
  industryMetrics: IndustryMetricRecord[];
  canonicalChecksum: string;
  lastUpdatedAt: string;
}

export class CanonicalResearchDataStore {
  private static readonly stores = new Map<string, CanonicalProjectDataSet>();

  public static getOrCreate(projectId: string, symbol: string, cutoffDate?: string): CanonicalProjectDataSet {
    const existing = this.stores.get(projectId);
    if (existing) return existing;

    const newStore: CanonicalProjectDataSet = {
      projectId,
      symbol,
      cutoffDate,
      filings: [],
      news: [],
      industryMetrics: [],
      canonicalChecksum: '',
      lastUpdatedAt: new Date().toISOString(),
    };
    newStore.canonicalChecksum = this.computeChecksum(newStore);
    this.stores.set(projectId, newStore);
    return newStore;
  }

  public static setFinancialStatement(projectId: string, stmt: SectorFinancialStatement): void {
    const store = this.stores.get(projectId);
    if (store) {
      store.financialStatement = stmt;
      store.lastUpdatedAt = new Date().toISOString();
      store.canonicalChecksum = this.computeChecksum(store);
    }
  }

  public static setMarketPrice(projectId: string, price: MarketPriceRecord): void {
    const store = this.stores.get(projectId);
    if (store) {
      store.marketPrice = price;
      store.lastUpdatedAt = new Date().toISOString();
      store.canonicalChecksum = this.computeChecksum(store);
    }
  }

  public static setShareholding(projectId: string, sh: ShareholdingRecord): void {
    const store = this.stores.get(projectId);
    if (store) {
      store.shareholding = sh;
      store.lastUpdatedAt = new Date().toISOString();
      store.canonicalChecksum = this.computeChecksum(store);
    }
  }

  public static setFilings(projectId: string, filings: ExchangeFilingRecord[]): void {
    const store = this.stores.get(projectId);
    if (store) {
      store.filings = filings;
      store.lastUpdatedAt = new Date().toISOString();
      store.canonicalChecksum = this.computeChecksum(store);
    }
  }

  public static setNews(projectId: string, news: RawNewsArticle[]): void {
    const store = this.stores.get(projectId);
    if (store) {
      store.news = news;
      store.lastUpdatedAt = new Date().toISOString();
      store.canonicalChecksum = this.computeChecksum(store);
    }
  }

  public static setIndustry(projectId: string, ind: IndustryMetricRecord[]): void {
    const store = this.stores.get(projectId);
    if (store) {
      store.industryMetrics = ind;
      store.lastUpdatedAt = new Date().toISOString();
      store.canonicalChecksum = this.computeChecksum(store);
    }
  }

  public static get(projectId: string): CanonicalProjectDataSet | undefined {
    return this.stores.get(projectId);
  }

  public static computeChecksum(store: CanonicalProjectDataSet): string {
    const canonical = CanonicalJsonSerializer.canonicalize({
      projectId: store.projectId,
      symbol: store.symbol,
      cutoffDate: store.cutoffDate,
      financialStatement: store.financialStatement,
      marketPrice: store.marketPrice,
      shareholding: store.shareholding,
      filings: store.filings,
      news: store.news,
      industryMetrics: store.industryMetrics,
    });
    return CanonicalJsonSerializer.sha256(canonical);
  }

  public static clear(): void {
    this.stores.clear();
  }
}
