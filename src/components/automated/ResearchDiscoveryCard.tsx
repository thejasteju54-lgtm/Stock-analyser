import React from 'react';
import { Globe, ShieldCheck, CheckCircle2, AlertTriangle, FileText, RefreshCw } from 'lucide-react';
import { Badge } from '../common/Badge';

export interface ResearchDiscoveryCardProps {
  evidenceCoveragePercent?: number;
  primarySourcesCount?: number;
  secondarySourcesCount?: number;
  sourceConflictsCount?: number;
  missingCriticalDataCount?: number;
  onRefreshClick?: () => void;
  onInvestigateConflicts?: () => void;
}

export const ResearchDiscoveryCard: React.FC<ResearchDiscoveryCardProps> = ({
  evidenceCoveragePercent = 94,
  primarySourcesCount = 8,
  secondarySourcesCount = 14,
  sourceConflictsCount = 0,
  missingCriticalDataCount = 0,
  onRefreshClick,
  onInvestigateConflicts,
}) => {
  return (
    <div
      className="terminal-card"
      id="research-discovery-card"
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
          <Globe size={16} color="var(--brand-blue)" />
          <h2 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--brand-navy)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Autonomous Data Acquisition & Ingestion Health
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Status: <strong style={{ color: 'var(--color-bullish)' }}>SYNCHRONIZED</strong>
          </span>
          {onRefreshClick && (
            <button
              onClick={onRefreshClick}
              style={{ background: 'none', border: 'none', color: 'var(--brand-blue)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
            >
              <RefreshCw size={11} /> Refresh Ingestion
            </button>
          )}
        </div>
      </div>

      {/* Vitals Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
        {/* 1. Evidence Coverage */}
        <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Evidence Coverage</span>
            <CheckCircle2 size={13} color="var(--color-bullish)" />
          </div>
          <div className="tabular-nums" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '2px' }}>
            {evidenceCoveragePercent}%
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-bullish)' }}>11/11 Research Pillars</div>
        </div>

        {/* 2. Primary Regulatory Sources */}
        <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Tier 1 Statutory Filings</span>
            <ShieldCheck size={13} color="var(--brand-blue)" />
          </div>
          <div className="tabular-nums" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '2px' }}>
            {primarySourcesCount} Docs
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>NSE/BSE Annual Filings</div>
        </div>

        {/* 3. Secondary Structured Sources */}
        <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Structured Market Feeds</span>
            <FileText size={13} color="var(--brand-blue)" />
          </div>
          <div className="tabular-nums" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '2px' }}>
            {secondarySourcesCount} Feeds
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Screener, Tickertape, MC</div>
        </div>

        {/* 4. Cross-Source Conflicts */}
        <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Cross-Source Conflicts</span>
            <AlertTriangle size={13} color={sourceConflictsCount > 0 ? 'var(--color-warning)' : 'var(--color-bullish)'} />
          </div>
          <div className="tabular-nums" style={{ fontSize: '18px', fontWeight: 800, color: sourceConflictsCount > 0 ? 'var(--color-warning)' : 'var(--brand-navy)', marginTop: '2px' }}>
            {sourceConflictsCount}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            {sourceConflictsCount === 0 ? (
              '100% Corroborated'
            ) : onInvestigateConflicts ? (
              <span onClick={onInvestigateConflicts} style={{ color: 'var(--brand-blue)', cursor: 'pointer', textDecoration: 'underline' }}>
                Investigate Conflicts →
              </span>
            ) : (
              'Disclosed in Audit'
            )}
          </div>
        </div>

        {/* 5. Missing Critical Data */}
        <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Missing Critical Data</span>
            <CheckCircle2 size={13} color="var(--color-bullish)" />
          </div>
          <div className="tabular-nums" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '2px' }}>
            {missingCriticalDataCount}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-bullish)' }}>Zero Gaps in Core DAG</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
        <span>Zero-Manual-Data Workflow: <Badge variant="bullish">ENABLED</Badge> • Automated document intake & reconciliation</span>
        <span>Auto-Ingestion Engine: v1.0.0 Production</span>
      </div>
    </div>
  );
};
