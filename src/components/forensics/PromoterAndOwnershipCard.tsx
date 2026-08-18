import React from 'react';
import { PromoterOwnershipSignalItem } from '../../domain/forensics/ForensicAnalysisTypes';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Lock, ShieldCheck } from 'lucide-react';

interface PromoterAndOwnershipCardProps {
  promoterSignals: PromoterOwnershipSignalItem[];
  onInspectEvidence?: (citations: string[]) => void;
}

export const PromoterAndOwnershipCard: React.FC<PromoterAndOwnershipCardProps> = ({
  promoterSignals,
  onInspectEvidence,
}) => {
  if (promoterSignals.length === 0) {
    return (
      <Card title="Promoter Ownership & Pledge Analysis" icon={<Lock size={14} color="#38bdf8" />}>
        <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
          No shareholding pattern filings available for the target period.
        </div>
      </Card>
    );
  }

  const sig = promoterSignals[0];

  return (
    <Card
      title="Promoter Ownership & Pledge Structure"
      icon={<Lock size={14} color="#38bdf8" />}
      action={
        sig.pledgeAsPctOfPromoterHolding > 0 ? (
          <Badge variant={sig.isPledgeHighPriority ? 'bearish' : 'warning'}>
            PLEDGE ACTIVE: {sig.pledgeAsPctOfPromoterHolding.toFixed(1)}%
          </Badge>
        ) : (
          <Badge variant="bullish">0% PROMOTER PLEDGE</Badge>
        )
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Dual Denominator Key Ratio Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '10px',
            padding: '10px',
            background: 'var(--bg-surface-raised)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '4px',
          }}
        >
          {/* Promoter Holding */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Promoter Holding
            </span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {sig.promoterHoldingPct.toFixed(2)}%
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
              {sig.promoterShares} Cr / {sig.totalShares} Cr Shares
            </span>
          </div>

          {/* Denominator 1: % of Promoter Holding */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Pledge (% of Promoter Holding)
            </span>
            <span
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: sig.pledgeAsPctOfPromoterHolding > 0 ? '#f59e0b' : '#10b981',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {sig.pledgeAsPctOfPromoterHolding.toFixed(2)}%
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
              Denominator: Promoter Shares ({sig.promoterShares} Cr)
            </span>
          </div>

          {/* Denominator 2: % of Total Share Capital */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Pledge (% of Total Capital)
            </span>
            <span
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: sig.pledgeAsPctOfTotalShareCapital > 0 ? '#f59e0b' : '#10b981',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {sig.pledgeAsPctOfTotalShareCapital.toFixed(2)}%
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
              Denominator: Total Equity ({sig.totalShares} Cr)
            </span>
          </div>

          {/* Institutional Holding */}
          {sig.institutionalHoldingPct !== undefined && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Institutional Holding
              </span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                {sig.institutionalHoldingPct.toFixed(2)}%
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>FII + DII Participation</span>
            </div>
          )}
        </div>

        {/* Diagnostic Context Note */}
        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
          {sig.pledgeAsPctOfPromoterHolding === 0
            ? 'No promoter shares are pledged as collateral. Operating voting control and economic equity remain unencumbered.'
            : `Promoter encumbrance of ${sig.pledgeAsPctOfPromoterHolding.toFixed(1)}% requires monitoring against loan-to-value margin call triggers.`}
        </p>

        {sig.evidenceReferences.length > 0 && onInspectEvidence && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
            <button
              onClick={() => onInspectEvidence(sig.evidenceReferences.map((e) => `${e.documentName} (P.${e.pageNumber || 'N/A'})`))}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-cyan)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                padding: 0,
                fontSize: '11px',
              }}
            >
              <ShieldCheck size={11} /> Shareholding Pattern Filing Citations
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};
