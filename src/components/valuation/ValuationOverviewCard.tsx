import React from 'react';
import { MarketValuationSnapshot, ValuationPosition } from '../../domain/valuation/ValuationTypes';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { AlertTriangle } from 'lucide-react';

interface ValuationOverviewCardProps {
  snapshot: MarketValuationSnapshot;
  position: ValuationPosition;
  confidenceScore: number;
  triangulatedBaseValue: number | null;
  onOpenSotp?: () => void;
  hasSotp?: boolean;
}

export const ValuationOverviewCard: React.FC<ValuationOverviewCardProps> = ({
  snapshot,
  position,
  confidenceScore,
  triangulatedBaseValue,
  onOpenSotp,
  hasSotp,
}) => {
  const getPositionBadge = (pos: ValuationPosition) => {
    switch (pos) {
      case 'DEEP_DISCOUNT':
        return <Badge variant="bullish">DEEP DISCOUNT</Badge>;
      case 'DISCOUNT':
        return <Badge variant="bullish">DISCOUNT</Badge>;
      case 'AROUND_FAIR_RANGE':
        return <Badge variant="neutral">AROUND FAIR RANGE</Badge>;
      case 'PREMIUM':
        return <Badge variant="warning">PREMIUM</Badge>;
      case 'EXTREME_PREMIUM':
        return <Badge variant="bearish">EXTREME PREMIUM</Badge>;
      default:
        return <Badge variant="neutral">NOT ASSESSABLE</Badge>;
    }
  };

  return (
    <Card
      title="Valuation Snapshot & Market Position"
      subtitle="Time-stamped market valuation, enterprise value bridge, and deterministic pricing position."
      action={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {hasSotp && onOpenSotp && (
            <button
              onClick={onOpenSotp}
              style={{
                background: 'rgba(2, 132, 199, 0.1)',
                border: '1px solid #0284c7',
                borderRadius: '4px',
                color: '#0284c7',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              View SOTP Breakdown
            </button>
          )}
          {getPositionBadge(position)}
        </div>
      }
    >
      {snapshot.isStale && (
        <div
          style={{
            padding: '8px 12px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid #f59e0b',
            borderRadius: '4px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: '#b45309',
          }}
        >
          <AlertTriangle size={16} />
          <span>
            <strong>MARKET_DATA_STALE:</strong> Market price date ({snapshot.priceDate}) exceeds freshness window.
          </span>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            padding: '12px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>CURRENT PRICE</div>
          <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            ₹{snapshot.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Price Date: {snapshot.priceDate}
          </div>
        </div>

        <div
          style={{
            padding: '12px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>MARKET CAP</div>
          <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0284c7' }}>
            ₹{Math.round(snapshot.evBridge.marketCapitalization).toLocaleString('en-IN')} Cr
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Shares: {snapshot.shareCapital.dilutedShares.toFixed(2)} Cr
          </div>
        </div>

        <div
          style={{
            padding: '12px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>ENTERPRISE VALUE</div>
          <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#7c3aed' }}>
            ₹{Math.round(snapshot.evBridge.enterpriseValue).toLocaleString('en-IN')} Cr
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Net Debt: ₹{Math.round(snapshot.evBridge.netDebt).toLocaleString('en-IN')} Cr
          </div>
        </div>

        <div
          style={{
            padding: '12px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>INTRINSIC BASE VALUE</div>
          <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#16a34a' }}>
            {triangulatedBaseValue ? `₹${triangulatedBaseValue.toFixed(1)}` : 'N/A'}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Triangulated Fair Value
          </div>
        </div>

        <div
          style={{
            padding: '12px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>VALUATION CONFIDENCE</div>
          <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {confidenceScore}%
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Data completeness & freshness
          </div>
        </div>
      </div>

      <div
        style={{
          padding: '10px 12px',
          background: 'var(--bg-primary)',
          border: '1px dashed var(--border-subtle)',
          borderRadius: '4px',
          fontSize: '11px',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
        }}
      >
        <strong>Enterprise Value Bridge:</strong> {snapshot.evBridge.formulaDescription} (Basis:{' '}
        {snapshot.evBridge.accountingBasis}, Period: {snapshot.evBridge.financialPeriod}).
      </div>
    </Card>
  );
};
