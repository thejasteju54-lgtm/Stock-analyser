import { describe, it, expect } from 'vitest';
import { CatalystRiskMasterEngine } from '../../src/domain/risks/CatalystRiskMasterEngine';
import { ResearchProject, createResearchProject } from '../../src/domain/models/ResearchProject';
import { createCompanyEntity } from '../../src/domain/models/Company';

describe('Phase 12 — Strict Non-Mutation Gate Tests (Phases 5–11)', () => {
  it('guarantees zero mutation of previous analytical layers when executing catalyst and risk engine', () => {
    const mockCompany = createCompanyEntity({
      legalName: 'Tata Motors Limited',
      displayName: 'Tata Motors',
      symbol: 'TATAMOTORS',
      exchange: 'NSE',
      sector: 'Automobile',
      subsector: 'Commercial Vehicles (CV)',
    });

    const project: ResearchProject = createResearchProject({ company: mockCompany });

    // Populate mock data from previous phases
    project.forensicAnalysis = {
      analysisId: 'fa_test',
      projectId: project.id,
      companyId: project.company.id,
      companySymbol: project.company.symbol,
      businessModelCode: 'MANUFACTURING',
      analysisVersion: '1.0',
      methodologyVersion: '1.0',
      generatedAt: new Date().toISOString(),
      overallForensicRiskScore: 25,
      overallForensicRisk: 'LOW',
      confidence: 'HIGH',
      dataCompleteness: 100,
      isAssessable: true,
      findings: [
        {
          findingId: 'find_1',
          category: 'CONTINGENT_LIABILITIES',
          categoryName: 'Contingent Liabilities',
          title: 'Tax Dispute Contingent Liability',
          observation: 'Disputed excise assessment under appeal.',
          signal: 'TAX_DISPUTE_SIGNAL',
          context: 'Appeals pending at tribunal',
          materialityScore: 15,
          isPersistent: false,
          sourceIndependence: 'SINGLE_SOURCE',
          status: 'MATERIAL_CONCERN',
          severity: 'HIGH',
          supportingFactIds: [],
          supportingMetricIds: [],
          possibleExplanations: [],
          alternativeExplanations: [],
          investigationQuestions: [],
          requiresManagementClarification: false,
          requiresFurtherEvidence: false,
          evidenceReferences: [
            {
              documentId: 'doc_1',
              documentName: 'Annual Report FY24',
              pageNumber: 32,
              sourceType: 'PRIMARY_AUDITED_FILING',
              confidence: 85,
            },
          ],
          confidence: 85,
        },
      ],
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

    project.managementAnalysis = {
      analysisId: 'mgmt_test',
      projectId: project.id,
      companyId: project.company.id,
      companySymbol: project.company.symbol,
      analysisVersion: '1.0',
      methodologyVersion: '1.0',
      generatedAt: new Date().toISOString(),
      statements: [],
      commitments: [],
      guidanceRevisions: [],
      languageShifts: [],
      dataTensions: [],
      contradictions: [],
      credibilityAssessment: {
        credibilityScore: 82,
        ratingTier: 'HIGH',
        definitionNotice: 'Historical guidance tracking',
        isAssessable: true,
        totalEligibleCommitments: 5,
        minimumRequiredCommitments: 3,
        categoryScores: [],
        achievedCount: 4,
        aboveGuidanceCount: 0,
        partiallyAchievedCount: 0,
        missedCount: 1,
        missedDueToExternalFactorsCount: 0,
        revisedCount: 0,
        withdrawnCount: 0,
        unverifiableCount: 0,
        scoringMethodologyNotes: [],
      },
      dnaProfile: {
        companySymbol: project.company.symbol,
        dimensions: [],
        strengths: [],
        watchItems: [],
        monitoringChecklistForFutureDisclosures: [],
      },
      evidenceReferences: [],
      limitations: [],
      disclaimer: '',
    };

    const snapshotBefore = JSON.stringify({
      forensics: project.forensicAnalysis,
      management: project.managementAnalysis,
    });

    const report = CatalystRiskMasterEngine.execute(project);

    const snapshotAfter = JSON.stringify({
      forensics: project.forensicAnalysis,
      management: project.managementAnalysis,
    });

    // Check report generated
    expect(report.risks.length).toBeGreaterThan(0);
    expect(report.catalysts.length).toBeGreaterThan(0);
    expect(report.thesisBreakers.length).toBeGreaterThan(0);

    // Verify snapshot unchanged (ZERO MUTATION)
    expect(snapshotBefore).toBe(snapshotAfter);
  });
});
