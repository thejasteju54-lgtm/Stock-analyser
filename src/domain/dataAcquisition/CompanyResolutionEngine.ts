/**
 * CompanyResolutionEngine.ts
 * Enterprise Security Master & Canonical Company Resolution Engine
 * Resolves Indian equities to canonical ISIN, NSE ticker, BSE code, sector, and industry.
 */

import { CompanyResolutionResult } from '../../infrastructure/researchSources/SourceAdapterTypes';
import { resolveSecurity } from '../../../server/api';

export class CompanyResolutionEngine {
  static async resolve(query: string): Promise<CompanyResolutionResult> {
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      throw new Error('Company query cannot be empty');
    }

    if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
      try {
        const resp = await fetch(`/api/company/resolve?q=${encodeURIComponent(cleanQuery)}`);
        const json = await resp.json();
        if (json.status === 'SUCCESS' && json.data) {
          const d = json.data;
          return {
            canonicalCompanyId: d.canonicalCompanyId,
            legalName: d.legalName,
            displayName: d.displayName,
            symbolNSE: d.symbolNSE,
            codeBSE: d.codeBSE,
            isin: d.isin,
            primaryExchange: d.primaryExchange,
            sector: d.sector,
            industry: d.industry,
            entityType: (d.entityType === 'BANK' ? 'BANK' : 'OPERATING_COMPANY') as any,
            aliases: [d.displayName, d.symbolNSE, d.legalName],
            confidence: d.confidence,
          };
        }
      } catch (e) {
        // Fallback to in-process security resolver
      }
    }

    const sec = resolveSecurity(cleanQuery);
    return {
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
      aliases: [sec.displayName, sec.symbolNSE, sec.legalName],
      confidence: sec.confidence,
    };
  }
}
