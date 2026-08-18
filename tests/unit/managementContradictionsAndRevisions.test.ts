import { describe, it, expect } from 'vitest';
import { ManagementCommitment } from '../../src/domain/management/ManagementDnaTypes';
import { ManagementDnaEngine } from '../../src/domain/management/ManagementDnaEngine';

describe('Phase 8 — Guidance Revision & Contradiction Preservation', () => {
  it('preserves original guidance and tracks subsequent revisions in history without overwrite', () => {
    const revisedCommitment: ManagementCommitment = {
      commitmentId: 'cmt_rev_test',
      statementId: 'stmt_orig',
      companyId: 'TESTCORP',
      managementPerson: 'CFO',
      commitmentType: 'MARGIN_OUTLOOK',
      commitmentText: 'Initial guidance: Consolidated EBITDA margin of 12–14% for FY24.',
      originalGuidanceText: 'Consolidated EBITDA margin of 12–14% for FY24.',
      targetMetric: 'EBITDA Margin',
      targetPeriod: 'FY24',
      commitmentStrength: 'QUANTIFIED_GUIDANCE',
      certaintyLevel: 'HIGH_CERTAINTY',
      materiality: 'HIGH',
      materialityWeight: 4,
      status: 'REVISED',
      isRevised: true,
      outcomeAttribution: 'EXTERNAL_FACTOR',
      reasonCodes: ['COMMODITY_CHANGE'],
      reasonVerificationStatus: 'SUPPORTED',
      revisedGuidanceHistory: [
        {
          revisionId: 'rev_entry_1',
          revisionDate: 'Nov 2023 (Q2 FY24 Call)',
          revisedPeriod: 'FY24',
          revisedRange: { min: 10, max: 11, unit: 'PERCENT' },
          revisedText: 'Revised downwards to 10–11% due to unprecedented steel price inflation.',
          managementStatedReason: 'Steel price surge',
          reasonCodes: ['COMMODITY_CHANGE'],
          reasonVerificationStatus: 'SUPPORTED',
          sourceDocumentId: 'concall_q2fy24.pdf',
          pageNumber: 5,
        },
      ],
      outcomeMetricIds: [],
      outcomeFactIds: [],
      evidenceReferences: [],
      confidence: 95,
    };

    const revisions = ManagementDnaEngine.trackGuidanceRevisions([revisedCommitment]);
    expect(revisions.length).toBe(1);
    expect(revisions[0].revisedText).toContain('10–11%');
    expect(revisedCommitment.originalGuidanceText).toContain('12–14%');
  });
});
