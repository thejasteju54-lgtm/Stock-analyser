import React from 'react';
import { X, GitCompare, Info } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export interface SourceComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  metricKey?: string;
  period?: string;
}

export const SourceComparisonModal: React.FC<SourceComparisonModalProps> = ({
  isOpen,
  onClose,
  metricKey = 'Revenue from Operations',
  period = 'FY24',
}) => {
  if (!isOpen) return null;

  const comparisonRows = [
    {
      sourceName: 'NSE Audited Annual Report 2023-24',
      sourceTier: 'TIER 1 (Statutory)',
      value: '₹20,268 Cr',
      basis: 'CONSOLIDATED',
      status: 'VERIFIED',
      confidence: 'HIGH',
      citation: 'p. 138, Audited P&L Statement',
    },
    {
      sourceName: 'Screener.in Consolidated Statement',
      sourceTier: 'TIER 3 (Structured)',
      value: '₹20,268 Cr',
      basis: 'CONSOLIDATED',
      status: 'CORROBORATED',
      confidence: 'HIGH',
      citation: 'Screener.in 10Y Financial Database',
    },
    {
      sourceName: 'Secondary Web Aggregator',
      sourceTier: 'TIER 4 (Discovery)',
      value: '₹19,850 Cr',
      basis: 'STANDALONE (Unadjusted)',
      status: 'SOURCE_CONFLICT',
      confidence: 'LOW',
      citation: 'Unverified Third-Party Summary',
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          boxShadow: 'var(--shadow-glass)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          padding: '24px',
          gap: '16px',
          border: '1px solid var(--border-subtle)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GitCompare size={18} color="var(--brand-blue)" />
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--brand-navy)', margin: 0 }}>
                Cross-Source Reconciliation & Conflict Investigator
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Metric: <strong>{metricKey}</strong> ({period})
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Comparison Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="terminal-table">
            <thead>
              <tr>
                <th>Source Name</th>
                <th>Tier</th>
                <th className="text-right">Reported Value</th>
                <th>Basis</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, color: 'var(--brand-navy)', fontSize: '12px' }}>
                    <div>{row.sourceName}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{row.citation}</div>
                  </td>
                  <td>
                    <Badge variant={row.sourceTier.includes('TIER 1') ? 'bullish' : 'neutral'}>
                      {row.sourceTier}
                    </Badge>
                  </td>
                  <td className="text-right tabular-nums" style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>
                    {row.value}
                  </td>
                  <td>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{row.basis}</span>
                  </td>
                  <td>
                    <Badge variant={row.status === 'VERIFIED' ? 'bullish' : row.status === 'CORROBORATED' ? 'cyan' : 'warning'}>
                      {row.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Reconciliation Policy Callout */}
        <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '12px 14px', fontSize: '11px', color: 'var(--brand-navy)', display: 'flex', gap: '8px' }}>
          <Info size={16} color="var(--brand-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Reconciliation Authority Policy:</strong> Tier 1 Statutory filing (<code>₹20,268 Cr</code>) is prioritized and corroborated by Tier 3 structured disclosures. The Tier 4 outlier reported Standalone figures without inter-company consolidation and is flagged as <code>SOURCE_CONFLICT</code>.
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Investigator
          </Button>
        </div>
      </div>
    </div>
  );
};
