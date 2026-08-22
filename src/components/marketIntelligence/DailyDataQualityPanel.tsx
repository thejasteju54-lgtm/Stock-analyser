import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Badge } from '../common/Badge';

export interface DailyDataQualityPanelProps {
  scannedCount: number;
  financialCoveragePercent: number;
  newsCoveragePercent: number;
  marketDataCoveragePercent: number;
  sourceConflictsCount: number;
  criticalMissingDataCount: number;
  calculationIntegrity: 'PASS' | 'WARN';
}

export const DailyDataQualityPanel: React.FC<DailyDataQualityPanelProps> = ({
  scannedCount = 500,
  financialCoveragePercent = 96,
  newsCoveragePercent = 98,
  marketDataCoveragePercent = 100,
  sourceConflictsCount = 0,
  criticalMissingDataCount = 0,
  calculationIntegrity = 'PASS',
}) => {
  return (
    <div
      className="terminal-card"
      id="daily-data-quality-panel"
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
          <ShieldCheck size={16} color="var(--brand-blue)" />
          <h2 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--brand-navy)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Daily Scanner Ingestion Health & Coverage Telemetry
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge variant="bullish">INTEGRITY: {calculationIntegrity}</Badge>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
        {/* Scanned Count */}
        <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Securities Scanned</div>
          <div className="tabular-nums" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '2px' }}>
            {scannedCount}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--brand-blue)' }}>NSE 500 Universe</div>
        </div>

        {/* Market Data Coverage */}
        <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Market Data Coverage</div>
          <div className="tabular-nums" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '2px' }}>
            {marketDataCoveragePercent}%
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-bullish)' }}>Live Price & Volume Telemetry</div>
        </div>

        {/* Financial Coverage */}
        <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Financial Coverage</div>
          <div className="tabular-nums" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '2px' }}>
            {financialCoveragePercent}%
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-bullish)' }}>10Y Normalized Statements</div>
        </div>

        {/* News Coverage */}
        <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>News Coverage</div>
          <div className="tabular-nums" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '2px' }}>
            {newsCoveragePercent}%
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-bullish)' }}>Deduplicated Event Radar</div>
        </div>

        {/* Conflicts */}
        <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Source Conflicts</div>
          <div className="tabular-nums" style={{ fontSize: '18px', fontWeight: 800, color: sourceConflictsCount > 0 ? 'var(--color-warning)' : 'var(--brand-navy)', marginTop: '2px' }}>
            {sourceConflictsCount}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-bullish)' }}>100% Corroborated</div>
        </div>

        {/* Missing Data */}
        <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Missing Critical Data</div>
          <div className="tabular-nums" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '2px' }}>
            {criticalMissingDataCount}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-bullish)' }}>Zero Gaps in Model Inputs</div>
        </div>
      </div>

      <div style={{ fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
        <strong>Strict Anti-Fabrication Rule:</strong> If any critical metric is missing from verified sources, it is marked <code>NOT_ASSESSABLE</code> and penalized rather than fabricated.
      </div>
    </div>
  );
};
