import React, { useState } from 'react';
import { ForensicFinding } from '../../domain/forensics/ForensicAnalysisTypes';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { AlertOctagon, ChevronDown, ChevronUp, ExternalLink, HelpCircle, ShieldCheck } from 'lucide-react';

interface HighPriorityFindingsCardProps {
  findings: ForensicFinding[];
  onInspectEvidence?: (citations: string[]) => void;
}

export const HighPriorityFindingsCard: React.FC<HighPriorityFindingsCardProps> = ({
  findings,
  onInspectEvidence,
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(findings.slice(0, 2).map((f) => f.findingId)));

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <Badge variant="bearish">CRITICAL</Badge>;
      case 'HIGH':
        return <Badge variant="bearish">HIGH SEVERITY</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning">MEDIUM</Badge>;
      default:
        return <Badge variant="neutral">LOW / OBSERVED</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'MATERIAL_CONCERN':
        return <Badge variant="bearish">MATERIAL CONCERN</Badge>;
      case 'REQUIRES_INVESTIGATION':
        return <Badge variant="warning">REQUIRES INVESTIGATION</Badge>;
      case 'POTENTIAL_CONCERN':
        return <Badge variant="cyan">POTENTIAL CONCERN</Badge>;
      default:
        return <Badge variant="neutral">OBSERVED</Badge>;
    }
  };

  if (findings.length === 0) {
    return (
      <Card title="High-Priority Forensic Leads & Red Flags" icon={<AlertOctagon size={14} color="#10b981" />}>
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
          No high-severity forensic anomalies or red flags identified in verified reporting facts.
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={`High-Priority Forensic Leads & Red Flags (${findings.length})`}
      icon={<AlertOctagon size={14} color="#ef4444" />}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {findings.map((fnd) => {
          const isExpanded = expandedIds.has(fnd.findingId);
          return (
            <div
              key={fnd.findingId}
              style={{
                padding: '12px 14px',
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-subtle)',
                borderLeft: fnd.severity === 'CRITICAL' || fnd.severity === 'HIGH' ? '3px solid #ef4444' : '3px solid #f59e0b',
                borderRadius: '4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {/* Header Row */}
              <div
                onClick={() => toggleExpand(fnd.findingId)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                      {fnd.title}
                    </span>
                    {getSeverityBadge(fnd.severity)}
                    {getStatusBadge(fnd.status)}
                    <span
                      style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-muted)',
                        background: 'var(--bg-surface)',
                        padding: '1px 6px',
                        borderRadius: '3px',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {fnd.categoryName}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {fnd.observation}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginTop: '2px' }}>
                  {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                </div>
              </div>

              {/* Expanded Detailed Audit Panel */}
              {isExpanded && (
                <div
                  style={{
                    marginTop: '6px',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    fontSize: '11px',
                  }}
                >
                  {/* Heuristic Signal Code & Context */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '10px' }}>
                      Deterministic Heuristic Signal:
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>{fnd.signal}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{fnd.context}</span>
                  </div>

                  {/* Alternative Explanations (Non-Malicious Causes) */}
                  {fnd.alternativeExplanations.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: 'var(--bg-surface)', padding: '6px 8px', borderRadius: '3px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        Plausible Alternative (Non-Malicious) Explanations:
                      </span>
                      <ul style={{ margin: 0, paddingLeft: '16px', color: 'var(--text-secondary)' }}>
                        {fnd.alternativeExplanations.map((alt, i) => (
                          <li key={i}>{alt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actionable Investigation Questions */}
                  {fnd.investigationQuestions.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: 600, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <HelpCircle size={12} /> Actionable Investigation Research Questions:
                      </span>
                      <ul style={{ margin: 0, paddingLeft: '16px', color: 'var(--text-secondary)' }}>
                        {fnd.investigationQuestions.map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Evidence Citations */}
                  {fnd.evidenceReferences.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                        Source: {fnd.evidenceReferences[0].documentName} (P.{fnd.evidenceReferences[0].pageNumber || 'N/A'})
                      </span>
                      {onInspectEvidence && (
                        <button
                          onClick={() => onInspectEvidence(fnd.evidenceReferences.map((e) => `${e.documentName} (P.${e.pageNumber || 'N/A'})`))}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-cyan)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: 0,
                            outline: 'none',
                            fontSize: '11px',
                          }}
                        >
                          <ShieldCheck size={11} /> Source Evidence <ExternalLink size={10} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
