/**
 * SnapshotComparisonModal.tsx
 * Phase 15 — Snapshot Comparison & Change Delta Modal Component.
 */

import React from 'react';
import { SnapshotComparisonReport } from '../../domain/snapshots/SnapshotTypes';
import { GitCompare, X, ArrowRight } from 'lucide-react';

interface SnapshotComparisonModalProps {
  comparisonReport: SnapshotComparisonReport;
  onClose: () => void;
}

export const SnapshotComparisonModal: React.FC<SnapshotComparisonModalProps> = ({
  comparisonReport,
  onClose,
}) => {
  const { snapshotA, snapshotB, decisionChange } = comparisonReport;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '840px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GitCompare size={18} color="#38bdf8" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
              Research Snapshot Comparison & Decision Delta
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {/* Decision Transition Hero */}
          <div
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '14px 16px',
              marginBottom: '16px',
            }}
          >
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>
              Verdict Transition Summary
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontWeight: 800,
                  fontSize: '12px',
                  background: '#0f172a',
                  color: '#f8fafc',
                  border: '1px solid #475569',
                }}
              >
                {snapshotA.decision} ({snapshotA.convictionScore.toFixed(1)}/10)
              </span>
              <ArrowRight size={16} color="#94a3b8" />
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontWeight: 800,
                  fontSize: '12px',
                  background: decisionChange.toVerdict === 'BUY' ? '#059669' : decisionChange.toVerdict === 'HOLD' ? '#d97706' : '#dc2626',
                  color: '#fff',
                }}
              >
                {snapshotB.decision} ({snapshotB.convictionScore.toFixed(1)}/10)
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
              {decisionChange.transitionReasonSummary}
            </p>
          </div>

          {/* Key Metric Comparison Table */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>
              Metric Deltas (Snapshot A vs Snapshot B)
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>Metric</th>
                  <th style={{ padding: '8px' }}>Snapshot A ({snapshotA.createdAt.split('T')[0]})</th>
                  <th style={{ padding: '8px' }}>Snapshot B ({snapshotB.createdAt.split('T')[0]})</th>
                  <th style={{ padding: '8px' }}>Delta</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '8px', color: '#f8fafc', fontWeight: 600 }}>Market Price</td>
                  <td style={{ padding: '8px', color: '#94a3b8' }}>₹{snapshotA.marketPrice || 'N/A'}</td>
                  <td style={{ padding: '8px', color: '#f8fafc' }}>₹{snapshotB.marketPrice || 'N/A'}</td>
                  <td style={{ padding: '8px', fontWeight: 700, color: decisionChange.priceDeltaPercent && decisionChange.priceDeltaPercent > 0 ? '#34d399' : '#f87171' }}>
                    {decisionChange.priceDeltaPercent ? `${decisionChange.priceDeltaPercent > 0 ? '+' : ''}${decisionChange.priceDeltaPercent}%` : 'N/A'}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '8px', color: '#f8fafc', fontWeight: 600 }}>Intrinsic Fair Value</td>
                  <td style={{ padding: '8px', color: '#94a3b8' }}>₹{snapshotA.intrinsicBaseValue || 'N/A'}</td>
                  <td style={{ padding: '8px', color: '#f8fafc' }}>₹{snapshotB.intrinsicBaseValue || 'N/A'}</td>
                  <td style={{ padding: '8px', fontWeight: 700, color: decisionChange.fairValueDeltaPercent && decisionChange.fairValueDeltaPercent > 0 ? '#34d399' : '#f87171' }}>
                    {decisionChange.fairValueDeltaPercent ? `${decisionChange.fairValueDeltaPercent > 0 ? '+' : ''}${decisionChange.fairValueDeltaPercent}%` : 'N/A'}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '8px', color: '#f8fafc', fontWeight: 600 }}>Margin of Safety</td>
                  <td style={{ padding: '8px', color: '#94a3b8' }}>{snapshotA.marginOfSafetyPercent ? `${snapshotA.marginOfSafetyPercent.toFixed(1)}%` : 'N/A'}</td>
                  <td style={{ padding: '8px', color: '#f8fafc' }}>{snapshotB.marginOfSafetyPercent ? `${snapshotB.marginOfSafetyPercent.toFixed(1)}%` : 'N/A'}</td>
                  <td style={{ padding: '8px', color: '#94a3b8' }}>
                    {snapshotA.marginOfSafetyPercent !== null && snapshotB.marginOfSafetyPercent !== null
                      ? `${(snapshotB.marginOfSafetyPercent - snapshotA.marginOfSafetyPercent).toFixed(1)}%`
                      : 'N/A'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Changed Factors List */}
          {decisionChange.changedFactors.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>
                Changed Evidence Factors ({decisionChange.changedFactors.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {decisionChange.changedFactors.map((f, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#f8fafc' }}>{f.factorName}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{f.explanation}</div>
                    </div>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '3px',
                        fontSize: '9px',
                        fontWeight: 700,
                        background: f.impactOnDecision === 'UPGRADE' ? 'rgba(16, 185, 129, 0.2)' : f.impactOnDecision === 'DOWNGRADE' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                        color: f.impactOnDecision === 'UPGRADE' ? '#34d399' : f.impactOnDecision === 'DOWNGRADE' ? '#f87171' : '#94a3b8',
                      }}
                    >
                      {f.impactOnDecision}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
