/**
 * PipelineReadinessGate.ts
 * Phase 15 — Pre-Flight Pipeline Execution Readiness Gate.
 * Evaluates whether evidence is sufficient to launch the analytical pipeline.
 */

import { ResearchProject } from '../models/ResearchProject';

export interface PipelineReadinessReport {
  isReadyForExecution: boolean;
  gateStatus: 'PASSED' | 'WARNINGS_PRESENT' | 'BLOCKED';
  blockers: string[];
  warnings: string[];
  checkedAt: string;
}

export class PipelineReadinessGate {
  /**
   * Validates pre-flight conditions before executing analytical pipelines.
   */
  public static evaluatePipelineReadiness(project: ResearchProject): PipelineReadinessReport {
    const blockers: string[] = [];
    const warnings: string[] = [];

    // 1. Company Identity Check
    if (!project.company || !project.company.symbol || !project.company.displayName) {
      blockers.push('Company identity is unverified or incomplete.');
    }

    // 2. Minimum Statutory Ingestion or Extracted Facts
    const hasFacts = (project.facts?.length || 0) > 0;
    const hasDocs = (project.documents?.length || 0) > 0;

    if (!hasFacts && !hasDocs) {
      blockers.push('No financial documents or extracted financial facts available for analysis.');
    } else if (!hasFacts) {
      warnings.push('Document extraction has not completed yet; extraction will run automatically during pipeline execution.');
    }

    // 3. Technical & News Checks (Non-blocking, generate warnings)
    const hasTechnicalDocs = project.documents?.some((d) => d.documentType === 'TECHNICAL_CHART');
    if (!hasTechnicalDocs && !project.technicalAnalysis) {
      warnings.push('Technical chart data is unavailable; Phase 10 Technical Structure will be marked NOT_ASSESSABLE.');
    }

    const hasNews = (project.documents?.some((d) => d.documentType === 'OTHER') || !!project.newsAndIndustryAnalysis);
    if (!hasNews) {
      warnings.push('External news feed is empty; Phase 11 will use filing announcements and sector benchmarks.');
    }

    const isReadyForExecution = blockers.length === 0;
    const gateStatus: PipelineReadinessReport['gateStatus'] =
      blockers.length > 0 ? 'BLOCKED' : warnings.length > 0 ? 'WARNINGS_PRESENT' : 'PASSED';

    return {
      isReadyForExecution,
      gateStatus,
      blockers,
      warnings,
      checkedAt: new Date().toISOString(),
    };
  }
}
