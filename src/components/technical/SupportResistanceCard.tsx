import React from 'react';
import { SupportResistanceZone, BreakoutEvent } from '../../domain/technical/TechnicalTypes';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { Shield, ArrowUp, ArrowDown } from 'lucide-react';

interface SupportResistanceCardProps {
  zones: SupportResistanceZone[];
  breakouts: BreakoutEvent[];
}

export const SupportResistanceCard: React.FC<SupportResistanceCardProps> = ({
  zones,
  breakouts,
}) => {
  return (
    <Card
      title="Support & Resistance Zones & Breakout Tracker"
      subtitle="ATR-normalized horizontal price clusters, touch density, and confirmed breakout/breakdown events."
      icon={<Shield size={16} color="var(--color-primary)" />}
    >
      <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>ZONE TYPE</th>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>RANGE (₹)</th>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>MID PRICE</th>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>STRENGTH</th>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>TOUCHES</th>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>REJECTIONS</th>
              <th style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>LAST TOUCH</th>
            </tr>
          </thead>
          <tbody>
            {zones.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No significant multi-touch support/resistance zones detected in current window.
                </td>
              </tr>
            ) : (
              zones.map((zone) => (
                <tr key={zone.zoneId} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 700, color: zone.type === 'SUPPORT' ? 'var(--color-bullish)' : 'var(--color-bearish)' }}>
                    {zone.type === 'SUPPORT' ? <ArrowUp size={12} style={{ display: 'inline', marginRight: '4px' }} /> : <ArrowDown size={12} style={{ display: 'inline', marginRight: '4px' }} />}
                    {zone.type}
                  </td>
                  <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)' }}>
                    ₹{zone.lowerBound.toFixed(1)} – ₹{zone.upperBound.toFixed(1)}
                  </td>
                  <td style={{ padding: '8px 12px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    ₹{zone.midPrice.toFixed(1)}
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <Badge variant={zone.strength === 'MAJOR' ? 'cyan' : 'neutral'}>{zone.strength}</Badge>
                  </td>
                  <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)' }}>{zone.touchCount}</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)' }}>{zone.rejectionCount}</td>
                  <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{zone.lastTouchDate}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Breakout / Breakdown Events */}
      {breakouts.length > 0 && (
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            BREAKOUT & BREAKDOWN STATUS:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {breakouts.map((bo) => (
              <div
                key={bo.eventId}
                style={{
                  padding: '8px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>{bo.description}</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Badge variant={bo.type.includes('BREAKOUT') ? 'bullish' : 'bearish'}>{bo.type.replace('_', ' ')}</Badge>
                  <Badge variant="cyan">{bo.confirmationStatus}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
