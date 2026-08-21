/**
 * LiveCompanyIdentityResolver.ts
 * Phase 16 — Company Identity Resolution, Alias Matching & Cross-Entity Isolation.
 * Resolves CIN, ISIN, NSE/BSE Symbols, Former Tickers, and Merged Entity Lineage.
 */

import { CompanyIdentity, MarketCapCategory } from '../models/Company';

export type ResolutionConfidence =
  | 'EXACT_MATCH'
  | 'HIGH_CONFIDENCE'
  | 'AMBIGUOUS'
  | 'UNRESOLVED';

export interface CompanyResolutionResult {
  confidence: ResolutionConfidence;
  confidenceScore: number; // 0 to 100
  resolvedCompany?: CompanyIdentity;
  matchedField?: 'CIN' | 'ISIN' | 'SYMBOL' | 'LEGAL_NAME' | 'ALIAS' | 'FORMER_TICKER';
  isIngestionAllowed: boolean;
  blockReason?: string;
}

export interface SecurityMasterEntry {
  companyId: string;
  legalName: string;
  displayName: string;
  symbol: string;
  exchange: 'NSE' | 'BSE';
  bseCode?: string;
  isin: string;
  cin?: string;
  sector: string;
  subsector: string;
  businessModel: string;
  marketCapCategory: MarketCapCategory;
  aliases: string[];
  formerTickers?: string[];
  mergerParentId?: string;
}

export class LiveCompanyIdentityResolver {
  private static readonly SECURITY_MASTER: SecurityMasterEntry[] = [
    {
      companyId: 'comp_tatamotors',
      legalName: 'Tata Motors Limited',
      displayName: 'Tata Motors',
      symbol: 'TATAMOTORS',
      exchange: 'NSE',
      bseCode: '500570',
      isin: 'INE155A01022',
      cin: 'L28920MH1945PLC004520',
      sector: 'Automobile and Ancillaries',
      subsector: 'Commercial & Passenger Vehicles',
      businessModel: 'NON_FINANCIAL_OPERATING',
      marketCapCategory: 'LARGE_CAP',
      aliases: ['Tata Motors', 'TML', 'Jaguar Land Rover India'],
      formerTickers: ['TELCO'],
    },
    {
      companyId: 'comp_dixon',
      legalName: 'Dixon Technologies (India) Limited',
      displayName: 'Dixon Technologies',
      symbol: 'DIXON',
      exchange: 'NSE',
      bseCode: '540699',
      isin: 'INE935N01020',
      cin: 'L32101UP1993PLC066581',
      sector: 'Consumer Durables',
      subsector: 'Electronic Manufacturing Services (EMS)',
      businessModel: 'NON_FINANCIAL_OPERATING',
      marketCapCategory: 'MID_CAP',
      aliases: ['Dixon Tech', 'Dixon India'],
    },
    {
      companyId: 'comp_hdfcbank',
      legalName: 'HDFC Bank Limited',
      displayName: 'HDFC Bank',
      symbol: 'HDFCBANK',
      exchange: 'NSE',
      bseCode: '500180',
      isin: 'INE040A01034',
      cin: 'L65920MH1994PLC080618',
      sector: 'Financial Services',
      subsector: 'Private Commercial Banking',
      businessModel: 'BANKING',
      marketCapCategory: 'LARGE_CAP',
      aliases: ['HDFC Bank', 'HDFC Ltd Post Merger'],
      formerTickers: ['HDFC'],
    },
    {
      companyId: 'comp_tatasteel',
      legalName: 'Tata Steel Limited',
      displayName: 'Tata Steel',
      symbol: 'TATASTEEL',
      exchange: 'NSE',
      bseCode: '500470',
      isin: 'INE081A01020',
      cin: 'L27100MH1907PLC000260',
      sector: 'Metals & Mining',
      subsector: 'Primary Steel Manufacturing',
      businessModel: 'NON_FINANCIAL_OPERATING',
      marketCapCategory: 'LARGE_CAP',
      aliases: ['Tata Iron & Steel'],
      formerTickers: ['TISCO'],
    },
    {
      companyId: 'comp_infosys',
      legalName: 'Infosys Limited',
      displayName: 'Infosys',
      symbol: 'INFY',
      exchange: 'NSE',
      bseCode: '500209',
      isin: 'INE009A01021',
      cin: 'L85110KA1981PLC013115',
      sector: 'Information Technology',
      subsector: 'IT Consulting & Software Services',
      businessModel: 'NON_FINANCIAL_OPERATING',
      marketCapCategory: 'LARGE_CAP',
      aliases: ['Infosys Technologies', 'Infy'],
    },
  ];

