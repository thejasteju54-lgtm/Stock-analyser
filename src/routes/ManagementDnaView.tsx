import React, { useState, useEffect } from 'react';
import { ResearchProject } from '../domain/models/ResearchProject';
import { ProjectStorage } from '../domain/storage/ProjectStorage';
import { ManagementDnaEngine } from '../domain/management/ManagementDnaEngine';
import { ManagementAnalysisReport } from '../domain/management/ManagementDnaTypes';
import { ManagementCredibilityCard } from '../components/management/ManagementCredibilityCard';
import { PromiseVsDeliveryCard } from '../components/management/PromiseVsDeliveryCard';
import { GuidanceTrackingCard } from '../components/management/GuidanceTrackingCard';
import { LanguageShiftCard } from '../components/management/LanguageShiftCard';
import { ManagementDataTensionsCard } from '../components/management/ManagementDataTensionsCard';
import { ManagementDnaCard } from '../components/management/ManagementDnaCard';
import { PromiseTimelineModal } from '../components/management/PromiseTimelineModal';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import {
  Users,
  Play,
  Calendar,
  Activity,
  ShieldAlert,
  X,
} from 'lucide-react';

interface ManagementDnaViewProps {
  currentProject: ResearchProject | null;
  onNavigateToFundamentals?: () => void;
  onNavigateToForensics?: () => void;
  onNavigateToCalculations?: () => void;
}

export const ManagementDnaView: React.FC<ManagementDnaViewProps> = ({
  currentProject,
  onNavigateToFundamentals,
  onNavigateToForensics,
}) => {
  const [report, setReport] = useState<ManagementAnalysisReport | null>(null);
  const [isTimelineOpen, setIsTimelineOpen] = useState<boolean>(false);
  const [selectedEvidenceList, setSelectedEvidenceList] = useState<string[] | null>(null);

  useEffect(() => {
    if (!currentProject) {
      setReport(null);
      return;
    }

    const savedReport = ProjectStorage.getManagementAnalysisForProject(currentProject.id);
    if (savedReport) {
      setReport(savedReport);
    } else {
      const facts = currentProject.facts || [];
      const metrics = currentProject.calculatedMetrics || [];
      const forensicReport = currentProject.forensicAnalysis || ProjectStorage.getForensicAnalysisForProject(currentProject.id);
      const result = ManagementDnaEngine.analyze(
        currentProject.id,
        currentProject.company.symbol,
        [],
        facts,
        metrics,
        forensicReport,
        'FY24',
        'FY23'
      );
      setReport(result);
      ProjectStorage.saveManagementAnalysisForProject(currentProject.id, result);
    }
  }, [currentProject?.id]);

  const handleRunAnalysis = () => {
    if (!currentProject) return;
    const facts = currentProject.facts || [];
    const metrics = currentProject.calculatedMetrics || [];
    const forensicReport = currentProject.forensicAnalysis || ProjectStorage.getForensicAnalysisForProject(currentProject.id);
    const result = ManagementDnaEngine.analyze(
      currentProject.id,
      currentProject.company.symbol,
      [],
      facts,
      metrics,
      forensicReport,
      'FY24',
      'FY23'
    );
    setReport(result);
    ProjectStorage.saveManagementAnalysisForProject(currentProject.id, result);
  };

  if (!currentProject) {
    return (
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Card title="Management DNA & Execution Credibility Engine">
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Please select or create an Indian equity research project to begin management analysis.
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header View */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={20} color="#0284c7" />
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Management DNA & Execution Credibility Engine
            </h1>
            <Badge variant="cyan">PHASE 8</Badge>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--text-muted)',
                background: 'var(--bg-surface-raised)',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              Entity: {currentProject.company.symbol}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
            Evidence-driven promise tracking, guidance revision history, YoY language shifts, and deterministic execution credibility scoring.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onNavigateToFundamentals && (
            <button
              onClick={onNavigateToFundamentals}
              className="terminal-btn terminal-btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Activity size={13} />
              Fundamentals
            </button>
          )}

          {onNavigateToForensics && (
            <button
              onClick={onNavigateToForensics}
              className="terminal-btn terminal-btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ShieldAlert size={13} />
              Forensics View
            </button>
          )}

          <button
            onClick={() => setIsTimelineOpen(true)}
            className="terminal-btn terminal-btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Calendar size={13} />
            Promise Timeline
          </button>

          <button
            onClick={handleRunAnalysis}
            className="terminal-btn terminal-btn-sm"
            style={{
              background: '#0284c7',
              color: '#ffffff',
              borderColor: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Play size={13} />
            Re-Run Management Scan
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      {report && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Top Row: Execution Credibility Assessment */}
          <ManagementCredibilityCard assessment={report.credibilityAssessment} />

          {/* Promise vs Delivery Matrix */}
          <PromiseVsDeliveryCard
            commitments={report.commitments}
            onInspectEvidence={(cits) => setSelectedEvidenceList(cits)}
          />

          {/* Guidance Tracking & Revision History */}
          <GuidanceTrackingCard
            revisions={report.guidanceRevisions}
            commitments={report.commitments}
            onInspectEvidence={(cits) => setSelectedEvidenceList(cits)}
          />

          {/* YoY Communication & Language Shift Comparison */}
          <LanguageShiftCard
            shifts={report.languageShifts}
            onInspectEvidence={(cits) => setSelectedEvidenceList(cits)}
          />

          {/* Management Commentary vs Financial Data Tensions */}
          <ManagementDataTensionsCard
            tensions={report.dataTensions}
            onInspectEvidence={(cits) => setSelectedEvidenceList(cits)}
          />

          {/* 7-Dimension Management DNA Profile */}
          <ManagementDnaCard profile={report.dnaProfile} />
        </div>
      )}

      {/* Timeline Modal */}
      {report && (
        <PromiseTimelineModal
          isOpen={isTimelineOpen}
          onClose={() => setIsTimelineOpen(false)}
          commitments={report.commitments}
          companySymbol={currentProject.company.symbol}
        />
      )}

      {/* Simple Evidence Citations Modal */}
      {selectedEvidenceList && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              width: '100%',
              maxWidth: '520px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                Source Evidence Provenance
              </span>
              <button
                onClick={() => setSelectedEvidenceList(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              {selectedEvidenceList.map((cit, i) => (
                <li key={i}>{cit}</li>
              ))}
            </ul>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button onClick={() => setSelectedEvidenceList(null)} className="terminal-btn terminal-btn-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
