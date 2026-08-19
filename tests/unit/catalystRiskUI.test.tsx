import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RiskOverviewCard } from '../../src/components/risks/RiskOverviewCard';
import { MultiDimensionalRiskMatrixCard } from '../../src/components/risks/MultiDimensionalRiskMatrixCard';
import { PrioritizedCatalystCard } from '../../src/components/risks/PrioritizedCatalystCard';
import { ThesisBreakersCard } from '../../src/components/risks/ThesisBreakersCard';
import { CrossLayerRiskBreakdownCard } from '../../src/components/risks/CrossLayerRiskBreakdownCard';
import { RiskDetailModal } from '../../src/components/risks/RiskDetailModal';
import { CatalystAndRiskReport, RiskItem } from '../../src/domain/risks/CatalystRiskTypes';

describe('Phase 12 — Catalyst & Risk UI Components Integration Tests', () => {
  const mockRisk: RiskItem = {
    riskId: 'risk_001',
    title: 'Raw Material Cost Inflation',
    category: 'MACRO_COMMODITY_CURRENCY',
    description: 'Steel and copper price surge.',
    probability: 'MODERATE',
    probabilityScore: 3,
    impact: 'MODERATE',
    impactScore: 3,
    rawRiskScore: 9,
    severity: 'MEDIUM',
    velocity: 'SLOW_EROSION',
    measurableExposure: '150 bps EBITDA margin compression',
    mitigations: [
      {
        mitigationId: 'mit_1',
        description: 'Quarterly price escalation contracts with OEM clients.',
        status: 'MITIGATION_VERIFIED',
        mitigationStrength: 0.3,
        evidenceReferences: ['Annual Report MD&A'],
        confidence: 85,
      },
    ],
    netExposure: 'PARTIALLY_MITIGATED',
    netRiskScore: 6,
    falsifiableTriggers: ['Raw material index > 150'],
    evidenceSourceIds: ['Note 28'],
    sourceLayer: 'INDUSTRY',
    lineage: {
      underlyingRiskId: 'und_commodity_cost',
      sourceRiskIds: ['r1'],
      sourceLayers: ['INDUSTRY'],
      relationshipType: 'INDEPENDENT_RISK',
      confidence: 85,
    },
    confidence: 85,
  };

  const mockReport: CatalystAndRiskReport = {
    projectId: 'proj_test',
    companySymbol: 'TATAMOTORS',
    asOfDate: '2024-04-12',
    catalysts: [
      {
        catalystId: 'cat_001',
        title: 'EV Capacity Expansion',
        description: 'Sanand plant Phase 2 commissioning.',
        type: 'CAPACITY_EXPANSION',
        expectedHorizon: 'SHORT_TERM_3_6M',
        likelihood: 'HIGH',
        likelihoodScore: 4,
        impactMagnitude: 'HIGH',
        impactScore: 8,
        financialChannels: ['REVENUE', 'CAPEX'],
        businessDrivers: ['EV Volume'],
        evidenceReferences: ['Investor Presentation Q3'],
        supportingFactIds: [],
        sourceLayer: 'MANAGEMENT',
        verificationStatus: 'VERIFIED_EVIDENCE',
        confidence: 90,
      },
    ],
    rankedCatalysts: [],
    risks: [mockRisk],
    rankedRisks: [mockRisk],
    thesisBreakers: [
      {
        breakerId: 'tb_001',
        premise: 'EBITDA margin sustains above 11%.',
        invalidationCondition: 'Margin falls below 11.0%.',
        metric: 'EBITDA Margin',
        operator: 'LESS_THAN',
        thresholdValue: 11.0,
        thresholdType: 'PERCENTAGE',
        evaluationPeriod: 'FY24',
        baselineValue: 14.5,
        currentValue: 13.2,
        bufferMarginPercent: 10,
        currentStatus: 'SAFE',
        sourceReferences: ['Audited Financials'],
        sourceDate: '2024-04-12',
        dataDate: '2024-03-31',
        retrievedAt: '2024-04-12T10:00:00Z',
        freshnessStatus: 'CURRENT',
        monitoringFrequency: 'QUARTERLY',
        recommendationImpactSignal: {
          suggestedVerdictAction: 'REVIEW_FOR_DOWNGRADE',
          severity: 'CRITICAL',
          rationale: 'Margin compression threatens cash flow.',
        },
        supportingEvidence: ['P&L Statements'],
      },
    ],
    matrixSummary: {
      totalRisksIdentified: 1,
      deduplicatedRiskCount: 1,
      criticalRiskCount: 0,
      highRiskCount: 0,
      mediumRiskCount: 1,
      lowRiskCount: 0,
      topRiskCategories: [{ category: 'MACRO_COMMODITY_CURRENCY', count: 1, maxScore: 6 }],
      aggregateRiskRating: 'MODERATE',
      asymmetryAssessment: 'FAVORABLE',
      upsidePotentialScore: 72,
      downsideRiskScore: 35,
      netAsymmetryRatio: 2.05,
      methodologyNote: '5x5 PxI Matrix',
    },
    crossLayerRiskSummary: {
      fundamentalRisks: [],
      forensicRisks: [],
      managementRisks: [],
      valuationRisks: [],
      technicalRisks: [],
      industryRisks: [mockRisk],
    },
    generatedAt: '2024-04-12T10:00:00Z',
  };
  mockReport.rankedCatalysts = mockReport.catalysts;

  it('renders RiskOverviewCard with aggregate risk rating, asymmetry score, and metric counters', () => {
    render(
      <RiskOverviewCard
        companySymbol={mockReport.companySymbol}
        summary={mockReport.matrixSummary}
      />
    );

    expect(screen.getByText(/Risk Matrix & Catalyst Asymmetry/i)).toBeDefined();
    expect(screen.getByText(/MODERATE RISK/i)).toBeDefined();
    expect(screen.getByText(/FAVORABLE/i)).toBeDefined();
    expect(screen.getByText('2.05x')).toBeDefined();
  });

  it('renders MultiDimensionalRiskMatrixCard and supports cell selection', () => {
    const onSelectRiskSpy = vi.fn();

    render(
      <MultiDimensionalRiskMatrixCard
        risks={mockReport.rankedRisks}
        onSelectRisk={onSelectRiskSpy}
      />
    );

    expect(screen.getByText(/5x5 Multi-Dimensional Probability × Impact Matrix/i)).toBeDefined();
    expect(screen.getByText('Raw Material Cost Inflation')).toBeDefined();

    const riskRow = screen.getByText('Raw Material Cost Inflation');
    fireEvent.click(riskRow);
    expect(onSelectRiskSpy).toHaveBeenCalledWith(mockRisk);
  });

  it('renders PrioritizedCatalystCard with horizon filters and score progress indicator', () => {
    render(<PrioritizedCatalystCard catalysts={mockReport.rankedCatalysts} />);

    expect(screen.getByText(/Prioritized Catalysts & Upside Triggers/i)).toBeDefined();
    expect(screen.getByText('EV Capacity Expansion')).toBeDefined();
    expect(screen.getByText('Score: 8/10')).toBeDefined();
  });

  it('renders ThesisBreakersCard with threshold operator and status badge', () => {
    render(<ThesisBreakersCard thesisBreakers={mockReport.thesisBreakers} />);

    expect(screen.getByText(/Falsifiable Thesis Breakers & Invalidation Triggers/i)).toBeDefined();
    expect(screen.getByText('EBITDA margin sustains above 11%.')).toBeDefined();
    expect(screen.getByText('SAFE')).toBeDefined();
  });

  it('renders CrossLayerRiskBreakdownCard and allows tab switching', () => {
    const onSelectRiskSpy = vi.fn();

    render(
      <CrossLayerRiskBreakdownCard
        crossLayerRiskSummary={mockReport.crossLayerRiskSummary}
        onSelectRisk={onSelectRiskSpy}
      />
    );

    expect(screen.getByText(/Cross-Layer Risk Decomposition/i)).toBeDefined();
    const industryTab = screen.getByRole('button', { name: /INDUSTRY \(1\)/i });
    fireEvent.click(industryTab);

    expect(screen.getByText('Raw Material Cost Inflation')).toBeDefined();
  });

  it('renders RiskDetailModal with verified mitigations and lineage', () => {
    const onCloseSpy = vi.fn();

    render(
      <RiskDetailModal
        risk={mockRisk}
        onClose={onCloseSpy}
      />
    );

    expect(screen.getByText(/Risk Provenance & Mitigation Inspector/i)).toBeDefined();
    expect(screen.getByText(/Quarterly price escalation contracts/i)).toBeDefined();
    expect(screen.getByText(/MITIGATION VERIFIED/i)).toBeDefined();

    const closeBtn = screen.getByRole('button', { name: /Close Inspector/i });
    fireEvent.click(closeBtn);
    expect(onCloseSpy).toHaveBeenCalled();
  });
});
