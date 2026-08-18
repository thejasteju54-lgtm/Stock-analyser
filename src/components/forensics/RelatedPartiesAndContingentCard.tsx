import React, { useState } from 'react';
import {
  RelatedPartyTransactionItem,
  ContingentLiabilityItem,
} from '../../domain/forensics/ForensicAnalysisTypes';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Users, ShieldCheck } from 'lucide-react';

interface RelatedPartiesAndContingentCardProps {
  relatedParties: RelatedPartyTransactionItem[];
  contingentLiabilities: ContingentLiabilityItem[];
  onInspectEvidence?: (citations: string[]) => void;
}

export const RelatedPartiesAndContingentCard: React.FC<RelatedPartiesAndContingentCardProps> = ({
  relatedParties,
  contingentLiabilities,
  onInspectEvidence,
}) => {
  const [activeTab, setActiveTab] = useState<'RPT' | 'CONTINGENT'>('RPT');

  return (
    <Card
      title="Related Parties & Contingent Liabilities"
      icon={<Users size={14} color="#38bdf8" />}
      action={
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => setActiveTab('RPT')}
            className={`terminal-btn terminal-btn-sm ${activeTab === 'RPT' ? 'active' : ''}`}
            style={{
              padding: '2px 8px',
              fontSize: '11px',
              background: activeTab === 'RPT' ? '#0284c7' : 'var(--bg-surface-raised)',
              color: activeTab === 'RPT' ? '#ffffff' : 'var(--text-secondary)',
              borderColor: activeTab === 'RPT' ? '#0284c7' : 'var(--border-subtle)',
            }}
          >
            Related Parties ({relatedParties.length})
          </button>
          <button
            onClick={() => setActiveTab('CONTINGENT')}
            className={`terminal-btn terminal-btn-sm ${activeTab === 'CONTINGENT' ? 'active' : ''}`}
            style={{
              padding: '2px 8px',
              fontSize: '11px',
              background: activeTab === 'CONTINGENT' ? '#0284c7' : 'var(--bg-surface-raised)',
              color: activeTab === 'CONTINGENT' ? '#ffffff' : 'var(--text-secondary)',
              borderColor: activeTab === 'CONTINGENT' ? '#0284c7' : 'var(--border-subtle)',
            }}
          >
            Contingent Liabilities ({contingentLiabilities.length})
          </button>
        </div>
      }
    >
      {activeTab === 'RPT' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {relatedParties.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              No material related-party transactions disclosed.
            </div>
          ) : (
            <div className="terminal-table-container" style={{ overflowX: 'auto' }}>
              <table className="terminal-table" style={{ width: '100%', fontSize: '11px' }}>
                <thead>
                  <tr>
                    <th>Counterparty & Relation</th>
                    <th>Transaction Type</th>
                    <th>Amount (Cr)</th>
                    <th>% of Revenue</th>
                    <th>% of Net Worth</th>
                    <th>Materiality</th>
                    <th>Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {relatedParties.map((rpt) => (
                    <tr key={rpt.transactionId}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rpt.counterparty}</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{rpt.relationship}</span>
                        </div>
                      </td>
                      <td>
                        <Badge variant="neutral">{rpt.transactionType.replace(/_/g, ' ')}</Badge>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        ₹{rpt.amount.toLocaleString()} Cr
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>
                        {rpt.percentOfRevenue !== undefined ? `${rpt.percentOfRevenue}%` : 'N/A'}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>
                        {rpt.percentOfNetWorth !== undefined ? `${rpt.percentOfNetWorth}%` : 'N/A'}
                      </td>
                      <td>
                        <Badge variant={rpt.materialityAssessment === 'MATERIAL_TRANSACTION' ? 'warning' : 'cyan'}>
                          {rpt.materialityAssessment.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td>
                        {rpt.evidenceReferences.length > 0 && onInspectEvidence && (
                          <button
                            onClick={() => onInspectEvidence(rpt.evidenceReferences.map((e) => `${e.documentName} (P.${e.pageNumber || 'N/A'})`))}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-cyan)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px',
                              padding: 0,
                              fontSize: '11px',
                            }}
                          >
                            <ShieldCheck size={11} /> Citations
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
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {contingentLiabilities.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              No contingent liabilities or disputed claims disclosed.
            </div>
          ) : (
            <div className="terminal-table-container" style={{ overflowX: 'auto' }}>
              <table className="terminal-table" style={{ width: '100%', fontSize: '11px' }}>
                <thead>
                  <tr>
                    <th>Category & Nature</th>
                    <th>Amount (Cr)</th>
                    <th>% Net Worth</th>
                    <th>% Revenue</th>
                    <th>% Cash</th>
                    <th>Outcome Status</th>
                    <th>Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {contingentLiabilities.map((cont) => (
                    <tr key={cont.liabilityId}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {cont.category.replace(/_/g, ' ')}
                          </span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{cont.description}</span>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        ₹{cont.amount.toLocaleString()} Cr
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>
                        {cont.percentOfNetWorth !== undefined ? `${cont.percentOfNetWorth}%` : 'N/A'}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>
                        {cont.percentOfRevenue !== undefined ? `${cont.percentOfRevenue}%` : 'N/A'}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>
                        {cont.percentOfCash !== undefined ? `${cont.percentOfCash}%` : 'N/A'}
                      </td>
                      <td>
                        <Badge variant={cont.outcomeStatus === 'OUTCOME_UNCERTAIN' ? 'warning' : 'neutral'}>
                          {cont.outcomeStatus.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td>
                        {cont.evidenceReferences.length > 0 && onInspectEvidence && (
                          <button
                            onClick={() => onInspectEvidence(cont.evidenceReferences.map((e) => `${e.documentName} (P.${e.pageNumber || 'N/A'})`))}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-cyan)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px',
                              padding: 0,
                              fontSize: '11px',
                            }}
                          >
                            <ShieldCheck size={11} /> Citations
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
      )}
    </Card>
  );
};
