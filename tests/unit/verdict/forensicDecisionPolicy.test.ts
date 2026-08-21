import { describe, it, expect } from 'vitest';
import { ForensicDecisionPolicyRegistry } from '../../../src/domain/verdict/ForensicDecisionPolicyRegistry';
import { ForensicAnalysisReport } from '../../../src/domain/forensics/ForensicAnalysisTypes';

describe('Phase 14 — ForensicDecisionPolicyRegistry', () => {
  const baseReport: ForensicAnalysisReport = {
    analysisId: 'forensic_test_1',
    projectId: 'proj_1',
    companyId: 'comp_1',
    companySymbol: 'TATAMOTORS',
    businessModelCode: 'NON_FINANCIAL_OPERATING',
    analysisVersion: '1.0.0',
    methodologyVersion: '1.0.0',
    generatedAt: new Date().toISOString(),
    overallForensicRisk: 'LOW',
    overallForensicRiskScore: 15,
    confidence: 'HIGH',
    dataCompleteness: 95,
    isAssessable: true,
    findings: [],
    redFlags: [],
    positiveEvidence: [],
    unresolvedQuestions: [],
    investigationPriorities: [],
    relatedPartyTransactions: [],
    contingentLiabilities: [],
    auditorDisclosures: [],
    accountingPolicyChanges: [],
    restatements: [],
    promoterSignals: [],
    crossStatementChecks: [],
    evidenceReferences: [],
    limitations: [],
    notes: '',
  };

  it('evaluates clean forensic profiles with full BUY eligibility', () => {
    const result = ForensicDecisionPolicyRegistry.evaluateForensicDecision(baseReport);
    expect(result.adjustment.forensicState).toBe('NO_MATERIAL_CONCERN');
    expect(result.adjustment.requiredMoSBufferPercent).toBe(0.0);
    expect(result.adjustment.confidenceCap).toBe(10.0);
    expect(result.activeBlockers.length).toBe(0);
  });

  it('evaluates watch items and applies +3% required MoS buffer', () => {
    const reportWithWatch: ForensicAnalysisReport = {
      ...baseReport,
      findings: [
        {
          findingId: 'fnd_1',
          category: 'WORKING_CAPITAL_FORENSICS',
          categoryName: 'Working Capital',
          title: 'Receivables expansion',
          observation: 'Receivable days increased by 8 days.',
          signal: 'RECEIVABLE_EXPANSION_SIGNAL',
          context: 'Auto sector supply chain normalization.',
          severity: 'HIGH',
          status: 'POTENTIAL_CONCERN',
          confidence: 80,
          materialityScore: 40,
          isPersistent: false,
          sourceIndependence: 'SINGLE_SOURCE',
          supportingFactIds: [],
          supportingMetricIds: [],
          evidenceReferences: [],
          possibleExplanations: [],
          alternativeExplanations: [],
          investigationQuestions: [],
          requiresManagementClarification: false,
          requiresFurtherEvidence: false,
        },
      ],
    };

    const result = ForensicDecisionPolicyRegistry.evaluateForensicDecision(reportWithWatch);
    expect(result.adjustment.forensicState).toBe('WATCH');
    expect(result.adjustment.requiredMoSBufferPercent).toBe(3.0);
    expect(result.adjustment.confidenceCap).toBe(8.0);
    expect(result.activeBlockers.length).toBe(0);
  });

  it('enforces CRITICAL_OVERRIDE for confirmed fraud or auditor resignation', () => {
    const reportWithFraud: ForensicAnalysisReport = {
      ...baseReport,
      findings: [
        {
          findingId: 'fnd_fraud',
          category: 'AUDITOR_DISCLOSURES',
          categoryName: 'Auditor Disclosures',
          title: 'Auditor resignation citing lack of financial information',
          observation: 'Statutory auditor resigned prior to FY audit completion.',
          signal: 'AUDITOR_RESIGNATION_SIGNAL',
          context: 'Critical governance failure.',
          severity: 'CRITICAL',
          status: 'MATERIAL_CONCERN',
          confidence: 95,
          materialityScore: 90,
          isPersistent: true,
          sourceIndependence: 'INDEPENDENT_EXTERNAL',
          supportingFactIds: [],
          supportingMetricIds: [],
          evidenceReferences: [],
          possibleExplanations: [],
          alternativeExplanations: [],
          investigationQuestions: [],
          requiresManagementClarification: true,
          requiresFurtherEvidence: false,
        },
      ],
    };

    const result = ForensicDecisionPolicyRegistry.evaluateForensicDecision(reportWithFraud);
    expect(result.adjustment.forensicState).toBe('CRITICAL_OVERRIDE');
    expect(result.adjustment.confidenceCap).toBe(10.0); // 10/10 decision certainty to avoid
    expect(result.activeBlockers.length).toBe(1);
    expect(result.activeBlockers[0].type).toBe('CRITICAL_FORENSIC');
  });
});
