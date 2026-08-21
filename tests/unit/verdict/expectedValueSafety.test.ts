import { describe, it, expect } from 'vitest';
import { VerdictMasterEngine } from '../../../src/domain/verdict/VerdictMasterEngine';
import { createResearchProject } from '../../../src/domain/models/ResearchProject';
import { createCompanyEntity } from '../../../src/domain/models/Company';

describe('Phase 14 — Expected Value Anti-Hallucination & Gating', () => {
  const company = createCompanyEntity({
    legalName: 'Tata Motors Limited',
    displayName: 'Tata Motors',
    symbol: 'TATAMOTORS',
    exchange: 'NSE',
    isin: 'INE155A01022',
    sector: 'Automobile',
    subsector: 'Passenger Vehicles (PV)',
    marketCapCategory: 'LARGE_CAP',
  });

  it('gates Expected Scenario Value when probabilities are placeholders', () => {
    const project = createResearchProject({ company });
    project.scenarioAnalysis = {
      projectId: project.id,
      companySymbol: 'TATAMOTORS',
      asOfDate: '2024-03-31',
      generatedAt: new Date().toISOString(),
      overallModelConfidence: 'HIGH',
      reconciliationAudit: {
        isFullyReconciled: true,
        brokenLinkCount: 0,
        flags: [],
      },
      comparison: {} as any,
      twoWaySensitivity: {} as any,
      scenarios: {
        BEAR: { scenarioType: 'BEAR', scenarioTitle: 'Bear Case', narrative: 'Slowdown', revenueCagr: 5, ebitMargin: 6, taxRate: 25, capexIntensity: 5, workingCapitalCycleDays: 35, valuationMultiple: 8, terminalGrowthRate: 3.5, wacc: 12, impliedFairValuePerShare: 750, projectedStatements: [], assumptionLineage: [], probabilityAllocation: { probabilityPercent: 25, rationale: 'Standard distribution', confidence: 50, isDisplayPlaceholder: true, historicalPrecedentFrequency: 0.25 } },
        BASE: { scenarioType: 'BASE', scenarioTitle: 'Base Case', narrative: 'Consolidation', revenueCagr: 10, ebitMargin: 8.5, taxRate: 25, capexIntensity: 4.5, workingCapitalCycleDays: 30, valuationMultiple: 12, terminalGrowthRate: 5, wacc: 11.5, impliedFairValuePerShare: 1100, projectedStatements: [], assumptionLineage: [], probabilityAllocation: { probabilityPercent: 50, rationale: 'Standard distribution', confidence: 50, isDisplayPlaceholder: true, historicalPrecedentFrequency: 0.50 } },
        BULL: { scenarioType: 'BULL', scenarioTitle: 'Bull Case', narrative: 'Expansion', revenueCagr: 15, ebitMargin: 10.5, taxRate: 25, capexIntensity: 4, workingCapitalCycleDays: 25, valuationMultiple: 15, terminalGrowthRate: 5.5, wacc: 11, impliedFairValuePerShare: 1450, projectedStatements: [], assumptionLineage: [], probabilityAllocation: { probabilityPercent: 25, rationale: 'Standard distribution', confidence: 50, isDisplayPlaceholder: true, historicalPrecedentFrequency: 0.25 } },
      } as any,
    };

    const report = VerdictMasterEngine.generateVerdictReport(project);
    expect(report.scenarios.areProbabilitiesPlaceholders).toBe(true);
    expect(report.scenarios.expectedValueStatus).toBe('EXPECTED_VALUE_NOT_ASSESSABLE');
    expect(report.scenarios.expectedScenarioValue).toBeNull();
  });
});
