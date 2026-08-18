import React, { useState } from 'react';
import {
  AuditorDisclosureItem,
  AccountingPolicyChangeItem,
  RestatementItem,
} from '../../domain/forensics/ForensicAnalysisTypes';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { FileCheck, ShieldCheck } from 'lucide-react';

interface AuditorAndAccountingCardProps {
  auditors: AuditorDisclosureItem[];
  policyChanges: AccountingPolicyChangeItem[];
  restatements: RestatementItem[];
  onInspectEvidence?: (citations: string[]) => void;
}

export const AuditorAndAccountingCard: React.FC<AuditorAndAccountingCardProps> = ({
  auditors,
  policyChanges,
  restatements,
  onInspectEvidence,
}) => {
  const [subTab, setSubTab] = useState<'AUDITOR' | 'POLICIES' | 'RESTATEMENTS'>('AUDITOR');

  const getOpinionBadge = (opinion: string) => {
    switch (opinion) {
      case 'QUALIFIED':
      case 'ADVERSE':
      case 'DISCLAIMER':
        return <Badge variant="bearish">{opinion}</Badge>;
      default:
        return <Badge variant="bullish">UNMODIFIED (TRUE & FAIR)</Badge>;
    }
  };

  return (
    <Card
      title="Auditor Disclosures & Accounting Integrity"
      icon={<FileCheck size={14} color="#10b981" />}
      action={
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => setSubTab('AUDITOR')}
            className={`terminal-btn terminal-btn-sm ${subTab === 'AUDITOR' ? 'active' : ''}`}
            style={{
              padding: '2px 8px',
              fontSize: '11px',
              background: subTab === 'AUDITOR' ? '#0284c7' : 'var(--bg-surface-raised)',
              color: subTab === 'AUDITOR' ? '#ffffff' : 'var(--text-secondary)',
              borderColor: subTab === 'AUDITOR' ? '#0284c7' : 'var(--border-subtle)',
            }}
          >
            Auditor Report
          </button>
          <button
            onClick={() => setSubTab('POLICIES')}
            className={`terminal-btn terminal-btn-sm ${subTab === 'POLICIES' ? 'active' : ''}`}
            style={{
              padding: '2px 8px',
              fontSize: '11px',
              background: subTab === 'POLICIES' ? '#0284c7' : 'var(--bg-surface-raised)',
              color: subTab === 'POLICIES' ? '#ffffff' : 'var(--text-secondary)',
              borderColor: subTab === 'POLICIES' ? '#0284c7' : 'var(--border-subtle)',
            }}
          >
            Policy Changes ({policyChanges.length})
          </button>
          <button
            onClick={() => setSubTab('RESTATEMENTS')}
            className={`terminal-btn terminal-btn-sm ${subTab === 'RESTATEMENTS' ? 'active' : ''}`}
            style={{
              padding: '2px 8px',
              fontSize: '11px',
              background: subTab === 'RESTATEMENTS' ? '#0284c7' : 'var(--bg-surface-raised)',
              color: subTab === 'RESTATEMENTS' ? '#ffffff' : 'var(--text-secondary)',
              borderColor: subTab === 'RESTATEMENTS' ? '#0284c7' : 'var(--border-subtle)',
            }}
          >
            Restatements ({restatements.length})
          </button>
        </div>
      }
    >
      {subTab === 'AUDITOR' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {auditors.map((aud) => (
            <div
              key={aud.disclosureId}
              style={{
                padding: '10px 12px',
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-primary)' }}>
                    {aud.auditorFirm}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                    Period: {aud.reportingPeriod}
                  </span>
                </div>
                {getOpinionBadge(aud.auditOpinion)}
              </div>

              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {aud.observationsSummary}
              </p>

              {aud.keyAuditMatterTopics.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Key Audit Matters (KAM) Highlighted:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {aud.keyAuditMatterTopics.map((topic, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '11px',
                          color: '#38bdf8',
                          background: 'rgba(56, 189, 248, 0.1)',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          border: '1px solid rgba(56, 189, 248, 0.2)',
                        }}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {aud.evidenceReferences.length > 0 && onInspectEvidence && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <button
                    onClick={() => onInspectEvidence(aud.evidenceReferences.map((e) => `${e.documentName} (P.${e.pageNumber || 'N/A'})`))}
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
                    <ShieldCheck size={11} /> Auditor Report Citations
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {subTab === 'POLICIES' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {policyChanges.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              No material accounting policy changes disclosed in the target period.
            </div>
          ) : (
            policyChanges.map((pol) => (
              <div
                key={pol.changeId}
                style={{
                  padding: '10px 12px',
                  background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>
                    {pol.accountingArea.replace(/_/g, ' ')}
                  </span>
                  <Badge variant={pol.impactDirection === 'PAT_POSITIVE' ? 'warning' : 'neutral'}>
                    {pol.impactDirection.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <strong>Reason:</strong> {pol.disclosedReason}
                </p>
                {pol.disclosedQuantitativeImpact && (
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-primary)' }}>
                    <strong>Impact:</strong> {pol.disclosedQuantitativeImpact}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {subTab === 'RESTATEMENTS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {restatements.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              No prior-period restatements or reclassifications identified.
            </div>
          ) : (
            restatements.map((rst) => (
              <div
                key={rst.restatementId}
                style={{
                  padding: '10px 12px',
                  background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>
                    {rst.metricOrLineItem} ({rst.periodAffected})
                  </span>
                  <Badge variant={rst.restatementType === 'ERROR_CORRECTION' ? 'bearish' : 'neutral'}>
                    {rst.restatementType}
                  </Badge>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                  <span>Original: ₹{rst.originalValue.toLocaleString()} Cr</span>
                  <span>Restated: ₹{rst.restatedValue.toLocaleString()} Cr</span>
                  <span style={{ color: rst.varianceAmount !== 0 ? '#38bdf8' : 'inherit' }}>
                    Variance: {rst.variancePct}% (₹{rst.varianceAmount.toLocaleString()} Cr)
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {rst.disclosedReason}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </Card>
  );
};
