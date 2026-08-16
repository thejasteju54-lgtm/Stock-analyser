import { describe, it, expect } from 'vitest';
import { PeriodDetector } from '../../src/domain/ingestion/PeriodDetector';

describe('Phase 3 — Deterministic Period Detector & Company Verification', () => {
  it('extracts standard fiscal year formats (FY24, FY2024, AR24, 2024)', () => {
    const p1 = PeriodDetector.detectPeriod('TataMotors_AR_FY24.pdf');
    expect(p1.isIdentifiable).toBe(true);
    expect(p1.fiscalYear).toBe('FY24');
    expect(p1.periodType).toBe('ANNUAL');

    const p2 = PeriodDetector.detectPeriod('HDFC_Annual_Report_2023.pdf');
    expect(p2.isIdentifiable).toBe(true);
    expect(p2.fiscalYear).toBe('FY23');

    const p3 = PeriodDetector.detectPeriod('Infosys_Integrated_Report_2023-24.pdf');
    expect(p3.isIdentifiable).toBe(true);
    expect(p3.fiscalYear).toBe('FY24');
  });

  it('extracts quarterly reporting periods (Q1FY25, Q3_2024)', () => {
    const q1 = PeriodDetector.detectPeriod('Reliance_Q3FY24_Results.pdf');
    expect(q1.isIdentifiable).toBe(true);
    expect(q1.quarter).toBe('Q3');
    expect(q1.fiscalYear).toBe('FY24');
    expect(q1.periodType).toBe('QUARTERLY');

    const q2 = PeriodDetector.detectPeriod('TCS_Q1_2025_Concall.pdf');
    expect(q2.isIdentifiable).toBe(true);
    expect(q2.quarter).toBe('Q1');
    expect(q2.fiscalYear).toBe('FY25');
  });

  it('flags unidentifiable period without guessing', () => {
    const unk = PeriodDetector.detectPeriod('random_document_scan.pdf');
    expect(unk.isIdentifiable).toBe(false);
    expect(unk.fiscalYear).toBeUndefined();
    expect(unk.periodType).toBe('OTHER');
  });

  it('verifies company identity consistency against target symbol and legal name', () => {
    const validVerification = PeriodDetector.verifyCompanyConsistency({
      filename: 'TATAMOTORS_Annual_Report_FY24.pdf',
      textSample: 'Tata Motors Limited Board of Directors Report',
      targetSymbol: 'TATAMOTORS',
      targetLegalName: 'Tata Motors Limited',
    });
    expect(validVerification.isConsistent).toBe(true);

    const mismatchVerification = PeriodDetector.verifyCompanyConsistency({
      filename: 'INFY_Annual_Report_FY24.pdf',
      textSample: 'Infosys Limited Annual Report audited financial statements with long sample content',
      targetSymbol: 'TATAMOTORS',
      targetLegalName: 'Tata Motors Limited',
    });
    expect(mismatchVerification.isConsistent).toBe(false);
  });
});
