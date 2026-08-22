import React from 'react';
import { X, BookOpen, ShieldAlert } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export interface InstitutionalRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstitutionalRulesModal: React.FC<InstitutionalRulesModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const rules = [
    { num: 1, title: 'Start with Primary Evidence', desc: 'Base every material conclusion on audited statutory annual reports and exchange filings, not third-party summaries.' },
    { num: 2, title: 'Never Ignore Provenance', desc: 'Every displayed metric must link to an exact document, note, and page citation via the [Why?] inspector.' },
    { num: 3, title: 'Separate Fact from Inference', desc: 'Strictly distinguish verified statutory data (FACT) from mathematical ratios (DERIVED) and thesis claims (INFERENCE).' },
    { num: 4, title: 'Understand Business Quality First', desc: 'Evaluate operating leverage, cash conversion, and balance sheet solvency before jumping to valuation multiples.' },
    { num: 5, title: 'Use Scenarios Over Point Targets', desc: 'Base is not guaranteed and Bull is not a promise. Use structured Bear/Base/Bull ranges to bound potential outcomes.' },
    { num: 6, title: 'Scrutinize the Bear Case', desc: 'True margin of safety is understood through the downside scenario, working capital stress, and debt obligations.' },
    { num: 7, title: 'Monitor Mathematical Thesis Breakers', desc: 'Convert qualitative investment theses into concrete falsification thresholds (e.g. EBITDA Margin < 11%).' },
    { num: 8, title: 'Audit the Investment Verdict', desc: 'Never treat BUY/HOLD/AVOID as an oracle. Inspect the Decision Audit Trail to review the rules and checksums evaluated.' },
    { num: 9, title: 'Track Temporal Changes & Deltas', desc: 'Create immutable research snapshots to compare how numbers and management guidance evolve quarter-over-quarter.' },
    { num: 10, title: 'Never Treat NOT_ASSESSABLE as Zero', desc: 'NOT_ASSESSABLE means insufficient verified evidence is available; it does not mean 0, negative, or bad.' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '740px',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          boxShadow: 'var(--shadow-glass)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          padding: '24px 28px',
          gap: '20px',
          border: '1px solid var(--border-subtle)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                background: 'var(--brand-blue-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-blue)',
              }}
            >
              <BookOpen size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-navy)', margin: 0, letterSpacing: '-0.01em' }}>
                How to Get the Most from Stock Analyser
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                10 Core Institutional Rules for Evidence-Driven Equity Research
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* The 10 Rules Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
          {rules.map((r) => (
            <div
              key={r.num}
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '12px 14px',
                display: 'flex',
                gap: '10px',
              }}
            >
              <span
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'var(--brand-blue)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {r.num}
              </span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--brand-navy)' }}>
                  {r.title}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                  {r.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Deep Dive: What NOT_ASSESSABLE Means */}
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '6px',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <ShieldAlert size={20} color="var(--color-warning)" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--brand-navy)' }}>
              Core Philosophy: What <Badge variant="warning">NOT_ASSESSABLE</Badge> Means
            </div>
            <p style={{ fontSize: '11px', color: 'var(--brand-navy)', margin: '4px 0 0 0', lineHeight: 1.5 }}>
              In institutional analysis, <strong>unknown information must remain unknown</strong>. If a statutory filing does not report a metric or if an OCR scan is unreadable, the system displays <code>NOT_ASSESSABLE</code> instead of synthesizing convenient industry averages.
            </p>
          </div>
        </div>

        {/* Reasoning Layer Reference */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '8px' }}>
            Data Reasoning Layers
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '11px' }}>
            <Badge variant="bullish">FACT: Primary filing disclosure</Badge>
            <Badge variant="cyan">DERIVED: Deterministic formula</Badge>
            <Badge variant="warning">INFERENCE: Evidence-grounded thesis</Badge>
            <Badge variant="neutral">ESTIMATE: Forward model projection</Badge>
            <Badge variant="neutral">SCENARIO: Macro sensitivity range</Badge>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
          <Button variant="primary" size="sm" onClick={onClose}>
            Understood & Close
          </Button>
        </div>
      </div>
    </div>
  );
};
