import React from 'react';
import { ScreenshotTechnicalObservation } from '../../domain/technical/TechnicalTypes';
import { Badge } from '../common/Badge';
import { X, Image as ImageIcon, Eye, AlertTriangle } from 'lucide-react';

interface ScreenshotObservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  observations: ScreenshotTechnicalObservation[];
  companySymbol: string;
}

export const ScreenshotObservationModal: React.FC<ScreenshotObservationModalProps> = ({
  isOpen,
  onClose,
  observations,
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
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '750px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ImageIcon size={18} color="var(--color-primary)" />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {companySymbol} — Screenshot Visual Chart Observations
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '10px 12px', background: 'var(--bg-secondary)', border: '1px dashed var(--border-subtle)', borderRadius: '4px', fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} color="var(--color-warning)" style={{ flexShrink: 0 }} />
            <div>
              <strong>Visual-Only Audit Guardrail:</strong> Screenshot observations are qualitative chart notes. Uncalculated indicators are marked NOT_ASSESSABLE without numerical fabrication.
            </div>
          </div>

          {observations.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              No visual screenshot observations registered for this technical dataset.
            </div>
          ) : (
            observations.map((obs) => (
              <div
                key={obs.observationId}
                style={{
                  padding: '14px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Eye size={14} color="var(--color-primary)" />
                    {obs.imageReference} {obs.pageNumber ? `(Page ${obs.pageNumber})` : ''}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Badge variant="cyan">VISUAL OBSERVATION</Badge>
                    <Badge variant="neutral">Confidence: {obs.confidence}%</Badge>
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <strong>Visible Date Range:</strong> {obs.visibleDateRange} ({obs.chartTimeframe})
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '11px', marginBottom: '8px' }}>
                  <div style={{ padding: '8px', background: 'var(--bg-primary)', borderRadius: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Visible Structure: </span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{obs.visiblePriceStructure}</span>
                  </div>
                  <div style={{ padding: '8px', background: 'var(--bg-primary)', borderRadius: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Visible Trend: </span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{obs.visibleTrend}</span>
                  </div>
                </div>

                {obs.visibleSupportResistance.length > 0 && (
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                    <strong>Visible S/R Levels:</strong> {obs.visibleSupportResistance.join(', ')}
                  </div>
                )}
                {obs.visibleMovingAverages.length > 0 && (
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    <strong>Visible MAs:</strong> {obs.visibleMovingAverages.join(', ')}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'var(--bg-secondary)',
          }}
        >
          <button onClick={onClose} className="terminal-btn terminal-btn-secondary">
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
