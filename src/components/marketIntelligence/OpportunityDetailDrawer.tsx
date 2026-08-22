import React from 'react';
import { X, Zap, TrendingUp, AlertOctagon } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { DailyOpportunityItem } from '../../domain/marketIntelligence/MarketIntelligenceTypes';

export interface OpportunityDetailDrawerProps {
  opportunity: DailyOpportunityItem | null;
  onClose: () => void;
  onAnalyzeStock: (symbol: string) => void;
}

export const OpportunityDetailDrawer: React.FC<OpportunityDetailDrawerProps> = ({
  opportunity,
  onClose,
  onAnalyzeStock,
}) => {
  if (!opportunity) return null;

  const item = opportunity;
  const isUp = item.changePercent >= 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          height: '100%',
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-glass)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          padding: '24px',
          gap: '16px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Badge variant="cyan">Rank #{item.rank}</Badge>
              <Badge variant={item.opportunityType === 'ORDER_BOOK' ? 'bullish' : 'neutral'}>
                {item.opportunityType.replace('_', ' ')}
              </Badge>
              <Badge variant={item.dataConfidence === 'HIGH' ? 'bullish' : 'neutral'}>
                Confidence: {item.dataConfidence}
              </Badge>
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-navy)', margin: '8px 0 2px 0' }}>
              {item.displayName} (<code>{item.symbol}</code>)
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Sector: {item.sector} • Price: <strong>₹{item.price.toFixed(1)}</strong> ({isUp ? '+' : ''}{item.changePercent.toFixed(1)}%) • Volume: {item.volumeMultiple.toFixed(1)}× 20DMA
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Opportunity Score Vitals */}
        <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-navy)' }}>
              Deterministic Opportunity Score
            </span>
            <div className="tabular-nums" style={{ fontSize: '20px', fontWeight: 800, color: item.opportunityScore >= 80 ? 'var(--color-bullish)' : 'var(--brand-blue)' }}>
              {item.opportunityScore} / 100
            </div>
          </div>

          {/* Component Score Progress Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '11px' }}>
            <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)' }}>Momentum</div>
              <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{item.scoreBreakdown.momentumScore} / 15</div>
            </div>
            <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)' }}>Fundamentals</div>
              <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{item.scoreBreakdown.fundamentalsScore} / 20</div>
            </div>
            <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)' }}>Catalysts</div>
              <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{item.scoreBreakdown.catalystsScore} / 20</div>
            </div>
            <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)' }}>Valuation</div>
              <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{item.scoreBreakdown.valuationScore} / 15</div>
            </div>
            <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)' }}>Technical</div>
              <div style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>{item.scoreBreakdown.technicalScore} / 10</div>
            </div>
            <div style={{ background: '#ffffff', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: 'var(--text-muted)' }}>Risk Penalty</div>
              <div style={{ fontWeight: 700, color: item.scoreBreakdown.riskPenalty > 0 ? 'var(--color-warning)' : 'var(--color-bullish)' }}>
                -{item.scoreBreakdown.riskPenalty} pts
              </div>
            </div>
          </div>
        </div>

        {/* 30-Second Micro Research Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--brand-navy)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            30-Second Institutional Micro-Research
          </h3>

          {/* 1. Business */}
          <div style={{ borderLeft: '3px solid var(--brand-blue)', paddingLeft: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-navy)' }}>BUSINESS OVERVIEW</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {item.microResearch.businessSummary}
            </div>
          </div>

          {/* 2. Today's Drivers */}
          <div style={{ borderLeft: '3px solid var(--color-bullish)', paddingLeft: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-navy)' }}>WHY TRENDING TODAY?</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {item.microResearch.whyToday}
            </div>
          </div>

          {/* 3. Fundamentals & Valuation */}
          <div style={{ borderLeft: '3px solid var(--brand-navy)', paddingLeft: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-navy)' }}>FUNDAMENTALS & VALUATION</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {item.microResearch.fundamentalsSummary} {item.microResearch.valuationSummary}
            </div>
          </div>

          {/* 4. Key Catalysts */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '10px 12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={13} color="var(--color-bullish)" /> KEY CATALYSTS
            </div>
            <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', fontSize: '11px', color: 'var(--text-secondary)' }}>
              {item.keyCatalysts.map((cat, idx) => (
                <li key={idx}>{cat}</li>
              ))}
            </ul>
          </div>

          {/* 5. Key Risks & Thesis Breakers */}
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', padding: '10px 12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-navy)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertOctagon size={13} color="var(--color-warning)" /> RISKS & THESIS BREAKERS TO MONITOR
            </div>
            <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', fontSize: '11px', color: 'var(--text-secondary)' }}>
              {item.microResearch.thesisBreakers.map((tb, idx) => (
                <li key={idx}>{tb}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Full Analysis Action Callout */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Button
            variant="primary"
            size="md"
            icon={<Zap size={14} />}
            onClick={() => onAnalyzeStock(item.symbol)}
          >
            Launch Full Institutional Research Workspace ({item.symbol})
          </Button>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>
            Triggers Phase 21 automated ingestion + Phase 4–15 analytical models
          </div>
        </div>
      </div>
    </div>
  );
};
