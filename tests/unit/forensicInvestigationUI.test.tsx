import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ForensicRiskOverviewCard } from '../../src/components/forensics/ForensicRiskOverviewCard';
import { HighPriorityFindingsCard } from '../../src/components/forensics/HighPriorityFindingsCard';
import { PromoterAndOwnershipCard } from '../../src/components/forensics/PromoterAndOwnershipCard';
import { RelatedPartiesAndContingentCard } from '../../src/components/forensics/RelatedPartiesAndContingentCard';
import { CrossStatementAuditModal } from '../../src/components/forensics/CrossStatementAuditModal';
import { ForensicInvestigationView } from '../../src/routes/ForensicInvestigationView';
import { ResearchProject } from '../../src/domain/models/ResearchProject';
import { ForensicAnalysisReport } from '../../src/domain/forensics/ForensicAnalysisTypes';

describe('Phase 7 — Forensic Investigation UI Components', () => {
  const mockReport: ForensicAnalysisReport = {
    analysisId: 'forensic_test_fy24',
    projectId: 'proj_test',
    companyId: 'TESTCO',
    companySymbol: 'TESTCO',
    businessModelCode: 'OPERATING_INDUSTRIAL',
    analysisVersion: 'v1',
    methodologyVersion: 'v1',
    generatedAt: new Date().toISOString(),
    overallForensicRisk: 'MODERATE',
    overallForensicRiskScore: 28,
    confidence: 'HIGH',
    dataCompleteness: 90,
    isAssessable: true,
    findings: [
      {
        findingId: 'fnd_1',
        category: 'REVENUE_QUALITY',
        categoryName: 'Revenue Quality & Collections',
        title: 'Receivables Growth Outpacing Revenue',
        observation: 'Revenue grew 10% while debtors grew 35% in FY24.',
        signal: 'RECEIVABLES_VS_REVENUE_GROWTH_DIVERGENCE_SIGNAL',
        context: 'Operating Industrial policy baseline.',
        severity: 'HIGH',
        status: 'REQUIRES_INVESTIGATION',
        confidence: 90,
        materialityScore: 65,
        isPersistent: false,
        sourceIndependence: 'MULTI_SOURCE_CORROBORATED',
        supportingFactIds: [],
        supportingMetricIds: [],
        evidenceReferences: [
          {
            documentId: 'doc_1',
            documentName: 'TESTCO_AR_FY24.pdf',
            pageNumber: 120,
            sourceType: 'PRIMARY_AUDITED_FILING',
            confidence: 95,
          },
        ],
        possibleExplanations: ['Credit term extension.'],
        alternativeExplanations: ['Distribution expansion.'],
        investigationQuestions: ['Did credit terms change?'],
        requiresManagementClarification: true,
        requiresFurtherEvidence: true,
      },
    ],
    redFlags: [],
    positiveEvidence: ['Promoter shareholding is completely unencumbered (0% promoter pledge).'],
    unresolvedQuestions: ['Did credit terms change?'],
    investigationPriorities: [],
    relatedPartyTransactions: [
      {
        transactionId: 'rpt_1',
        counterparty: 'Tata Sons Private Limited',
        relationship: 'Holding Company',
        transactionType: 'PURCHASE_OF_GOODS',
        amount: 1250,
        currency: 'INR',
        period: 'FY24',
        percentOfRevenue: 0.3,
        percentOfNetWorth: 1.4,
        materialityAssessment: 'NOTABLE',
        materialityMethodology: 'Evaluated against revenue and net worth.',
        disclosureStatus: 'ADEQUATELY_DISCLOSED',
        isPromoterEntity: true,
        evidenceReferences: [],
      },
    ],
    contingentLiabilities: [
      {
        liabilityId: 'cont_1',
        category: 'TAX_DISPUTE_DIRECT',
        description: 'Direct Tax Matters in Dispute',
        amount: 4500,
        period: 'FY24',
        percentOfNetWorth: 5.0,
        percentOfRevenue: 1.0,
        materialityTier: 'MODERATE',
        outcomeStatus: 'OUTCOME_UNCERTAIN',
        evidenceReferences: [],
      },
    ],
    auditorDisclosures: [
      {
        disclosureId: 'aud_1',
        auditorFirm: 'B S R & Co. LLP',
        reportingPeriod: 'FY24',
        auditOpinion: 'UNMODIFIED',
        reportMatters: ['KEY_AUDIT_MATTER'],
        observationsSummary: 'Unmodified true & fair opinion.',
        keyAuditMattersCount: 2,
        keyAuditMatterTopics: ['Impairment assessment', 'Revenue recognition'],
        hasGoingConcernWarning: false,
        isAuditorTenureShort: false,
        evidenceReferences: [],
      },
    ],
    accountingPolicyChanges: [],
    restatements: [],
    promoterSignals: [
      {
        signalId: 'prom_1',
        reportingPeriod: 'FY24',
        totalShares: 367.8,
        promoterShares: 170.4,
        promoterPledgedShares: 0.0,
        promoterHoldingPct: 46.33,
        promoterHoldingChangeYoY: 0.0,
        pledgeAsPctOfPromoterHolding: 0.0,
        pledgeAsPctOfTotalShareCapital: 0.0,
        pledgeChangeBpsYoY: 0,
        isPledgeHighPriority: false,
        institutionalHoldingPct: 37.8,
        evidenceReferences: [],
      },
    ],
    crossStatementChecks: [
      {
        checkId: 'chk_1',
        checkName: 'Capex vs PPE Gross Additions Bridge',
        statementA: 'CASH_FLOW_STATEMENT',
        statementB: 'BALANCE_SHEET',
        metricA: 'Capex Outflow',
        valueA: 32000,
        metricB: 'PPE Additions',
        valueB: 31500,
        unit: 'INR_CRORE',
        rawDifference: 500,
        accountingBridgeExplanation: 'Explained by CWIP movements.',
        status: 'EXPLAINED_VARIANCE',
        evidenceReferences: [],
      },
    ],
    evidenceReferences: ['TESTCO_AR_FY24.pdf (P.120)'],
    limitations: [],
    notes: 'Diagnostic only.',
  };

  const mockProject: ResearchProject = {
    id: 'proj_test',
    name: 'Test Project',
    company: {
      id: 'comp_1',
      legalName: 'Test Company Ltd',
      displayName: 'Test Company Ltd',
      symbol: 'TESTCO',
      exchange: 'NSE',
      sector: 'Automotive',
      subsector: 'Passenger Cars & Utility Vehicles',
      businessModel: 'OPERATING_INDUSTRIAL',
      marketCapCategory: 'LARGE_CAP',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    status: 'ANALYZED',
    documents: [],
    facts: [],
    calculatedMetrics: [],
    forensicAnalysis: mockReport,
    metadata: {
      targetInvestmentHorizon: '3_YEARS',
      sourceFilingYears: ['FY24', 'FY23'],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastAccessedAt: new Date().toISOString(),
  };

  it('1. Renders ForensicRiskOverviewCard with risk score, tier, and severity tallies', () => {
    render(<ForensicRiskOverviewCard report={mockReport} />);
    expect(screen.getByText('Forensic Risk Score')).toBeDefined();
    expect(screen.getByText('28')).toBeDefined();
    expect(screen.getByText('MODERATE')).toBeDefined();
  });

  it('2. Renders HighPriorityFindingsCard and displays details', () => {
    render(<HighPriorityFindingsCard findings={mockReport.findings} />);
    expect(screen.getByText('Receivables Growth Outpacing Revenue')).toBeDefined();
    expect(screen.getByText('HIGH SEVERITY')).toBeDefined();
    expect(screen.getByText('Plausible Alternative (Non-Malicious) Explanations:')).toBeDefined();
  });

  it('3. Renders PromoterAndOwnershipCard displaying dual pledge denominators', () => {
    render(<PromoterAndOwnershipCard promoterSignals={mockReport.promoterSignals} />);
    expect(screen.getByText('0% PROMOTER PLEDGE')).toBeDefined();
    expect(screen.getByText('46.33%')).toBeDefined();
    expect(screen.getByText(/Promoter Shares \(170.4 Cr\)/)).toBeDefined();
    expect(screen.getByText(/Total Equity \(367.8 Cr\)/)).toBeDefined();
  });

  it('4. Renders RelatedPartiesAndContingentCard and switches tabs', () => {
    render(
      <RelatedPartiesAndContingentCard
        relatedParties={mockReport.relatedPartyTransactions}
        contingentLiabilities={mockReport.contingentLiabilities}
      />
    );
    expect(screen.getByText('Tata Sons Private Limited')).toBeDefined();

    // Click Contingent Liabilities tab button
    const contTabBtn = screen.getByRole('button', { name: /Contingent Liabilities/i });
    fireEvent.click(contTabBtn);
    expect(screen.getByText('TAX DISPUTE DIRECT')).toBeDefined();
  });

  it('5. Renders CrossStatementAuditModal with accounting bridge explanation', () => {
    const handleClose = vi.fn();
    render(
      <CrossStatementAuditModal
        isOpen={true}
        onClose={handleClose}
        checks={mockReport.crossStatementChecks}
      />
    );
    expect(screen.getByText('Cross-Statement Integrity & Accounting Bridge Audit')).toBeDefined();
    expect(screen.getByText('Capex vs PPE Gross Additions Bridge')).toBeDefined();
    expect(screen.getByText('EXPLAINED BRIDGE')).toBeDefined();

    const closeBtn = screen.getByText('Close Audit View');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('6. Renders ForensicInvestigationView root dashboard', () => {
    render(<ForensicInvestigationView currentProject={mockProject} />);
    expect(screen.getByText('Forensic Accounting & Earnings-Quality Investigation')).toBeDefined();
    expect(screen.getByText('PHASE 7')).toBeDefined();
  });
});
