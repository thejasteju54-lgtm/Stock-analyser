/**
 * ForwardEventEngine.ts
 * Order Book, Tender & Forward Commitment Intelligence Engine
 * Classifies forward-looking corporate commitments without confusing MoUs with confirmed revenue.
 */

export type ForwardCommitmentType =
  | 'CONFIRMED_ORDER'
  | 'TENDER_BID'
  | 'MOU_LOI'
  | 'CAPEX_EXPANSION'
  | 'PRODUCT_LAUNCH'
  | 'RUMORED_PIPELINE';

export interface ForwardEventItem {
  eventId: string;
  companySymbol: string;
  type: ForwardCommitmentType;
  headline: string;
  announcedDate: string;
  estimatedValueCr?: number;
  executionHorizonMonths?: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  valuationRevenueCreditPct: number; // e.g., 100% for Confirmed, 20% for Tender, 0% for MoU
  thesisImpact: string;
}

export class ForwardEventEngine {
  /**
   * Evaluates raw news/filing text and extracts forward deal intelligence.
   */
  static analyzeEvent(rawNews: {
    eventId: string;
    headline: string;
    summary: string;
    companySymbol: string;
    publicationDate: string;
  }): ForwardEventItem {
    const text = `${rawNews.headline} ${rawNews.summary}`.toLowerCase();
    const cleanSym = rawNews.companySymbol.toUpperCase();

    // 1. Confirmed Order
    if (
      text.includes('bags order') ||
      text.includes('wins contract') ||
      text.includes('awarded contract') ||
      text.includes('receives order') ||
      text.includes('order win')
    ) {
      const val = this.extractCrValue(text);
      return {
        eventId: rawNews.eventId,
        companySymbol: cleanSym,
        type: 'CONFIRMED_ORDER',
        headline: rawNews.headline,
        announcedDate: rawNews.publicationDate,
        estimatedValueCr: val,
        executionHorizonMonths: 24,
        confidence: 'HIGH',
        valuationRevenueCreditPct: 100,
        thesisImpact: 'Firm commercial backlog addition supporting multi-year revenue visibility.',
      };
    }

    // 2. MoU / Letter of Intent
    if (text.includes('mou') || text.includes('memorandum of understanding') || text.includes('letter of intent') || text.includes('loi')) {
      const val = this.extractCrValue(text);
      return {
        eventId: rawNews.eventId,
        companySymbol: cleanSym,
        type: 'MOU_LOI',
        headline: rawNews.headline,
        announcedDate: rawNews.publicationDate,
        estimatedValueCr: val,
        executionHorizonMonths: 36,
        confidence: 'LOW',
        valuationRevenueCreditPct: 0, // Strict rule: MoUs provide ZERO immediate revenue credit
        thesisImpact: 'Non-binding framework agreement. Subject to definitive commercial contracting.',
      };
    }

    // 3. Tender / L1 Bidder
    if (text.includes('tender') || text.includes('lowest bidder') || text.includes('l1 bidder') || text.includes('submits bid')) {
      const val = this.extractCrValue(text);
      return {
        eventId: rawNews.eventId,
        companySymbol: cleanSym,
        type: 'TENDER_BID',
        headline: rawNews.headline,
        announcedDate: rawNews.publicationDate,
        estimatedValueCr: val,
        executionHorizonMonths: 24,
        confidence: 'MEDIUM',
        valuationRevenueCreditPct: 35, // Probability weighted
        thesisImpact: 'Tender participation. Contract award pending formal administrative approval.',
      };
    }

    // 4. Capex Expansion
    if (text.includes('capex') || text.includes('expansion') || text.includes('new facility') || text.includes('manufacturing plant')) {
      const val = this.extractCrValue(text);
      return {
        eventId: rawNews.eventId,
        companySymbol: cleanSym,
        type: 'CAPEX_EXPANSION',
        headline: rawNews.headline,
        announcedDate: rawNews.publicationDate,
        estimatedValueCr: val,
        executionHorizonMonths: 18,
        confidence: 'HIGH',
        valuationRevenueCreditPct: 50,
        thesisImpact: 'Capacity ramp supporting medium-term operational scale.',
      };
    }

    // 5. Default
    return {
      eventId: rawNews.eventId,
      companySymbol: cleanSym,
      type: 'PRODUCT_LAUNCH',
      headline: rawNews.headline,
      announcedDate: rawNews.publicationDate,
      confidence: 'MEDIUM',
      valuationRevenueCreditPct: 0,
      thesisImpact: 'General operational update.',
    };
  }

  private static extractCrValue(text: string): number | undefined {
    const match = text.match(/(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*(?:cr|crore)/i);
    if (match && match[1]) {
      const parsed = parseFloat(match[1].replace(/,/g, ''));
      return isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  }
}
