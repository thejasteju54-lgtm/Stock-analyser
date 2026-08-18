import React, { useState } from 'react';
import { ManagementCommitment, ManagementCommitmentStatus } from '../../domain/management/ManagementDnaTypes';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { FileText } from 'lucide-react';

interface PromiseVsDeliveryCardProps {
  commitments: ManagementCommitment[];
  onInspectEvidence?: (citations: string[]) => void;
}

export const PromiseVsDeliveryCard: React.FC<PromiseVsDeliveryCardProps> = ({
  commitments,
  onInspectEvidence,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<ManagementCommitmentStatus | 'ALL'>('ALL');

  const filteredCommitments = commitments.filter((c) => {
    if (selectedStatus === 'ALL') return true;
    return c.status === selectedStatus;
  });

  const getStatusBadge = (status: ManagementCommitmentStatus) => {
    switch (status) {
      case 'ACHIEVED':
        return <Badge variant="bullish">ACHIEVED</Badge>;
      case 'ABOVE_GUIDANCE':
        return <Badge variant="cyan">ABOVE GUIDANCE</Badge>;
      case 'ON_TRACK':
        return <Badge variant="bullish">ON TRACK</Badge>;
      case 'PARTIALLY_ACHIEVED':
        return <Badge variant="warning">PARTIAL</Badge>;
      case 'MISSED':
        return <Badge variant="bearish">MISSED</Badge>;
      case 'REVISED':
        return <Badge variant="warning">REVISED</Badge>;
      case 'WITHDRAWN':
        return <Badge variant="bearish">WITHDRAWN</Badge>;
      case 'UNVERIFIABLE':
        return <Badge variant="neutral">UNVERIFIABLE</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getMaterialityChip = (materiality: string) => {
    const colorMap: Record<string, string> = {
      STRATEGIC: '#8b5cf6',
      HIGH: '#0284c7',
      MEDIUM: '#f59e0b',
      LOW: '#64748b',
    };
    return (
      <span
        style={{
          fontSize: '9px',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          padding: '2px 6px',
          borderRadius: '3px',
          background: `${colorMap[materiality] || '#64748b'}20`,
          color: colorMap[materiality] || '#64748b',
          border: `1px solid ${colorMap[materiality] || '#64748b'}40`,
        }}
      >
        {materiality}
      </span>
    );
  };

  return (
    <Card
      title="Promise vs Delivery Register"
      action={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            aria-label="Filter commitments by status"
            data-testid="status-filter-select"
            className="terminal-select terminal-select-sm"
            style={{ fontSize: '11px', padding: '3px 8px' }}
          >
            <option value="ALL">All Statuses ({commitments.length})</option>
            <option value="ACHIEVED">Achieved</option>
            <option value="ABOVE_GUIDANCE">Above Guidance</option>
            <option value="ON_TRACK">On Track</option>
            <option value="PARTIALLY_ACHIEVED">Partially Achieved</option>
            <option value="MISSED">Missed</option>
            <option value="REVISED">Revised</option>
            <option value="UNVERIFIABLE">Unverifiable</option>
          </select>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredCommitments.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px' }}>
            No management commitments match the selected filter.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="terminal-table" style={{ width: '100%', fontSize: '11px' }}>
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>Period</th>
                  <th style={{ width: '110px' }}>Category</th>
                  <th>Promise / Guidance Stated</th>
                  <th>Target Metric & Range</th>
                  <th>Observed Actual Outcome</th>
                  <th style={{ width: '110px' }}>Status</th>
                  <th style={{ width: '80px', textAlign: 'right' }}>Evidence</th>
                </tr>
              </thead>
              <tbody>
                {filteredCommitments.map((c) => (
                  <tr key={c.commitmentId}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {c.targetPeriod}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                          {c.commitmentType.replace(/_/g, ' ')}
                        </span>
                        {getMaterialityChip(c.materiality)}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ color: 'var(--text-primary)' }}>{c.commitmentText}</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                          Spokesperson: {c.managementPerson}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{c.targetMetric}</strong>
                        {c.targetRange && (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#0284c7' }}>
                            {c.targetRange.min !== undefined && c.targetRange.max !== undefined
                              ? `${c.targetRange.min}–${c.targetRange.max}%`
                              : `${c.targetRange.target}%`}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {c.actualOutcomeSummary || 'Data unavailable from verified sources.'}
                        </span>
                        {c.reasonCodes && c.reasonCodes.length > 0 && (
                          <span style={{ fontSize: '10px', color: '#f59e0b' }}>
                            Stated Reason: {c.reasonCodes.join(', ')} ({c.reasonVerificationStatus})
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{getStatusBadge(c.status)}</td>
                    <td style={{ textAlign: 'right' }}>
                      {onInspectEvidence && c.evidenceReferences.length > 0 && (
                        <button
                          onClick={() =>
                            onInspectEvidence(
                              c.evidenceReferences.map((e) => `${e.documentName} (P.${e.pageNumber || 'N/A'}) [${e.sourceType}]`)
                            )
                          }
                          className="terminal-btn terminal-btn-xs"
                          style={{ padding: '2px 6px', fontSize: '10px' }}
                          title="View Source Citations"
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
