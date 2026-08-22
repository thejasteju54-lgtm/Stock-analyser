import React from 'react';
import { X, HelpCircle } from 'lucide-react';
import { Button } from '../common/Button';

export interface ContextualHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic?: string | null;
}

export const ContextualHelpModal: React.FC<ContextualHelpModalProps> = ({
  isOpen,
  onClose,
  topic,
}) => {
  if (!isOpen) return null;

  const topicsData: Record<string, { title: string; meaning: string; whyItMatters: string; howToInterpret: string; formula?: string }> = {
    ROCE: {
      title: 'Return on Capital Employed (ROCE)',
      meaning: 'Measures how efficiently a company generates operating profits from all the capital invested by equity shareholders and lenders.',
      whyItMatters: 'High ROCE (> 18%) indicates competitive moats, pricing power, or capital efficiency that compounds shareholder wealth over time.',
      howToInterpret: 'Compare ROCE against the company’s Cost of Capital (WACC ~11-12%). If ROCE > WACC, the business creates economic value; if ROCE < WACC, growth destroys value.',
      formula: 'ROCE = EBIT / (Total Equity + Total Debt)',
    },
    CFO_PAT: {
      title: 'Operating Cash Flow to PAT (CFO / PAT)',
      meaning: 'Compares cash generated from day-to-day business operations against accounting net profit reported in the P&L.',
      whyItMatters: 'Profits on paper can be manipulated through aggressive revenue booking, but bank cash cannot. A high ratio indicates clean earnings.',
      howToInterpret: 'Ratio > 1.0x indicates healthy cash conversion. Ratio < 0.7x over multiple years indicates profits are trapped in unpaid customer bills (receivables) or unsold inventory.',
      formula: 'Cash Flow from Operations / Profit After Tax',
    },
    FCF: {
      title: 'Free Cash Flow (FCF)',
      meaning: 'The actual cash left over after the business pays all operating expenses and purchases necessary plant, machinery, and technology (Capex).',
      whyItMatters: 'Free cash flow is the cash that can be used to pay dividends, repurchase shares, retire debt, or reinvest in new growth without outside borrowing.',
      howToInterpret: 'Growing positive FCF provides balance sheet resilience. Negative FCF is acceptable during heavy capex expansion phases if future ROCE is high.',
      formula: 'FCF = CFO - Capital Expenditures (Capex)',
    },
    MARGIN_OF_SAFETY: {
      title: 'Margin of Safety (MOS)',
      meaning: 'The percentage discount between a stock’s current market price and its estimated intrinsic fair value.',
      whyItMatters: 'Buffett/Graham cornerstone: guards against estimation errors, unforeseen economic downturns, and competitive shocks.',
      howToInterpret: 'Positive MOS (> +15%) provides an entry cushion with upside potential. Negative MOS indicates the stock trades at a premium to estimated fair value.',
      formula: 'MOS = (Intrinsic Fair Value - Market Price) / Market Price',
    },
    THESIS_BREAKER: {
      title: 'Mathematical Thesis Breaker',
      meaning: 'An explicit numerical trigger that proves the core investment hypothesis is invalid or impaired.',
      whyItMatters: 'Prevents emotional confirmation bias and moving the goalposts when a business deteriorates.',
      howToInterpret: 'When a thesis breaker changes from VALID to TRIGGERED, the analyst must immediately review and downgrade the investment stance.',
      formula: 'Example: EBITDA Margin < 11.0% (Current: 14.2%, Distance: 3.2 pp)',
    },
    SOURCE_CONFLICT: {
      title: 'Source Conflict Hierarchy',
      meaning: 'Occurs when two independent statutory documents or disclosures report differing figures for the same financial period.',
      whyItMatters: 'Prevents silent data fabrication. Exposes both sources and applies strict regulatory precedence.',
      howToInterpret: 'Tier 1 Audited Filings supersede investor presentations. If unresolved, flagged for manual analyst review.',
      formula: 'Tier 1 (Audited) > Tier 2 (Presentations) > Tier 3 (Media) > Tier 4 (Web)',
    },
  };

  const currentTopic = (topic && topicsData[topic]) || topicsData.ROCE;

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
          maxWidth: '560px',
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          boxShadow: 'var(--shadow-glass)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          padding: '24px',
          gap: '16px',
          border: '1px solid var(--border-subtle)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={18} color="var(--brand-blue)" />
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--brand-navy)', margin: 0 }}>
              {currentTopic.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* 3 Core Plain-English Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--brand-navy)', marginBottom: '3px' }}>What It Means:</div>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{currentTopic.meaning}</div>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: 'var(--brand-blue)', marginBottom: '3px' }}>Why It Matters to Investors:</div>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{currentTopic.whyItMatters}</div>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: 'var(--color-bullish)', marginBottom: '3px' }}>How to Interpret It:</div>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{currentTopic.howToInterpret}</div>
          </div>

          {currentTopic.formula && (
            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: 700, color: 'var(--brand-navy)', fontSize: '11px', marginBottom: '2px' }}>Deterministic Formula:</div>
              <code style={{ fontSize: '11px', color: 'var(--brand-navy)', fontFamily: 'var(--font-mono)' }}>{currentTopic.formula}</code>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Explanation
          </Button>
        </div>
      </div>
    </div>
  );
};
