import React, { useState, useEffect } from 'react';
import { ResearchProject } from '../domain/models/ResearchProject';
import { ProjectStorage } from '../domain/storage/ProjectStorage';
import { FundamentalHealthEngine } from '../domain/analysis/FundamentalHealthEngine';
import { FundamentalHealthAnalysis } from '../domain/analysis/FundamentalHealthTypes';
import { HealthScoringPolicyRegistry } from '../domain/analysis/HealthScoringPolicyRegistry';
import { FundamentalHealthCard } from '../components/analysis/FundamentalHealthCard';
import { RedFlagMatrixCard } from '../components/analysis/RedFlagMatrixCard';
import { StrengthsAndWatchItemsCard } from '../components/analysis/StrengthsAndWatchItemsCard';
import { DriverDecompositionModal } from '../components/analysis/DriverDecompositionModal';
import { BusinessModelGatingBanner } from '../components/calculations/BusinessModelGatingBanner';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import {
  Activity,
  ShieldCheck,
  Play,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';

interface FundamentalHealthViewProps {
  currentProject: ResearchProject | null;
  onNavigateToCalculations?: () => void;
  onNavigateToIngestion?: () => void;
}

export const FundamentalHealthView: React.FC<FundamentalHealthViewProps> = ({
  currentProject,
  onNavigateToCalculations,
}) => {
  const [analysis, setAnalysis] = useState<FundamentalHealthAnalysis | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');
  const [isDriverModalOpen, setIsDriverModalOpen] = useState<boolean>(false);
  const [selectedEvidenceList, setSelectedEvidenceList] = useState<string[] | null>(null);

  useEffect(() => {
    if (!currentProject) {
      setAnalysis(null);
      return;
    }

    const savedAnalysis = ProjectStorage.getFundamentalAnalysisForProject(currentProject.id);
    if (savedAnalysis) {
      setAnalysis(savedAnalysis);
    } else {
      // Auto-run if facts & metrics exist
      const facts = currentProject.facts || [];
      const metrics = currentProject.calculatedMetrics || [];
      if (facts.length > 0) {
        const result = FundamentalHealthEngine.analyze(
          currentProject.id,
          currentProject.company.symbol,
          currentProject.company.businessModel,
          facts,
          metrics,
          'FY24',
          'FY23'
        );
        setAnalysis(result);
        ProjectStorage.saveFundamentalAnalysisForProject(currentProject.id, result);
      }
    }
  }, [currentProject?.id]);

  const handleRunAnalysis = () => {
    if (!currentProject) return;
    const facts = currentProject.facts || [];
    const metrics = currentProject.calculatedMetrics || [];
    const result = FundamentalHealthEngine.analyze(
      currentProject.id,
      currentProject.company.symbol,
      currentProject.company.businessModel,
      facts,
      metrics,
      'FY24',
      'FY23'
    );
    setAnalysis(result);
    ProjectStorage.saveFundamentalAnalysisForProject(currentProject.id, result);
  };

  const getScoreColor = (score?: number) => {
    if (score === undefined) return 'var(--text-muted)';
    if (score >= 8.0) return '#10b981';
    if (score >= 6.0) return '#38bdf8';
    if (score >= 4.0) return '#f59e0b';
    return '#ef4444';
  };

  const getConfidenceBadge = (confidence?: string) => {
    switch (confidence) {
      case 'HIGH':
        return <Badge variant="bullish">HIGH CONFIDENCE</Badge>;
      case 'MEDIUM':
        return <Badge variant="cyan">MEDIUM CONFIDENCE</Badge>;
      case 'LOW':
        return <Badge variant="warning">LOW CONFIDENCE</Badge>;
      default:
        return <Badge variant="neutral">NOT ASSESSABLE</Badge>;
    }
  };

  if (!currentProject) {
    return (
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Card title="Fundamental Health Analysis">
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Please select or create an Indian equity research project to begin analysis.
          </div>
        </Card>
      </div>
    );
  }

  const policy = HealthScoringPolicyRegistry.getPolicy(currentProject.company.businessModel);

  const filteredScores =
    analysis?.categoryScores.filter((c) => {
      if (activeCategoryFilter === 'ALL') return true;
      return c.category === activeCategoryFilter;
    }) || [];

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header View */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={20} color="#38bdf8" />
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Fundamental Health Analysis
            </h1>
            <Badge variant="cyan">PHASE 6</Badge>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--text-muted)',
                background: 'var(--bg-surface-raised)',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              Policy: {policy.policyName}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
            Objective diagnostic evaluation of underlying operating robustness, cash conversion, solvency, and capital productivity.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onNavigateToCalculations && (
            <button
              onClick={onNavigateToCalculations}
              className="terminal-btn terminal-btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <FileSpreadsheet size={13} />
              Calculations View
            </button>
          )}

          <button
            onClick={() => setIsDriverModalOpen(true)}
            className="terminal-btn terminal-btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Layers size={13} />
            Return Drivers
          </button>

          <button
            onClick={handleRunAnalysis}
            className="terminal-btn terminal-btn-sm"
            style={{
              background: '#0284c7',
              color: '#ffffff',
              borderColor: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Play size={13} />
            Re-Evaluate Health
          </button>
        </div>
      </div>

      {/* Business Model Gating Notification */}
      <BusinessModelGatingBanner
        companySymbol={currentProject.company.symbol}
        businessModelCode={currentProject.company.businessModel}
        archetype={policy.businessModelCode}
        totalMetricsCount={policy.applicableMetrics.length}
        applicableMetricsCount={policy.applicableMetrics.length}
      />

      {/* Top Analytical Scorecard Grid */}
      {analysis && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px',
          }}
        >
          {/* Health Score Gauge */}
          <div
            style={{
              padding: '16px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Overall Health Score
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '28px',
                  fontWeight: 800,
                  color: getScoreColor(analysis.overallHealthScore),
                }}
              >
                {analysis.overallHealthScore !== undefined ? analysis.overallHealthScore.toFixed(1) : 'N/A'}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>/ 10.0</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Deterministic weighted aggregation across applicable categories.
            </span>
          </div>

          {/* Data Completeness */}
          <div
            style={{
              padding: '16px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Data Completeness
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '28px',
                  fontWeight: 800,
                  color: analysis.dataCompleteness >= 80 ? '#10b981' : analysis.dataCompleteness >= 50 ? '#38bdf8' : '#f59e0b',
                }}
              >
                {analysis.dataCompleteness}%
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Required reporting filings available for this business model.
            </span>
          </div>

          {/* Evidence Quality */}
          <div
            style={{
              padding: '16px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Evidence Quality
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '28px',
                  fontWeight: 800,
                  color: '#38bdf8',
                }}
              >
                {analysis.evidenceQuality}%
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Audit provenance score from verified primary source filings.
            </span>
          </div>

          {/* Analysis Confidence */}
          <div
            style={{
              padding: '16px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Analysis Confidence
            </span>
            <div>{getConfidenceBadge(analysis.analysisConfidence)}</div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Score ≠ Investment Conviction (Valuation evaluated in Phase 9).
            </span>
          </div>
        </div>
      )}

      {/* Category Filter Tabs */}
      {analysis && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All Categories' },
            { id: 'GROWTH', label: 'Growth Quality' },
            { id: 'MARGINS', label: 'Profitability' },
            { id: 'CASH_FLOW_QUALITY', label: 'Cash Flow' },
            { id: 'LEVERAGE', label: 'Balance Sheet' },
            { id: 'RETURNS', label: 'Capital Efficiency' },
            { id: 'WORKING_CAPITAL', label: 'Working Capital' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategoryFilter(tab.id)}
              style={{
                background: activeCategoryFilter === tab.id ? '#0284c7' : 'var(--bg-surface)',
                color: activeCategoryFilter === tab.id ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '5px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Category Breakdown Cards */}
      {analysis && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '16px',
          }}
        >
          {filteredScores.map((catScore) => (
            <FundamentalHealthCard
              key={catScore.category}
              categoryScore={catScore}
              onInspectEvidence={(cits) => setSelectedEvidenceList(cits)}
            />
          ))}
        </div>
      )}

      {/* Red Flags & Risk Matrix */}
      {analysis && (
        <RedFlagMatrixCard
          redFlags={analysis.redFlags}
          onInspectEvidence={(cits) => setSelectedEvidenceList(cits)}
        />
      )}

      {/* Strengths & Watch Items */}
      {analysis && (
        <StrengthsAndWatchItemsCard
          strengths={analysis.strengths}
          watchItems={analysis.watchItems}
          onInspectEvidence={(cits) => setSelectedEvidenceList(cits)}
        />
      )}

      {/* Return Drivers Decomposition Modal */}
      {analysis && (
        <DriverDecompositionModal
          isOpen={isDriverModalOpen}
          onClose={() => setIsDriverModalOpen(false)}
          decompositions={analysis.driverDecompositions}
        />
      )}

      {/* Evidence Citations Drawer */}
      {selectedEvidenceList && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '540px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} color="#10b981" />
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Verified Source Citations
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvidenceList(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              {selectedEvidenceList.map((cit, i) => (
                <li key={i} style={{ marginBottom: '6px' }}>
                  {cit}
                </li>
              ))}
            </ul>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button
                onClick={() => setSelectedEvidenceList(null)}
                className="terminal-btn terminal-btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
