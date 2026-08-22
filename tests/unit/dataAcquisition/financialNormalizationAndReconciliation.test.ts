import { describe, it, expect } from 'vitest';
import { FinancialDataNormalizer } from '../../../src/domain/dataAcquisition/FinancialDataNormalizer';
import { CrossSourceReconciliationEngine } from '../../../src/domain/dataAcquisition/CrossSourceReconciliationEngine';
import { NormalizedFinancialStatementItem } from '../../../src/infrastructure/researchSources/SourceAdapterTypes';

describe('Phase 21 — Financial Normalization & Cross-Source Reconciliation', () => {
  it('converts Lakhs, Millions, and Raw Rupees accurately to Standard INR Crores', () => {
    expect(FinancialDataNormalizer.normalizeToCrores(10000, 'INR_LAKH')).toBe(100);
    expect(FinancialDataNormalizer.normalizeToCrores(500, 'INR_MILLION')).toBe(50);
    expect(FinancialDataNormalizer.normalizeToCrores(100000000, 'INR_RAW')).toBe(10);
    expect(FinancialDataNormalizer.normalizeToCrores(250, 'INR_CR')).toBe(250);
  });

  it('detects incompatible reporting basis comparisons', () => {
    const itemA: NormalizedFinancialStatementItem = {
      metricKey: 'REVENUE',
      displayName: 'Revenue',
      value: 20000,
      unit: 'INR_CR',
      scale: 1,
      periodLabel: 'FY24',
      periodStart: '2023-04-01',
      periodEnd: '2024-03-31',
      fiscalYear: 2024,
      periodType: 'ANNUAL',
      reportingBasis: 'CONSOLIDATED',
      restatementStatus: 'ORIGINAL_AS_REPORTED',
      sourceTier: 1,
      sourceId: 'src_a',
      observationDate: '2024-03-31',
      publicationDate: '2024-05-29',
    };

    const itemB: NormalizedFinancialStatementItem = {
      ...itemA,
      reportingBasis: 'STANDALONE',
      sourceId: 'src_b',
    };

    const comp = FinancialDataNormalizer.validateCompatibility(itemA, itemB);
    expect(comp.isCompatible).toBe(false);
    expect(comp.warning).toContain('INCOMPATIBLE_BASIS');
  });

  it('marks corroboration when independent sources agree', () => {
    const item1: NormalizedFinancialStatementItem = {
      metricKey: 'REVENUE',
      displayName: 'Revenue',
      value: 20268,
      unit: 'INR_CR',
      scale: 1,
      periodLabel: 'FY24',
      periodStart: '2023-04-01',
      periodEnd: '2024-03-31',
      fiscalYear: 2024,
      periodType: 'ANNUAL',
      reportingBasis: 'CONSOLIDATED',
      restatementStatus: 'ORIGINAL_AS_REPORTED',
      sourceTier: 1,
      sourceId: 'nse_official',
      observationDate: '2024-03-31',
      publicationDate: '2024-05-29',
    };

    const item2: NormalizedFinancialStatementItem = {
      ...item1,
      sourceTier: 3,
      sourceId: 'screener_in',
    };

    const rec = CrossSourceReconciliationEngine.reconcileMetric([item1, item2]);
    expect(rec.status).toBe('CORROBORATED');
    expect(rec.reconciledValue).toBe(20268);
    expect(rec.authoritativeSourceTier).toBe(1);
  });

  it('flags SOURCE_CONFLICT when same-basis numbers differ', () => {
    const item1: NormalizedFinancialStatementItem = {
      metricKey: 'REVENUE',
      displayName: 'Revenue',
      value: 20268,
      unit: 'INR_CR',
      scale: 1,
      periodLabel: 'FY24',
      periodStart: '2023-04-01',
      periodEnd: '2024-03-31',
      fiscalYear: 2024,
      periodType: 'ANNUAL',
      reportingBasis: 'CONSOLIDATED',
      restatementStatus: 'ORIGINAL_AS_REPORTED',
      sourceTier: 1,
      sourceId: 'nse_official',
      observationDate: '2024-03-31',
      publicationDate: '2024-05-29',
    };

    const item2: NormalizedFinancialStatementItem = {
      ...item1,
      value: 19500, // Discrepancy
      sourceTier: 3,
      sourceId: 'unverified_media',
    };

    const rec = CrossSourceReconciliationEngine.reconcileMetric([item1, item2]);
    expect(rec.status).toBe('SOURCE_CONFLICT');
    expect(rec.deltaAmount).toBe(768);
    expect(rec.reconciledValue).toBe(20268); // Prioritizes Tier 1
  });
});
