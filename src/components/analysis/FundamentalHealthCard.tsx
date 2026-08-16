import React from 'react';
import { CategoryScore } from '../../domain/analysis/FundamentalHealthTypes';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { TrendingUp, Info, ShieldCheck } from 'lucide-react';

interface FundamentalHealthCardProps {
  categoryScore: CategoryScore;
  onInspectEvidence?: (citations: string[]) => void;
}

export const FundamentalHealthCard: React.FC<FundamentalHealthCardProps> = ({
  categoryScore,
  onInspectEvidence,
}) => {
  const getScoreBadge = (score?: number, status?: string) => {
    if (status === 'NOT_APPLICABLE') {
      return <Badge variant="neutral">NOT APPLICABLE</Badge>;
    }
    if (status === 'MISSING_DATA' || score === undefined) {
      return <Badge variant="warning">MISSING DATA</Badge>;
    }
    if (score >= 8.0) return <Badge variant="bullish">{score.toFixed(1)} / 10 EXCELLENT</Badge>;
    if (score >= 6.0) return <Badge variant="cyan">{score.toFixed(1)} / 10 HEALTHY</Badge>;
    if (score >= 4.0) return <Badge variant="warning">{score.toFixed(1)} / 10 MODERATE</Badge>;
    return <Badge variant="bearish">{score.toFixed(1)} / 10 WEAK</Badge>;
  };

  const getScoreColor = (score?: number) => {
    if (score === undefined) return 'var(--text-muted)';
    if (score >= 8.0) return '#10b981';
    if (score >= 6.0) return '#38bdf8';
    if (score >= 4.0) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <Card
      title={categoryScore.categoryName}
      icon={<TrendingUp size={14} color="#38bdf8" />}
      action={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              background: 'var(--bg-surface-raised)',
              padding: '2px 6px',
              borderRadius: '3px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            Weight: {categoryScore.normalizedWeight}%
          </span>
          {getScoreBadge(categoryScore.rawScore, categoryScore.status)}
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Score Meter */}
        {categoryScore.isApplicable && categoryScore.rawScore !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                flex: 1,
                height: '6px',
                background: 'var(--bg-surface-raised)',
                borderRadius: '3px',
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  width: `${categoryScore.rawScore * 10}%`,
                  height: '100%',
                  background: getScoreColor(categoryScore.rawScore),
                  borderRadius: '3px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: '12px',
                color: getScoreColor(categoryScore.rawScore),
              }}
            >
              {categoryScore.rawScore.toFixed(1)}/10
            </span>
          </div>
        )}

        {/* Not Applicable Notice */}
        {!categoryScore.isApplicable && (
          <div
            style={{
              padding: '8px 10px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px dashed var(--border-subtle)',
              borderRadius: '4px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Info size={12} />
            This category is gated as not applicable for this company's business model. Weight renormalized to other categories.
          </div>
        )}

        {/* Positive Factors */}
        {categoryScore.positiveFactors.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#10b981', textTransform: 'uppercase' }}>
              Supporting Strengths
            </span>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: 'var(--text-primary)' }}>
              {categoryScore.positiveFactors.map((f, i) => (
                <li key={i} style={{ marginBottom: '2px' }}>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Negative Factors */}
        {categoryScore.negativeFactors.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase' }}>
              Observed Sensitivities / Concerns
            </span>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: 'var(--text-primary)' }}>
              {categoryScore.negativeFactors.map((f, i) => (
                <li key={i} style={{ marginBottom: '2px' }}>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Missing Inputs */}
        {categoryScore.missingInputs.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Missing Reporting Inputs
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {categoryScore.missingInputs.map((m, i) => (
                <Badge key={i} variant="neutral">
                  {m}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Evidence Citations */}
        {categoryScore.evidenceReferences.length > 0 && onInspectEvidence && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button
              onClick={() => onInspectEvidence(categoryScore.evidenceReferences)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-cyan)',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 0',
                outline: 'none',
              }}
            >
              <ShieldCheck size={11} />
              View Evidence Citations ({categoryScore.evidenceReferences.length})
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};
