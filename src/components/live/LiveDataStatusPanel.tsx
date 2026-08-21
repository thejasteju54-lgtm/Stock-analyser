/**
 * LiveDataStatusPanel.tsx
 * Phase 16 — Live Provider Health, Latency & Rate Budget Telemetry Card.
 */

import React from 'react';
import { DataSourceMetadataRegistry } from '../../domain/dataSources/DataSourceMetadataRegistry';

export const LiveDataStatusPanel: React.FC = () => {
  const sources = DataSourceMetadataRegistry.getAllMetadata();

  return (
    <div
      style={{
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '16px',
        color: '#f8fafc',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>
          Live Data Feeds & Connectivity Status
        </h4>
        <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          SHA-256 Verified Ingestion
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
        {sources.map((s) => {
          const isHealthy = s.availabilityStatus === 'CONNECTED';
          return (
            <div
              key={s.sourceId}
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#f1f5f9' }}>{s.sourceId}</span>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 600,
                    backgroundColor: isHealthy ? '#064e3b' : '#7f1d1d',
                    color: isHealthy ? '#6ee7b7' : '#fca5a5',
                  }}
                >
                  {s.availabilityStatus}
                </span>
              </div>

              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                Tier: <span style={{ color: '#cbd5e1' }}>{s.sourceTier}</span>
              </div>

              <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                <span>Budget: {s.rateLimitPerMinute}/min</span>
                <span style={{ color: '#38bdf8' }}>{s.licenseStatus}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
