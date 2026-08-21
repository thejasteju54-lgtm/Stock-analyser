/**
 * ResearchDocumentRequirementPolicy.ts
 * Phase 15 — Sector- and Archetype-Aware Document Requirement Policies.
 */

import { EconomicArchetype } from '../taxonomy/BusinessModelRegistry';
import { IngestedDocument } from '../ingestion/DocumentTypes';
import { DocumentRequirementRule, ProjectDocumentRequirementStatus } from './DocumentRequirementTypes';

export class ResearchDocumentRequirementPolicy {
  public static readonly DEFAULT_RULES: DocumentRequirementRule[] = [
    {
      documentType: 'ANNUAL_REPORT',
      tier: 'REQUIRED',
      minimumCount: 2,
      periodCoverageYears: 2,
      description: 'Minimum 2 consecutive years of audited statutory annual reports',
      applicableArchetypes: [
        'OPERATING_INDUSTRIAL',
        'LENDING_FINANCIAL',
        'NON_LENDING_FINANCIAL',
        'UTILITY_REGULATED',
        'INFRASTRUCTURE_TRUST',
        'CONGLOMERATE',
      ],
    },
    {
      documentType: 'FINANCIAL_STATEMENTS',
      tier: 'REQUIRED',
      minimumCount: 1,
      periodCoverageYears: 1,
      description: 'Audited balance sheet, P&L, and cash flow statements with schedules',
      applicableArchetypes: [
        'OPERATING_INDUSTRIAL',
        'LENDING_FINANCIAL',
        'NON_LENDING_FINANCIAL',
        'UTILITY_REGULATED',
        'INFRASTRUCTURE_TRUST',
        'CONGLOMERATE',
      ],
    },
    {
      documentType: 'MDA',
      tier: 'RECOMMENDED',
      minimumCount: 1,
      periodCoverageYears: 1,
      description: 'Management Discussion & Analysis section from annual report',
      applicableArchetypes: [
        'OPERATING_INDUSTRIAL',
        'LENDING_FINANCIAL',
        'NON_LENDING_FINANCIAL',
        'UTILITY_REGULATED',
        'INFRASTRUCTURE_TRUST',
        'CONGLOMERATE',
      ],
    },
    {
      documentType: 'CONCALL_TRANSCRIPT',
      tier: 'RECOMMENDED',
      minimumCount: 2,
      periodCoverageYears: 1,
      description: 'Quarterly earnings conference call transcripts for guidance tracking',
      applicableArchetypes: [
        'OPERATING_INDUSTRIAL',
        'LENDING_FINANCIAL',
        'NON_LENDING_FINANCIAL',
        'CONGLOMERATE',
      ],
    },
    {
      documentType: 'SHAREHOLDING_PATTERN',
      tier: 'REQUIRED',
      minimumCount: 1,
      periodCoverageYears: 1,
      description: 'Latest quarterly shareholding pattern with promoter pledge details',
      applicableArchetypes: [
        'OPERATING_INDUSTRIAL',
        'LENDING_FINANCIAL',
        'NON_LENDING_FINANCIAL',
        'UTILITY_REGULATED',
        'INFRASTRUCTURE_TRUST',
        'CONGLOMERATE',
      ],
    },
    {
      documentType: 'SCREENER_SCREENSHOT',
      tier: 'OPTIONAL',
      minimumCount: 0,
      periodCoverageYears: 0,
      description: 'Financial snapshot from Screener.in or verified database',
      applicableArchetypes: [
        'OPERATING_INDUSTRIAL',
        'LENDING_FINANCIAL',
        'NON_LENDING_FINANCIAL',
        'UTILITY_REGULATED',
        'INFRASTRUCTURE_TRUST',
        'CONGLOMERATE',
      ],
    },
    {
      documentType: 'TECHNICAL_CHART',
      tier: 'OPTIONAL',
      minimumCount: 0,
      periodCoverageYears: 0,
      description: 'Multi-timeframe candlestick chart screenshot or price series',
      applicableArchetypes: [
        'OPERATING_INDUSTRIAL',
        'LENDING_FINANCIAL',
        'NON_LENDING_FINANCIAL',
        'UTILITY_REGULATED',
        'INFRASTRUCTURE_TRUST',
        'CONGLOMERATE',
      ],
    },
    {
      documentType: 'INVESTOR_PRESENTATION',
      tier: 'RECOMMENDED',
      minimumCount: 1,
      periodCoverageYears: 1,
      description: 'Investor corporate presentation for segment breakdown & strategy',
      applicableArchetypes: [
        'OPERATING_INDUSTRIAL',
        'LENDING_FINANCIAL',
        'NON_LENDING_FINANCIAL',
        'UTILITY_REGULATED',
        'INFRASTRUCTURE_TRUST',
        'CONGLOMERATE',
      ],
    },
  ];

  /**
   * Evaluates document requirement statuses for a project given its archetype and uploaded documents.
   */
  public static evaluateRequirements(
    archetype: EconomicArchetype,
    documents: IngestedDocument[]
  ): ProjectDocumentRequirementStatus[] {
    const rules = this.DEFAULT_RULES.filter((r) => r.applicableArchetypes.includes(archetype));

    return rules.map((rule) => {
      const matchingDocs = documents.filter((d) => d.documentType === rule.documentType);
      const availableCount = matchingDocs.length;
      const isSatisfied = availableCount >= rule.minimumCount;

      let statusText = `${availableCount}/${rule.minimumCount} available`;
      if (rule.tier === 'REQUIRED' && !isSatisfied) {
        statusText = `MISSING REQUIRED (${availableCount}/${rule.minimumCount})`;
      } else if (isSatisfied) {
        statusText = 'SATISFIED';
      }

      return {
        documentType: rule.documentType,
        tier: rule.tier,
        minimumCount: rule.minimumCount,
        availableCount,
        isSatisfied,
        statusText,
      };
    });
  }
}
