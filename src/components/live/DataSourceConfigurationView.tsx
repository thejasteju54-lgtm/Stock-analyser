/**
 * DataSourceConfigurationView.tsx
 * Phase 16 — Comprehensive Data Provider Configuration, Licensing & Attribution View.
 */

import React from 'react';
import { DataSourceMetadataRegistry } from '../../domain/dataSources/DataSourceMetadataRegistry';

export const DataSourceConfigurationView: React.FC = () => {
  const sources = DataSourceMetadataRegistry.getAllMetadata();

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
          Data Sources & Provider Governance
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
          Manage external data adapters, API rate budgets, licensing restrictions, and provenance attribution policies.
        </p>
      </div>

      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Source ID / Name</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Category</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Authority Tier</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>License Status</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Rate Budget</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Attribution</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => (
              <tr key={s.sourceId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>{s.sourceId}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{s.sourceName}</div>
                </td>
                <td style={{ padding: '14px 16px', color: '#334155' }}>{s.category}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      backgroundColor: s.sourceTier === 'TIER_1_PRIMARY' ? '#dbeafe' : '#f1f5f9',
                      color: s.sourceTier === 'TIER_1_PRIMARY' ? '#1d4ed8' : '#475569',
                    }}
                  >
                    {s.sourceTier}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', color: '#334155' }}>{s.licenseStatus}</td>
                <td style={{ padding: '14px 16px', color: '#334155' }}>{s.rateLimitPerMinute} req/min</td>
                <td style={{ padding: '14px 16px', fontSize: '11px', color: '#64748b' }}>
                  {s.attributionRequirement || 'N/A'}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      backgroundColor: s.availabilityStatus === 'CONNECTED' ? '#dcfce7' : '#fee2e2',
                      color: s.availabilityStatus === 'CONNECTED' ? '#15803d' : '#b91c1c',
                    }}
                  >
                    {s.availabilityStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
