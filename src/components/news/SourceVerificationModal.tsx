import React from 'react';
import { NewsEvent, SourceConflict } from '../../domain/news/NewsAndIndustryTypes';
import { Badge } from '../common/Badge';
import { ShieldCheck, ExternalLink, X, AlertTriangle, Layers } from 'lucide-react';

interface SourceVerificationModalProps {
  event: NewsEvent | null;
  conflicts: SourceConflict[];
  onClose: () => void;
}

export const SourceVerificationModal: React.FC<SourceVerificationModalProps> = ({
  event,
  conflicts,
  onClose,
}) => {
  if (!event) return null;

  const relevantConflicts = conflicts.filter((c) => c.eventId === event.eventId);

  const getTierBadge = (tier: string) => {
    if (tier === 'TIER_1_PRIMARY') return <Badge variant="bullish">TIER 1: PRIMARY FILING</Badge>;
    if (tier === 'TIER_2_HIGH_QUALITY_MEDIA') return <Badge variant="cyan">TIER 2: FINANCIAL MEDIA</Badge>;
    if (tier === 'TIER_3_SECONDARY') return <Badge variant="warning">TIER 3: SECONDARY PORTAL</Badge>;
    return <Badge variant="neutral">TIER 4: DISCOVERY ONLY</Badge>;
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
          borderRadius: '8px',
          maxWidth: '750px',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <ShieldCheck size={18} color="var(--color-primary)" />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Source Provenance & Lineage Audit
              </h3>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Event ID: {event.eventId} | Corroboration: {event.corroborationStatus}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Headline */}
        <div style={{ padding: '10px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {event.headline}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {event.summary}
          </div>
        </div>

        {/* Conflicting Source Warning if any */}
        {relevantConflicts.length > 0 && (
          <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-bearish)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={14} />
              IDENTIFIED SOURCE CONFLICTS:
            </div>
            {relevantConflicts.map((c) => (
              <div
                key={c.conflictId}
                style={{
                  padding: '10px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '6px',
                  fontSize: '11px',
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.claim}</div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{c.difference}</div>
                <div style={{ fontSize: '10px', color: 'var(--color-bullish)', marginTop: '4px' }}>
                  Resolution: {c.resolution} ({c.resolutionEvidence})
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sources List */}
        <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={14} />
          Attributed Sourcing Feed ({event.sourceReferences.length} Outlets):
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {event.sourceReferences.map((src) => (
            <div
              key={src.sourceId}
              style={{
                padding: '12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  {getTierBadge(src.sourceTier)}
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {src.publisher}
                  </span>
                  {src.isSyndicated && <Badge variant="neutral">SYNDICATED WIRE</Badge>}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Source: {src.sourceName} | Type: {src.sourceType}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Published: {src.publishedAt} | Retrieved: {src.retrievedAt} | Timezone: {src.timezone}
                </div>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary)' }}>
                  Reliability: {src.reliabilityScore}%
                </div>
                {src.sourceURL && (
                  <a
                    href={src.sourceURL}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '10px',
                      color: 'var(--color-primary)',
                      textDecoration: 'none',
                      marginTop: '4px',
                    }}
                  >
                    Direct Link <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'right', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
          <button onClick={onClose} className="terminal-btn terminal-btn-primary" style={{ fontSize: '11px' }}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
