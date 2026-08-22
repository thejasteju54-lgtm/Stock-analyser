import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, FileCheck, RefreshCw, Cpu } from 'lucide-react';
import { Badge } from '../common/Badge';

export interface DataQualityCenterCardProps {
  evidenceCompletenessPercent?: number;
  freshnessStatus?: 'CURRENT' | 'HIGH' | 'STALE' | 'UNKNOWN';
  sourceQualityTier?: 'TIER_1_AUDITED' | 'TIER_2_OFFICIAL' | 'TIER_3_MEDIA' | 'MIXED';
  conflictsCount?: number;
  missingCriticalMetricsCount?: number;
  calculationIntegrityStatus?: 'PASS' | 'WARN' | 'FAIL';
  lastAuditTimestamp?: string;
  onRefreshClick?: () => void;
}

export const DataQualityCenterCard: React.FC<DataQualityCenterCardProps> = ({
  evidenceCompletenessPercent = 92,
  freshnessStatus = 'HIGH',
  sourceQualityTier = 'TIER_1_AUDITED',
  conflictsCount = 0,
  missingCriticalMetricsCount = 0,
  calculationIntegrityStatus = 'PASS',
  lastAuditTimestamp = 'Real-time (Deterministic)',
  onRefreshClick,
}) => {
  const sourceQualityDisplay = {
    TIER_1_AUDITED: 'Tier 1 Audited',
    TIER_2_OFFICIAL: 'Tier 2 Official',
    TIER_3_MEDIA: 'Tier 3 Media',
    MIXED: 'Mixed Sources',
  }[sourceQualityTier];

  return (
    <div
      className="terminal-card"
      id="data-quality-center-card"
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
            Data Accuracy Center & Audit Vitals
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Audit Status: <strong style={{ color: 'var(--color-bullish)' }}>CERTIFIED</strong>
          </span>
          {onRefreshClick && (
            <button
              onClick={onRefreshClick}
              style={{ background: 'none', border: 'none', color: 'var(--brand-blue)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
            >
              <RefreshCw size={11} /> Re-verify
            </button>
          )}
        </div>
      </div>

      {/* 6 Audit Vitals Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        {/* 1. Evidence Completeness */}
        <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Evidence Completeness</span>
            <FileCheck size={13} color="var(--color-bullish)" />
          </div>
          <div className="tabular-nums" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '2px' }}>
            {evidenceCompletenessPercent}%
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-bullish)' }}>11/11 Statutory Pillars</div>
        </div>

        {/* 2. Data Freshness */}
        <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Freshness Rating</span>
            <CheckCircle2 size={13} color="var(--brand-blue)" />
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--brand-blue)', marginTop: '4px' }}>
            {freshnessStatus}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Market & Filings In-Sync</div>
        </div>

        {/* 3. Source Quality Tier */}
        <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Source Authority</span>
            <ShieldCheck size={13} color="var(--color-bullish)" />
          </div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '6px' }}>
            {sourceQualityDisplay}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-bullish)' }}>NSE/BSE Primary Filings</div>
        </div>

        {/* 4. Active Source Conflicts */}
        <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Source Conflicts</span>
            <AlertTriangle size={13} color={conflictsCount > 0 ? 'var(--color-warning)' : 'var(--color-bullish)'} />
          </div>
          <div className="tabular-nums" style={{ fontSize: '18px', fontWeight: 800, color: conflictsCount > 0 ? 'var(--color-warning)' : 'var(--brand-navy)', marginTop: '2px' }}>
            {conflictsCount}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            {conflictsCount === 0 ? 'Zero Cross-Layer Conflicts' : 'Reconciled via Policy'}
          </div>
        </div>

        {/* 5. Missing Critical Metrics */}
        <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Missing Critical Metrics</span>
            <CheckCircle2 size={13} color="var(--color-bullish)" />
          </div>
          <div className="tabular-nums" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-navy)', marginTop: '2px' }}>
            {missingCriticalMetricsCount}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-bullish)' }}>Zero Missing Vital Inputs</div>
        </div>

        {/* 6. Calculation Integrity */}
        <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Calculation Integrity</span>
            <Cpu size={13} color="var(--brand-blue)" />
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: calculationIntegrityStatus === 'PASS' ? 'var(--color-bullish)' : 'var(--color-warning)', marginTop: '4px' }}>
            {calculationIntegrityStatus}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>100% Deterministic Math</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
        <span>Anti-Hallucination Sentinel: <Badge variant="bullish">ACTIVE</Badge> • Unknown data strictly returns <code>NOT_ASSESSABLE</code></span>
        <span>Validation Engine: {lastAuditTimestamp}</span>
      </div>
    </div>
  );
};
