import React from 'react';
import { Award, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { DailyOpportunityItem } from '../../domain/marketIntelligence/MarketIntelligenceTypes';

export interface DailyTop10CardProps {
  opportunities: DailyOpportunityItem[];
  onSelectOpportunity: (item: DailyOpportunityItem) => void;
  onAnalyzeStock: (symbol: string) => void;
}

export const DailyTop10Card: React.FC<DailyTop10CardProps> = ({
  opportunities,
  onSelectOpportunity,
  onAnalyzeStock,
}) => {
  return (
    <div
      className="terminal-card"
      id="daily-top-10-card"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        background: '#ffffff',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={18} color="var(--brand-blue)" />
          <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--brand-navy)', margin: 0, letterSpacing: '-0.01em' }}>
            Today's Top 10 Opportunities
          </h2>
          <Badge variant="cyan">Ranked by Multi-Factor Opportunity Score</Badge>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Tie-breaking: <strong style={{ color: 'var(--brand-navy)' }}>Confidence → Catalysts → Volume</strong>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="terminal-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>Rank</th>
              <th>Company & Symbol</th>
              <th>Sector</th>
              <th className="text-right">Price</th>
              <th className="text-right">1D %</th>
              <th className="text-right">Volume</th>
              <th className="text-center">Score</th>
              <th>Opportunity Type</th>
              <th>Key Catalyst</th>
              <th>Key Risk</th>
              <th className="text-center">Confidence</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {opportunities.map((item) => {
              const isUp = item.changePercent >= 0;
              const isTop3 = item.rank <= 3;

              return (
                <tr
                  key={item.symbol}
                  style={{
                    backgroundColor: isTop3 ? 'rgba(238, 242, 255, 0.35)' : 'transparent',
                    cursor: 'pointer',
                  }}
                  onClick={() => onSelectOpportunity(item)}
                >
                  {/* Rank */}
                  <td style={{ fontWeight: 800, fontSize: '13px', color: isTop3 ? 'var(--brand-blue)' : 'var(--text-secondary)' }}>
                    #{item.rank}
                  </td>

                  {/* Company & Symbol */}
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--brand-navy)', fontSize: '13px' }}>
                      {item.displayName}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <code>{item.symbol}</code>
                      {item.rankDeltaFromYesterday?.type === 'UP' && (
                        <span style={{ color: 'var(--color-bullish)', fontSize: '10px', fontWeight: 600 }}>
                          ▲ +{item.rankDeltaFromYesterday.places}
                        </span>
                      )}
                      {item.rankDeltaFromYesterday?.type === 'NEW_ENTRY' && (
                        <span style={{ color: 'var(--brand-blue)', fontSize: '10px', fontWeight: 700 }}>
                          [NEW]
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Sector */}
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {item.sector}
                  </td>

                  {/* Price */}
                  <td className="text-right tabular-nums" style={{ fontWeight: 700, color: 'var(--brand-navy)' }}>
                    ₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
                  </td>

                  {/* 1D Change % */}
                  <td className="text-right tabular-nums" style={{ fontWeight: 700, color: isUp ? 'var(--color-bullish)' : 'var(--color-bearish)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px' }}>
                      {isUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                      {isUp ? '+' : ''}{item.changePercent.toFixed(1)}%
                    </div>
                  </td>

                  {/* Volume Multiple */}
                  <td className="text-right tabular-nums" style={{ fontWeight: 600, color: item.volumeMultiple >= 2.0 ? 'var(--brand-navy)' : 'var(--text-secondary)' }}>
                    {item.volumeMultiple.toFixed(1)}×
                  </td>

                  {/* Opportunity Score */}
                  <td className="text-center">
                    <div
                      className="tabular-nums"
                      style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: item.opportunityScore >= 80 ? '#ecfdf5' : item.opportunityScore >= 65 ? '#eff6ff' : '#f8fafc',
                        border: `1px solid ${item.opportunityScore >= 80 ? '#bbf7d0' : item.opportunityScore >= 65 ? '#bfdbfe' : 'var(--border-subtle)'}`,
                        color: item.opportunityScore >= 80 ? 'var(--color-bullish)' : item.opportunityScore >= 65 ? 'var(--brand-blue)' : 'var(--text-secondary)',
                        fontWeight: 800,
                        fontSize: '13px',
                      }}
                    >
                      {item.opportunityScore}
                    </div>
                  </td>

                  {/* Opportunity Type */}
                  <td>
                    <Badge variant={item.opportunityType === 'ORDER_BOOK' ? 'bullish' : item.opportunityType === 'QUALITY_COMPOUNDER' ? 'cyan' : 'neutral'}>
                      {item.opportunityType.replace('_', ' ')}
                    </Badge>
                  </td>

                  {/* Key Catalyst */}
                  <td style={{ fontSize: '11px', color: 'var(--brand-navy)', maxWidth: '220px', lineHeight: 1.3 }}>
                    {item.keyCatalysts[0] || 'Sector tailwind'}
                  </td>

                  {/* Key Risk */}
                  <td style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '180px', lineHeight: 1.3 }}>
                    {item.keyRisks[0] || 'Broader market volatility'}
                  </td>

                  {/* Data Confidence */}
                  <td className="text-center">
                    <Badge variant={item.dataConfidence === 'HIGH' ? 'bullish' : 'neutral'}>
                      {item.dataConfidence}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onSelectOpportunity(item)}
                      >
                        Detail
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        icon={<Zap size={11} />}
                        onClick={() => onAnalyzeStock(item.symbol)}
                      >
                        Analyze
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
        <span>Showing Top 10 opportunities from 500 scanned securities • Zero look-ahead bias enforced</span>
        <span>Click any row for 30-second micro-research • Click <strong>[Analyze]</strong> to launch full institutional report</span>
      </div>
    </div>
  );
};
