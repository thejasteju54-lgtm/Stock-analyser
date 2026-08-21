/**
 * EvidenceCompletenessGrid.tsx
 * Phase 15 — 11-Pillar Evidence Completeness Dashboard Component.
 */

import React from 'react';
import { ProjectEvidenceCompletenessReport } from '../../domain/readiness/EvidenceCompletenessEngine';
import { Layers, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface EvidenceCompletenessGridProps {
  completenessReport: ProjectEvidenceCompletenessReport;
}

export const EvidenceCompletenessGrid: React.FC<EvidenceCompletenessGridProps> = ({ completenessReport }) => {
  const pillarsList = Object.values(completenessReport.pillars);

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px 20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={16} color="#38bdf8" />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            11-Pillar Evidence Completeness & Criticality Gate
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            Satisfied: <strong>{completenessReport.satisfiedPillarsCount}/{completenessReport.totalPillarsCount}</strong>
          </span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 700,
              background: completenessReport.criticalPillarsSatisfied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: completenessReport.criticalPillarsSatisfied ? '#34d399' : '#f87171',
            }}
          >
            {completenessReport.criticalPillarsSatisfied ? 'CRITICAL GATES SATISFIED' : 'CRITICAL GATES BLOCKED'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
        {pillarsList.map((p) => {
          const isComplete = p.status === 'COMPLETE';
          const isCritical = p.criticality === 'CRITICAL';

          return (
            <div
              key={p.pillarId}
              style={{
                background: '#1e293b',
                border: isComplete ? '1px solid #334155' : isCritical ? '1px solid #ef4444' : '1px solid #334155',
                borderRadius: '6px',
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#f8fafc' }}>{p.name}</span>
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 700,
                      padding: '1px 5px',
                      borderRadius: '3px',
                      background: isCritical ? 'rgba(239, 68, 68, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                      color: isCritical ? '#f87171' : '#94a3b8',
                      textTransform: 'uppercase',
                    }}
                  >
                    {p.criticality}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '6px 0' }}>
                  <div style={{ flex: 1, background: '#334155', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${p.score}%`,
                        background: isComplete ? '#10b981' : p.score > 0 ? '#f59e0b' : '#ef4444',
                        height: '100%',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#e2e8f0', minWidth: '28px', textAlign: 'right' }}>
                    {p.score}%
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #334155' }}>
                <span style={{ fontSize: '10px', color: '#64748b' }}>
                  {p.availableItemsCount}/{p.expectedItemsCount} artifacts
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: 600, color: isComplete ? '#34d399' : p.score > 0 ? '#fbbf24' : '#94a3b8' }}>
                  {isComplete ? <CheckCircle2 size={11} /> : p.score > 0 ? <AlertCircle size={11} /> : <HelpCircle size={11} />}
                  {p.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
