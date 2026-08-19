import React, { useState } from 'react';
import { CatalystItem, CatalystHorizon } from '../../domain/risks/CatalystRiskTypes';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { Zap, Clock, ShieldCheck } from 'lucide-react';

interface PrioritizedCatalystCardProps {
  catalysts: CatalystItem[];
}

export const PrioritizedCatalystCard: React.FC<PrioritizedCatalystCardProps> = ({ catalysts }) => {
  const [activeHorizon, setActiveHorizon] = useState<string>('ALL');

  const filteredCatalysts = activeHorizon === 'ALL'
    ? catalysts
    : catalysts.filter((c) => c.expectedHorizon === activeHorizon);

  const getHorizonLabel = (h: CatalystHorizon) => {
    switch (h) {
      case 'IMMEDIATE_0_3M':
        return '0-3M Immediate';
      case 'SHORT_TERM_3_6M':
        return '3-6M Short Term';
      case 'MEDIUM_TERM_6_12M':
        return '6-12M Medium Term';
      case 'LONG_TERM_12M_PLUS':
        return '12M+ Long Term';
      default:
        return 'Structural';
    }
  };

  return (
    <Card className="prioritized-catalyst-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} stroke="var(--color-primary)" />
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Prioritized Catalysts & Upside Triggers ({catalysts.length})
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          {['ALL', 'IMMEDIATE_0_3M', 'SHORT_TERM_3_6M', 'MEDIUM_TERM_6_12M', 'LONG_TERM_12M_PLUS'].map((h) => (
            <button
              key={h}
              onClick={() => setActiveHorizon(h)}
              className={`terminal-btn ${activeHorizon === h ? 'terminal-btn-primary' : ''}`}
              style={{ fontSize: '10px', padding: '2px 8px' }}
            >
              {h === 'ALL' ? 'All Horizons' : h.replace('_0_3M', ' 0-3M').replace('_3_6M', ' 3-6M').replace('_6_12M', ' 6-12M').replace('_12M_PLUS', ' 12M+')}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredCatalysts.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
            No catalysts identified in this time horizon.
          </div>
        ) : (
          filteredCatalysts.map((cat, idx) => (
            <div
              key={cat.catalystId}
              style={{
                padding: '12px 14px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-primary)' }}>
                    #{idx + 1}
                  </span>
                  <Badge variant="bullish">
                    {cat.type.replace(/_/g, ' ')}
                  </Badge>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {cat.title}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-primary)' }}>
                    Score: {cat.impactScore}/10
                  </span>
                  <Badge variant="neutral">
                    {cat.likelihood} LIKELIHOOD
                  </Badge>
                </div>
              </div>

              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: '1.4' }}>
                {cat.description}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={11} /> {getHorizonLabel(cat.expectedHorizon)}
                  </span>
                  <span>Channel: {cat.financialChannels.join(', ')}</span>
                  <span>Source: {cat.sourceLayer}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-success)' }}>
                  <ShieldCheck size={11} /> {cat.verificationStatus.replace(/_/g, ' ')} ({cat.confidence}% Conf)
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
