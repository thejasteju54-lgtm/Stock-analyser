/**
 * ClaimProvenanceDrawer.tsx
 * Phase 15 — Interactive "Why?" Claim Provenance & Evidence Drawer.
 */

import React from 'react';
import { ReportClaimCitation } from '../../domain/reports/ReportTypes';
import { Compass, X, FileText, Calendar, CheckCircle2 } from 'lucide-react';

interface ClaimProvenanceDrawerProps {
  citation: ReportClaimCitation | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ClaimProvenanceDrawer: React.FC<ClaimProvenanceDrawerProps> = ({
  citation,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !citation) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(2px)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          height: '100%',
          background: '#0f172a',
          borderLeft: '1px solid #334155',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 25px -5px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Drawer Header */}
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
            <Compass size={16} color="#38bdf8" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Evidence Citation & Provenance
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

        {/* Drawer Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {/* Claim Hero */}
          <div
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '14px',
              marginBottom: '16px',
            }}
          >
            <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
              Material Research Claim
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', lineHeight: 1.5 }}>
              "{citation.claimText}"
            </div>
          </div>

          {/* Provenance Metadata Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '10px 12px' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                Originating Analytical Phase
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#38bdf8' }}>
                {citation.sourcePhase}
              </div>
            </div>

            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '10px 12px' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                Assessability Classification
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={13} color="#10b981" />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
                  {citation.assessabilityStatus}
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  ({citation.confidenceScore}% Confidence)
                </span>
              </div>
            </div>

            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '10px 12px' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                Source Document & Location
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#e2e8f0', marginBottom: '2px' }}>
                <FileText size={13} color="#94a3b8" />
                <span>{citation.sourceDocumentTitle || 'Statutory Annual Report'}</span>
              </div>
              {citation.pageOrSection && (
                <div style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '19px' }}>
                  Location: {citation.pageOrSection}
                </div>
              )}
            </div>

            {citation.calculationReference && (
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '10px 12px' }}>
                <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                  Deterministic Calculation Formula
                </div>
                <code style={{ fontSize: '11px', color: '#a5f3fc', background: '#0f172a', padding: '2px 6px', borderRadius: '3px' }}>
                  {citation.calculationReference}
                </code>
              </div>
            )}

            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '10px 12px' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                Point-in-Time Data Date
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#cbd5e1' }}>
                <Calendar size={13} color="#94a3b8" />
                <span>{citation.dataDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #1e293b', background: '#0f172a' }}>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '4px',
              padding: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close Provenance Explorer
          </button>
        </div>
      </div>
    </div>
  );
};
