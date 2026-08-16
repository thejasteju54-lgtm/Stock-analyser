import React from 'react';
import { CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { TwoYearAuditReport } from '../../domain/ingestion/TwoYearReportAudit';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface TwoYearAuditCardProps {
  auditReport: TwoYearAuditReport;
  targetSymbol: string;
}

export const TwoYearAuditCard: React.FC<TwoYearAuditCardProps> = ({
  auditReport,
  targetSymbol,
}) => {
  const { isReadyForTwoYearModel, fy0Document, fy1Document, warnings, statusMessage } = auditReport;

  return (
    <Card
      title="Two-Year Annual Report Intake Baseline"
      icon={<FileText size={14} color="#38bdf8" />}
      action={
        isReadyForTwoYearModel ? (
          <Badge variant="bullish" icon={<CheckCircle2 size={11} />}>
            2-YEAR BASELINE READY
          </Badge>
        ) : (
          <Badge variant="bearish" icon={<AlertTriangle size={11} />}>
            BASELINE INCOMPLETE
          </Badge>
        )
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} id="two-year-audit-card">
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {statusMessage}
        </p>

        {/* 2-Slot Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '12px',
          }}
        >
          {/* FY-1 (Base Year) */}
          <div
            style={{
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              padding: '12px',
              background: fy1Document ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-surface-sunken)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                FY-1 (Base Year Report)
              </span>
              {fy1Document ? (
                <Badge variant="bullish">{fy1Document.reportingPeriod.fiscalYear || 'Identified'}</Badge>
              ) : (
                <Badge variant="neutral">Pending Intake</Badge>
              )}
            </div>

            {fy1Document ? (
              <div style={{ fontSize: '11px', color: 'var(--text-primary)' }}>
                <strong style={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {fy1Document.filename}
                </strong>
                <span style={{ color: 'var(--text-muted)' }}>
                  {fy1Document.pages.length} Pages • Hash: {fy1Document.fileHash.slice(0, 10)}...
                </span>
              </div>
            ) : (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Upload older consecutive annual report (e.g. FY23) to enable comparative cash flow & DuPont analysis.
              </div>
            )}
          </div>

          {/* FY-0 (Current Year) */}
          <div
            style={{
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              padding: '12px',
              background: fy0Document ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-surface-sunken)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                FY-0 (Current Year Report)
              </span>
              {fy0Document ? (
                <Badge variant="cyan">{fy0Document.reportingPeriod.fiscalYear || 'Identified'}</Badge>
              ) : (
                <Badge variant="neutral">Pending Intake</Badge>
              )}
            </div>

            {fy0Document ? (
              <div style={{ fontSize: '11px', color: 'var(--text-primary)' }}>
                <strong style={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {fy0Document.filename}
                </strong>
                <span style={{ color: 'var(--text-muted)' }}>
                  {fy0Document.pages.length} Pages • Hash: {fy0Document.fileHash.slice(0, 10)}...
                </span>
              </div>
            ) : (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Upload latest audited annual report (e.g. FY24) for target {targetSymbol}.
              </div>
            )}
          </div>
        </div>

        {/* Warning messages */}
        {warnings.length > 0 && (
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '4px',
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              fontSize: '11px',
              color: '#f59e0b',
            }}
            id="two-year-audit-warnings"
          >
            {warnings.map((w, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={12} style={{ flexShrink: 0 }} />
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
