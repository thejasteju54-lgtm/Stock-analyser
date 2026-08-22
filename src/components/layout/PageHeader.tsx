import React from 'react';
import { Building, RefreshCw, FileText, Download, ShieldCheck, Clock } from 'lucide-react';
import { Badge } from '../common/Badge';
import { StatusBadge, DataReliabilityStatus } from '../common/StatusBadge';
import { Button } from '../common/Button';
import { CompanyIdentity } from '../../domain/models/Company';

export interface PageHeaderProps {
  title?: string;
  company?: CompanyIdentity;
  status?: DataReliabilityStatus | string;
  freshnessLabel?: string;
  onRefresh?: () => void;
  onViewEvidence?: () => void;
  onExport?: () => void;
  isRefreshing?: boolean;
  actions?: React.ReactNode;
  breadcrumbs?: string[];
  className?: string;
  id?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  company,
  status = 'VERIFIED',
  freshnessLabel = 'Updated Just Now',
  onRefresh,
  onViewEvidence,
  onExport,
  isRefreshing = false,
  actions,
  breadcrumbs,
  className = '',
  id,
}) => {
  return (
    <div
      className={`terminal-card ${className}`}
      id={id}
      style={{
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        background: '#ffffff',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span>/</span>}
              <span style={{ color: idx === breadcrumbs.length - 1 ? 'var(--brand-navy)' : 'var(--text-muted)', fontWeight: idx === breadcrumbs.length - 1 ? 600 : 400 }}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        {/* Company and Title Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '6px',
              background: 'var(--brand-blue-light)',
              border: '1px solid var(--brand-blue-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-blue)',
            }}
          >
            <Building size={20} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--brand-navy)', letterSpacing: '-0.02em', margin: 0 }}>
                {company ? company.displayName : title || 'Institutional Research Terminal'}
              </h1>
              {company && (
                <div style={{ display: 'flex', gap: '4px' }}>
                  <Badge variant="cyan">{company.exchange}:{company.symbol}</Badge>
                  <Badge variant="neutral">{company.sector}</Badge>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={13} color="var(--brand-blue)" />
                <span>Research Status:</span>
                <StatusBadge status={status} />
              </div>

              <span>•</span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={13} />
                <span>{freshnessLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {actions}

          {onRefresh && (
            <Button
              size="sm"
              icon={<RefreshCw size={12} className={isRefreshing ? 'spin' : ''} />}
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              Refresh
            </Button>
          )}

          {onViewEvidence && (
            <Button
              size="sm"
              icon={<FileText size={12} />}
              onClick={onViewEvidence}
            >
              Evidence
            </Button>
          )}

          {onExport && (
            <Button
              size="sm"
              variant="secondary"
              icon={<Download size={12} />}
              onClick={onExport}
            >
              Export
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
