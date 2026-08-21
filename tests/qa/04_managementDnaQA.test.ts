/**
 * 04_managementDnaQA.test.ts
 * QA Track: Management DNA, Credibility Scoring & Zero-Hallucination Fact/Claim Boundary.
 */

import { describe, it, expect } from 'vitest';
import { ManagementDnaEngine } from '../../src/domain/management/ManagementDnaEngine';
import { CandidateManagementStatement } from '../../src/domain/management/ManagementDnaTypes';

describe('Management DNA & Credibility QA', () => {
  it('strictly classifies management statements as claims/intentions without promoting to facts', () => {
    const rawStatements: CandidateManagementStatement[] = [
      {
        candidateId: 'stmt_1',
        rawText: 'We expect to achieve 25% revenue growth in FY25.',
        speaker: 'Managing Director',
        role: 'MD & CEO',
        sourceDocumentId: 'doc_concall_q4',
        sourceType: 'CONCALL_TRANSCRIPT',
        tentativeCategory: 'GUIDANCE',
        tentativeStrength: 'QUANTIFIED_GUIDANCE',
        confidence: 90,
      },
      {
        candidateId: 'stmt_2',
        rawText: 'We are committed to maintaining zero promoter pledge.',
        speaker: 'CFO',
        role: 'CFO',
        sourceDocumentId: 'doc_concall_q4',
        sourceType: 'CONCALL_TRANSCRIPT',
        tentativeCategory: 'TIMELINE_COMMITMENT',
        tentativeStrength: 'EXPLICIT_COMMITMENT',
        confidence: 95,
      },
    ];

    const report = ManagementDnaEngine.analyze(
      'proj_mgmt_qa',
      'TATAMOTORS',
      rawStatements,
      [],
      [],
      null
    );

    expect(report.statements.length).toBe(2);
    expect(report.statements[0].claimCategory).toBe('GUIDANCE');
    expect(report.statements[0].claimStrength).toBe('QUANTIFIED_GUIDANCE');
    expect(report.dnaProfile).toBeDefined();
    expect(report.credibilityAssessment).toBeDefined();
  });
});
