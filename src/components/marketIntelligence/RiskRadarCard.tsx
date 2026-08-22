import React from 'react';
import { AlertOctagon } from 'lucide-react';
import { Badge } from '../common/Badge';

export interface RiskRadarItem {
  symbol: string;
  company: string;
  riskCategory: string;
  riskDescription: string;
  severity: 'HIGH' | 'CRITICAL';
  action: string;
}

export interface RiskRadarCardProps {
  risks: RiskRadarItem[];
  onAnalyzeStock: (symbol: string) => void;
}

export const RiskRadarCard: React.FC<RiskRadarCardProps> = ({ risks, onAnalyzeStock }) => {
  return (
    <div
      className="terminal-card"
      id="risk-radar-card"
      style={{
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        background: '#ffffff',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertOctagon size={16} color="var(--color-warning)" />
          <h2 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--brand-navy)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Risk Radar & Governance Watchlist
          </h2>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Focus: <strong style={{ color: 'var(--brand-navy)' }}>Valuation Overheating • Margin Pressure • Execution Gaps</strong>
        </div>
      </div>

      {/* Risks Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
        {risks.map((item, idx) => (
          <div
            key={idx}
            style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '6px',
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--brand-navy)' }}>
                {item.company} (<code>{item.symbol}</code>)
              </div>
              <Badge variant="warning">{item.riskCategory}</Badge>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {item.riskDescription}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #fef3c7', paddingTop: '6px', marginTop: '2px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {item.action}
              </span>
              <button
                onClick={() => onAnalyzeStock(item.symbol)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--brand-navy)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Inspect Risks →
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
        <strong>Hostile Audit Policy:</strong> The scanner applies dedicated risk penalty deductions to prevent high-risk, volatile stocks from artificially ranking high.
      </div>
    </div>
  );
};
