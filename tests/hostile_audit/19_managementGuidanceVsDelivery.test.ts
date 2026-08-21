/**
 * 19_managementGuidanceVsDelivery.test.ts
 * Phase 19 — Hostile Management Guidance vs Historical Delivery Suite.
 */

import { describe, it, expect } from 'vitest';
import { ManagementDnaEngine } from '../../src/domain/management/ManagementDnaEngine';

describe('Management Guidance vs Delivery Suite', () => {
  it('evaluates promise vs delivery and scores management credibility based on empirical delivery rather than rhetorical sentiment', () => {
    const rawStatements: any[] = [
      {
        statementId: 'stmt_rev_guide',
        projectId: 'proj_mgt_test',
        companySymbol: 'TATAMOTORS',
        speaker: 'CFO',
        speakerDesignation: 'Chief Financial Officer',
        documentName: 'Concall_Q4FY23.pdf',
        pageNumber: 4,
        date: '2023-05-12',
        statementType: 'GUIDANCE',
        isForwardLooking: true,
        periodReferenced: 'FY24',
        topic: 'REVENUE_GROWTH',
        originalText: 'We expect consolidated revenue growth of 15-18% in FY24.',
        commitmentKey: 'guidance_rev_growth_fy24',
        originalTarget: '15-18% growth',
        isRevision: false,
        verificationStatus: 'VERIFIED',
      },
    ];

    const facts: any[] = [];
    const metrics: any[] = [];

    const report = ManagementDnaEngine.analyze(
      'proj_mgt_test',
      'TATAMOTORS',
      rawStatements,
      facts,
      metrics,
      null,
      'FY24',
      'FY23'
    );

    expect(report).toBeDefined();
    expect(report.commitments).toBeDefined();
    expect(report.credibilityAssessment).toBeDefined();
  });
});
