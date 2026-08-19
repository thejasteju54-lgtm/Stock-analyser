/**
 * CatalystExtractionEngine.ts
 * Phase 12 — Extracts, standardizes, and scores institutional catalysts from cross-layer evidence.
 */

import { ResearchProject } from '../models/ResearchProject';
import { CatalystItem, CatalystType, CatalystHorizon, CatalystLikelihood, CatalystImpactMagnitude } from './CatalystRiskTypes';
import { CatalystRiskPolicyRegistry } from './CatalystRiskPolicyRegistry';

export class CatalystExtractionEngine {
  /**
   * Extracts and ranks evidence-backed catalysts from project state.
   */
  public static extractCatalysts(project: ResearchProject): {
    catalysts: CatalystItem[];
    rankedCatalysts: CatalystItem[];
  } {
    const catalysts: CatalystItem[] = [];

    // 1. Ingest News & Industry Catalysts (Phase 11)
    if (project.newsAndIndustryAnalysis) {
      for (const cat of project.newsAndIndustryAnalysis.catalysts) {
        let type: CatalystType = 'ORDER_BOOK_WIN';
        if (cat.category === 'CAPEX' || cat.category === 'EXPANSION') type = 'CAPACITY_EXPANSION';
        else if (cat.category === 'RESULTS') type = 'EARNINGS_GROWTH';
        else if (cat.category === 'ACQUISITION') type = 'MARKET_SHARE_GAIN';
        else if (cat.category === 'REGULATORY') type = 'REGULATORY_RELAXATION';

        let horizon: CatalystHorizon = 'SHORT_TERM_3_6M';
        if (cat.datePrecision === 'EXACT_DATE') horizon = 'IMMEDIATE_0_3M';
        else if (cat.category === 'CAPEX') horizon = 'LONG_TERM_12M_PLUS';

        const likelihood: CatalystLikelihood = 'HIGH';
        const impactMagnitude: CatalystImpactMagnitude = 'HIGH';

        const { score, isAssessable } = CatalystRiskPolicyRegistry.calculateCatalystScore({
          impactMagnitude,
          likelihood,
          verificationStatus: 'VERIFIED_EVIDENCE',
          horizon,
          isPrimaryFinancialChannel: true,
          confidence: 85,
        });

        if (isAssessable) {
          catalysts.push({
            catalystId: `cat_news_${cat.catalystId}`,
            title: cat.event,
            description: cat.businessImpact,
            type,
            expectedHorizon: horizon,
            likelihood,
            likelihoodScore: 4,
            impactMagnitude,
            impactScore: score,
            financialChannels: [cat.financialChannel],
            businessDrivers: [cat.category.replace('_', ' ')],
            evidenceReferences: [cat.event],
            supportingFactIds: [],
            sourceLayer: 'NEWS_INDUSTRY',
            verificationStatus: 'VERIFIED_EVIDENCE',
            confidence: 85,
          });
        }
      }
    }

    // 2. Ingest Management Guidance Commitments (Phase 8)
    if (project.managementAnalysis) {
      const overallCred = project.managementAnalysis.credibilityAssessment?.credibilityScore || 75;
      for (const commitment of project.managementAnalysis.commitments) {
        if (commitment.status === 'ON_TRACK' || commitment.status === 'ACHIEVED' || commitment.status === 'ABOVE_GUIDANCE') {
          const type: CatalystType = commitment.commitmentType === 'CAPEX_PLAN' ? 'CAPACITY_EXPANSION' : 'EARNINGS_GROWTH';
          const horizon: CatalystHorizon = 'MEDIUM_TERM_6_12M';
          const likelihood: CatalystLikelihood = commitment.status === 'ACHIEVED' ? 'HIGH' : 'MEDIUM';
          const impactMagnitude: CatalystImpactMagnitude = 'HIGH';

          const { score, isAssessable } = CatalystRiskPolicyRegistry.calculateCatalystScore({
            impactMagnitude,
            likelihood,
            verificationStatus: 'MANAGEMENT_CLAIM',
            horizon,
            isPrimaryFinancialChannel: true,
            precedentFrequency: overallCred / 100.0,
            confidence: overallCred,
          });

          if (isAssessable) {
            catalysts.push({
              catalystId: `cat_mgmt_${commitment.commitmentId}`,
              title: `Management Guidance: ${commitment.commitmentText}`,
              description: commitment.managementStatedReason || commitment.commitmentText,
              type,
              expectedHorizon: horizon,
              likelihood,
              likelihoodScore: likelihood === 'HIGH' ? 4 : 3,
              impactMagnitude,
              impactScore: score,
              financialChannels: ['REVENUE', 'MARGINS'],
              businessDrivers: [commitment.commitmentType],
              evidenceReferences: commitment.evidenceReferences.map((e) => e.documentName || 'Annual Filing'),
              supportingFactIds: [],
              sourceLayer: 'MANAGEMENT',
              verificationStatus: 'MANAGEMENT_CLAIM',
              confidence: overallCred,
            });
          }
        }
      }
    }

    // 3. Ingest Technical Breakout Setup (Phase 10)
    if (project.technicalAnalysis) {
      const ta = project.technicalAnalysis;
      if (ta.marketCycle.phase === 'MARKUP' || ta.trend.primaryTrend === 'STRONG_UPTREND' || ta.trend.primaryTrend === 'UPTREND') {
        const { score, isAssessable } = CatalystRiskPolicyRegistry.calculateCatalystScore({
          impactMagnitude: 'MEDIUM',
          likelihood: 'HIGH',
          verificationStatus: 'VERIFIED_EVIDENCE',
          horizon: 'IMMEDIATE_0_3M',
          isPrimaryFinancialChannel: false,
          confidence: 80,
        });

        if (isAssessable) {
          catalysts.push({
            catalystId: `cat_tech_markup`,
            title: `Technical Stage-2 Markup & Bullish Trend Alignment`,
            description: `Stock trading in confirmed bullish market structure above key moving averages with volume expansion.`,
            type: 'VALUATION_RERATING',
            expectedHorizon: 'IMMEDIATE_0_3M',
            likelihood: 'HIGH',
            likelihoodScore: 4,
            impactMagnitude: 'MEDIUM',
            impactScore: score,
            financialChannels: ['VALUATION_MULTIPLE'],
            businessDrivers: ['Technical Momentum'],
            evidenceReferences: [`Technical Regime: ${ta.movingAverages.alignment}`],
            supportingFactIds: [],
            sourceLayer: 'TECHNICAL',
            verificationStatus: 'VERIFIED_EVIDENCE',
            confidence: 80,
          });
        }
      }
    }

    // 4. Ingest Valuation Discount / Re-Rating Potential (Phase 9)
    if (project.valuationAnalysis) {
      const val = project.valuationAnalysis;
      if (val.valuationPosition === 'DEEP_DISCOUNT' || val.valuationPosition === 'DISCOUNT') {
        const { score, isAssessable } = CatalystRiskPolicyRegistry.calculateCatalystScore({
          impactMagnitude: 'MATERIAL',
          likelihood: 'MEDIUM',
          verificationStatus: 'VERIFIED_EVIDENCE',
          horizon: 'MEDIUM_TERM_6_12M',
          isPrimaryFinancialChannel: true,
          confidence: 85,
        });

        if (isAssessable) {
          catalysts.push({
            catalystId: `cat_val_rerate`,
            title: `Valuation Re-Rating to Sector Median`,
            description: `Stock trades at ${val.valuationPosition.replace('_', ' ')} relative to intrinsic DCF fair value range.`,
            type: 'VALUATION_RERATING',
            expectedHorizon: 'MEDIUM_TERM_6_12M',
            likelihood: 'MEDIUM',
            likelihoodScore: 3,
            impactMagnitude: 'MATERIAL',
            impactScore: score,
            financialChannels: ['VALUATION_MULTIPLE'],
            businessDrivers: ['Multiple Expansion'],
            evidenceReferences: [`Valuation Position: ${val.valuationPosition}`],
            supportingFactIds: [],
            sourceLayer: 'VALUATION',
            verificationStatus: 'VERIFIED_EVIDENCE',
            confidence: 85,
          });
        }
      }
    }

    // Default Fallback Catalyst if empty
    if (catalysts.length === 0) {
      const { score } = CatalystRiskPolicyRegistry.calculateCatalystScore({
        impactMagnitude: 'MEDIUM',
        likelihood: 'MEDIUM',
        verificationStatus: 'ANALYST_INFERENCE',
        horizon: 'MEDIUM_TERM_6_12M',
        isPrimaryFinancialChannel: true,
        confidence: 60,
      });

      catalysts.push({
        catalystId: `cat_fundamental_organic`,
        title: `Organic Revenue & Margin Expansion`,
        description: `Core domestic market volume growth and stable input cost economics.`,
        type: 'EARNINGS_GROWTH',
        expectedHorizon: 'MEDIUM_TERM_6_12M',
        likelihood: 'MEDIUM',
        likelihoodScore: 3,
        impactMagnitude: 'MEDIUM',
        impactScore: score,
        financialChannels: ['REVENUE', 'MARGINS'],
        businessDrivers: ['Domestic Demand'],
        evidenceReferences: ['Audited Financial Statements'],
        supportingFactIds: [],
        sourceLayer: 'FUNDAMENTAL',
        verificationStatus: 'ANALYST_INFERENCE',
        confidence: 60,
      });
    }

    // Sort rankedCatalysts deterministically by impactScore descending, then likelihoodScore descending
    const rankedCatalysts = [...catalysts].sort((a, b) => {
      if (b.impactScore !== a.impactScore) return b.impactScore - a.impactScore;
      return b.likelihoodScore - a.likelihoodScore;
    });

    return {
      catalysts,
      rankedCatalysts,
    };
  }
}
