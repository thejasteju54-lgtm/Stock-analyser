import React, { useState } from 'react';
import { ResearchProject } from '../domain/models/ResearchProject';
import { EvidenceCompletenessEngine } from '../domain/readiness/EvidenceCompletenessEngine';
import { ResearchFreshnessEngine } from '../domain/freshness/ResearchFreshnessEngine';
import { InvestmentResearchReportEngine } from '../domain/reports/InvestmentResearchReportEngine';
import { ResearchChangeDetectionEngine } from '../domain/snapshots/ResearchChangeDetectionEngine';
import { ResearchPipelineOrchestrator, PipelineExecutionReport } from '../domain/orchestration/ResearchPipelineOrchestrator';
import { LiveResearchRefreshOrchestrator } from '../domain/dataSources/LiveResearchRefreshOrchestrator';
import { WorkflowStatusStepper } from '../components/workflow/WorkflowStatusStepper';
import { DocumentRegistryTable } from '../components/workflow/DocumentRegistryTable';
import { EvidenceCompletenessGrid } from '../components/workflow/EvidenceCompletenessGrid';
import { PipelineExecutionPanel } from '../components/workflow/PipelineExecutionPanel';
import { FreshnessAndRefreshQueueCard } from '../components/workflow/FreshnessAndRefreshQueueCard';
import { InvestmentReportViewer } from '../components/workflow/InvestmentReportViewer';
import { SnapshotComparisonModal } from '../components/workflow/SnapshotComparisonModal';
import { LiveResearchControlPanel } from '../components/live/LiveResearchControlPanel';
import { LiveDataStatusPanel } from '../components/live/LiveDataStatusPanel';
import { Briefcase, History } from 'lucide-react';

interface ResearchWorkspaceViewProps {
  project: ResearchProject;
  onProjectUpdate?: (updatedProject: ResearchProject) => void;
  onRefreshProject?: () => void;
}

export const ResearchWorkspaceView: React.FC<ResearchWorkspaceViewProps> = ({
  project,
  onProjectUpdate,
  onRefreshProject,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isReplayMode, setIsReplayMode] = useState(project.isReplayMode || false);
  const [cutoffDate, setCutoffDate] = useState<string | undefined>(project.replayCutoffDate);
  const [executionReport, setExecutionReport] = useState<PipelineExecutionReport | undefined>(undefined);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);
  const [compareSnapshotId, setCompareSnapshotId] = useState<string | null>(null);

  // 1. Calculate 11-pillar evidence completeness
  const completenessReport = EvidenceCompletenessEngine.evaluateProjectCompleteness(project);

  // 2. Calculate Freshness Report
  const freshnessReport = ResearchFreshnessEngine.assessProjectFreshness(project);

  // 3. Generate Latest 22-Section Report
  const latestSnapshotId = project.snapshots && project.snapshots.length > 0
    ? project.snapshots[project.snapshots.length - 1].snapshotId
    : `snap_temp_${Date.now()}`;
  const investmentReport = InvestmentResearchReportEngine.generateReport(project, latestSnapshotId);

  // 4. Trigger Full or Incremental Analytical Pipeline Execution
  const handleExecutePipeline = (invalidatedPhases?: any[]) => {
    setIsRunning(true);
    setTimeout(() => {
      try {
        const report = ResearchPipelineOrchestrator.executePipeline(project, invalidatedPhases);
        setExecutionReport(report);
        if (onProjectUpdate) {
          onProjectUpdate({ ...project });
        }
        if (onRefreshProject) {
          onRefreshProject();
        }
      } catch (err) {
        console.error('Pipeline execution error:', err);
      } finally {
        setIsRunning(false);
      }
    }, 100);
  };

  // 5. Handle Live / Replay Feed Refresh
  const handleLiveFeedsRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      try {
        const refreshResult = LiveResearchRefreshOrchestrator.processLiveUpdate(
          project,
          'MARKET_PRICE_TICK',
          ['rawPrice', 'splitAdjustedPrice', 'totalReturnPrice'],
          cutoffDate
        );
        setExecutionReport(refreshResult.executionReport);
        if (onProjectUpdate) {
          onProjectUpdate({ ...project });
        }
        if (onRefreshProject) {
          onRefreshProject();
        }
      } catch (err) {
        console.error('Live feed refresh error:', err);
      } finally {
        setIsRefreshing(false);
      }
    }, 150);
  };

  // 6. Handle Snapshot Comparison Modal Trigger
  const handleCompareWithPreviousSnapshot = () => {
    const snapshots = project.snapshots || [];
    if (snapshots.length >= 2) {
      setSelectedSnapshotId(snapshots[snapshots.length - 1].snapshotId);
      setCompareSnapshotId(snapshots[snapshots.length - 2].snapshotId);
      setShowCompareModal(true);
    } else if (snapshots.length === 1) {
      setSelectedSnapshotId(snapshots[0].snapshotId);
      setCompareSnapshotId(snapshots[0].snapshotId);
      setShowCompareModal(true);
    }
  };

  const snapshotA = project.snapshots?.find((s) => s.snapshotId === selectedSnapshotId);
  const snapshotB = project.snapshots?.find((s) => s.snapshotId === compareSnapshotId) || snapshotA;
  const comparisonReport = snapshotA && snapshotB
    ? ResearchChangeDetectionEngine.compareSnapshots(snapshotA, snapshotB)
    : null;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px', color: '#f8fafc' }}>
      {/* Workspace Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase size={20} color="#38bdf8" />
            <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Phase 15/16 — Production Research Workspace & Live Reliability Engine
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

      {/* Phase 16 Live Research Control Bar */}
      <LiveResearchControlPanel
        symbol={project.company.symbol}
        isReplayMode={isReplayMode}
        cutoffDate={cutoffDate}
        onToggleMode={(mode) => setIsReplayMode(mode)}
        onCutoffChange={(newDate) => setCutoffDate(newDate)}
        onRefreshData={handleLiveFeedsRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Phase 16 Live Feed Health & Connectivity Status */}
      <div style={{ marginBottom: '16px' }}>
        <LiveDataStatusPanel />
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
        onRunFullPipeline={() => handleExecutePipeline()}
        onRunIncrementalPipeline={() => handleExecutePipeline()}
      />

      {/* 5. Evidence Freshness & Priority Refresh Queue */}
      <FreshnessAndRefreshQueueCard
        freshnessReport={freshnessReport}
        onRefreshCategory={() => handleLiveFeedsRefresh()}
      />

      {/* 6. Canonical 22-Section Institutional Report Delivery */}
      <InvestmentReportViewer report={investmentReport} />

      {/* 7. Snapshot Delta Comparison Modal */}
      {showCompareModal && comparisonReport && (
        <SnapshotComparisonModal
          comparisonReport={comparisonReport}
          onClose={() => setShowCompareModal(false)}
        />
      )}
    </div>
  );
};
