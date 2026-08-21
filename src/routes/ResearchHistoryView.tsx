/**
 * ResearchHistoryView.tsx
 * Phase 15 — Snapshot History & Decision Trajectory View.
 */

import React, { useState } from 'react';
import { ResearchProject } from '../domain/models/ResearchProject';
import { ResearchSnapshot, SnapshotComparisonReport } from '../domain/snapshots/SnapshotTypes';
import { ResearchChangeDetectionEngine } from '../domain/snapshots/ResearchChangeDetectionEngine';
import { SnapshotComparisonModal } from '../components/workflow/SnapshotComparisonModal';
import { History, GitCompare, Shield, Hash, Calendar } from 'lucide-react';

interface ResearchHistoryViewProps {
  project: ResearchProject;
}

export const ResearchHistoryView: React.FC<ResearchHistoryViewProps> = ({ project }) => {
  const [selectedForCompare, setSelectedForCompare] = useState<ResearchSnapshot[]>([]);
  const [comparisonReport, setComparisonReport] = useState<SnapshotComparisonReport | null>(null);

  const snapshots: ResearchSnapshot[] = project.snapshots || [];

  const handleToggleSelect = (snap: ResearchSnapshot) => {
    if (selectedForCompare.find((s) => s.snapshotId === snap.snapshotId)) {
      setSelectedForCompare(selectedForCompare.filter((s) => s.snapshotId !== snap.snapshotId));
    } else if (selectedForCompare.length < 2) {
      setSelectedForCompare([...selectedForCompare, snap]);
    } else {
      setSelectedForCompare([selectedForCompare[1], snap]);
    }
  };

  const handleCompareSelected = () => {
    if (selectedForCompare.length === 2) {
      const rep = ResearchChangeDetectionEngine.compareSnapshots(
        selectedForCompare[0],
        selectedForCompare[1]
      );
      setComparisonReport(rep);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px', color: '#f8fafc' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={20} color="#38bdf8" />
            <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Research Snapshot History & Decision Timeline
            </h1>
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
            Immutable point-in-time snapshots for <strong>{project.company.displayName}</strong> (<code>{project.company.symbol}</code>)
          </div>
        </div>

        {selectedForCompare.length === 2 && (
          <button
            onClick={handleCompareSelected}
            style={{
              background: 'linear-gradient(135deg, #0284c7, #2563eb)',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 16px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <GitCompare size={13} /> Compare Selected ({selectedForCompare[0].snapshotId.substring(0, 8)} vs {selectedForCompare[1].snapshotId.substring(0, 8)})
          </button>
        )}
      </div>

      {snapshots.length === 0 ? (
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '40px', textAlign: 'center', color: '#64748b' }}>
          No research snapshots recorded yet. Run the analytical pipeline in the Research Workspace to capture immutable snapshots.
        </div>
      ) : (
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {snapshots.map((snap) => {
              const isSelected = !!selectedForCompare.find((s) => s.snapshotId === snap.snapshotId);

              return (
                <div
                  key={snap.snapshotId}
                  style={{
                    background: isSelected ? 'rgba(2, 132, 199, 0.15)' : '#1e293b',
                    border: isSelected ? '1px solid #38bdf8' : '1px solid #334155',
                    borderRadius: '6px',
                    padding: '14px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '4px',
                          fontWeight: 800,
                          fontSize: '11px',
                          background: snap.decision === 'BUY' ? '#059669' : snap.decision === 'HOLD' ? '#d97706' : '#dc2626',
                          color: '#fff',
                        }}
                      >
                        {snap.decision}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#e2e8f0' }}>
                        Conviction: {snap.convictionScore.toFixed(1)}/10 ({snap.convictionBand})
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                        Price: ₹{snap.marketPrice || 'N/A'}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                        Fair Value: ₹{snap.intrinsicBaseValue || 'N/A'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '10px', color: '#64748b' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={11} /> {snap.createdAt.split('T')[0]}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Hash size={11} /> {snap.snapshotId}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Shield size={11} /> Checksum: {snap.hash.substring(0, 12)}...
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleSelect(snap)}
                    style={{
                      background: isSelected ? '#0284c7' : '#0f172a',
                      color: isSelected ? '#fff' : '#38bdf8',
                      border: '1px solid #334155',
                      borderRadius: '4px',
                      padding: '5px 12px',
                      fontSize: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {isSelected ? 'Selected' : 'Select to Compare'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {comparisonReport && (
        <SnapshotComparisonModal
          comparisonReport={comparisonReport}
          onClose={() => setComparisonReport(null)}
        />
      )}
    </div>
  );
};
