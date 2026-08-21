/**
 * LiveResearchRefreshOrchestrator.ts
 * Phase 16 — Live Research Refresh & Phase 15 DAG Integration Controller.
 * Emits CanonicalDataChange events directly into the single canonical Phase 15 AnalysisDependencyGraph.
 */

import { ResearchProject } from '../models/ResearchProject';
import { AnalysisDependencyGraph, UpstreamInputCategory, PhaseNodeId } from '../orchestration/AnalysisDependencyGraph';
import { ResearchPipelineOrchestrator, PipelineExecutionReport } from '../orchestration/ResearchPipelineOrchestrator';

export interface CanonicalDataChange {
  changeId: string;
  projectId: string;
  timestamp: string;
  category: UpstreamInputCategory;
  symbol: string;
  updatedFields: string[];
  cutoffDate?: string;
}

export interface LiveRefreshExecutionResult {
  changeRecord: CanonicalDataChange;
  affectedPhases: PhaseNodeId[];
  executionReport: PipelineExecutionReport;
  durationMs: number;
}

export class LiveResearchRefreshOrchestrator {
  /**
   * Processes a live data modification event, queries the Phase 15 DAG for downstream dependents,
   * and triggers surgical recalculation across only affected analytical phases.
   */
  public static processLiveUpdate(
    project: ResearchProject,
    category: UpstreamInputCategory,
    updatedFields: string[] = [],
    cutoffDate?: string
  ): LiveRefreshExecutionResult {
    const start = Date.now();
    const changeId = `chg_${category}_${Date.now()}`;

    const changeRecord: CanonicalDataChange = {
      changeId,
      projectId: project.id,
      timestamp: new Date().toISOString(),
      category,
      symbol: project.company.symbol,
      updatedFields,
      cutoffDate,
    };

    // 1. Query Phase 15 Analysis Dependency Graph for downstream dependent phases
    const affectedPhases = AnalysisDependencyGraph.getInvalidatedPhasesForInput(category);

    // 2. Execute surgical recalculation on affected phases
    const executionReport = ResearchPipelineOrchestrator.executePipeline(project, affectedPhases);

    return {
      changeRecord,
      affectedPhases,
      executionReport,
      durationMs: Date.now() - start,
    };
  }
}
