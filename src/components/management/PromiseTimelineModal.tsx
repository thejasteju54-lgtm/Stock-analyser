import React from 'react';
import { ManagementCommitment } from '../../domain/management/ManagementDnaTypes';
import { Badge } from '../common/Badge';
import { X, Calendar, FileText } from 'lucide-react';

interface PromiseTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  commitments: ManagementCommitment[];
  companySymbol: string;
}

export const PromiseTimelineModal: React.FC<PromiseTimelineModalProps> = ({
  isOpen,
  onClose,
  commitments,
  companySymbol,
}) => {
  if (!isOpen) return null;

  return (
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
          borderRadius: '8px',
          width: '100%',
          maxWidth: '750px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={18} color="#0284c7" />
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Promise Timeline & Execution Journey ({companySymbol})
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ position: 'relative', paddingLeft: '24px' }}>
            {/* Timeline Line */}
            <div
              style={{
                position: 'absolute',
                top: '10px',
                bottom: '10px',
                left: '7px',
                width: '2px',
                background: 'var(--border-subtle)',
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {commitments.map((c, idx) => (
                <div key={c.commitmentId || idx} style={{ position: 'relative' }}>
                  {/* Timeline Dot */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '4px',
                      left: '-24px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background:
                        c.status === 'ACHIEVED' || c.status === 'ABOVE_GUIDANCE'
                          ? '#10b981'
                          : c.status === 'ON_TRACK'
                          ? '#0284c7'
                          : c.status === 'MISSED'
                          ? '#ef4444'
                          : '#f59e0b',
                      border: '3px solid var(--bg-surface)',
                      boxShadow: '0 0 0 1px var(--border-subtle)',
                    }}
                  />

                  {/* Card Content */}
                  <div
                    style={{
                      padding: '14px',
                      background: 'var(--bg-surface-raised)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {c.targetPeriod}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>•</span>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#0284c7' }}>
                          {c.targetMetric}
                        </span>
                      </div>
                      <Badge variant={c.status === 'ACHIEVED' || c.status === 'ABOVE_GUIDANCE' ? 'bullish' : c.status === 'MISSED' ? 'bearish' : 'warning'}>
                        {c.status}
                      </Badge>
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      <strong>Original Statement:</strong> "{c.commitmentText}"
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-primary)' }}>
                      <strong>Observed Outcome:</strong> {c.actualOutcomeSummary || 'Data unavailable.'}
                    </div>

                    {c.evidenceReferences.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        <FileText size={11} />
                        Source: {c.evidenceReferences[0].documentName} (P.{c.evidenceReferences[0].pageNumber || 'N/A'})
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button onClick={onClose} className="terminal-btn terminal-btn-sm">
            Close Timeline
          </button>
        </div>
      </div>
    </div>
  );
};
