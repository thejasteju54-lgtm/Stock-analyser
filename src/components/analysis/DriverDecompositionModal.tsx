import React from 'react';
import { DriverDecomposition } from '../../domain/analysis/FundamentalHealthTypes';
import { Badge } from '../common/Badge';
import { X, Layers } from 'lucide-react';

interface DriverDecompositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  decompositions: DriverDecomposition[];
}

export const DriverDecompositionModal: React.FC<DriverDecompositionModalProps> = ({
  isOpen,
  onClose,
  decompositions,
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
          width: '100%',
          maxWidth: '680px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '85vh',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={16} color="#38bdf8" />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Evidence-Driven Return Driver Decomposition
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: 'none',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              padding: '10px 14px',
              background: 'rgba(56, 189, 248, 0.05)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '6px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              lineHeight: '1.5',
            }}
          >
            <strong>Anti-Hallucination Policy:</strong> Return drivers (profitability margins, operating asset efficiency, financial gearing) are only isolated when supporting accounting facts are explicitly verified in reported filings. Drivers are never assumed.
          </div>

          {decompositions.map((dec, idx) => (
            <div
              key={idx}
              style={{
                padding: '14px',
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                    {dec.returnMetric} Driver Analysis
                  </span>
                  {dec.currentReturn !== undefined && (
                    <Badge variant="cyan">{dec.currentReturn}%</Badge>
                  )}
                </div>
                <Badge variant={dec.status === 'SUPPORTED_DRIVER' ? 'bullish' : 'neutral'}>
                  {dec.status === 'SUPPORTED_DRIVER' ? 'SUPPORTED BY EVIDENCE' : 'DRIVER NOT DETERMINABLE'}
                </Badge>
              </div>

              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {dec.driverExplanation}
              </p>

              {dec.supportingEvidence.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Component Evidence Facts
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                    {dec.supportingEvidence.map((ev, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '8px 10px',
                          background: 'rgba(0, 0, 0, 0.25)',
                          borderRadius: '4px',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                        }}
                      >
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ev.component}</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                          {ev.value !== undefined ? `${ev.value} ${ev.unit}` : 'Not Disclosed'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
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
          <button
            onClick={onClose}
            className="terminal-btn terminal-btn-sm"
            style={{ minWidth: '80px' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
