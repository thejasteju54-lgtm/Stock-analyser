import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FundamentalHealthView } from '../../src/routes/FundamentalHealthView';
import { FundamentalHealthCard } from '../../src/components/analysis/FundamentalHealthCard';
import { RedFlagMatrixCard } from '../../src/components/analysis/RedFlagMatrixCard';
import { StrengthsAndWatchItemsCard } from '../../src/components/analysis/StrengthsAndWatchItemsCard';
import { DriverDecompositionModal } from '../../src/components/analysis/DriverDecompositionModal';
import { CategoryScore, FundamentalRedFlag, FundamentalStrength, WatchItem, DriverDecomposition } from '../../src/domain/analysis/FundamentalHealthTypes';
import { ResearchProject } from '../../src/domain/models/ResearchProject';
import { ProjectStorage } from '../../src/domain/storage/ProjectStorage';

describe('Phase 6 — Fundamental Health UI Components', () => {
  const mockCategoryScore: CategoryScore = {
    category: 'GROWTH',
    categoryName: 'Growth Quality',
    rawScore: 8.5,
    originalWeight: 15,
    applicableWeight: 15,
    normalizedWeight: 15,
    isApplicable: true,
    status: 'ASSESSED',
    supportingSignals: [],
    positiveFactors: ['Strong revenue growth of 26.6% YoY.'],
    negativeFactors: [],
    missingInputs: [],
    confidence: 'HIGH',
    evidenceReferences: ['TATAMOTORS_AR_FY24.pdf (P.140)'],
  };

  it('1. FundamentalHealthCard: renders category score, meter, positive factors, and weight tag', () => {
    render(<FundamentalHealthCard categoryScore={mockCategoryScore} />);

    expect(screen.getByText('Growth Quality')).toBeInTheDocument();
    expect(screen.getByText('Weight: 15%')).toBeInTheDocument();
    expect(screen.getByText('8.5/10')).toBeInTheDocument();
    expect(screen.getByText('Strong revenue growth of 26.6% YoY.')).toBeInTheDocument();
  });

  it('2. RedFlagMatrixCard: renders structured red flags with severity badges and triggers', () => {
    const mockRedFlags: FundamentalRedFlag[] = [
      {
        redFlagId: 'rf_1',
        category: 'CASH_FLOW_QUALITY',
        signal: {
          signalId: 'sig_1',
          signalCode: 'LOW_CFO_PAT_CONVERSION_SIGNAL',
          category: 'CASH_FLOW_QUALITY',
          title: 'Low Operating Cash Conversion',
          metricCode: 'CFO_TO_PAT_RATIO',
          currentValue: 0.35,
          signalDirection: 'NEGATIVE',
          description: 'CFO/PAT ratio is 0.35x.',
          supportingMetricIds: ['m1'],
          supportingFactIds: ['f1'],
        },
        title: 'Weak Cash Conversion / Potential Working Capital Drain',
        description: 'CFO is significantly lower than PAT (0.35x).',
        severity: 'HIGH',
        status: 'REQUIRES_INVESTIGATION',
        triggerMetricIds: ['m1'],
        supportingFactIds: ['f1'],
        supportingMetricIds: ['m1'],
        evidenceReferences: ['Doc1 (P.10)'],
        confidence: 90,
        requiresForensicReview: true,
      },
    ];

    render(<RedFlagMatrixCard redFlags={mockRedFlags} />);

    expect(screen.getByText(/Fundamental Red Flags & Risk Matrix/i)).toBeInTheDocument();
    expect(screen.getByText('Weak Cash Conversion / Potential Working Capital Drain')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText('REQUIRES INVESTIGATION')).toBeInTheDocument();
    expect(screen.getByText('LEAD FOR PHASE 7 FORENSICS')).toBeInTheDocument();
  });

  it('3. StrengthsAndWatchItemsCard: renders verified strengths and monitoring watch items', () => {
    const mockStrengths: FundamentalStrength[] = [
      {
        strengthId: 'str_1',
        category: 'CASH_FLOW_QUALITY',
        title: 'Positive Free Cash Flow Generation',
        description: 'Generated 14394 Cr in FCF.',
        supportingMetricIds: ['m1'],
        supportingFactIds: ['f1'],
        evidenceReferences: ['Doc1 (P.10)'],
        confidence: 95,
      },
    ];

    const mockWatchItems: WatchItem[] = [
      {
        watchItemId: 'wi_1',
        category: 'WORKING_CAPITAL',
        title: 'Extended Debtor Collection Period',
        description: 'Receivable days stand at 95 days.',
        metricOrFact: 'RECEIVABLE_DAYS',
        currentValue: '95 Days',
        historicalComparison: 'Collection monitoring',
        reasonForMonitoring: 'Monitor customer credit terms.',
        evidenceReferences: ['Doc1 (P.10)'],
        confidence: 90,
      },
    ];

    render(<StrengthsAndWatchItemsCard strengths={mockStrengths} watchItems={mockWatchItems} />);

    expect(screen.getByText('Positive Free Cash Flow Generation')).toBeInTheDocument();
    expect(screen.getByText('Extended Debtor Collection Period')).toBeInTheDocument();
    expect(screen.getByText('95 Days')).toBeInTheDocument();
  });

  it('4. DriverDecompositionModal: displays return driver decomposition when open', () => {
    const mockDecompositions: DriverDecomposition[] = [
      {
        returnMetric: 'ROE',
        currentReturn: 35.7,
        status: 'SUPPORTED_DRIVER',
        primaryDriver: 'OPERATING_PROFITABILITY',
        driverExplanation: 'ROE of 35.7% is primarily supported by healthy underlying net profit margins.',
        supportingEvidence: [
          { component: 'PAT Margin', value: 7.3, unit: '%', period: 'FY24', factId: 'f1' },
        ],
      },
    ];

    render(
      <DriverDecompositionModal
        isOpen={true}
        onClose={() => {}}
        decompositions={mockDecompositions}
      />
    );

    expect(screen.getByText('Evidence-Driven Return Driver Decomposition')).toBeInTheDocument();
    expect(screen.getByText('ROE Driver Analysis')).toBeInTheDocument();
    expect(screen.getByText('SUPPORTED BY EVIDENCE')).toBeInTheDocument();
    expect(screen.getByText(/ROE of 35.7% is primarily supported/i)).toBeInTheDocument();
  });

  it('5. FundamentalHealthView: renders workspace header, gauge cards, and triggers analysis', () => {
    const active = ProjectStorage.getActiveProject();
    const mockProject: ResearchProject = {
      ...active,
      status: 'EXTRACTED',
      facts: [
        {
          factId: 'f1',
          projectId: active.id,
          companyId: active.company.id,
          companySymbol: active.company.symbol,
          documentId: 'doc1',
          documentName: 'TATAMOTORS_AR_FY24.pdf',
          category: 'INCOME_STATEMENT',
          metric: 'REVENUE',
          metricLabel: 'Revenue',
          availabilityStatus: 'AVAILABLE',
          value: 437928,
          originalValue: 437928,
          unit: 'INR_CRORE',
          originalUnit: 'INR_CRORE',
          normalizedUnit: 'INR_CRORE',
          originalCurrency: 'INR',
          normalizedCurrency: 'INR',
          reportingPeriod: { fiscalYear: 'FY24', isIdentifiable: true, periodType: 'ANNUAL', rawPeriodString: 'FY24' },
          accountingBasis: 'CONSOLIDATED',
          extractionMethod: 'STRUCTURED_TABLE',
          provenanceSourceType: 'PRIMARY_SOURCE_DERIVED',
          sourceReference: { documentId: 'doc1', documentTitle: 'TATAMOTORS_AR_FY24.pdf', pageNumber: 140 },
          confidence: 98,
          confidenceTier: 'HIGH',
          verificationStatus: 'VERIFIED',
          extractedAt: new Date().toISOString(),
        },
      ],
      calculatedMetrics: [
        {
          metricId: 'm1',
          metricCode: 'REVENUE_GROWTH',
          metricName: 'Revenue Growth',
          category: 'GROWTH',
          value: 26.6,
          unit: 'PERCENT',
          period: 'FY24',
          formulaId: 'FORMULA_REVENUE_GROWTH',
          formulaName: 'Revenue Growth',
          formulaExpression: '((Revenue_CY - Revenue_PY) / Revenue_PY) * 100',
          methodologyId: 'GROWTH_YOY_BASE_V1',
          methodologyVersion: 'india-equity-methodology-v1',
          calculationVersion: 'financial-metrics-v1',
          inputFactIds: ['f1'],
          inputFactsSummary: [],
          calculationTimestamp: new Date().toISOString(),
          status: 'CALCULATED',
          warnings: [],
          isApplicableForBusinessModel: true,
        },
      ],
    };

    ProjectStorage.saveProject(mockProject);

    render(<FundamentalHealthView currentProject={mockProject} />);

    expect(screen.getByText('Fundamental Health Analysis')).toBeInTheDocument();
    expect(screen.getByText('Overall Health Score')).toBeInTheDocument();
    expect(screen.getByText('Data Completeness')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Re-Evaluate Health/i })).toBeInTheDocument();
  });
});
