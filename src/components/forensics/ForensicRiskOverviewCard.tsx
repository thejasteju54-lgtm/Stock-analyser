import React from 'react';
import { ForensicAnalysisReport } from '../../domain/forensics/ForensicAnalysisTypes';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ShieldAlert } from 'lucide-react';

interface ForensicRiskOverviewCardProps {
  report: ForensicAnalysisReport;
}

export const ForensicRiskOverviewCard: React.FC<ForensicRiskOverviewCardProps> = ({ report }) => {
  const getRiskBadge = (tier: string) => {
    switch (tier) {
      case 'HIGH':
        return <Badge variant="bearish">HIGH FORENSIC ATTENTION</Badge>;
      case 'ELEVATED':
        return <Badge variant="warning">ELEVATED ATTENTION</Badge>;
      case 'MODERATE':
        return <Badge variant="cyan">MODERATE</Badge>;
      default:
        return <Badge variant="bullish">LOW FORENSIC RISK</Badge>;
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 60) return '#ef4444';
    if (score >= 35) return '#f59e0b';
    if (score >= 15) return '#38bdf8';
    return '#10b981';
  };

  const criticalCount = report.findings.filter((f) => f.severity === 'CRITICAL').length;
  const highCount = report.findings.filter((f) => f.severity === 'HIGH').length;
  const mediumCount = report.findings.filter((f) => f.severity === 'MEDIUM').length;
  const lowCount = report.findings.filter((f) => f.severity === 'LOW').length;

  return (
    <Card
      title="Forensic Risk & Accounting Sentinel Overview"
      icon={<ShieldAlert size={14} color="#f59e0b" />}
      action={getRiskBadge(report.overallForensicRisk)}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'center' }}>
        {/* Risk Score Gauge */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Forensic Risk Score
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: getRiskColor(report.overallForensicRiskScore), fontFamily: 'var(--font-mono)' }}>
              {report.overallForensicRiskScore}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/ 100</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface-raised)', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${report.overallForensicRiskScore}%`,
                height: '100%',
                background: getRiskColor(report.overallForensicRiskScore),
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            Lower score indicates fewer unresolved anomalies
          </span>
        </div>

        {/* Confidence & Completeness */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Analysis Confidence:</span>
            <Badge variant={report.confidence === 'HIGH' ? 'bullish' : 'warning'}>{report.confidence}</Badge>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Data Completeness:</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {report.dataCompleteness}%
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Investigation Leads:</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: '#38bdf8' }}>
              {report.findings.length} Items
            </span>
          </div>
        </div>

        {/* Severity Tally Pill Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Findings Severity Tally
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
            <div style={{ padding: '4px 8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '3px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: '#ef4444' }}>Critical</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444' }}>{criticalCount}</span>
            </div>
            <div style={{ padding: '4px 8px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '3px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: '#f59e0b' }}>High</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#f59e0b' }}>{highCount}</span>
            </div>
            <div style={{ padding: '4px 8px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '3px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: '#38bdf8' }}>Medium</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8' }}>{mediumCount}</span>
            </div>
            <div style={{ padding: '4px 8px', background: 'var(--bg-surface-raised)', border: '1px solid var(--border-subtle)', borderRadius: '3px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Low / Obs</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>{lowCount}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
