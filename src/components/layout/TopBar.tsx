import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Database, Clock } from 'lucide-react';
import { Badge } from '../common/Badge';
import { CompanyEntitySummary, SystemStatus } from '../../types';

interface TopBarProps {
  company: CompanyEntitySummary | null;
  systemStatus: SystemStatus;
}

export const TopBar: React.FC<TopBarProps> = ({ company, systemStatus }) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' IST'
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="terminal-header" id="terminal-topbar">
      {/* Brand / Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '18px',
              height: '18px',
              background: '#0284c7',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
            }}
          >
            EQ
          </div>
          <span
            style={{
              fontWeight: 700,
              fontSize: '12px',
              letterSpacing: '0.06em',
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
            }}
          >
            Equity Intelligence Terminal
          </span>
        </div>

        <Badge variant="cyan" icon={<ShieldCheck size={11} />}>
          Institutional Grade
        </Badge>
      </div>

      {/* Active Company Context */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'var(--bg-surface-raised)',
          padding: '4px 12px',
          borderRadius: '4px',
          border: '1px solid var(--border-subtle)',
        }}
        id="active-company-context"
      >
        {company ? (
          <>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '12px' }}>
              {company.name}
            </span>
            <span
              className="tabular-nums"
              style={{
                color: 'var(--color-brand)',
                fontSize: '11px',
                padding: '1px 5px',
                background: 'rgba(56, 189, 248, 0.1)',
                borderRadius: '2px',
              }}
            >
              {company.exchange}:{company.symbol}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
              {company.sector} / {company.subsector}
            </span>
            <Badge variant="neutral">{company.marketCapCategory.replace('_', ' ')}</Badge>
          </>
        ) : (
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
            No Company Loaded • Ready for Ingestion
          </span>
        )}
      </div>

      {/* Right Controls: Market Time & Engine Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
          }}
        >
          <Clock size={12} color="var(--text-muted)" />
          <span className="tabular-nums">{currentTime}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity size={12} color={systemStatus.engineStatus === 'READY' ? '#10b981' : '#f59e0b'} />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: systemStatus.engineStatus === 'READY' ? '#10b981' : '#f59e0b',
              fontWeight: 600,
            }}
          >
            {systemStatus.engineStatus}
          </span>
        </div>

        <Badge variant="neutral" icon={<Database size={10} />}>
          Phase 1 Active
        </Badge>
      </div>
    </header>
  );
};
