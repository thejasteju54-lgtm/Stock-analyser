import React from 'react';
import { ForensicFinding } from '../../domain/forensics/ForensicAnalysisTypes';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ListFilter, MessageSquare, HelpCircle } from 'lucide-react';

interface InvestigationQueueCardProps {
  priorities: ForensicFinding[];
  onSelectFinding?: (findingId: string) => void;
}

export const InvestigationQueueCard: React.FC<InvestigationQueueCardProps> = ({
  priorities,
  onSelectFinding,
}) => {
  return (
    <Card
      title={`Forensic Investigation Queue (${priorities.length})`}
      icon={<ListFilter size={14} color="#38bdf8" />}
    >
      {priorities.length === 0 ? (
        <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
          No outstanding forensic research inquiries in the queue.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {priorities.map((item, idx) => (
            <div
              key={item.findingId}
              onClick={() => onSelectFinding && onSelectFinding(item.findingId)}
              style={{
                padding: '8px 12px',
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '10px',
                cursor: onSelectFinding ? 'pointer' : 'default',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    minWidth: '16px',
                  }}
                >
                  #{idx + 1}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.title}
                    </span>
                    <Badge variant={item.severity === 'CRITICAL' || item.severity === 'HIGH' ? 'bearish' : 'cyan'}>
                      {item.severity}
                    </Badge>
                    {item.requiresManagementClarification && (
                      <span
                        style={{
                          fontSize: '10px',
                          color: '#38bdf8',
                          background: 'rgba(56, 189, 248, 0.1)',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          border: '1px solid rgba(56, 189, 248, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        <MessageSquare size={9} /> Management Clarification Lead
                      </span>
                    )}
                  </div>
                  {item.investigationQuestions.length > 0 && (
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <HelpCircle size={10} color="var(--text-muted)" /> {item.investigationQuestions[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
