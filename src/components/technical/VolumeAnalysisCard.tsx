import React from 'react';
import { VolumeAssessment } from '../../domain/technical/TechnicalTypes';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { BarChart3, AlertCircle } from 'lucide-react';

interface VolumeAnalysisCardProps {
  volume: VolumeAssessment;
}

export const VolumeAnalysisCard: React.FC<VolumeAnalysisCardProps> = ({
  volume,
}) => {
  const getVolBadge = (status: string) => {
    if (status === 'CONFIRMING') return <Badge variant="bullish">CONFIRMING</Badge>;
    if (status === 'DIVERGING') return <Badge variant="bearish">DIVERGING</Badge>;
    if (status === 'WEAK_CONFIRMATION') return <Badge variant="warning">WEAK CONFIRMATION</Badge>;
    return <Badge variant="neutral">{status.replace('_', ' ')}</Badge>;
  };

  const getAccumBadge = (status: string) => {
    if (status === 'POTENTIAL_ACCUMULATION') return <Badge variant="bullish">POTENTIAL ACCUMULATION</Badge>;
    if (status === 'POTENTIAL_DISTRIBUTION') return <Badge variant="bearish">POTENTIAL DISTRIBUTION</Badge>;
    return <Badge variant="neutral">{status.replace('_', ' ')}</Badge>;
  };

  return (
    <Card
      title="Volume Dynamics & Accumulation / Distribution"
      subtitle="Relative Volume (RVOL 20), strict Up/Down session volume ratio, and volume trend expansion."
      icon={<BarChart3 size={16} color="var(--color-primary)" />}
      action={
        <div style={{ display: 'flex', gap: '8px' }}>
          {getVolBadge(volume.status)}
          {getAccumBadge(volume.accumulationDistributionStatus)}
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <div style={{ padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>RELATIVE VOLUME (RVOL 20)</div>
          <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: volume.relativeVolume20 && volume.relativeVolume20 > 1.4 ? 'var(--color-primary)' : 'var(--text-primary)' }}>
            {volume.relativeVolume20 !== null ? `${volume.relativeVolume20.toFixed(2)}x` : '—'}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            vs 20-day Volume SMA
          </div>
        </div>

        <div style={{ padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>UP / DOWN VOLUME RATIO</div>
          <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: volume.upDownVolumeRatio20 && volume.upDownVolumeRatio20 > 1.0 ? 'var(--color-bullish)' : 'var(--color-bearish)' }}>
            {volume.upDownVolumeRatio20 !== null ? `${volume.upDownVolumeRatio20.toFixed(2)}x` : '—'}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            20-session Up vs Down closes
          </div>
        </div>

        <div style={{ padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>VOLUME TREND</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {volume.volumeTrend}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
            20-Day SMA: {volume.volumeMovingAverage20?.toLocaleString() || '—'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {volume.evidenceNotes.map((note, idx) => (
          <div key={idx} style={{ padding: '8px 12px', background: 'var(--bg-primary)', border: '1px dashed var(--border-subtle)', borderRadius: '4px', fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <AlertCircle size={14} color="var(--text-muted)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>{note}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};
