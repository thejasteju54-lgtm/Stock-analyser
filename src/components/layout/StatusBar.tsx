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
          <Terminal size={11} color="#38bdf8" />
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>SYSTEM:</span>
          <span style={{ color: '#38bdf8' }}>MODULAR_MONOLITH_ACTIVE</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: 'var(--text-muted)' }}>CURRENT_PHASE:</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            PHASE {systemStatus.activePhase} (APPLICATION_SHELL)
          </span>
        </div>
      </div>

      {/* Center item: Anti-Hallucination & Provenance Sentinel */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <ShieldCheck size={12} color="#10b981" />
        <span style={{ color: '#10b981', fontWeight: 600, letterSpacing: '0.04em' }}>
          ZERO_FABRICATION_POLICY_ACTIVE • EVIDENCE_PROVENANCE_ENFORCED
        </span>
      </div>

      {/* Right items: Quality Gate & Memory state */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: 'var(--text-muted)' }}>DATA_QUALITY_GATE:</span>
          {systemStatus.dataQualityStatus === 'PASSED' ? (
            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <CheckCircle size={10} /> PASSED
            </span>
          ) : (
            <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <AlertCircle size={10} /> {systemStatus.dataQualityStatus}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: 'var(--text-muted)' }}>MEMORY:</span>
          <span style={{ color: 'var(--text-secondary)' }}>{systemStatus.memoryState}</span>
        </div>
      </div>
    </footer>
  );
};
