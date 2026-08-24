/**
 * ResearchContext.ts
 * AI Research Context Container & Tool-Calling Environment Capsule
 */

import { FinancialFact, ManagementClaim } from '../extraction/FinancialFactTypes';
import { IngestedDocument } from '../ingestion/DocumentTypes';
import { ResearchProject } from '../models/ResearchProject';

export interface VerifiedNewsEvent {
  eventId: string;
  headline: string;
  summary: string;
  source: string;
  sourceTier: number;
  publicationDate: string;
  impactDirection: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  materiality: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ResearchContext {
  company: {
    canonicalCompanyId: string;
    legalName: string;
    displayName: string;
    symbolNSE: string;
    codeBSE: string;
    isin: string;
    sector: string;
    industry: string;
    businessModel: string;
    marketCapCategory: string;
  };
  marketData?: {
    price: number;
    fiftyTwoWeekHigh: number;
    fiftyTwoWeekLow: number;
    peRatio?: number;
    marketCap: number;
    delayStatus: string;
    exchangeStatus: string;
  };
  financialFacts: FinancialFact[];
  managementClaims: ManagementClaim[];
  documents: IngestedDocument[];
  newsEvents: VerifiedNewsEvent[];
  forensicSignals?: Record<string, any>;
  valuationSummary?: Record<string, any>;
}

export class ResearchContextBuilder {
  static buildFromProject(
    project: ResearchProject,
    marketData?: any,
    newsEvents?: VerifiedNewsEvent[]
  ): ResearchContext {
    return {
      company: {
        canonicalCompanyId: project.company.id,
        legalName: project.company.legalName,
        displayName: project.company.displayName,
        symbolNSE: project.company.symbol,
        codeBSE: '000000',
        isin: project.company.isin || 'INE000000000',
        sector: project.company.sector,
        industry: project.company.subsector || 'General',
        businessModel: project.company.businessModel,
        marketCapCategory: project.company.marketCapCategory,
      },
      marketData,
      financialFacts: project.facts || [],
      managementClaims: project.managementClaims || [],
      documents: project.documents || [],
      newsEvents: newsEvents || [],
    };
  }
}
