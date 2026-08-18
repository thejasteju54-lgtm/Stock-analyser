import { describe, it, expect } from 'vitest';
import { ManagementDnaEngine } from '../../src/domain/management/ManagementDnaEngine';

describe('Phase 8 — Anti-Hallucination & Analytical Boundary Guardrails', () => {
  it('does not invent numerical guidance from vague qualitative commentary', () => {
    const vagueStatement = {
      statementId: 'stmt_vague',
      companyId: 'TESTCORP',
      companySymbol: 'TESTCORP',
      managementPerson: 'CEO',
      role: 'CEO',
      statementDate: 'May 2023',
      periodReferenced: 'FY24',
      sourceDocumentId: 'doc_ar.pdf',
      pageId: 'page_10',
      pageNumber: 10,
      sourceType: 'ANNUAL_REPORT_MDA' as const,
      section: 'MD&A',
      rawStatement: 'We remain optimistic about our long-term growth trajectory and market share expansion.',
      normalizedClaim: 'Optimistic about growth trajectory',
      claimCategory: 'OTHER' as const,
      claimStrength: 'GENERAL_COMMENTARY' as const,
      certaintyLevel: 'NON_COMMITTAL' as const,
      confidence: 90,
      evidenceReference: {
        documentId: 'doc_ar.pdf',
        documentName: 'doc_ar.pdf',
        pageNumber: 10,
        sourceType: 'PRIMARY_AUDITED_FILING' as const,
        confidence: 90,
      },
    };

    const commitments = ManagementDnaEngine.evaluateCommitmentOutcomes([vagueStatement], [], [], 'FY24', 'FY23');
    // Non-guidance commentary is not converted into an artificial numerical commitment
    expect(commitments.length).toBe(0);
  });

  it('report output contains mandatory methodology disclaimer and zero investment advice', () => {
    const report = ManagementDnaEngine.analyze('proj_1', 'TATAMOTORS', [], [], [], null, 'FY24', 'FY23');
    expect(report.disclaimer).toBeDefined();
    expect(report.disclaimer).toContain('does not constitute an investment recommendation');
    expect(report.disclaimer).toContain('BUY/HOLD/AVOID');
  });

  it('preserves stable pageId on all verified management statements', () => {
    const report = ManagementDnaEngine.analyze('proj_1', 'TATAMOTORS', [], [], [], null, 'FY24', 'FY23');
    for (const stmt of report.statements) {
      expect(stmt.pageId).toBeDefined();
      expect(stmt.pageId.length).toBeGreaterThan(0);
      expect(stmt.sourceDocumentId).toBeDefined();
    }
  });
});
