import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  statusBadge?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  id?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subtitle,
  trend,
  trendValue,
  statusBadge,
  icon,
  className = '',
  id,
}) => {
  return (
    <div
      className={`terminal-card ${className}`}
      id={id}
      style={{
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '96px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {icon && <span style={{ color: 'var(--brand-blue)', display: 'inline-flex' }}>{icon}</span>}
          <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
            {label}
          </span>
        </div>
        {statusBadge && <div>{statusBadge}</div>}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '4px' }}>
        <span className="tabular-nums" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--brand-navy)', letterSpacing: '-0.02em' }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
            {unit}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
        {subtitle && <span>{subtitle}</span>}
        {trend && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              fontWeight: 600,
              color: trend === 'up' ? 'var(--color-bullish)' : trend === 'down' ? 'var(--color-bearish)' : 'var(--text-muted)',
            }}
          >
            {trend === 'up' && <ArrowUpRight size={13} />}
            {trend === 'down' && <ArrowDownRight size={13} />}
            {trend === 'neutral' && <Minus size={13} />}
            {trendValue && <span>{trendValue}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
