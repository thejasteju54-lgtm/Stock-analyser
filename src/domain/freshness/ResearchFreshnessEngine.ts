/**
 * ResearchFreshnessEngine.ts
 * Phase 15 — Project-Wide Freshness & Staleness Assessment Engine.
 */

import { ResearchProject } from '../models/ResearchProject';
import { ResearchFreshnessPolicyRegistry } from './ResearchFreshnessPolicyRegistry';
import { PhaseNodeId } from '../orchestration/AnalysisDependencyGraph';

export type RefreshPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface FreshnessItemAssessment {
  category: string;
  name: string;
  lastUpdated: string;
  ageHours: number;
  maxFreshnessHours: number;
  isStale: boolean;
  isCriticallyStale: boolean;
  priority: RefreshPriority;
  affectedPhases: PhaseNodeId[];
}

export interface ProjectFreshnessReport {
  items: FreshnessItemAssessment[];
  hasStaleData: boolean;
  hasCriticallyStaleData: boolean;
  totalConvictionPenalty: number;
  evaluatedAt: string;
}

export class ResearchFreshnessEngine {
  /**
   * Evaluates freshness across all data categories for a research project.
   */
  public static assessProjectFreshness(
    project: ResearchProject,
    currentDateIso: string = new Date().toISOString()
  ): ProjectFreshnessReport {
    const items: FreshnessItemAssessment[] = [];
    const now = new Date(currentDateIso).getTime();

    // 1. Market Price
    const priceDate = project.valuationAnalysis?.marketSnapshot.priceDate || project.updatedAt || project.createdAt;
    items.push(this.evaluateCategory('MARKET_PRICE', priceDate, now));

    // 2. Technical Data
    const techDate = (project.technicalAnalysis as any)?.dataCutoffDate || priceDate;
    items.push(this.evaluateCategory('TECHNICAL_DATA', techDate, now));

    // 3. News
    const newsDate = (project.newsAndIndustryAnalysis as any)?.newsFeedSummary?.lastNewsDate || project.updatedAt;
    items.push(this.evaluateCategory('NEWS', newsDate, now));

    // 4. Shareholding
    const shareholdingDoc = project.documents?.find((d) => d.documentType === 'SHAREHOLDING_PATTERN');
    const shareholdingDate = (shareholdingDoc?.reportingPeriod as any)?.endDate || shareholdingDoc?.reportingPeriod?.fiscalYear || project.createdAt;
    items.push(this.evaluateCategory('SHAREHOLDING', shareholdingDate, now));

    // 5. Financial Statements
    const annualReportDoc = project.documents?.find((d) => d.documentType === 'ANNUAL_REPORT');
    const finDate = (annualReportDoc?.reportingPeriod as any)?.endDate || annualReportDoc?.reportingPeriod?.fiscalYear || project.createdAt;
    items.push(this.evaluateCategory('FINANCIAL_STATEMENTS', finDate, now));

    // 6. Management Guidance
    const concallDoc = project.documents?.find((d) => d.documentType === 'CONCALL_TRANSCRIPT');
    const mgmtDate = (concallDoc?.reportingPeriod as any)?.endDate || concallDoc?.reportingPeriod?.fiscalYear || project.createdAt;
    items.push(this.evaluateCategory('MANAGEMENT_GUIDANCE', mgmtDate, now));

    // 7. Industry Data
    const indDate = (project.newsAndIndustryAnalysis as any)?.industryProfile?.lastUpdatedDate || project.createdAt;
    items.push(this.evaluateCategory('INDUSTRY_DATA', indDate, now));

    // 8. Valuation Inputs
    items.push(this.evaluateCategory('VALUATION_INPUTS', priceDate, now));

    let hasStaleData = false;
    let hasCriticallyStaleData = false;
    let totalConvictionPenalty = 0;

    for (const item of items) {
      if (item.isCriticallyStale) {
        hasCriticallyStaleData = true;
        hasStaleData = true;
        const rule = ResearchFreshnessPolicyRegistry.getRule(item.category);
        totalConvictionPenalty += rule.convictionPenaltyIfStale;
      } else if (item.isStale) {
        hasStaleData = true;
        const rule = ResearchFreshnessPolicyRegistry.getRule(item.category);
        totalConvictionPenalty += rule.convictionPenaltyIfStale;
      }
    }

    return {
      items,
      hasStaleData,
      hasCriticallyStaleData,
      totalConvictionPenalty: Math.min(3.0, totalConvictionPenalty), // Capped at 3.0 conviction penalty
      evaluatedAt: currentDateIso,
    };
  }

  private static evaluateCategory(category: string, lastUpdatedIso: string, nowMs: number): FreshnessItemAssessment {
    const rule = ResearchFreshnessPolicyRegistry.getRule(category);
    const lastTime = new Date(lastUpdatedIso).getTime() || nowMs;
    const ageHours = Math.max(0, Math.round((nowMs - lastTime) / (1000 * 60 * 60)));

    const isCriticallyStale = ageHours > rule.criticalStaleThresholdHours;
    const isStale = ageHours > rule.staleThresholdHours;

    let priority: RefreshPriority = 'LOW';
    if (isCriticallyStale) {
      priority = 'CRITICAL';
    } else if (isStale) {
      priority = 'HIGH';
    } else if (ageHours > rule.freshThresholdHours) {
      priority = 'MEDIUM';
    }

    return {
      category: rule.category,
      name: rule.name,
      lastUpdated: lastUpdatedIso,
      ageHours,
      maxFreshnessHours: rule.freshThresholdHours,
      isStale,
      isCriticallyStale,
      priority,
      affectedPhases: rule.affectedPhases,
    };
  }
}
