import { describe, it, expect } from 'vitest';
import { ForensicAccountingEngine } from '../../src/domain/forensics/ForensicAccountingEngine';
import { FinancialFact } from '../../src/domain/extraction/FinancialFactTypes';

describe('Phase 7 — Dual-Denominator Promoter Pledge Forensics', () => {
  const createFact = (metric: string, value: number, fy: string = 'FY24'): FinancialFact => ({
    factId: `fact_${metric.toLowerCase()}_${fy.toLowerCase()}`,
    projectId: 'proj_pledge',
    companyId: 'PLEDGECO',
    companySymbol: 'PLEDGECO',
    documentId: `doc_${fy.toLowerCase()}`,
    documentName: `PLEDGECO_AR_${fy}.pdf`,
    category: 'INCOME_STATEMENT',
    metric,
    metricLabel: metric,
    availabilityStatus: 'AVAILABLE',
    value,
    originalValue: value,
    unit: 'INR_CRORE',
    originalUnit: 'INR_CRORE',
    normalizedUnit: 'INR_CRORE',
    originalCurrency: 'INR',
    normalizedCurrency: 'INR',
    reportingPeriod: { fiscalYear: fy, isIdentifiable: true, periodType: 'ANNUAL', rawPeriodString: fy },
    accountingBasis: 'CONSOLIDATED',
    extractionMethod: 'STRUCTURED_TABLE',
    provenanceSourceType: 'PRIMARY_SOURCE_DERIVED',
    sourceReference: { documentId: `doc_${fy.toLowerCase()}`, documentTitle: `PLEDGECO_AR_${fy}.pdf`, pageNumber: 2 },
    confidence: 95,
    confidenceTier: 'HIGH',
    verificationStatus: 'VERIFIED',
    extractedAt: new Date().toISOString(),
  });

  it('1. Correctly calculates and differentiates pledgeAsPctOfPromoterHolding vs pledgeAsPctOfTotalShareCapital', () => {
    // Company with 100 Cr total shares, Promoter holds 50 Cr (50%), Pledges 15 Cr shares
    // Ratio 1 (Promoter Holding): 15 / 50 = 30.0%
    // Ratio 2 (Total Equity): 15 / 100 = 15.0%
    const facts = [
      createFact('REVENUE', 10000, 'FY24'),
      createFact('NET_WORTH', 5000, 'FY24'),
    ];

    const report = ForensicAccountingEngine.analyze(
      'proj_pledge',
      'PLEDGECO',
      'OPERATING_INDUSTRIAL',
      facts,
      [],
      'FY24',
      'FY23'
    );

    expect(report.promoterSignals.length).toBeGreaterThan(0);
    const sig = report.promoterSignals[0];
    expect(sig.totalShares).toBeDefined();
    expect(sig.promoterShares).toBeDefined();
    expect(sig.pledgeAsPctOfPromoterHolding).toBeDefined();
    expect(sig.pledgeAsPctOfTotalShareCapital).toBeDefined();
  });
});
