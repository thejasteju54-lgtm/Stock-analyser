import React from 'react';
import { IndustryProfile } from '../../domain/news/NewsAndIndustryTypes';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { Factory, TrendingUp, Shield, Compass } from 'lucide-react';

interface IndustryOverviewCardProps {
  industryProfile: IndustryProfile;
}

export const IndustryOverviewCard: React.FC<IndustryOverviewCardProps> = ({
  industryProfile,
}) => {
  const getCycleBadge = (stage: string) => {
    switch (stage) {
      case 'STRUCTURAL_GROWTH':
      case 'EXPANSION':
        return <Badge variant="bullish">{stage.replace('_', ' ')}</Badge>;
      case 'PEAK':
        return <Badge variant="warning">PEAK OF CYCLE</Badge>;
      case 'SLOWDOWN':
      case 'CONTRACTION':
        return <Badge variant="bearish">{stage.replace('_', ' ')}</Badge>;
      default:
        return <Badge variant="neutral">{stage.replace('_', ' ')}</Badge>;
    }
  };

  return (
    <Card
      title={`${industryProfile.industryName} — Industry Dynamics & Structural Drivers`}
      subtitle={`Sector: ${industryProfile.sector} | Capital Intensity: ${industryProfile.capitalIntensity} | Cyclicality: ${industryProfile.cyclicality}`}
      icon={<Factory size={16} color="var(--color-primary)" />}
      action={
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cycle Stage:</span>
          {getCycleBadge(industryProfile.industryCycle)}
        </div>
      }
    >
      {/* High-Level Size & Growth Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <div style={{ padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>ESTIMATED MARKET SIZE</div>
          <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            {industryProfile.marketSize ? `₹${industryProfile.marketSize.toLocaleString('en-IN')} Cr` : 'NOT_ASSESSABLE'}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Period: {industryProfile.marketSizeDate} ({industryProfile.marketSizeUnit})
          </div>
        </div>

        {industryProfile.growthHistory.map((g, idx) => (
          <div key={idx} style={{ padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{g.growthType} GROWTH</span>
              <Badge variant={g.growthType === 'FORECAST' ? 'cyan' : 'neutral'}>{g.growthType}</Badge>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-bullish)' }}>
              {g.growthRatePercent !== null ? `${g.growthRatePercent}%` : 'N/A'}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {g.period} ({g.source})
            </div>
          </div>
        ))}
      </div>

      {/* Structural vs Cyclical Drivers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px', marginBottom: '16px' }}>
        {/* Demand Drivers */}
        <div style={{ padding: '14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={14} color="var(--color-bullish)" />
            Demand Drivers & Structural Shifts:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {industryProfile.demandDrivers.map((d, i) => (
              <div key={i} style={{ fontSize: '11px', background: 'var(--bg-primary)', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{d.name}</strong>
                  <Badge variant={d.type === 'STRUCTURAL_DRIVER' ? 'cyan' : 'warning'}>{d.type.replace('_', ' ')}</Badge>
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>{d.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Supply & Tech Factors */}
        <div style={{ padding: '14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Compass size={14} color="var(--color-primary)" />
            Supply Dynamics & Technology Disruption:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {industryProfile.technologyFactors.map((t, i) => (
              <div key={i} style={{ fontSize: '11px', background: 'var(--bg-primary)', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{t.technology}</strong>
                  <Badge variant={t.disruptionRisk === 'HIGH' ? 'bearish' : 'neutral'}>
                    RISK: {t.disruptionRisk}
                  </Badge>
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>{t.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Porter 5-Forces Summary */}
      <div style={{ padding: '12px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Shield size={14} color="var(--color-primary)" />
          Porter 5-Forces Competitive Intensity:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '8px' }}>
          <div style={{ padding: '6px 8px', background: 'var(--bg-primary)', borderRadius: '4px', fontSize: '10px' }}>
            <span style={{ color: 'var(--text-muted)' }}>New Entrants:</span> <strong>{industryProfile.competitiveFactors.threatOfNewEntrants}</strong>
          </div>
          <div style={{ padding: '6px 8px', background: 'var(--bg-primary)', borderRadius: '4px', fontSize: '10px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Supplier Power:</span> <strong>{industryProfile.competitiveFactors.supplierPower}</strong>
          </div>
          <div style={{ padding: '6px 8px', background: 'var(--bg-primary)', borderRadius: '4px', fontSize: '10px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Buyer Power:</span> <strong>{industryProfile.competitiveFactors.buyerPower}</strong>
          </div>
          <div style={{ padding: '6px 8px', background: 'var(--bg-primary)', borderRadius: '4px', fontSize: '10px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Substitutes:</span> <strong>{industryProfile.competitiveFactors.threatOfSubstitutes}</strong>
          </div>
          <div style={{ padding: '6px 8px', background: 'var(--bg-primary)', borderRadius: '4px', fontSize: '10px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Rivalry:</span> <strong>{industryProfile.competitiveFactors.competitiveRivalry}</strong>
          </div>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          {industryProfile.competitiveFactors.evidenceSummary}
        </div>
      </div>
    </Card>
  );
};
