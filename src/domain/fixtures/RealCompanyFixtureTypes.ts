/**
 * RealCompanyFixtureTypes.ts
 * Phase 16 — Real-Company Frozen Fixture & Invariant Specification Schemas.
 */

import { CompanyIdentity } from '../models/Company';
import {
  SectorFinancialStatement,
  MarketPriceRecord,
  ShareholdingRecord,
  ExchangeFilingRecord,
} from '../dataSources/DataSourceTypes';
import { RawNewsArticle } from '../dataSources/NewsDataAdapter';
import { IndustryMetricRecord } from '../dataSources/IndustryDataAdapter';
import { RawSourceCaptureRecord } from '../dataSources/RawDataStore';

export interface ExpectedFixtureInvariant {
  metric: string;
  operator: 'EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'RANGE' | 'IS_ASSESSABLE' | 'IS_NOT_ASSESSABLE';
  expectedValue: number | string | [number, number];
  period: string; // e.g. "FY2024", "Q3FY2024"
  sourceReference: string;
  tolerancePercent?: number;
  assessabilityRequired: boolean;
}

export interface RealCompanyFrozenFixture {
  fixtureId: string;
  companyIdentity: CompanyIdentity;
  analysisCutoffDate: string; // ISO DateTime
  rawPayloads: RawSourceCaptureRecord[];
  canonicalStatement: SectorFinancialStatement;
  marketPrice: MarketPriceRecord;
  shareholding: ShareholdingRecord;
  filings: ExchangeFilingRecord[];
  newsEvents: RawNewsArticle[];
  industryMetrics: IndustryMetricRecord[];
  schemaVersion: string;
  policyVersion: string;
  canonicalHash: string;
  invariants: ExpectedFixtureInvariant[];
}
