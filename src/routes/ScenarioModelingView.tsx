/**
 * ScenarioModelingView.tsx
 * Phase 13 — Scenario Modeling & Forward Financial Projection Engine Viewport.
 * Route: /scenarios
 */

import React, { useState } from 'react';
import { ResearchProject } from '../domain/models/ResearchProject';
import { ScenarioType, ScenarioAssumption } from '../domain/scenarios/ScenarioTypes';
import { ScenarioMasterEngine } from '../domain/scenarios/ScenarioMasterEngine';
import { ProjectStorage } from '../domain/storage/ProjectStorage';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ScenarioOverviewCard } from '../components/scenarios/ScenarioOverviewCard';
import { ScenarioFinancialDashboardCard } from '../components/scenarios/ScenarioFinancialDashboardCard';
import { ScenarioAssumptionProvenanceCard } from '../components/scenarios/ScenarioAssumptionProvenanceCard';
import { ScenarioSensitivityMatrixCard } from '../components/scenarios/ScenarioSensitivityMatrixCard';
import { ScenarioInvalidationCard } from '../components/scenarios/ScenarioInvalidationCard';
import { ScenarioComparisonCard } from '../components/scenarios/ScenarioComparisonCard';
import { AssumptionDetailModal } from '../components/scenarios/AssumptionDetailModal';

interface ScenarioModelingViewProps {
  project?: ResearchProject;
  onProjectUpdate?: (project: ResearchProject) => void;
}

export const ScenarioModelingView: React.FC<ScenarioModelingViewProps> = ({
  project,
  onProjectUpdate,
}) => {
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('BASE');
  const [inspectingAssumption, setInspectingAssumption] = useState<ScenarioAssumption | null>(null);

  if (!project) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p className="text-base font-semibold text-slate-300">No active research project selected.</p>
        <p className="text-xs mt-1">Please onboard or select a company from the project switcher.</p>
      </div>
    );
  }

  // Generate or retrieve scenario analysis
  const report =
    project.scenarioAnalysis || ScenarioMasterEngine.generateScenarioReport(project);

  const handleRunAnalysis = () => {
    const updatedReport = ScenarioMasterEngine.generateScenarioReport(project);
    const updatedProj = ProjectStorage.saveScenarioAnalysisForProject(project.id, updatedReport);
    if (updatedProj && onProjectUpdate) {
      onProjectUpdate(updatedProj);
    }
  };

  const handleSaveOverride = (
    assumptionId: string,
    newValue: number,
    rationale: string
  ) => {
    const activeSc = report.scenarios[activeScenario];
    const updatedAssumps = activeSc.assumptions.map((a) => {
      if (a.assumptionId === assumptionId) {
        return {
          ...a,
          value: newValue,
          sourceType: 'USER_DEFINED' as const,
          userOverride: {
            systemValue: a.value,
            userValue: newValue,
            variancePercent: a.value !== 0 ? Math.round(((newValue - a.value) / a.value) * 1000) / 10 : 0,
            userRationale: rationale,
            overriddenAt: new Date().toISOString(),
            impactOnValuationPercent: 2.5,
          },
          status: 'USER_DEFINED' as const,
        };
      }
      return a;
    });

    const updatedSc = { ...activeSc, assumptions: updatedAssumps };
    const updatedReport = {
      ...report,
      scenarios: {
        ...report.scenarios,
        [activeScenario]: updatedSc,
      },
    };

    const updatedProj = ProjectStorage.saveScenarioAnalysisForProject(project.id, updatedReport);
    if (updatedProj && onProjectUpdate) {
      onProjectUpdate(updatedProj);
    }
    setInspectingAssumption(null);
  };

  const currentScenarioModel = report.scenarios[activeScenario];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-100">
      {/* Top Header / Context Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-xl border border-slate-800 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400">PHASE 13</span>
            <span className="text-slate-600">•</span>
            <h1 className="text-lg font-bold text-slate-100 tracking-tight">
              Scenario Modeling & Forward Financial Projection Engine
            </h1>
            <Badge variant="cyan">Active Module 11</Badge>
          </div>
          <p className="text-xs text-slate-400">
            Company: <span className="text-slate-200 font-semibold">{project.company.displayName} ({project.company.symbol})</span> | Business Model:{' '}
            <span className="text-slate-200 font-semibold">{project.company.businessModel}</span> | As of:{' '}
            <span className="text-slate-200">{report.asOfDate}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button size="sm" variant="primary" onClick={handleRunAnalysis}>
            Re-calculate Scenarios
          </Button>
        </div>
      </div>

      {/* 1. Overview & Switcher Card */}
      <ScenarioOverviewCard
        report={report}
        activeScenario={activeScenario}
        onSelectScenario={(s) => setActiveScenario(s)}
      />

      {/* 2. Side-by-Side Comparison Matrix */}
      <ScenarioComparisonCard report={report} />

      {/* 3. High-Density Forward Financial Statement Table */}
      <ScenarioFinancialDashboardCard scenario={currentScenarioModel} />

      {/* 4. Sensitivity Grids & Top Value Drivers */}
      <ScenarioSensitivityMatrixCard
        sensitivityGrid={report.twoWaySensitivity}
        elasticityItems={currentScenarioModel.elasticityRanking}
      />

      {/* 5. Assumptions & Provenance Ledger */}
      <ScenarioAssumptionProvenanceCard
        assumptions={currentScenarioModel.assumptions}
        onInspectAssumption={(a) => setInspectingAssumption(a)}
      />

      {/* 6. Invalidation Conditions */}
      <ScenarioInvalidationCard conditions={currentScenarioModel.invalidationConditions} />

      {/* Detail Modal Drawer */}
      <AssumptionDetailModal
        assumption={inspectingAssumption}
        onClose={() => setInspectingAssumption(null)}
        onSaveOverride={handleSaveOverride}
      />
    </div>
  );
};
