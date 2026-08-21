import { describe, it, expect } from 'vitest';
import { VerdictMasterEngine } from '../../../src/domain/verdict/VerdictMasterEngine';
import { createResearchProject } from '../../../src/domain/models/ResearchProject';
import { createCompanyEntity } from '../../../src/domain/models/Company';

describe('Phase 14 — VerdictMasterEngine Master Synthesis & Non-Mutation', () => {
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

  const project = createResearchProject({
    company,
    name: 'Tata Motors FY24 Deep Research',
  });

  // Attach mock upstream data from Phase 6, 8, 9, 12, 13
  project.fundamentalAnalysis = {
    analysisId: 'fa_1',
    projectId: project.id,
    companyId: company.isin || 'INE155A01022',
    companySymbol: 'TATAMOTORS',
    businessModelCode: 'NON_FINANCIAL_OPERATING',
    analysisVersion: '1.0.0',
    methodologyVersion: '1.0.0',
    isAssessable: true,
    dataCompleteness: 95,
    evidenceQuality: 88,
    analysisConfidence: 'HIGH',
    categoryScores: [],
    sections: [],
    redFlags: [],
    driverDecompositions: [],
    evidenceReferences: [],
    limitations: [],
    strengths: [{ strengthId: 's1', category: 'CASH_FLOW_QUALITY', title: 'Strong Cash Generation', description: 'CFO > PAT', supportingMetricIds: [], supportingFactIds: [], evidenceReferences: [], confidence: 90 }],
    watchItems: [{ watchItemId: 'w1', category: 'WORKING_CAPITAL', title: 'Inventory buffer', description: 'Monitor inventory', metricOrFact: 'Inventory', currentValue: '45d', historicalComparison: '42d', reasonForMonitoring: 'Supply chain', evidenceReferences: [], confidence: 80 }],
    generatedAt: new Date().toISOString(),
  };

  project.valuationAnalysis = {
    analysisId: 'va_1',
    projectId: project.id,
    companySymbol: 'TATAMOTORS',
    businessModel: 'NON_FINANCIAL_OPERATING',
    sector: 'Automobile',
    generatedAt: new Date().toISOString(),
    marketSnapshot: {
      currentPrice: 920.0,
      priceDate: new Date().toISOString().substring(0, 10),
      marketDataTimestamp: new Date().toISOString(),
      currency: 'INR',
      shareCapital: { basicShares: 334.8, dilutedShares: 335.0, weightedAverageShares: 334.8, faceValue: 2, effectiveDate: '2024-03-31', corporateActionAdjustments: [], source: 'BSE', confidence: 90 },
      evBridge: { marketCapitalization: 308000, plusTotalDebt: 60000, plusPreferredEquity: 0, plusMinorityInterest: 5000, lessCashAndEquivalents: 40000, lessLiquidInvestments: 5000, netDebt: 15000, enterpriseValue: 323000, formulaDescription: 'EV Bridge', accountingBasis: 'CONSOLIDATED', financialPeriod: 'FY24' },
      isStale: false,
      freshnessThresholdHours: 48,
      source: 'NSE Official Feed',
      confidence: 90,
    },
    relativeMultiples: [],
    historicalValuation: [],
    peerBenchmarking: { peers: [], peMedian: 18.5, evEbitdaMedian: 9.2, pbMedian: 3.4 },
    dcfModel: {
      scenarios: {
        BEAR: { scenarioName: 'BEAR', forecastYears: 5, revenueCagr: 5, terminalEbitMargin: 6, taxRate: 25, wacc: 12, terminalGrowthRate: 4, projectedCashFlows: [], pvCashFlows: 0, terminalValue: 0, pvTerminalValue: 0, enterpriseValue: 0, equityValue: 0, valuePerShare: 750, marginOfSafetyPercent: -18, upsideDownsidePercent: -18, assumptions: [] },
        BASE: { scenarioName: 'BASE', forecastYears: 5, revenueCagr: 11, terminalEbitMargin: 8.5, taxRate: 25, wacc: 11.5, terminalGrowthRate: 5, projectedCashFlows: [], pvCashFlows: 0, terminalValue: 0, pvTerminalValue: 0, enterpriseValue: 0, equityValue: 0, valuePerShare: 1120, marginOfSafetyPercent: 17.8, upsideDownsidePercent: 21.7, assumptions: [] },
        BULL: { scenarioName: 'BULL', forecastYears: 5, revenueCagr: 16, terminalEbitMargin: 10, taxRate: 25, wacc: 11, terminalGrowthRate: 5.5, projectedCashFlows: [], pvCashFlows: 0, terminalValue: 0, pvTerminalValue: 0, enterpriseValue: 0, equityValue: 0, valuePerShare: 1450, marginOfSafetyPercent: 36.5, upsideDownsidePercent: 57.6, assumptions: [] },
      },
      sensitivityMatrix: { waccRange: [], terminalGrowthRange: [], valuesPerShare: [], baseWaccIndex: 0, baseGrowthIndex: 0 },
      waccBridge: { costOfEquity: 12, costOfDebt: 8, taxRate: 25, wacc: 11.5 },
    },
    embeddedExpectations: { currentPrice: 920, solvedVariable: 'REVENUE_CAGR', impliedRevenueCagr: 8.5, impliedEbitMargin: 7.8, impliedRoce: 16.5, impliedFcf5YearSum: 45000, convergenceTolerance: 0.01, fixedAssumptions: {}, revenueGrowthComparison: 'WITHIN_HISTORICAL_RANGE', marginComparison: 'WITHIN_HISTORICAL_RANGE', diagnosticExplanation: 'Realistic embedded growth.' },
    forensicAdjustments: [],
    triangulation: { items: [], triangulatedBaseValuePerShare: 1120, intrinsicRange: { low: 750, base: 1120, high: 1450 } },
    marginOfSafety: { vsBearValuePercent: -18.5, vsBaseValuePercent: 17.8, vsBullValuePercent: 36.5, downsideToBearPercent: -18.5, upsideToBasePercent: 21.7, upsideToBullPercent: 57.6 },
    valuationPosition: 'DISCOUNT',
    valuationConfidenceScore: 85,
    disclaimers: [],
  };

  it('generates a complete InvestmentVerdictReport with all sub-assessments populated', () => {
    // Snapshot original project to verify non-mutation
    const originalStringified = JSON.stringify(project);

    const report = VerdictMasterEngine.generateVerdictReport(project);

    expect(report.companySymbol).toBe('TATAMOTORS');
    expect(report.verdict).toBeDefined();
    expect(['BUY', 'HOLD', 'AVOID', 'DECISION_NOT_ASSESSABLE']).toContain(report.verdict);
    expect(report.convictionScore).toBeGreaterThanOrEqual(0.0);
    expect(report.convictionScore).toBeLessThanOrEqual(10.0);
    expect(report.decisionConfidenceScore).toBeGreaterThanOrEqual(0.0);
    expect(report.decisionConfidenceScore).toBeLessThanOrEqual(10.0);
    expect(report.oneLineVerdict.length).toBeGreaterThan(10);

    // Check Sub-assessments
    expect(report.valuationAssessment.marginOfSafety.status).toBeDefined();
    expect(report.valuationAssessment.interestingPrice.displayRange).toBeDefined();
    expect(report.businessQuality.businessQualityScore).toBeGreaterThan(0);
    expect(report.forensics.forensicState).toBeDefined();
    expect(report.scenarios.bearValuation).toBeDefined();
    expect(report.topCatalysts).toBeDefined();
    expect(report.topRisks).toBeDefined();
    expect(report.thesisBreakers.overallBreakerState).toBeDefined();
    expect(report.auditTrail.snapshot.snapshotId).toBeDefined();

    // Verify Non-Mutation Invariant
    expect(JSON.stringify(project)).toBe(originalStringified);
  });
});
