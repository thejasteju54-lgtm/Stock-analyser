import React from 'react';
import { TechnicalDataset, TrendAssessment, MarketStructure, TechnicalRiskAssessment } from '../../domain/technical/TechnicalTypes';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { Activity, ShieldCheck } from 'lucide-react';

interface TechnicalOverviewCardProps {
  currentPrice: number;
  priceDate: string;
  dataset: TechnicalDataset;
  trend: TrendAssessment;
  marketStructure: MarketStructure;
  technicalRisk: TechnicalRiskAssessment;
  confidenceScore: number;
  technicalScore: number | null;
}

export const TechnicalOverviewCard: React.FC<TechnicalOverviewCardProps> = ({
  currentPrice,
  priceDate,
  dataset,
  trend,
  marketStructure,
  technicalRisk,
  confidenceScore,
  technicalScore,
}) => {
  const getTrendBadge = (dir: string) => {
    if (dir.includes('UPTREND')) return <Badge variant="bullish">{dir.replace('_', ' ')}</Badge>;
    if (dir.includes('DOWNTREND')) return <Badge variant="bearish">{dir.replace('_', ' ')}</Badge>;
    return <Badge variant="neutral">{dir.replace('_', ' ')}</Badge>;
  };

  const getRiskBadge = (level: string) => {
    if (level === 'LOW') return <Badge variant="bullish">LOW FRAGILITY</Badge>;
    if (level === 'MODERATE') return <Badge variant="neutral">MODERATE RISK</Badge>;
    if (level === 'HIGH') return <Badge variant="warning">HIGH FRAGILITY</Badge>;
    if (level === 'EXTREME') return <Badge variant="bearish">EXTREME FRAGILITY</Badge>;
    return <Badge variant="neutral">NOT ASSESSABLE</Badge>;
  };

  return (
    <Card
      title="Technical Overview & Market Structure Snapshot"
      subtitle="Point-in-time price action, structural trend progression, and setup fragility."
      icon={<Activity size={16} color="var(--color-primary)" />}
      action={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {getTrendBadge(trend.primaryTrend)}
          {getRiskBadge(technicalRisk.level)}
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <div style={{ padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>CURRENT PRICE</div>
          <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            ₹{currentPrice.toFixed(2)}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Price Date: {priceDate}
          </div>
        </div>

        <div style={{ padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>DATA QUALITY & FEED</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} />
            {dataset.dataQuality} QUALITY
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {dataset.candleCount} Candles ({dataset.timeframe}) | {dataset.adjusted ? 'ADJUSTED' : 'UNADJUSTED'}
          </div>
        </div>

        <div style={{ padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>MARKET STRUCTURE</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: marketStructure.direction.includes('BULLISH') ? 'var(--color-bullish)' : marketStructure.direction.includes('BEARISH') ? 'var(--color-bearish)' : 'var(--text-primary)' }}>
            {marketStructure.direction.replace('_', ' ')}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {marketStructure.higherHighsCount} HHs, {marketStructure.higherLowsCount} HLs, {marketStructure.lowerHighsCount} LHs
          </div>
        </div>

        <div style={{ padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>COMPOSITE TECHNICAL SCORE</div>
          <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
            {technicalScore !== null ? `${technicalScore} / 100` : '—'}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Multi-Pipeline Weighted Setup Score
          </div>
        </div>

        <div style={{ padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>ANALYSIS CONFIDENCE</div>
          <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {confidenceScore}%
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Observation depth & timeframe consistency
          </div>
        </div>
      </div>

      <div style={{ padding: '10px 12px', background: 'var(--bg-primary)', border: '1px dashed var(--border-subtle)', borderRadius: '4px', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        <strong>Primary Trend Rationale:</strong> {trend.rationale}
      </div>
    </Card>
  );
};
