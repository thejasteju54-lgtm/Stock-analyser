import React, { useState } from 'react';
import { RiskItem } from '../../domain/risks/CatalystRiskTypes';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { Grid, Eye } from 'lucide-react';

interface MultiDimensionalRiskMatrixCardProps {
  risks: RiskItem[];
  onSelectRisk: (risk: RiskItem) => void;
}

export const MultiDimensionalRiskMatrixCard: React.FC<MultiDimensionalRiskMatrixCardProps> = ({
  risks,
  onSelectRisk,
}) => {
  const [selectedCell, setSelectedCell] = useState<{ p: number; i: number } | null>(null);

  // Group risks into 5x5 grid cells
  const grid: Record<string, RiskItem[]> = {};
  for (let p = 1; p <= 5; p++) {
    for (let i = 1; i <= 5; i++) {
      grid[`${p}_${i}`] = [];
    }
  }

  for (const r of risks) {
    const key = `${r.probabilityScore}_${r.impactScore}`;
    if (grid[key]) {
      grid[key].push(r);
    }
  }

  const getCellColor = (p: number, i: number, count: number) => {
    const raw = p * i;
    if (count === 0) return 'rgba(255, 255, 255, 0.02)';
    if (raw >= 20) return 'rgba(239, 68, 68, 0.35)'; // Critical
    if (raw >= 12) return 'rgba(245, 158, 11, 0.35)'; // High
    if (raw >= 6) return 'rgba(59, 130, 246, 0.25)'; // Medium
    return 'rgba(16, 185, 129, 0.25)'; // Low
  };

  const filteredRisks = selectedCell
    ? grid[`${selectedCell.p}_${selectedCell.i}`] || []
    : risks;

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bearish';
      case 'HIGH':
        return 'neutral';
      case 'MEDIUM':
        return 'neutral';
      default:
        return 'bullish';
    }
  };

  return (
    <Card className="risk-matrix-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Grid size={18} stroke="var(--color-primary)" />
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
            5x5 Multi-Dimensional Probability × Impact Matrix
          </h3>
        </div>
        {selectedCell && (
          <button
            onClick={() => setSelectedCell(null)}
            className="terminal-btn"
            style={{ fontSize: '11px', padding: '2px 8px' }}
          >
            Clear Filter (P: {selectedCell.p}, I: {selectedCell.i})
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 1.2fr)', gap: '20px' }}>
        {/* 5x5 Matrix Visualizer */}
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '6px' }}>
            ▲ PROBABILITY (1: Remote → 5: Almost Certain)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[5, 4, 3, 2, 1].map((p) => (
              <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '18px', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>
                  P{p}
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', flex: 1 }}>
                  {[1, 2, 3, 4, 5].map((i) => {
                    const cellRisks = grid[`${p}_${i}`] || [];
                    const isSelected = selectedCell?.p === p && selectedCell?.i === i;
                    return (
                      <button
                        key={`${p}_${i}`}
                        onClick={() => setSelectedCell(isSelected ? null : { p, i })}
                        style={{
                          height: '38px',
                          background: getCellColor(p, i, cellRisks.length),
                          border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                          borderRadius: '4px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: cellRisks.length > 0 ? 'pointer' : 'default',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span style={{ fontSize: '11px', fontWeight: 800, color: cellRisks.length > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {cellRisks.length > 0 ? cellRisks.length : '-'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '22px', marginTop: '6px', fontSize: '10px', color: 'var(--text-muted)' }}>
            <span>I1: Negligible</span>
            <span>I2: Minor</span>
            <span>I3: Moderate</span>
            <span>I4: Severe</span>
            <span>I5: Catastrophic</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '4px' }}>
            ► IMPACT MAGNITUDE
          </div>
        </div>

        {/* Filtered Risk List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
            {selectedCell ? `Risks at Coordinate (P: ${selectedCell.p}, I: ${selectedCell.i})` : 'All Prioritized Risks'} ({filteredRisks.length}):
          </div>

          {filteredRisks.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              No risks plotted in this coordinate cell.
            </div>
          ) : (
            filteredRisks.map((risk) => (
              <div
                key={risk.riskId}
                onClick={() => onSelectRisk(risk)}
                style={{
                  padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <Badge variant={getSeverityBadge(risk.severity)}>
                      {risk.severity} ({risk.netRiskScore}/25)
                    </Badge>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {risk.title}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Category: {risk.category.replace(/_/g, ' ')} | P: {risk.probabilityScore} × I: {risk.impactScore} | Velocity: {risk.velocity.replace(/_/g, ' ')}
                  </div>
                </div>
                <Eye size={14} stroke="var(--color-primary)" style={{ flexShrink: 0 }} />
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
};
