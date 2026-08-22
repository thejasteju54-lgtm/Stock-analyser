import React from 'react';
import { ShieldCheck, CheckCircle, Terminal, AlertCircle } from 'lucide-react';
import { SystemStatus } from '../../types';

interface StatusBarProps {
  systemStatus: SystemStatus;
}

export const StatusBar: React.FC<StatusBarProps> = ({ systemStatus }) => {
  return (
    <footer className="terminal-status-bar" id="terminal-statusbar">
      {/* Left items */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Terminal size={11} color="var(--brand-blue)" />
          <span style={{ color: 'var(--brand-navy)', fontWeight: 700 }}>SYSTEM:</span>
          <span style={{ color: 'var(--brand-blue)', fontWeight: 600 }}>MODULAR_MONOLITH_ACTIVE</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: 'var(--text-muted)' }}>STATUS:</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            RESEARCH_ENGINE_ACTIVE
          </span>
        </div>
      </div>

      {/* Center item: Anti-Hallucination & Provenance Sentinel */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <ShieldCheck size={12} color="var(--color-bullish)" />
        <span style={{ color: 'var(--color-bullish)', fontWeight: 700, letterSpacing: '0.03em' }}>
          ZERO_FABRICATION_POLICY_ACTIVE • EVIDENCE_PROVENANCE_ENFORCED
        </span>
      </div>

      {/* Right items: Quality Gate & Data Freshness */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: 'var(--text-muted)' }}>DATA_QUALITY_GATE:</span>
          {systemStatus.dataQualityStatus === 'PASSED' ? (
            <span style={{ color: 'var(--color-bullish)', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
              <CheckCircle size={11} /> PASSED
            </span>
          ) : (
            <span style={{ color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
              <AlertCircle size={11} /> {systemStatus.dataQualityStatus}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: 'var(--text-muted)' }}>PERSISTENCE:</span>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>IMMUTABLE_HASH_CHAINED</span>
        </div>
      </div>
    </footer>
  );
};
