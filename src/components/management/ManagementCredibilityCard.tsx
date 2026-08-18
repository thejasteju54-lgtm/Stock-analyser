import React from 'react';
import { ManagementCredibilityAssessment } from '../../domain/management/ManagementDnaTypes';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Award, Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface ManagementCredibilityCardProps {
  assessment: ManagementCredibilityAssessment;
}

export const ManagementCredibilityCard: React.FC<ManagementCredibilityCardProps> = ({
  assessment,
}) => {
  const getRatingBadge = (tier: string) => {
    switch (tier) {
      case 'VERY_HIGH':
        return <Badge variant="bullish">VERY HIGH CREDIBILITY</Badge>;
      case 'HIGH':
        return <Badge variant="bullish">HIGH CREDIBILITY</Badge>;
      case 'MODERATE':
        return <Badge variant="warning">MODERATE CREDIBILITY</Badge>;
      case 'WEAK':
        return <Badge variant="bearish">WEAK CREDIBILITY</Badge>;
      case 'LOW':
        return <Badge variant="bearish">LOW CREDIBILITY</Badge>;
      default:
        return <Badge variant="neutral">NOT ASSESSABLE</Badge>;
    }
  };

  return (
    <Card
      title="Execution Credibility Assessment"
      action={getRatingBadge(assessment.ratingTier)}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Definition Notice Banner */}
        <div
          style={{
            padding: '10px 14px',
            background: 'var(--bg-surface-raised)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11px',
            color: 'var(--text-secondary)',
          }}
        >
          <Info size={14} color="#0284c7" />
          <span>
            <strong>Methodology Definition:</strong> {assessment.definitionNotice}{' '}
            <em>(Does not measure honesty, morality, intent, or fraud likelihood).</em>
          </span>
        </div>

        {/* Top Summary Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
          }}
        >
          {/* Main Credibility Score */}
          <div
            style={{
              padding: '16px',
              background: 'var(--bg-surface-raised)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Award size={18} color="#0284c7" />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Execution Reliability Score
              </span>
            </div>
            <div
              style={{
                fontSize: '36px',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color:
                  assessment.credibilityScore === null
                    ? 'var(--text-muted)'
                    : assessment.credibilityScore >= 75
                    ? '#10b981'
                    : assessment.credibilityScore >= 50
                    ? '#f59e0b'
                    : '#ef4444',
              }}
            >
              {assessment.credibilityScore !== null ? `${assessment.credibilityScore}/100` : 'N/A'}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {assessment.isAssessable
                ? `Derived from ${assessment.totalEligibleCommitments} verified commitments`
                : `Requires ≥ ${assessment.minimumRequiredCommitments} commitments`}
            </span>
          </div>

          {/* Delivery Counts Breakdown */}
          <div
            style={{
              padding: '14px',
              background: 'var(--bg-surface-raised)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Historical Delivery Breakdown
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={13} color="#10b981" />
                <span style={{ color: 'var(--text-secondary)' }}>Achieved / Above:</span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                  {assessment.achievedCount + assessment.aboveGuidanceCount}
                </strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <XCircle size={13} color="#ef4444" />
                <span style={{ color: 'var(--text-secondary)' }}>Missed:</span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                  {assessment.missedCount}
                </strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={13} color="#f59e0b" />
                <span style={{ color: 'var(--text-secondary)' }}>Revised Guidance:</span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                  {assessment.revisedCount}
                </strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Info size={13} color="#94a3b8" />
                <span style={{ color: 'var(--text-secondary)' }}>Unverifiable:</span>
                <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                  {assessment.unverifiableCount}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Category Scores Breakdown */}
        {assessment.categoryScores.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Discipline Category Breakdown
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
              {assessment.categoryScores.map((cat, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px 12px',
                    background: 'var(--bg-surface-raised)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {cat.categoryName}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: cat.score >= 75 ? '#10b981' : cat.score >= 50 ? '#f59e0b' : '#ef4444',
                      }}
                    >
                      {cat.score}/100
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ width: '100%', height: '4px', background: 'var(--bg-canvas)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${cat.score}%`,
                        height: '100%',
                        background: cat.score >= 75 ? '#10b981' : cat.score >= 50 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {cat.notes}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
