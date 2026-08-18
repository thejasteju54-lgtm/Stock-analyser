/**
 * NewsAndIndustryMasterEngine.ts
 * Master orchestrator for Phase 11 — News Intelligence & Industry Analysis.
 */

import {
  NewsAndIndustryReport,
} from './NewsAndIndustryTypes';
import { RawNewsArticle } from './NewsDeduplicationEngine';
import { CompanyEntityProfile } from './EntityResolutionEngine';
import { NewsIntelligenceEngine } from './NewsIntelligenceEngine';
import { IndustryAnalysisEngine } from '../industry/IndustryAnalysisEngine';
import { CrossLayerSensitivityEngine } from './CrossLayerSensitivityEngine';

export class NewsAndIndustryMasterEngine {
  /**
   * Main analysis execution entry point for Phase 11.
   */
  public static analyze(
    projectId: string,
    companySymbol: string,
    companyName: string,
    sector: string,
    industryName: string,
    rawArticles: RawNewsArticle[],
    companyProfile: CompanyEntityProfile,
    currentDate: string = new Date().toISOString().split('T')[0]
  ): NewsAndIndustryReport {
    // 1. Execute Pipeline A: News Intelligence
    const newsResult = NewsIntelligenceEngine.processNewsFeed(
      rawArticles,
      companyProfile,
      currentDate
    );

    // 2. Execute Pipeline B: Industry Analysis
    const industryProfile = IndustryAnalysisEngine.generateIndustryProfile(
      sector,
      industryName,
      companySymbol
    );

    const competitors = IndustryAnalysisEngine.getCompetitors(companySymbol);
    const companyIndustryPosition = IndustryAnalysisEngine.evaluateCompanyPosition(
      companySymbol,
      competitors
    );
    const industryOutlook = IndustryAnalysisEngine.generateIndustryOutlook(industryName);

    // 3. Execute Cross-Layer Sensitivity Mapping (Non-mutating)
    const crossLayerSensitivities = CrossLayerSensitivityEngine.generateSensitivities(
      newsResult.newsEvents,
      industryProfile
    );

    // Calculate aggregate confidence score
    const avgNewsConfidence = newsResult.newsEvents.length > 0
      ? newsResult.newsEvents.reduce((a, b) => a + b.confidence, 0) / newsResult.newsEvents.length
      : 80;
    const confidenceScore = Math.round((avgNewsConfidence * 0.5 + industryProfile.confidence * 0.5));

    return {
      reportId: `news_ind_${companySymbol}_${Date.now()}`,
      projectId,
      companySymbol,
      companyName,
      sector,
      industry: industryName,
      newsEvents: newsResult.newsEvents,
      materialAlerts: newsResult.materialAlerts,
      catalysts: newsResult.catalysts,
      upcomingEvents: newsResult.upcomingEvents,
      newsRisks: newsResult.newsRisks,
      sourceConflicts: newsResult.sourceConflicts,
      sourceLineages: [],
      industryProfile,
      competitors,
      companyIndustryPosition,
      industryOutlook,
      crossLayerSensitivities,
      dataFreshness: {
        latestNewsRetrieved: new Date().toISOString(),
        industryDataUpdated: industryProfile.updatedAt,
        marketContextDate: currentDate,
        isStale: false,
      },
      confidenceScore,
      disclaimers: [
        'Analytical Research Platform: External context intelligence does NOT constitute an investment recommendation or BUY/HOLD/AVOID verdict.',
        'Zero State Mutation: Cross-layer linkages provide analytical sensitivity observations without modifying historical accounting facts or model valuations.',
        'Causality Guardrail: Coincident price-action movements on event dates represent point-in-time correlations unless direct factual causality is proven.',
      ],
      analysisTimestamp: new Date().toISOString(),
    };
  }
}
