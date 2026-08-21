/**
 * FreshnessAndRefreshQueueCard.tsx
 * Phase 15 — Data Freshness & Priority Refresh Queue UI Component.
 */

import React from 'react';
import { ProjectFreshnessReport } from '../../domain/freshness/ResearchFreshnessEngine';
import { Clock, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

interface FreshnessAndRefreshQueueCardProps {
  freshnessReport: ProjectFreshnessReport;
  onRefreshCategory: (category: string) => void;
}

export const FreshnessAndRefreshQueueCard: React.FC<FreshnessAndRefreshQueueCardProps> = ({
  freshnessReport,
  onRefreshCategory,
}) => {
  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px 20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={16} color="#38bdf8" />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Evidence Freshness & Priority Refresh Queue
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 700,
              background: freshnessReport.hasCriticallyStaleData
                ? 'rgba(239, 68, 68, 0.2)'
                : freshnessReport.hasStaleData
                ? 'rgba(245, 158, 11, 0.2)'
                : 'rgba(16, 185, 129, 0.2)',
              color: freshnessReport.hasCriticallyStaleData
                ? '#f87171'
                : freshnessReport.hasStaleData
                ? '#fbbf24'
                : '#34d399',
            }}
          >
            {freshnessReport.hasCriticallyStaleData
              ? 'CRITICALLY STALE DATA'
              : freshnessReport.hasStaleData
              ? 'STALE DATA PRESENT'
              : 'ALL SOURCES CURRENT'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
        {freshnessReport.items.map((item) => (
          <div
            key={item.category}
            style={{
              background: '#1e293b',
              border: item.isCriticallyStale ? '1px solid #ef4444' : item.isStale ? '1px solid #f59e0b' : '1px solid #334155',
              borderRadius: '6px',
              padding: '10px 12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#f8fafc' }}>{item.name}</div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                Age: {item.ageHours}h (Max: {item.maxFreshnessHours}h)
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: item.isCriticallyStale ? '#f87171' : item.isStale ? '#fbbf24' : '#34d399',
                }}
              >
                {item.isCriticallyStale || item.isStale ? <AlertTriangle size={11} /> : <CheckCircle size={11} />}
                {item.isCriticallyStale ? 'CRITICAL' : item.isStale ? 'STALE' : 'FRESH'}
              </span>
              {(item.isStale || item.isCriticallyStale) && (
                <button
                  onClick={() => onRefreshCategory(item.category)}
                  style={{
                    background: '#0284c7',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '3px',
                    padding: '3px 6px',
                    fontSize: '9px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                >
                  <RefreshCw size={9} /> Refresh
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
