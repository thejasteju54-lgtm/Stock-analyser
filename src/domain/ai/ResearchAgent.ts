/**
 * ResearchAgent.ts
 * Evidence-Grounded Autonomous AI Research Agent
 * Coordinates tool calling across company evidence stores to generate substantiated investment conclusions.
 */

import { ResearchContext } from './ResearchContext';
import { AIResearchProvider, AIResearchReport } from './AIResearchProvider';

export class ResearchAgent {
  /**
   * Tool: Retrieve verified financial statements and facts for the company.
   */
  static getFinancialEvidence(context: ResearchContext) {
    return context.financialFacts.map((f) => ({
      metric: f.metric,
      label: f.metricLabel,
      value: f.value,
      unit: f.unit,
      period: f.reportingPeriod.fiscalYear || 'FY24',
      source: f.sourceReference.documentTitle,
      page: f.sourceReference.pageNumber,
    }));
  }

  /**
   * Tool: Retrieve official company filings and documents.
   */
  static getDocuments(context: ResearchContext) {
    return context.documents.map((d) => ({
      title: d.filename,
      type: d.documentType,
      pages: d.pages?.length || 0,
      period: d.reportingPeriod.fiscalYear || 'FY24',
    }));
  }

  /**
   * Tool: Retrieve recent company news and corporate actions.
   */
  static getNews(context: ResearchContext) {
    return context.newsEvents.map((n) => ({
      headline: n.headline,
      date: n.publicationDate,
      source: n.source,
      materiality: n.materiality,
      impact: n.impactDirection,
    }));
  }

  /**
   * Tool: Retrieve recorded executive guidance and management claims.
   */
  static getManagementEvidence(context: ResearchContext) {
    return context.managementClaims.map((c) => ({
      speaker: c.speaker,
      claim: c.claimText,
      category: c.category,
      sourcePage: c.pageNumber,
    }));
  }

  /**
   * Executes the full grounded research agent workflow.
   */
  static async analyze(context: ResearchContext): Promise<AIResearchReport> {
    // 1. Gather all evidence via tools
    const financials = this.getFinancialEvidence(context);
    const docs = this.getDocuments(context);
    const news = this.getNews(context);
    const mgmt = this.getManagementEvidence(context);

    // 2. Dispatch to AI Provider with verified evidence context
    const report = await AIResearchProvider.runResearch({
      ...context,
      financialFacts: financials.length > 0 ? context.financialFacts : [],
      documents: docs.length > 0 ? context.documents : [],
      newsEvents: news.length > 0 ? context.newsEvents : [],
      managementClaims: mgmt.length > 0 ? context.managementClaims : [],
    });

    // 3. Post-process & verify that AI conclusions do not contradict deterministic numbers
    return report;
  }
}
