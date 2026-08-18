import React from 'react';
import { LanguageShiftItem } from '../../domain/management/ManagementDnaTypes';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { MessageSquare, FileText } from 'lucide-react';

interface LanguageShiftCardProps {
  shifts: LanguageShiftItem[];
  onInspectEvidence?: (citations: string[]) => void;
}

export const LanguageShiftCard: React.FC<LanguageShiftCardProps> = ({
  shifts,
  onInspectEvidence,
}) => {
  const getShiftBadge = (type: string) => {
    switch (type) {
      case 'GUIDANCE_SPECIFICITY_DECREASED':
        return <Badge variant="warning">SPECIFICITY DECREASED</Badge>;
      case 'GUIDANCE_SPECIFICITY_INCREASED':
        return <Badge variant="bullish">SPECIFICITY INCREASED</Badge>;
      case 'INCREASED_CERTAINTY':
        return <Badge variant="bullish">INCREASED CERTAINTY</Badge>;
      case 'INCREASED_QUALIFIERS':
        return <Badge variant="warning">INCREASED QUALIFIERS</Badge>;
      case 'TIMELINE_EXTENSION':
        return <Badge variant="bearish">TIMELINE EXTENDED</Badge>;
      default:
        return <Badge variant="neutral">NO MATERIAL SHIFT</Badge>;
    }
  };

  return (
    <Card
      title="Year-over-Year Language & Communication Shift Analysis"
      action={<Badge variant="cyan">OBSERVABLE LINGUISTIC FEATURES</Badge>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
          <strong>Boundary Notice:</strong> Analyzes observable linguistic precision and qualifier frequency across comparable disclosure topics. Strictly avoids psychological speculation.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {shifts.map((shift) => (
            <div
              key={shift.shiftId}
              style={{
                padding: '14px',
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={14} color="#0284c7" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Topic: {shift.topic}
                  </span>
                </div>
                {getShiftBadge(shift.shiftType)}
              </div>

              {/* Side-by-side statements */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                {/* Previous Period */}
                <div
                  style={{
                    padding: '10px 12px',
                    background: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>
                      PREVIOUS STATEMENT ({shift.previousPeriod})
                    </span>
                    {onInspectEvidence && (
                      <button
                        onClick={() =>
                          onInspectEvidence([
                            `${shift.previousEvidence.documentName} (P.${shift.previousEvidence.pageNumber || 'N/A'})`,
                          ])
                        }
                        className="terminal-btn terminal-btn-xs"
                        style={{ padding: '1px 5px', fontSize: '9px' }}
                      >
                        <FileText size={10} />
                        Cite
                      </button>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    "{shift.previousPeriodStatement}"
                  </p>
                </div>

                {/* Current Period */}
                <div
                  style={{
                    padding: '10px 12px',
                    background: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>
                      CURRENT STATEMENT ({shift.currentPeriod})
                    </span>
                    {onInspectEvidence && (
                      <button
                        onClick={() =>
                          onInspectEvidence([
                            `${shift.currentEvidence.documentName} (P.${shift.currentEvidence.pageNumber || 'N/A'})`,
                          ])
                        }
                        className="terminal-btn terminal-btn-xs"
                        style={{ padding: '1px 5px', fontSize: '9px' }}
                      >
                        <FileText size={10} />
                        Cite
                      </button>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-primary)', fontStyle: 'italic' }}>
                    "{shift.currentPeriodStatement}"
                  </p>
                </div>
              </div>

              {/* Observable Shift Summary */}
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Observable Shift:</strong> {shift.shiftObservation}
                </div>
                {shift.disclosedReason && (
                  <div>
                    <strong style={{ color: 'var(--text-muted)' }}>Disclosed Context:</strong> {shift.disclosedReason}
                  </div>
                )}
                {shift.actualOutcome && (
                  <div>
                    <strong style={{ color: 'var(--text-muted)' }}>Subsequent Outcome:</strong> {shift.actualOutcome}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
