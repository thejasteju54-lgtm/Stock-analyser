import { describe, it, expect } from 'vitest';
import { ManagementDnaEngine } from '../../src/domain/management/ManagementDnaEngine';

describe('Phase 8 — Management Commentary vs Financial Data Tension', () => {
  it('detects narrative tension when forensic finding conflicts with commentary', () => {
    const metrics: any[] = [
      {
        metricId: 'calc_rec_days',
        metricCode: 'RECEIVABLE_DAYS',
        metricName: 'Receivable Days',
        category: 'WORKING_CAPITAL',
        period: 'FY24',
        value: 35,
        unit: 'DAYS',
        formula: 'Receivables / Revenue * 365',
        inputFactIds: [],
        confidence: 95,
        calculatedAt: new Date().toISOString(),
      },
    ];

    const forensicReport: any = {
      analysisId: 'forensic_test',
      projectId: 'proj_test',
      companyId: 'TESTCORP',
      companySymbol: 'TESTCORP',
      analysisVersion: 'v1',
      methodologyVersion: 'v1',
      generatedAt: new Date().toISOString(),
      overallForensicSeverity: 'MODERATE_RISK',
      totalRedFlagsCount: 1,
      criticalFlagsCount: 0,
      moderateFlagsCount: 1,
      lowFlagsCount: 0,
      findings: [
        {
          findingId: 'f1',
          category: 'REVENUE_QUALITY',
          severity: 'MEDIUM',
          confidence: 95,
          metricCode: 'RECEIVABLE_VS_REVENUE_GROWTH',
          metricName: 'Receivable Growth Divergence',
          calculatedValue: 2.1,
          thresholdBenchmark: 'Receivables growing faster than top-line',
          observationText: 'Receivables grew 2.1x faster than revenues',
          riskImplication: 'Working capital elongation',
          requiresFurtherInvestigation: true,
          evidenceReferences: [],
          ruleId: 'REV_01',
        },
      ],
      promoterPledgeSignals: [],
      contingentLiabilityAssessments: [],
      relatedPartyAssessments: [],
      beneishMScore: { mScore: -2.5, earningsManipulationRisk: 'LOW_RISK', isApplicable: true, uncalculatedVariables: [], notes: '' },
      altmanZScore: { zScore: 3.2, distressZone: 'SAFE_ZONE', isApplicable: true, uncalculatedVariables: [], notes: '' },
      crossStatementChecks: [],
      recommendations: [],
      dataQualityLimitations: [],
      sourceIndependenceNotes: '',
    };

    const tensions = ManagementDnaEngine.evaluateManagementDataTensions([], [], metrics, forensicReport, 'FY24');
    expect(tensions.length).toBe(1);
    expect(tensions[0].status).toBe('TENSION');
    expect(tensions[0].isComparabilityVerified).toBe(true);
    expect(tensions[0].requiresManagementClarification).toBe(true);
    expect(tensions[0].financialMetricCode).toBe('RECEIVABLE_DAYS');
  });

  it('returns empty tensions when no forensic contradictions exist', () => {
    const tensions = ManagementDnaEngine.evaluateManagementDataTensions([], [], [], null, 'FY24');
    expect(tensions.length).toBe(0);
  });
});
