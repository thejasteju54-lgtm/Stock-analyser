import React from 'react';
import { ManagementDataTension } from '../../domain/management/ManagementDnaTypes';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { FileText, Scale } from 'lucide-react';

interface ManagementDataTensionsCardProps {
  tensions: ManagementDataTension[];
  onInspectEvidence?: (citations: string[]) => void;
}

export const ManagementDataTensionsCard: React.FC<ManagementDataTensionsCardProps> = ({
  tensions,
  onInspectEvidence,
}) => {
  return (
    <Card
      title="Management Commentary vs Financial Data Tensions"
      action={
        tensions.length > 0 ? (
          <Badge variant="warning">{tensions.length} TENSION(S) IDENTIFIED</Badge>
        ) : (
          <Badge variant="bullish">ALIGNED WITH DATA</Badge>
        )
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div
          style={{
            padding: '8px 12px',
            background: 'var(--bg-surface-raised)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '4px',
            fontSize: '11px',
            color: 'var(--text-secondary)',
          }}
        >
          <strong>Comparability Gating:</strong> Tensions are established only after strictly verifying metric identity, reporting periods, consolidated vs standalone basis, and segment boundaries.
        </div>

        {tensions.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px' }}>
            No material contradictions or narrative tensions identified between management claims and verified accounting data.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tensions.map((ten) => (
              <div
                key={ten.tensionId}
                style={{
                  padding: '12px 14px',
                  background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Scale size={15} color="#f59e0b" />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {ten.topic}
                    </span>
                  </div>
                  <Badge variant="warning">{ten.status}</Badge>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                  {/* Management Claim */}
                  <div
                    style={{
                      padding: '10px',
                      background: 'var(--bg-canvas)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '4px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#0284c7' }}>
                      MANAGEMENT COMMENTARY ({ten.statementPeriod})
                    </span>
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-primary)', fontStyle: 'italic' }}>
                      "{ten.managementStatementText}"
                    </p>
                  </div>

                  {/* Verified Metric / Forensic Fact */}
                  <div
                    style={{
                      padding: '10px',
                      background: 'var(--bg-canvas)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '4px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#f59e0b' }}>
                      VERIFIED FINANCIAL METRIC ({ten.financialMetricPeriod})
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                        {ten.financialMetricName}:
                      </strong>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: '#ef4444' }}>
                        {ten.financialMetricValue} {ten.financialMetricUnit}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Diagnostic Observation:</strong> {ten.tensionExplanation}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: 'var(--text-muted)' }}>
                  <span>{ten.comparabilityNotes}</span>
                  {onInspectEvidence && (
                    <button
                      onClick={() =>
                        onInspectEvidence([
                          `${ten.statementSource.documentName} (P.${ten.statementSource.pageNumber || 'N/A'}) [Management Concall]`,
                          `${ten.financialMetricSource.documentName} (P.${ten.financialMetricSource.pageNumber || 'N/A'}) [Audited Financials]`,
                        ])
                      }
                      className="terminal-btn terminal-btn-xs"
                      style={{ padding: '2px 6px', fontSize: '10px' }}
                    >
                      <FileText size={10} />
                      Inspect Both Sources
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
