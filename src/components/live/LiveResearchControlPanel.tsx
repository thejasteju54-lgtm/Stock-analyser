/**
 * LiveResearchControlPanel.tsx
 * Phase 16 — Live Research Control Bar & Replay Mode Switcher.
 */

import React, { useState } from 'react';
import { DataSourceMetadataRegistry } from '../../domain/dataSources/DataSourceMetadataRegistry';

interface LiveResearchControlPanelProps {
  symbol: string;
  isReplayMode: boolean;
  cutoffDate?: string;
  onToggleMode: (isReplay: boolean) => void;
  onCutoffChange: (newCutoff: string) => void;
  onRefreshData: () => void;
  isRefreshing?: boolean;
}

export const LiveResearchControlPanel: React.FC<LiveResearchControlPanelProps> = ({
  symbol,
  isReplayMode,
  cutoffDate,
  onToggleMode,
  onCutoffChange,
  onRefreshData,
  isRefreshing = false,
}) => {
  const [tempCutoff, setTempCutoff] = useState(cutoffDate ? cutoffDate.split('T')[0] : '2024-06-30');
  const activeSourcesCount = DataSourceMetadataRegistry.getAllMetadata().filter(
    (s) => s.availabilityStatus === 'CONNECTED'
  ).length;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        marginBottom: '16px',
        color: '#f8fafc',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isReplayMode ? '#f59e0b' : '#10b981',
              boxShadow: isReplayMode ? '0 0 8px #f59e0b' : '0 0 8px #10b981',
            }}
          />
          <span style={{ fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {isReplayMode ? 'Point-in-Time Replay' : 'Live Data Mode'}
          </span>
        </div>

        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
          Active Feeds: <span style={{ color: '#38bdf8', fontWeight: 600 }}>{activeSourcesCount} / 6</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {isReplayMode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8' }}>Cutoff:</label>
            <input
              type="date"
              value={tempCutoff}
              onChange={(e) => {
                setTempCutoff(e.target.value);
                onCutoffChange(`${e.target.value}T23:59:59Z`);
              }}
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                color: '#f8fafc',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
              }}
            />
          </div>
        )}

        <button
          onClick={() => onToggleMode(!isReplayMode)}
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            color: '#f8fafc',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Switch to {isReplayMode ? 'Live Mode' : 'Point-in-Time Replay'}
        </button>

        <button
          onClick={onRefreshData}
          disabled={isRefreshing}
          style={{
            backgroundColor: isRefreshing ? '#475569' : '#2563eb',
            border: 'none',
            color: '#ffffff',
            padding: '6px 14px',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: isRefreshing ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {isRefreshing ? 'Refreshing Feeds...' : `Refresh Feeds (${symbol})`}
        </button>
      </div>
    </div>
  );
};
