import React from 'react';
import { Flame, AlertOctagon, Target, ArrowRight } from 'lucide-react';
import { InvestmentVerdictReport, TopCatalystItem, TopRiskItem, ThesisBreakerDecisionItem } from '../../domain/verdict/VerdictTypes';
import { Badge } from '../common/Badge';

export interface WhatMattersNowCardProps {
  report: InvestmentVerdictReport;
  onNavigateToCatalysts?: () => void;
  onNavigateToRisks?: () => void;
  onNavigateToThesisBreakers?: () => void;
}

export const WhatMattersNowCard: React.FC<WhatMattersNowCardProps> = ({
  report,
  onNavigateToCatalysts,
  onNavigateToRisks,
  onNavigateToThesisBreakers,
}) => {
  const topCatalysts: TopCatalystItem[] = report.topCatalysts?.slice(0, 3) || [];
  const topRisks: TopRiskItem[] = report.topRisks?.slice(0, 3) || [];
  const topBreakers: ThesisBreakerDecisionItem[] = report.thesisBreakers?.breakers?.slice(0, 3) || [];

  return (
    <div
      className="terminal-card"
      id="what-matters-now-card"
      style={{
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        background: '#ffffff',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={16} color="var(--brand-blue)" />
          <h2 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--brand-navy)', margin: 0, letterSpacing: '-0.01em' }}>
            What Matters Now: Asymmetric Drivers & Invalidation Sentinel
          </h2>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Top 3 Material Factors Each
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {/* COLUMN 1: TOP 3 CATALYSTS */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '12px', color: 'var(--brand-navy)' }}>
              <Flame size={14} color="var(--color-bullish)" />
              <span>Top 3 Catalysts</span>
            </div>
            {onNavigateToCatalysts && (
              <button
                onClick={onNavigateToCatalysts}
                style={{ background: 'none', border: 'none', color: 'var(--brand-blue)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', padding: 0 }}
              >
                View all <ArrowRight size={11} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topCatalysts.length > 0 ? (
              topCatalysts.map((cat, idx) => (
                <div
                  key={cat.catalystId || idx}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    padding: '8px 10px',
                    fontSize: '11px',
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--brand-navy)', marginBottom: '3px' }}>
                    {idx + 1}. {cat.title}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '10px' }}>
                    <span>Rank: <strong style={{ color: 'var(--color-bullish)' }}>#{cat.rank}</strong></span>
                    <span>Horizon: {cat.expectedHorizon}</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No active material catalysts configured.
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 2: TOP 3 RISKS */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '12px', color: 'var(--brand-navy)' }}>
              <AlertOctagon size={14} color="var(--color-warning)" />
              <span>Top 3 Risks</span>
            </div>
            {onNavigateToRisks && (
              <button
                onClick={onNavigateToRisks}
                style={{ background: 'none', border: 'none', color: 'var(--brand-blue)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', padding: 0 }}
              >
                View all <ArrowRight size={11} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topRisks.length > 0 ? (
              topRisks.map((risk, idx) => (
                <div
                  key={risk.riskId || idx}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    padding: '8px 10px',
                    fontSize: '11px',
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--brand-navy)', marginBottom: '3px' }}>
                    {idx + 1}. {risk.title}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '10px' }}>
                    <span>Rank: <strong style={{ color: 'var(--color-warning)' }}>#{risk.rank}</strong></span>
                    <span>Net Score: <strong style={{ color: 'var(--brand-navy)' }}>{risk.netRiskScore?.toFixed(1) || 'N/A'}</strong></span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No active downside risks recorded.
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: TOP 3 THESIS BREAKERS */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '12px', color: 'var(--brand-navy)' }}>
              <Target size={14} color="var(--color-bearish)" />
              <span>Top 3 Thesis Breakers</span>
            </div>
            {onNavigateToThesisBreakers && (
              <button
                onClick={onNavigateToThesisBreakers}
                style={{ background: 'none', border: 'none', color: 'var(--brand-blue)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', padding: 0 }}
              >
                View all <ArrowRight size={11} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topBreakers.length > 0 ? (
              topBreakers.map((tb, idx) => (
                <div
                  key={tb.breakerId || idx}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    padding: '8px 10px',
                    fontSize: '11px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>
                      {tb.metric} {tb.operator} {String(tb.threshold)}
                    </span>
                    <Badge variant={tb.status === 'SAFE' ? 'bullish' : 'bearish'}>
                      {tb.status}
                    </Badge>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '10px', marginTop: '2px' }}>
                    <span>Current: <strong style={{ color: 'var(--brand-navy)' }}>{String(tb.currentValue ?? 'N/A')}</strong></span>
                    <span>Distance: <strong style={{ color: 'var(--brand-blue)' }}>{tb.distanceToTriggerPercent?.toFixed(1) || '0.0'} pp</strong></span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                All thesis falsification conditions valid.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
