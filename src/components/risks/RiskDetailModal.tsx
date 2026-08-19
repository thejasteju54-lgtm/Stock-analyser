import React from 'react';
import { RiskItem } from '../../domain/risks/CatalystRiskTypes';
import { Badge } from '../common/Badge';
import { ShieldCheck, X, AlertTriangle, Layers, Target, CheckCircle2 } from 'lucide-react';

interface RiskDetailModalProps {
  risk: RiskItem | null;
  onClose: () => void;
}

export const RiskDetailModal: React.FC<RiskDetailModalProps> = ({ risk, onClose }) => {
  if (!risk) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
          borderRadius: '8px',
          maxWidth: '700px',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <AlertTriangle size={18} stroke="var(--color-warning)" />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Risk Provenance & Mitigation Inspector
              </h3>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Risk ID: {risk.riskId} | Category: {risk.category.replace(/_/g, ' ')}
            </div>
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

        {/* Title & Description */}
        <div style={{ padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Badge variant="neutral">{risk.severity} SEVERITY</Badge>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {risk.title}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            {risk.description}
          </div>
        </div>

        {/* Geometry & Exposure */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
          <div style={{ padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>P × I MATRIX</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              P: {risk.probabilityScore} × I: {risk.impactScore} ({risk.rawRiskScore}/25)
            </div>
          </div>
          <div style={{ padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>RISK VELOCITY</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              {risk.velocity.replace(/_/g, ' ')}
            </div>
          </div>
          <div style={{ padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>NET SCORE (POST-MIT)</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '2px' }}>
              {risk.netRiskScore}/25 ({risk.netExposure.replace(/_/g, ' ')})
            </div>
          </div>
        </div>

        {/* Measurable Exposure */}
        <div style={{ marginBottom: '14px' }}>
          <h4 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Measurable Financial Exposure:
          </h4>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '4px' }}>
            {risk.measurableExposure}
          </div>
        </div>

        {/* Verified Mitigations */}
        <div style={{ marginBottom: '14px' }}>
          <h4 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={13} stroke="var(--color-success)" /> Verified Mitigating Factors ({risk.mitigations.length}):
          </h4>
          {risk.mitigations.length === 0 ? (
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No documented mitigations established from verified sources. Net exposure remains unmitigated.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {risk.mitigations.map((m) => (
                <div
                  key={m.mitigationId}
                  style={{
                    padding: '8px 12px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {m.description}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Citations: {m.evidenceReferences.join(', ')}
                    </div>
                  </div>
                  <Badge variant={m.status === 'MITIGATION_VERIFIED' ? 'bullish' : 'neutral'}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                      <CheckCircle2 size={10} /> {m.status.replace(/_/g, ' ')}
                    </span>
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Falsifiable Triggers */}
        <div style={{ marginBottom: '14px' }}>
          <h4 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Target size={13} stroke="var(--color-primary)" /> Falsifiable Breach Triggers:
          </h4>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', color: 'var(--text-secondary)' }}>
            {risk.falsifiableTriggers.map((t, idx) => (
              <li key={idx} style={{ marginBottom: '2px' }}>{t}</li>
            ))}
          </ul>
        </div>

        {/* Lineage & Double-Counting Protection */}
        <div style={{ padding: '10px 12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={13} />
          <span>
            <strong>Lineage ID:</strong> {risk.lineage.underlyingRiskId} | <strong>Source Layer:</strong> {risk.sourceLayer} | <strong>Relationship:</strong> {risk.lineage.relationshipType} ({risk.confidence}% Conf)
          </span>
        </div>

        <div style={{ textAlign: 'right', marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
          <button onClick={onClose} className="terminal-btn terminal-btn-primary" style={{ fontSize: '11px' }}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
