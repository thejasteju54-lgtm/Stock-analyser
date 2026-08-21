/**
 * ResearchWorkspaceView.tsx
 * Phase 15 — Production Research Workflow, Evidence Refresh & Report Delivery View.
 */

import React, { useState } from 'react';
import { ResearchProject } from '../domain/models/ResearchProject';
import { WorkflowStatusStepper } from '../components/workflow/WorkflowStatusStepper';
import { DocumentRegistryTable } from '../components/workflow/DocumentRegistryTable';
import { EvidenceCompletenessGrid } from '../components/workflow/EvidenceCompletenessGrid';
import { PipelineExecutionPanel } from '../components/workflow/PipelineExecutionPanel';
import { FreshnessAndRefreshQueueCard } from '../components/workflow/FreshnessAndRefreshQueueCard';
import { InvestmentReportViewer } from '../components/workflow/InvestmentReportViewer';
import { SnapshotComparisonModal } from '../components/workflow/SnapshotComparisonModal';
import { EvidenceCompletenessEngine } from '../domain/readiness/EvidenceCompletenessEngine';
import { ResearchFreshnessEngine } from '../domain/freshness/ResearchFreshnessEngine';
import { ResearchPipelineOrchestrator, PipelineExecutionReport } from '../domain/orchestration/ResearchPipelineOrchestrator';
import { ResearchSnapshotEngine } from '../domain/snapshots/ResearchSnapshotEngine';
import { ResearchChangeDetectionEngine } from '../domain/snapshots/ResearchChangeDetectionEngine';
import { InvestmentResearchReportEngine } from '../domain/reports/InvestmentResearchReportEngine';
import { ProjectStorage } from '../domain/storage/ProjectStorage';
import { SnapshotComparisonReport } from '../domain/snapshots/SnapshotTypes';
import { Briefcase, History } from 'lucide-react';

interface ResearchWorkspaceViewProps {
  project: ResearchProject;
  onProjectUpdate?: (updatedProject: ResearchProject) => void;
}

export const ResearchWorkspaceView: React.FC<ResearchWorkspaceViewProps> = ({
  project,
  onProjectUpdate,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [executionReport, setExecutionReport] = useState<PipelineExecutionReport | undefined>(undefined);
  const [comparisonReport, setComparisonReport] = useState<SnapshotComparisonReport | null>(null);

  const completenessReport = EvidenceCompletenessEngine.evaluateProjectCompleteness(project);
  const freshnessReport = ResearchFreshnessEngine.assessProjectFreshness(project);
  const reportPayload = project.reportPayload || InvestmentResearchReportEngine.generateReport(project, project.snapshots?.[0]?.snapshotId);

  const handleRunFullPipeline = () => {
    setIsRunning(true);
    setTimeout(() => {
      const rep = ResearchPipelineOrchestrator.executePipeline(project);
      setExecutionReport(rep);
      
      // Auto-create snapshot and report
      const snap = ResearchSnapshotEngine.createSnapshot(project, undefined, 'Workflow Pipeline Execution');
      ProjectStorage.addSnapshotToProject(project.id, snap);
      
      const repPayload = InvestmentResearchReportEngine.generateReport(project, snap.snapshotId);
      ProjectStorage.saveReportPayloadForProject(project.id, repPayload);

      setIsRunning(false);
      if (onProjectUpdate) {
        onProjectUpdate({ ...project });
      }
    }, 300);
  };

  const handleRunIncrementalPipeline = () => {
    setIsRunning(true);
    setTimeout(() => {
      const rep = ResearchPipelineOrchestrator.executePipeline(project, ['PHASE_10_TECHNICAL', 'PHASE_14_VERDICT', 'PHASE_15_REPORT']);
      setExecutionReport(rep);
      setIsRunning(false);
    }, 200);
  };

  const handleRefreshCategory = (_category: string) => {
    handleRunIncrementalPipeline();
  };

  const handleCompareWithPreviousSnapshot = () => {
    const snapshots = project.snapshots || [];
    if (snapshots.length >= 2) {
      const diff = ResearchChangeDetectionEngine.compareSnapshots(
        snapshots[snapshots.length - 2],
        snapshots[snapshots.length - 1]
      );
      setComparisonReport(diff);
    } else {
      // Mock earlier snapshot comparison for demonstration
      const dummyPrior = ResearchSnapshotEngine.createSnapshot(project);
      dummyPrior.snapshotId = 'snap_prior_demo';
      dummyPrior.marketPrice = (dummyPrior.marketPrice || 1000) * 0.92;
      dummyPrior.decision = 'BUY';
      dummyPrior.convictionScore = 8.5;
      const diff = ResearchChangeDetectionEngine.compareSnapshots(dummyPrior, dummyPrior);
      setComparisonReport(diff);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px', color: '#f8fafc' }}>
      {/* Workspace Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase size={20} color="#38bdf8" />
            <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Phase 15 — Production Research Workspace & Report Delivery
            </h1>
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
            Active Company: <strong>{project.company.displayName}</strong> (<code>{project.company.symbol}</code>) | Sector: {project.company.sector}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleCompareWithPreviousSnapshot}
            style={{
              background: '#1e293b',
              color: '#38bdf8',
              border: '1px solid #334155',
              borderRadius: '4px',
              padding: '6px 14px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <History size={13} />
            Compare Snapshot Deltas
          </button>
        </div>
      </div>

      {/* 1. Workflow Lifecycle Stepper */}
      <WorkflowStatusStepper currentState={project.workflowState || 'DECISION_READY'} />

      {/* 2. Document Registry Table */}
      <DocumentRegistryTable documents={project.documents || []} />

      {/* 3. 11-Pillar Evidence Completeness Grid */}
      <EvidenceCompletenessGrid completenessReport={completenessReport} />

      {/* 4. Analytical Pipeline Execution Panel */}
      <PipelineExecutionPanel
        executionReport={executionReport}
        isRunning={isRunning}
        onRunFullPipeline={handleRunFullPipeline}
        onRunIncrementalPipeline={handleRunIncrementalPipeline}
      />

      {/* 5. Freshness & Priority Refresh Queue */}
      <FreshnessAndRefreshQueueCard
        freshnessReport={freshnessReport}
        onRefreshCategory={handleRefreshCategory}
      />

      {/* 6. 22-Section Canonical Investment Report Viewer & Exporter */}
      <InvestmentReportViewer report={reportPayload} />

      {/* Snapshot Comparison Modal */}
      {comparisonReport && (
        <SnapshotComparisonModal
          comparisonReport={comparisonReport}
          onClose={() => setComparisonReport(null)}
        />
      )}
    </div>
  );
};