  public static resolve(query: string): CompanyResolutionResult {
    const q = query.trim().toUpperCase();
    if (!q) {
      return {
        confidence: 'UNRESOLVED',
        confidenceScore: 0,
        isIngestionAllowed: false,
        blockReason: 'Empty query provided for company identity resolution.',
      };
    }

    // 1. Exact CIN Match
    const cinMatch = this.SECURITY_MASTER.find((e) => e.cin?.toUpperCase() === q);
    if (cinMatch) {
      return this.buildResult(cinMatch, 'EXACT_MATCH', 100, 'CIN');
    }

    // 2. Exact ISIN Match
    const isinMatch = this.SECURITY_MASTER.find((e) => e.isin.toUpperCase() === q);
    if (isinMatch) {
      return this.buildResult(isinMatch, 'EXACT_MATCH', 100, 'ISIN');
    }

    // 3. Exact Symbol Match
    const symbolMatch = this.SECURITY_MASTER.find(
      (e) => e.symbol.toUpperCase() === q || `NSE:${e.symbol}` === q || `BSE:${e.bseCode}` === q
    );
    if (symbolMatch) {
      return this.buildResult(symbolMatch, 'EXACT_MATCH', 100, 'SYMBOL');
    }

    // 4. Exact Legal Name Match
    const legalMatch = this.SECURITY_MASTER.find((e) => e.legalName.toUpperCase() === q);
    if (legalMatch) {
      return this.buildResult(legalMatch, 'HIGH_CONFIDENCE', 95, 'LEGAL_NAME');
    }

    // 5. Former Ticker Matching (checked before general aliases)
    for (const entry of this.SECURITY_MASTER) {
      if (entry.formerTickers?.some((f) => f.toUpperCase() === q)) {
        return this.buildResult(entry, 'HIGH_CONFIDENCE', 85, 'FORMER_TICKER');
      }
    }

    // 6. Alias Matching
    for (const entry of this.SECURITY_MASTER) {
      if (entry.aliases.some((a) => a.toUpperCase() === q)) {
        return this.buildResult(entry, 'HIGH_CONFIDENCE', 90, 'ALIAS');
      }
    }

    // 7. Fuzzy Substring Matching
    const substringMatches = this.SECURITY_MASTER.filter(
      (e) =>
        e.legalName.toUpperCase().includes(q) ||
        e.displayName.toUpperCase().includes(q) ||
        q.includes(e.symbol.toUpperCase())
    );

    if (substringMatches.length === 1) {
      return this.buildResult(substringMatches[0], 'HIGH_CONFIDENCE', 80, 'LEGAL_NAME');
    } else if (substringMatches.length > 1) {
      return {
        confidence: 'AMBIGUOUS',
        confidenceScore: 60,
        isIngestionAllowed: false,
        blockReason: `Ambiguous company query '${query}' matched multiple entities (${substringMatches.map((m) => m.symbol).join(', ')}). Ingestion blocked until resolved.`,
      };
    }

    return {
      confidence: 'UNRESOLVED',
      confidenceScore: 0,
      isIngestionAllowed: false,
      blockReason: `Unresolved company identity for '${query}'. Ingestion blocked to prevent wrong-company data contamination.`,
    };
  }

  private static buildResult(
    entry: SecurityMasterEntry,
    confidence: ResolutionConfidence,
    score: number,
    field: 'CIN' | 'ISIN' | 'SYMBOL' | 'LEGAL_NAME' | 'ALIAS' | 'FORMER_TICKER'
  ): CompanyResolutionResult {
    const now = new Date().toISOString();
    return {
      confidence,
      confidenceScore: score,
      matchedField: field,
      isIngestionAllowed: true,
      resolvedCompany: {
        id: entry.companyId,
        legalName: entry.legalName,
        displayName: entry.displayName,
        symbol: entry.symbol,
        exchange: entry.exchange,
        isin: entry.isin,
        cin: entry.cin,
        sector: entry.sector,
        subsector: entry.subsector,
        businessModel: entry.businessModel,
        marketCapCategory: entry.marketCapCategory,
        createdAt: now,
        updatedAt: now,
      },
    };
  }
}
