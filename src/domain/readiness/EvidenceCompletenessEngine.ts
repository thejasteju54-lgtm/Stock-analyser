/**
 * EvidenceCompletenessEngine.ts
 * Phase 15 — Independent 11-Pillar Evidence Completeness Evaluation Engine.
 */

import { ResearchProject } from '../models/ResearchProject';
import { CompletenessPolicyRegistry, CompletenessCriticalityTier } from './CompletenessPolicyRegistry';

export type CompletenessStatus = 'COMPLETE' | 'PARTIAL' | 'INSUFFICIENT' | 'NOT_ASSESSABLE';

export interface PillarCompletenessItem {
  pillarId: string;
  name: string;
  score: number; // 0-100
  status: CompletenessStatus;
  criticality: CompletenessCriticalityTier;
  availableItemsCount: number;
  expectedItemsCount: number;
  missingItems: string[];
}

export interface ProjectEvidenceCompletenessReport {
  pillars: Record<string, PillarCompletenessItem>;
  criticalPillarsSatisfied: boolean;
  totalPillarsCount: number;
  satisfiedPillarsCount: number;
  evaluatedAt: string;
}

export class EvidenceCompletenessEngine {
  /**
   * Evaluates the completeness of all 11 analytical pillars for a given research project.
   */
  public static evaluateProjectCompleteness(project: ResearchProject): ProjectEvidenceCompletenessReport {
    const pillars: Record<string, PillarCompletenessItem> = {};

    // 1. Financial Statements Completeness (P5)
    const factsCount = project.facts?.length || 0;
    const finScore = Math.min(100, Math.round((factsCount / 20) * 100));
    pillars['FINANCIAL_STATEMENTS'] = this.buildPillarItem(
      'FINANCIAL_STATEMENTS',
      finScore,
      factsCount,
      20,
      factsCount < 10 ? ['Audited Income Statement', 'Audited Balance Sheet', 'Cash Flow Statement'] : []
    );

    // 2. Fundamental Health Completeness (P6)
    const hasHealth = !!project.fundamentalAnalysis;
    pillars['FUNDAMENTAL_HEALTH'] = this.buildPillarItem(
      'FUNDAMENTAL_HEALTH',
      hasHealth ? 100 : 0,
      hasHealth ? 1 : 0,
      1,
      hasHealth ? [] : ['Phase 6 Fundamental Health Analysis']
    );

    // 3. Forensic Accounting Completeness (P7)
    const hasForensics = !!project.forensicAnalysis;
    pillars['FORENSIC_ACCOUNTING'] = this.buildPillarItem(
      'FORENSIC_ACCOUNTING',
      hasForensics ? 100 : 0,
      hasForensics ? 1 : 0,
      1,
      hasForensics ? [] : ['Phase 7 Forensic Accounting Investigation']
    );

    // 4. Management DNA Completeness (P8)
    const claimsCount = project.managementClaims?.length || 0;
    const hasMgmtAnalysis = !!project.managementAnalysis;
    const mgmtScore = hasMgmtAnalysis ? 100 : Math.min(100, Math.round((claimsCount / 5) * 100));
    pillars['MANAGEMENT_DNA'] = this.buildPillarItem(
      'MANAGEMENT_DNA',
      mgmtScore,
      claimsCount,
      5,
      claimsCount < 3 ? ['Concall Transcript Guidance', 'Management Commitments'] : []
    );

    // 5. Sector Valuation Completeness (P9)
    const hasValuation = !!project.valuationAnalysis;
    pillars['SECTOR_VALUATION'] = this.buildPillarItem(
      'SECTOR_VALUATION',
      hasValuation ? 100 : 0,
      hasValuation ? 1 : 0,
      1,
      hasValuation ? [] : ['Sector-Aware Valuation Model']
    );

    // 6. Technical Structure Completeness (P10)
    const hasTechnical = !!project.technicalAnalysis;
    pillars['TECHNICAL_STRUCTURE'] = this.buildPillarItem(
      'TECHNICAL_STRUCTURE',
      hasTechnical ? 100 : 0,
      hasTechnical ? 1 : 0,
      1,
      hasTechnical ? [] : ['Candlestick Price History / Chart Screenshot']
    );

    // 7. Real-Time News Completeness (P11)
    const hasNews = !!project.newsAndIndustryAnalysis;
    pillars['REAL_TIME_NEWS'] = this.buildPillarItem(
      'REAL_TIME_NEWS',
      hasNews ? 100 : 0,
      hasNews ? 1 : 0,
      1,
      hasNews ? [] : ['Corporate Announcements & News Intelligence']
    );

    // 8. Industry Moat Completeness (P11)
    pillars['INDUSTRY_MOAT'] = this.buildPillarItem(
      'INDUSTRY_MOAT',
      hasNews ? 100 : 0,
      hasNews ? 1 : 0,
      1,
      hasNews ? [] : ['Industry Peer Moat & Porter 5-Forces Profile']
    );

    // 9. Catalysts & Risks Completeness (P12)
    const hasCatRisk = !!project.catalystAndRiskAnalysis;
    pillars['CATALYSTS_AND_RISKS'] = this.buildPillarItem(
      'CATALYSTS_AND_RISKS',
      hasCatRisk ? 100 : 0,
      hasCatRisk ? 1 : 0,
      1,
      hasCatRisk ? [] : ['Catalyst & Multi-Dimensional Risk Synthesis']
    );

    // 10. Scenario Modeling Completeness (P13)
    const hasScenarios = !!project.scenarioAnalysis;
    pillars['SCENARIO_MODELING'] = this.buildPillarItem(
      'SCENARIO_MODELING',
      hasScenarios ? 100 : 0,
      hasScenarios ? 1 : 0,
      1,
      hasScenarios ? [] : ['Bear/Base/Bull Forward Scenario Models']
    );

    // 11. Decision Synthesis Completeness (P14)
    const hasVerdict = !!project.verdictAnalysis;
    pillars['DECISION_SYNTHESIS'] = this.buildPillarItem(
      'DECISION_SYNTHESIS',
      hasVerdict ? 100 : 0,
      hasVerdict ? 1 : 0,
      1,
      hasVerdict ? [] : ['Phase 14 Investment Verdict & Decision Matrix']
    );

    // Evaluate Critical Pillars
    let criticalPillarsSatisfied = true;
    let satisfiedPillarsCount = 0;
    const totalPillarsCount = Object.keys(pillars).length;

    for (const item of Object.values(pillars)) {
      const rule = CompletenessPolicyRegistry.getRule(item.pillarId);
      const isPillarPassed = item.score >= rule.minimumCompletenessScore;
      if (isPillarPassed) {
        satisfiedPillarsCount++;
      } else if (rule.criticality === 'CRITICAL') {
        criticalPillarsSatisfied = false;
      }
    }

    return {
      pillars,
      criticalPillarsSatisfied,
      totalPillarsCount,
      satisfiedPillarsCount,
      evaluatedAt: new Date().toISOString(),
    };
  }

  private static buildPillarItem(
    pillarId: string,
    score: number,
    availableItemsCount: number,
    expectedItemsCount: number,
    missingItems: string[]
  ): PillarCompletenessItem {
    const rule = CompletenessPolicyRegistry.getRule(pillarId);
    let status: CompletenessStatus = 'NOT_ASSESSABLE';

    if (score >= rule.minimumCompletenessScore) {
      status = 'COMPLETE';
    } else if (score > 0) {
      status = 'PARTIAL';
    } else {
      status = 'INSUFFICIENT';
    }

    return {
      pillarId,
      name: rule.name,
      score,
      status,
      criticality: rule.criticality,
      availableItemsCount,
      expectedItemsCount,
      missingItems,
    };
  }
}
