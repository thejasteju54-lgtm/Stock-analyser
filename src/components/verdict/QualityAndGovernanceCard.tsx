import React from 'react';
import { InvestmentVerdictReport } from '../../domain/verdict/VerdictTypes';
import { Award, Shield, UserCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

interface QualityAndGovernanceCardProps {
  report: InvestmentVerdictReport;
}

export const QualityAndGovernanceCard: React.FC<QualityAndGovernanceCardProps> = ({ report }) => {
  const { businessQuality, forensics, management } = report;

  const forensicStateBadge = {
    NO_MATERIAL_CONCERN: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', text: 'Clean Forensic Profile' },
    WATCH: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', text: 'Forensic Watch (+3% MoS)' },
    MATERIAL_CONCERN: { color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)', text: 'Material Forensic Anomaly' },
    SEVERE_CONCERN: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', text: 'Severe Forensic Concern' },
    CRITICAL_OVERRIDE: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)', text: 'Critical Override (AVOID)' },
    NOT_ASSESSABLE: { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', text: 'Forensics Unassessable' },
  }[forensics.forensicState];

  const mgmtStateBadge = {
    EXCELLENT: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', text: 'High Credibility' },
    GOOD: { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.1)', text: 'Solid Credibility' },
    MIXED: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', text: 'Mixed Execution' },
    WEAK: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', text: 'Weak Guidance Delivery' },
    SEVERE_CONCERN: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)', text: 'Governance Concern' },
    NOT_ASSESSABLE: { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', text: 'Management Unassessable' },
  }[management.managementState];

  return (
    <div
      style={{
        background: '#0c1017',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '20px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: '#f8fafc', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={16} className="text-emerald-400" />
          Business Quality, Forensics & Governance
        </h3>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#10b981',
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '3px 8px',
            borderRadius: '4px',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}
        >
          Quality Score: {businessQuality.businessQualityScore.toFixed(1)} / 100
        </span>
      </div>

      {/* 3 Pillar Summary Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
        {/* Fundamental Pillars */}
        <div style={{ background: '#121824', border: '1px solid #1e293b', borderRadius: '6px', padding: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
            Fundamental Health
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Revenue Quality:</span>
              <span style={{ color: '#f8fafc', fontWeight: 600 }}>{businessQuality.revenueQualityTier}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Cash Conversion:</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>{businessQuality.cashConversionQuality}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Balance Sheet:</span>
              <span style={{ color: '#38bdf8', fontWeight: 600 }}>{businessQuality.balanceSheetStrength}</span>
            </div>
          </div>
        </div>

        {/* Forensic Accounting */}
        <div style={{ background: '#121824', border: '1px solid #1e293b', borderRadius: '6px', padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
              Forensic Health
            </span>
            <Shield size={12} className="text-emerald-400" />
          </div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: forensicStateBadge.color,
              background: forensicStateBadge.bg,
              padding: '3px 6px',
              borderRadius: '4px',
              marginBottom: '8px',
              display: 'inline-block',
            }}
          >
            {forensicStateBadge.text}
          </div>
          <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1.4 }}>
            {forensics.decisionImpactSummary}
          </div>
        </div>

        {/* Management & Governance */}
        <div style={{ background: '#121824', border: '1px solid #1e293b', borderRadius: '6px', padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
              Management DNA
            </span>
            <UserCheck size={12} className="text-sky-400" />
          </div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: mgmtStateBadge.color,
              background: mgmtStateBadge.bg,
              padding: '3px 6px',
              borderRadius: '4px',
              marginBottom: '8px',
              display: 'inline-block',
            }}
          >
            {mgmtStateBadge.text} ({management.credibilityScore ?? 'N/A'}/100)
          </div>
          <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1.4 }}>
            Pledge: <strong style={{ color: '#10b981' }}>{management.promoterPledgePercent}%</strong> • Stake: <strong>{management.stakeChangeTrajectory}</strong>
          </div>
        </div>
      </div>

      {/* Key Strengths and Watch Items */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: 'auto' }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '4px', padding: '8px 12px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={11} /> Top Operational Strength
          </div>
          <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
            {businessQuality.strengths[0] || 'Durable competitive advantage with strong ROCE'}
          </div>
        </div>

        <div style={{ background: 'rgba(245, 158, 11, 0.04)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '4px', padding: '8px 12px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertTriangle size={11} /> Primary Watch Item
          </div>
          <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
            {businessQuality.watchItems[0] || 'Raw material inflation pass-through timing'}
          </div>
        </div>
      </div>
    </div>
  );
};
