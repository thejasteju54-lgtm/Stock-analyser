/**
 * CatalystRiskMasterEngine.ts
 * Phase 12 — Master Orchestrator for Catalysts, Thesis Breakers & Multi-Dimensional Risk Matrix.
 */

import { ResearchProject } from '../models/ResearchProject';
import {
  CatalystAndRiskReport,
  RiskMatrixSummary,
} from './CatalystRiskTypes';
import { CatalystExtractionEngine } from './CatalystExtractionEngine';
import { RiskSynthesisEngine } from './RiskSynthesisEngine';
import { ThesisBreakerEngine } from './ThesisBreakerEngine';
import { CatalystRiskPolicyRegistry } from './CatalystRiskPolicyRegistry';

export class CatalystRiskMasterEngine {
  /**
   * Runs the complete Phase 12 Catalyst and Risk synthesis pipeline.
   * Strictly read-only against previous phase state (zero mutation).
   */
  public static execute(project: ResearchProject): CatalystAndRiskReport {
    const asOfDate = new Date().toISOString().split('T')[0];

    // 1. Pipeline A: Catalyst Extraction & Ranking
    const { catalysts, rankedCatalysts } = CatalystExtractionEngine.extractCatalysts(project);

    // 2. Pipeline B: Multi-Dimensional Risk Synthesis & Lineage Deduplication
    const { risks, rankedRisks, crossLayerRiskSummary } = RiskSynthesisEngine.synthesizeRisks(project);

    // 3. Pipeline C: Sector-Specific Falsifiable Thesis Breakers
    const thesisBreakers = ThesisBreakerEngine.generateThesisBreakers(project);

    // 4. Aggregate Risk Rating & Deduplicated Geometry
    const aggResult = CatalystRiskPolicyRegistry.calculateAggregateRiskRating(risks);

    // 5. Catalyst-Risk Asymmetry Evaluator
    const asymResult = CatalystRiskPolicyRegistry.calculateCatalystRiskAsymmetry(catalysts, risks);

    // 6. Assemble Top Categories
    const categoryMap = new Map<string, { count: number; maxScore: number }>();
    for (const r of risks) {
      const existing = categoryMap.get(r.category) || { count: 0, maxScore: 0 };
      categoryMap.set(r.category, {
        count: existing.count + 1,
        maxScore: Math.max(existing.maxScore, r.netRiskScore),
      });
    }

    const topRiskCategories = Array.from(categoryMap.entries()).map(([cat, val]) => ({
      category: cat as any,
      count: val.count,
      maxScore: val.maxScore,
    }));

    const matrixSummary: RiskMatrixSummary = {
      totalRisksIdentified: risks.length,
      deduplicatedRiskCount: aggResult.deduplicatedRiskCount,
      criticalRiskCount: aggResult.criticalCount,
      highRiskCount: aggResult.highCount,
      mediumRiskCount: aggResult.mediumCount,
      lowRiskCount: aggResult.lowCount,
      topRiskCategories,
      aggregateRiskRating: aggResult.rating,
      asymmetryAssessment: asymResult.asymmetry,
      upsidePotentialScore: asymResult.upsideScore,
      downsideRiskScore: asymResult.downsideScore,
      netAsymmetryRatio: asymResult.ratio,
      methodologyNote: `5x5 Matrix (P: 1-5 x I: 1-5) evaluated with verified mitigation factor reductions and lineage deduplication.`,
    };

    return {
      projectId: project.id,
      companySymbol: project.company.symbol,
      asOfDate,
      catalysts,
      rankedCatalysts,
      risks,
      rankedRisks,
      thesisBreakers,
      matrixSummary,
      crossLayerRiskSummary,
      generatedAt: new Date().toISOString(),
    };
  }
}
