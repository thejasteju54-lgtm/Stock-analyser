import { CrossStatementCheck } from '../../domain/forensics/ForensicAnalysisTypes';
import { Badge } from '../common/Badge';
import { X, Network } from 'lucide-react';

interface CrossStatementAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  checks: CrossStatementCheck[];
}

export const CrossStatementAuditModal: React.FC<CrossStatementAuditModalProps> = ({
  isOpen,
  onClose,
  checks,
}) => {
  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONSISTENT':
        return <Badge variant="bullish">CONSISTENT</Badge>;
      case 'EXPLAINED_VARIANCE':
        return <Badge variant="cyan">EXPLAINED BRIDGE</Badge>;
      case 'POTENTIAL_VARIANCE':
        return <Badge variant="warning">POTENTIAL VARIANCE</Badge>;
      case 'UNEXPLAINED_DISCREPANCY':
        return <Badge variant="bearish">UNEXPLAINED DISCREPANCY</Badge>;
      default:
        return <Badge variant="neutral">NOT ASSESSABLE</Badge>;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
          width: '100%',
          maxWidth: '850px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Network size={16} color="#38bdf8" />
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Cross-Statement Integrity & Accounting Bridge Audit
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
            Cross-statement checks audit numerical continuity across the Income Statement, Balance Sheet, Cash Flow Statement, and Notes to Accounts, incorporating known accounting bridges (CWIP, depreciation, foreign exchange adjustments, and capitalized borrowing costs).
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {checks.map((chk) => (
              <div
                key={chk.checkId}
                style={{
                  padding: '12px 14px',
                  background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                    {chk.checkName}
                  </span>
                  {getStatusBadge(chk.status)}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    padding: '8px 10px',
                    background: 'var(--bg-surface)',
                    borderRadius: '3px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>{chk.statementA.replace(/_/g, ' ')}:</span>{' '}
                    <span style={{ fontWeight: 600, color: '#38bdf8' }}>{chk.metricA}</span> = ₹
                    {chk.valueA?.toLocaleString()} Cr
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>{chk.statementB.replace(/_/g, ' ')}:</span>{' '}
                    <span style={{ fontWeight: 600, color: '#38bdf8' }}>{chk.metricB}</span> = ₹
                    {chk.valueB?.toLocaleString()} Cr
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    Accounting Bridge Reconciliation:
                  </span>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {chk.accountingBridgeExplanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button onClick={onClose} className="terminal-btn terminal-btn-sm">
            Close Audit View
          </button>
        </div>
      </div>
    </div>
  );
};
