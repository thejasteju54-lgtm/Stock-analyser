import React from 'react';
import { RevisedGuidanceEntry, ManagementCommitment } from '../../domain/management/ManagementDnaTypes';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { FileText } from 'lucide-react';

interface GuidanceTrackingCardProps {
  revisions: RevisedGuidanceEntry[];
  commitments: ManagementCommitment[];
  onInspectEvidence?: (citations: string[]) => void;
}

export const GuidanceTrackingCard: React.FC<GuidanceTrackingCardProps> = ({
  revisions,
  commitments,
  onInspectEvidence,
}) => {
  const revisedCommitments = commitments.filter((c) => c.status === 'REVISED' || (c.revisedGuidanceHistory && c.revisedGuidanceHistory.length > 0));

  return (
    <Card
      title="Guidance Revision & Target Postponement Ledger"
      action={
        revisions.length > 1 ? (
          <Badge variant="warning">REVISION PATTERN DETECTED</Badge>
        ) : (
          <Badge variant="bullish">STABLE GUIDANCE</Badge>
        )
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Notice about preservation of original guidance */}
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
          <strong>Methodology Rule:</strong> Original guidance targets are strictly preserved and never overwritten by subsequent revisions.
        </div>

        {revisions.length === 0 && revisedCommitments.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px' }}>
            No mid-year downward guidance revisions or target postponements recorded across analyzed disclosures.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="terminal-table" style={{ width: '100%', fontSize: '11px' }}>
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>Period</th>
                  <th>Original Stated Guidance</th>
                  <th>Revised Guidance Target</th>
                  <th>Revision Date & Reason</th>
                  <th style={{ width: '110px' }}>Verification</th>
                  <th style={{ width: '80px', textAlign: 'right' }}>Evidence</th>
                </tr>
              </thead>
              <tbody>
                {revisions.map((rev) => (
                  <tr key={rev.revisionId}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {rev.revisedPeriod}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      Original target preserved in promise register
                    </td>
                    <td style={{ color: '#f59e0b', fontWeight: 600 }}>
                      {rev.revisedText}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ color: 'var(--text-primary)' }}>{rev.managementStatedReason}</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                          Date: {rev.revisionDate}
                        </span>
                      </div>
                    </td>
                    <td>
                      <Badge variant={rev.reasonVerificationStatus === 'SUPPORTED' ? 'bullish' : 'warning'}>
                        {rev.reasonVerificationStatus}
                      </Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {onInspectEvidence && (
                        <button
                          onClick={() =>
                            onInspectEvidence([`${rev.sourceDocumentId} (P.${rev.pageNumber || 'N/A'})`])
                          }
                          className="terminal-btn terminal-btn-xs"
                          style={{ padding: '2px 6px', fontSize: '10px' }}
                        >
                          <FileText size={11} />
                          Cite
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
};
