import React from 'react';
import { InvestmentVerdictReport } from '../../domain/verdict/VerdictTypes';
import { Award, Shield, UserCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

interface QualityAndGovernanceCardProps {
  report: InvestmentVerdictReport;
}

export const QualityAndGovernanceCard: React.FC<QualityAndGovernanceCardProps> = ({ report }) => {
  const { businessQuality, forensics, management } = report;

  const forensicStateBadge = {
    NO_MATERIAL_CONCERN: { color: 'var(--color-bullish)', bg: 'var(--color-bullish-bg)', border: 'var(--color-bullish-border)', text: 'Clean Forensic Profile' },
    WATCH: { color: 'var(--color-warning)', bg: 'var(--color-warning-bg)', border: 'var(--color-warning-border)', text: 'Forensic Watch (+3% MoS)' },
    MATERIAL_CONCERN: { color: 'var(--color-warning)', bg: 'var(--color-warning-bg)', border: 'var(--color-warning-border)', text: 'Material Forensic Anomaly' },
    SEVERE_CONCERN: { color: 'var(--color-bearish)', bg: 'var(--color-bearish-bg)', border: 'var(--color-bearish-border)', text: 'Severe Forensic Concern' },
    CRITICAL_OVERRIDE: { color: 'var(--color-bearish)', bg: 'var(--color-bearish-bg)', border: 'var(--color-bearish-border)', text: 'Critical Override (AVOID)' },
    NOT_ASSESSABLE: { color: 'var(--text-muted)', bg: '#f1f5f9', border: 'var(--border-subtle)', text: 'Forensics Unassessable' },
  }[forensics.forensicState];

  const mgmtStateBadge = {
    EXCELLENT: { color: 'var(--color-bullish)', bg: 'var(--color-bullish-bg)', border: 'var(--color-bullish-border)', text: 'High Credibility' },
    GOOD: { color: 'var(--brand-blue)', bg: 'var(--brand-blue-light)', border: 'var(--brand-blue-subtle)', text: 'Solid Credibility' },
    MIXED: { color: 'var(--color-warning)', bg: 'var(--color-warning-bg)', border: 'var(--color-warning-border)', text: 'Mixed Execution' },
    WEAK: { color: 'var(--color-bearish)', bg: 'var(--color-bearish-bg)', border: 'var(--color-bearish-border)', text: 'Weak Guidance Delivery' },
    SEVERE_CONCERN: { color: 'var(--color-bearish)', bg: 'var(--color-bearish-bg)', border: 'var(--color-bearish-border)', text: 'Governance Concern' },
    NOT_ASSESSABLE: { color: 'var(--text-muted)', bg: '#f1f5f9', border: 'var(--border-subtle)', text: 'Management Unassessable' },
  }[management.managementState];

  return (
    <div
      className="terminal-card"
      style={{
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        background: '#ffffff',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--brand-navy)', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Award size={16} color="var(--color-bullish)" />
          Business Quality, Forensics & Governance
        </h3>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--color-bullish)',
            background: 'var(--color-bullish-bg)',
            padding: '3px 8px',
            borderRadius: '4px',
            border: '1px solid var(--color-bullish-border)',
          }}
        >
          Quality Score: {businessQuality.businessQualityScore.toFixed(1)} / 100
        </span>
      </div>

      {/* 3 Pillar Summary Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {/* Fundamental Pillars */}
        <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-navy)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Fundamental Health
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Revenue Quality:</span>
              <span style={{ color: 'var(--brand-navy)', fontWeight: 600 }}>{businessQuality.revenueQualityTier}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Cash Conversion:</span>
              <span style={{ color: 'var(--color-bullish)', fontWeight: 700 }}>{businessQuality.cashConversionQuality}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Balance Sheet:</span>
              <span style={{ color: 'var(--brand-blue)', fontWeight: 600 }}>{businessQuality.balanceSheetStrength}</span>
            </div>
          </div>
        </div>

        {/* Forensic Accounting */}
        <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-navy)', textTransform: 'uppercase' }}>
              Forensic Health
            </span>
            <Shield size={12} color="var(--color-bullish)" />
          </div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: forensicStateBadge.color,
              background: forensicStateBadge.bg,
              padding: '3px 6px',
              borderRadius: '4px',
              marginBottom: '6px',
              display: 'inline-block',
              border: `1px solid ${forensicStateBadge.border}`,
            }}
          >
            {forensicStateBadge.text}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {forensics.decisionImpactSummary}
          </div>
        </div>

        {/* Management & Governance */}
        <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-navy)', textTransform: 'uppercase' }}>
              Management DNA
            </span>
            <UserCheck size={12} color="var(--brand-blue)" />
          </div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: mgmtStateBadge.color,
              background: mgmtStateBadge.bg,
              padding: '3px 6px',
              borderRadius: '4px',
              marginBottom: '6px',
              display: 'inline-block',
              border: `1px solid ${mgmtStateBadge.border}`,
            }}
          >
            {mgmtStateBadge.text} ({management.credibilityScore ?? 'N/A'}/100)
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Pledge: <strong style={{ color: 'var(--color-bullish)' }}>{management.promoterPledgePercent}%</strong> • Stake: <strong>{management.stakeChangeTrajectory}</strong>
          </div>
        </div>
      </div>

      {/* Key Strengths and Watch Items */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '4px', padding: '8px 12px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-bullish)', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={11} /> Top Operational Strength
          </div>
          <div style={{ fontSize: '11px', color: 'var(--brand-navy)' }}>
            {businessQuality.strengths[0] || 'Durable competitive advantage with strong ROCE'}
          </div>
        </div>

        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '4px', padding: '8px 12px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-warning)', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertTriangle size={11} /> Primary Watch Item
          </div>
          <div style={{ fontSize: '11px', color: 'var(--brand-navy)' }}>
            {businessQuality.watchItems[0] || 'Raw material inflation pass-through timing'}
          </div>
        </div>
      </div>
    </div>
  );
};
