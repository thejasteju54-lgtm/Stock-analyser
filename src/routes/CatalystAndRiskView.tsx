import React, { useState } from 'react';
import { ResearchProject } from '../domain/models/ResearchProject';
import { ProjectStorage } from '../domain/storage/ProjectStorage';
import { CatalystRiskMasterEngine } from '../domain/risks/CatalystRiskMasterEngine';
import { RiskItem } from '../domain/risks/CatalystRiskTypes';
import { RiskOverviewCard } from '../components/risks/RiskOverviewCard';
import { MultiDimensionalRiskMatrixCard } from '../components/risks/MultiDimensionalRiskMatrixCard';
import { PrioritizedCatalystCard } from '../components/risks/PrioritizedCatalystCard';
import { ThesisBreakersCard } from '../components/risks/ThesisBreakersCard';
import { CrossLayerRiskBreakdownCard } from '../components/risks/CrossLayerRiskBreakdownCard';
import { RiskDetailModal } from '../components/risks/RiskDetailModal';
import { ShieldAlert, Play } from 'lucide-react';
import { Badge } from '../components/common/Badge';

interface CatalystAndRiskViewProps {
  project: ResearchProject;
  onProjectUpdate?: (updated: ResearchProject) => void;
}

export const CatalystAndRiskView: React.FC<CatalystAndRiskViewProps> = ({
  project,
  onProjectUpdate,
}) => {
  const [selectedRisk, setSelectedRisk] = useState<RiskItem | null>(null);

  const report = project.catalystAndRiskAnalysis || CatalystRiskMasterEngine.execute(project);

  const handleRunAnalysis = () => {
    const freshReport = CatalystRiskMasterEngine.execute(project);
    const updated = ProjectStorage.saveCatalystAndRiskAnalysisForProject(project.id, freshReport);
    if (updated && onProjectUpdate) {
      onProjectUpdate(updated);
    }
  };

  return (
    <div className="terminal-viewport" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Workspace Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <ShieldAlert size={20} stroke="var(--color-primary)" />
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Catalysts, Thesis Breakers & Multi-Dimensional Risk Matrix
            </h2>
            <Badge variant="neutral">PHASE 12 ACTIVE</Badge>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
            Company: {project.company.displayName || project.company.legalName} ({project.company.symbol}) | Sector: {project.company.sector} | Deterministic 5x5 Matrix & Falsifiable Invalidation Gate
          </p>
        </div>

        <button
          onClick={handleRunAnalysis}
          className="terminal-btn terminal-btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '8px 16px' }}
        >
          <Play size={14} fill="currentColor" /> Synthesize Risk Matrix & Catalysts
        </button>
      </div>

      {/* Top Overview Card */}
      <RiskOverviewCard companySymbol={project.company.symbol} summary={report.matrixSummary} />

      {/* 5x5 Probability x Impact Matrix */}
      <MultiDimensionalRiskMatrixCard
        risks={report.rankedRisks}
        onSelectRisk={(risk) => setSelectedRisk(risk)}
      />

      {/* Prioritized Catalysts */}
      <PrioritizedCatalystCard catalysts={report.rankedCatalysts} />

      {/* Falsifiable Thesis Breakers */}
      <ThesisBreakersCard thesisBreakers={report.thesisBreakers} />

      {/* Cross-Layer Breakdown */}
      <CrossLayerRiskBreakdownCard
        crossLayerRiskSummary={report.crossLayerRiskSummary}
        onSelectRisk={(risk) => setSelectedRisk(risk)}
      />

      {/* Modal Inspector */}
      <RiskDetailModal
        risk={selectedRisk}
        onClose={() => setSelectedRisk(null)}
      />
    </div>
  );
};
