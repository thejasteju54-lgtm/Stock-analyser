import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResearchWorkspaceView } from '../../../src/routes/ResearchWorkspaceView';
import { ResearchHistoryView } from '../../../src/routes/ResearchHistoryView';
import { createResearchProject } from '../../../src/domain/models/ResearchProject';
import { CompanyIdentity } from '../../../src/domain/models/Company';

describe('Phase 15 — Research Workspace & History UI Views', () => {
  const company: CompanyIdentity = {
    id: 'comp_1',
    displayName: 'Tata Motors Ltd',
    legalName: 'Tata Motors Limited',
    symbol: 'TATAMOTORS',
    isin: 'INE155A01022',
    exchange: 'NSE',
    sector: 'AUTOMOBILE',
    subsector: 'PASSENGER_CARS',
    marketCapCategory: 'LARGE_CAP',
    businessModel: 'NON_FINANCIAL_OPERATING',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  it('renders the complete ResearchWorkspaceView with stepper, registry, completeness grid, and 22-section report', () => {
    const project = createResearchProject({ company });
    project.workflowState = 'DECISION_READY';

    render(<ResearchWorkspaceView project={project} />);

    expect(screen.getByText(/Production Research Workspace/i)).toBeInTheDocument();
    expect(screen.getByText(/Workflow Lifecycle State/i)).toBeInTheDocument();
    expect(screen.getByText(/Document Registry & Version Ledger/i)).toBeInTheDocument();
    expect(screen.getByText(/11-Pillar Evidence Completeness/i)).toBeInTheDocument();
    expect(screen.getByText(/Analytical Pipeline Orchestration/i)).toBeInTheDocument();
    expect(screen.getByText(/Evidence Freshness & Priority Refresh Queue/i)).toBeInTheDocument();
    expect(screen.getByText(/Final Institutional Investment Research Report/i)).toBeInTheDocument();
    expect(screen.getByText(/Print \/ Save as PDF/i)).toBeInTheDocument();
  });

  it('renders ResearchHistoryView and allows snapshot selection', () => {
    const project = createResearchProject({ company });
    project.snapshots = [
      {
        snapshotId: 'snap_1',
        projectId: project.id,
        companyId: 'TATAMOTORS',
        companySymbol: 'TATAMOTORS',
        createdAt: '2024-03-31T10:00:00Z',
        dataCutoffDate: '2024-03-31',
        codeVersion: '1.0.0',
        gitCommit: 'abc1234',
        buildId: 'build_1',
        schemaVersion: 'v15.0',
        analysisVersion: 'v14.0',
        policyVersions: {},
        documentVersions: [],
        phaseStatuses: {},
        decision: 'BUY',
        convictionScore: 8.5,
        convictionBand: 'VERY_HIGH',
        marketPrice: 980.5,
        marketPriceStatus: 'CURRENT',
        intrinsicBaseValue: 1150.0,
        marginOfSafetyPercent: 17.3,
        scenarioSummary: {
          bearValuation: 750,
          baseValuation: 1150,
          bullValuation: 1400,
          expectedScenarioValue: 1120,
          areProbabilitiesPlaceholders: false,
          probabilityStatus: 'ESTIMATED',
        },
        hash: 'a'.repeat(64),
        inputHash: 'b'.repeat(64),
        outputHash: 'c'.repeat(64),
      },
    ];

    render(<ResearchHistoryView project={project} />);

    expect(screen.getByText(/Research Snapshot History & Decision Timeline/i)).toBeInTheDocument();
    expect(screen.getByText(/snap_1/i)).toBeInTheDocument();
    expect(screen.getByText(/Conviction: 8.5\/10/i)).toBeInTheDocument();
  });
});
