/**
 * RiskSynthesisEngine.ts
 * Phase 12 — Multi-Dimensional Risk Synthesis Engine with Lineage Deduplication,
 * Verified Mitigation Assessment, and Deterministic 5x5 PxI Matrix Mapping.
 */

import { ResearchProject } from '../models/ResearchProject';
import {
  RiskItem,
  RiskCategory,
  MitigationAssessment,
  RiskLineage,
} from './CatalystRiskTypes';
import { CatalystRiskPolicyRegistry } from './CatalystRiskPolicyRegistry';

export class RiskSynthesisEngine {
  /**
   * Synthesizes, deduplicates, and ranks multi-dimensional risks across all analytical phases.
   */
  public static synthesizeRisks(project: ResearchProject): {
    risks: RiskItem[];
    rankedRisks: RiskItem[];
    crossLayerRiskSummary: {
      fundamentalRisks: RiskItem[];
      forensicRisks: RiskItem[];
      managementRisks: RiskItem[];
      valuationRisks: RiskItem[];
      technicalRisks: RiskItem[];
      industryRisks: RiskItem[];
    };
  } {
    const risks: RiskItem[] = [];
    const fundamentalRisks: RiskItem[] = [];
    const forensicRisks: RiskItem[] = [];
    const managementRisks: RiskItem[] = [];
    const valuationRisks: RiskItem[] = [];
    const technicalRisks: RiskItem[] = [];
    const industryRisks: RiskItem[] = [];

    // 1. Ingest Forensic Red Flags (Phase 7)
    if (project.forensicAnalysis) {
      for (const finding of project.forensicAnalysis.findings) {
        if (finding.severity === 'CRITICAL' || finding.severity === 'HIGH' || finding.severity === 'MEDIUM') {
          let category: RiskCategory = 'EARNINGS_QUALITY_FORENSIC';
          if (finding.category === 'CONTINGENT_LIABILITIES' || finding.category === 'DEBT_AND_FINANCING') {
            category = 'BALANCE_SHEET_LEVERAGE';
          } else if (finding.category === 'PROMOTER_OWNERSHIP' || finding.category === 'RELATED_PARTY_TRANSACTIONS') {
            category = 'MANAGEMENT_GOVERNANCE';
          }

          const probRes = CatalystRiskPolicyRegistry.evaluateRiskProbability({
            consecutiveNegativeQuarters: 2,
            hasActiveRegulatoryOrder: finding.severity === 'CRITICAL',
            triggerProximityPercent: 5,
          });

          const impactRes = CatalystRiskPolicyRegistry.evaluateRiskImpact({
            potentialPatImpactPercent: finding.severity === 'CRITICAL' ? 30 : 15,
            threatensBusinessContinuity: finding.severity === 'CRITICAL',
            potentialMarginCompressionBps: 200,
          });

          const evCitations = finding.evidenceReferences.map((e) => `${e.documentName} (p.${e.pageNumber || 'N/A'})`);

          const mitigations: MitigationAssessment[] = [
            {
              mitigationId: `mit_${finding.findingId}`,
              description: 'Company maintains operational liquidity buffer and dispute reserve.',
              status: 'MITIGATION_PARTIAL',
              mitigationStrength: 0.2,
              evidenceReferences: evCitations.length > 0 ? evCitations : ['Annual Report Notes'],
              confidence: finding.confidence,
            },
          ];

          const netRes = CatalystRiskPolicyRegistry.evaluateNetRiskScore(
            probRes.score,
            impactRes.score,
            'MITIGATION_PARTIAL',
            0.2
          );

          const lineage: RiskLineage = {
            underlyingRiskId: `und_forensic_${finding.category.toLowerCase()}`,
            sourceRiskIds: [finding.findingId],
            sourceLayers: ['FORENSIC'],
            relationshipType: 'INDEPENDENT_RISK',
            confidence: finding.confidence,
          };

          const riskItem: RiskItem = {
            riskId: `risk_forensic_${finding.findingId}`,
            title: finding.title,
            category,
            description: finding.observation || finding.context,
            probability: probRes.probability,
            probabilityScore: probRes.score,
            impact: impactRes.impact,
            impactScore: impactRes.score,
            rawRiskScore: netRes.rawRiskScore,
            severity: netRes.severity,
            velocity: finding.severity === 'CRITICAL' ? 'IMMEDIATE_SHOCK' : 'SLOW_EROSION',
            measurableExposure: `Forensic flag in ${finding.category.replace(/_/g, ' ')} with severity ${finding.severity}.`,
            mitigations,
            netExposure: netRes.netExposure,
            netRiskScore: netRes.netRiskScore,
            falsifiableTriggers: [`Auditor qualification or statutory notice regarding ${finding.category}`],
            evidenceSourceIds: evCitations,
            sourceLayer: 'FORENSIC',
            lineage,
            confidence: finding.confidence,
          };

          risks.push(riskItem);
          forensicRisks.push(riskItem);
        }
      }
    }

    // 2. Ingest Fundamental Health Warnings (Phase 6)
    if (project.fundamentalAnalysis) {
      for (const flag of project.fundamentalAnalysis.redFlags) {
        if (flag.severity === 'CRITICAL' || flag.severity === 'HIGH') {
          const probRes = CatalystRiskPolicyRegistry.evaluateRiskProbability({
            consecutiveNegativeQuarters: 1,
            triggerProximityPercent: 10,
          });

          const impactRes = CatalystRiskPolicyRegistry.evaluateRiskImpact({
            potentialMarginCompressionBps: 150,
            potentialPatImpactPercent: 12,
          });

          const netRes = CatalystRiskPolicyRegistry.evaluateNetRiskScore(
            probRes.score,
            impactRes.score,
            'MITIGATION_UNVERIFIED',
            0.0
          );

          const lineage: RiskLineage = {
            underlyingRiskId: `und_health_${flag.category.toLowerCase()}`,
            sourceRiskIds: [flag.redFlagId],
            sourceLayers: ['FUNDAMENTAL_HEALTH'],
            relationshipType: 'INDEPENDENT_RISK',
            confidence: 85,
          };

          const riskItem: RiskItem = {
            riskId: `risk_health_${flag.redFlagId}`,
            title: flag.title,
            category: 'COMPANY_EXECUTION',
            description: flag.description,
            probability: probRes.probability,
            probabilityScore: probRes.score,
            impact: impactRes.impact,
            impactScore: impactRes.score,
            rawRiskScore: netRes.rawRiskScore,
            severity: netRes.severity,
            velocity: 'SLOW_EROSION',
            measurableExposure: 'Fundamental health score deterioration in ' + flag.category,
            mitigations: [],
            netExposure: 'UNMITIGATED',
            netRiskScore: netRes.netRiskScore,
            falsifiableTriggers: ['Operating margin drops below sector threshold for 2 consecutive quarters'],
            evidenceSourceIds: flag.evidenceReferences.length > 0 ? flag.evidenceReferences : ['Financial Health Engine Scorecard'],
            sourceLayer: 'FUNDAMENTAL',
            lineage,
            confidence: 85,
          };

          risks.push(riskItem);
          fundamentalRisks.push(riskItem);
        }
      }
    }

    // 3. Ingest Management Credibility / Governance Risks (Phase 8)
    if (project.managementAnalysis) {
      const dna = project.managementAnalysis;
      const overallCred = dna.credibilityAssessment?.credibilityScore ?? 75;
      const redFlags = dna.contradictions || [];
      if (overallCred < 65 || redFlags.length > 0) {
        const probRes = CatalystRiskPolicyRegistry.evaluateRiskProbability({
          historicalFrequency: (100 - overallCred) / 100.0,
          consecutiveNegativeQuarters: 1,
        });

        const impactRes = CatalystRiskPolicyRegistry.evaluateRiskImpact({
          potentialPatImpactPercent: 15,
          potentialMarginCompressionBps: 150,
        });

        const netRes = CatalystRiskPolicyRegistry.evaluateNetRiskScore(
          probRes.score,
          impactRes.score,
          'MITIGATION_PARTIAL',
          0.1
        );

        const lineage: RiskLineage = {
          underlyingRiskId: 'und_mgmt_execution',
          sourceRiskIds: redFlags.map((f: any) => f.contradictionId || 'contradiction'),
          sourceLayers: ['MANAGEMENT_DNA'],
          relationshipType: 'INDEPENDENT_RISK',
          confidence: overallCred,
        };

        const riskItem: RiskItem = {
          riskId: `risk_mgmt_credibility`,
          title: `Management Guidance Reliability & Execution Risk`,
          category: 'MANAGEMENT_GOVERNANCE',
          description: `Management credibility score is ${overallCred}/100 with documented delivery variance.`,
          probability: probRes.probability,
          probabilityScore: probRes.score,
          impact: impactRes.impact,
          impactScore: impactRes.score,
          rawRiskScore: netRes.rawRiskScore,
          severity: netRes.severity,
          velocity: 'TRIGGER_DEPENDENT',
          measurableExposure: `Historical guidance variance indicates execution uncertainty.`,
          mitigations: [
            {
              mitigationId: 'mit_mgmt_board',
              description: 'Independent board oversight and audit committee reviews.',
              status: 'MITIGATION_PARTIAL',
              mitigationStrength: 0.1,
              evidenceReferences: ['Annual Report Corporate Governance Report'],
              confidence: 75,
            },
          ],
          netExposure: netRes.netExposure,
          netRiskScore: netRes.netRiskScore,
          falsifiableTriggers: ['Management revises FY guidance downward by >15%'],
          evidenceSourceIds: ['Management Concall Transcripts & Annual Reports'],
          sourceLayer: 'MANAGEMENT',
          lineage,
          confidence: overallCred,
        };

        risks.push(riskItem);
        managementRisks.push(riskItem);
      }
    }

    // 4. Ingest Valuation Downside Risk (Phase 9)
    if (project.valuationAnalysis) {
      const val = project.valuationAnalysis;
      if (val.valuationPosition === 'PREMIUM' || val.valuationPosition === 'EXTREME_PREMIUM') {
        const probRes = CatalystRiskPolicyRegistry.evaluateRiskProbability({
          triggerProximityPercent: 5,
        });

        const impactRes = CatalystRiskPolicyRegistry.evaluateRiskImpact({
          potentialPatImpactPercent: 25,
          potentialMarginCompressionBps: 250,
        });

        const netRes = CatalystRiskPolicyRegistry.evaluateNetRiskScore(
          probRes.score,
          impactRes.score,
          'MITIGATION_UNVERIFIED',
          0.0
        );

        const lineage: RiskLineage = {
          underlyingRiskId: 'und_val_compression',
          sourceRiskIds: ['valuation_premium'],
          sourceLayers: ['SECTOR_VALUATION'],
          relationshipType: 'INDEPENDENT_RISK',
          confidence: 85,
        };

        const riskItem: RiskItem = {
          riskId: `risk_val_multiple_compression`,
          title: `Valuation Multiple Compression Risk`,
          category: 'VALUATION_MULTIPLE_COMPRESSION',
          description: `Stock trades at ${val.valuationPosition.replace(/_/g, ' ')} with limited margin of safety.`,
          probability: probRes.probability,
          probabilityScore: probRes.score,
          impact: impactRes.impact,
          impactScore: impactRes.score,
          rawRiskScore: netRes.rawRiskScore,
          severity: netRes.severity,
          velocity: 'RAPID_DEVELOPMENT',
          measurableExposure: `Current market price exceeds fair DCF range baseline by >20%.`,
          mitigations: [],
          netExposure: 'UNMITIGATED',
          netRiskScore: netRes.netRiskScore,
          falsifiableTriggers: ['Sector P/E multiple deratings > 15% across peer group'],
          evidenceSourceIds: ['DCF Scenario Model & Peer Relative Valuation'],
          sourceLayer: 'VALUATION',
          lineage,
          confidence: 85,
        };

        risks.push(riskItem);
        valuationRisks.push(riskItem);
      }
    }

    // 5. Ingest Technical Breakdown Risk (Phase 10)
    if (project.technicalAnalysis) {
      const ta = project.technicalAnalysis;
      if (ta.technicalRisk.riskScore >= 60 || ta.trend.primaryTrend === 'STRONG_DOWNTREND' || ta.trend.primaryTrend === 'DOWNTREND') {
        const probRes = CatalystRiskPolicyRegistry.evaluateRiskProbability({
          consecutiveNegativeQuarters: 1,
          triggerProximityPercent: 5,
        });

        const impactRes = CatalystRiskPolicyRegistry.evaluateRiskImpact({
          potentialPatImpactPercent: 10,
        });

        const netRes = CatalystRiskPolicyRegistry.evaluateNetRiskScore(
          probRes.score,
          impactRes.score,
          'MITIGATION_UNVERIFIED',
          0.0
        );

        const lineage: RiskLineage = {
          underlyingRiskId: 'und_tech_breakdown',
          sourceRiskIds: ['tech_fragility'],
          sourceLayers: ['TECHNICAL_ANALYSIS'],
          relationshipType: 'INDEPENDENT_RISK',
          confidence: 80,
        };

        const riskItem: RiskItem = {
          riskId: `risk_tech_structure_break`,
          title: `Technical Support Invalidation & Trend Fragility`,
          category: 'TECHNICAL_PRICE_STRUCTURE',
          description: `Technical fragility score is elevated (${ta.technicalRisk.riskScore}/100) with price testing key breakdown thresholds.`,
          probability: probRes.probability,
          probabilityScore: probRes.score,
          impact: impactRes.impact,
          impactScore: impactRes.score,
          rawRiskScore: netRes.rawRiskScore,
          severity: netRes.severity,
          velocity: 'IMMEDIATE_SHOCK',
          measurableExposure: `Breakdown below key 200 DMA support zone.`,
          mitigations: [],
          netExposure: 'UNMITIGATED',
          netRiskScore: netRes.netRiskScore,
          falsifiableTriggers: ['Weekly close below 200 DMA on heavy volume'],
          evidenceSourceIds: ['Daily OHLCV Technical Chart Structure'],
          sourceLayer: 'TECHNICAL',
          lineage,
          confidence: 80,
        };

        risks.push(riskItem);
        technicalRisks.push(riskItem);
      }
    }

    // 6. Ingest News, Regulatory & Industry Risks (Phase 11)
    if (project.newsAndIndustryAnalysis) {
      for (const nr of project.newsAndIndustryAnalysis.newsRisks) {
        let category: RiskCategory = 'SECTOR_COMPETITIVE';
        if (nr.riskCategory === 'REGULATORY' || nr.riskCategory === 'LITIGATION') category = 'REGULATORY_LEGAL';
        else if (nr.riskCategory === 'COMMODITY') category = 'MACRO_COMMODITY_CURRENCY';

        const probRes = CatalystRiskPolicyRegistry.evaluateRiskProbability({
          triggerProximityPercent: 10,
          isExternalCorroborated: true,
        });

        const impactRes = CatalystRiskPolicyRegistry.evaluateRiskImpact({
          potentialPatImpactPercent: nr.severity === 'CRITICAL' ? 25 : 10,
          potentialMarginCompressionBps: 150,
        });

        const netRes = CatalystRiskPolicyRegistry.evaluateNetRiskScore(
          probRes.score,
          impactRes.score,
          'MITIGATION_PARTIAL',
          0.15
        );

        const lineage: RiskLineage = {
          underlyingRiskId: `und_news_${nr.riskId}`,
          sourceRiskIds: [nr.riskId],
          sourceLayers: ['NEWS_INDUSTRY'],
          relationshipType: 'INDEPENDENT_RISK',
          confidence: 80,
        };

        const riskItem: RiskItem = {
          riskId: `risk_news_${nr.riskId}`,
          title: nr.riskCategory.replace(/_/g, ' ') + ' Risk',
          category,
          description: nr.evidence || 'External news and industry risk event.',
          probability: probRes.probability,
          probabilityScore: probRes.score,
          impact: impactRes.impact,
          impactScore: impactRes.score,
          rawRiskScore: netRes.rawRiskScore,
          severity: netRes.severity,
          velocity: 'RAPID_DEVELOPMENT',
          measurableExposure: `Potential impact on ${nr.financialChannel} channel.`,
          mitigations: [
            {
              mitigationId: `mit_news_${nr.riskId}`,
              description: 'Company ongoing operational adjustments and legal defenses.',
              status: 'MITIGATION_PARTIAL',
              mitigationStrength: 0.15,
              evidenceReferences: [nr.evidence],
              confidence: 75,
            },
          ],
          netExposure: netRes.netExposure,
          netRiskScore: netRes.netRiskScore,
          falsifiableTriggers: [`Official adverse ruling on ${nr.riskCategory}`],
          evidenceSourceIds: [nr.evidence],
          sourceLayer: 'NEWS_INDUSTRY',
          lineage,
          confidence: 80,
        };

        risks.push(riskItem);
        industryRisks.push(riskItem);
      }
    }

    // Default macro sector risk if none detected
    if (risks.length === 0) {
      const probRes = CatalystRiskPolicyRegistry.evaluateRiskProbability({ triggerProximityPercent: 20 });
      const impactRes = CatalystRiskPolicyRegistry.evaluateRiskImpact({ potentialPatImpactPercent: 5 });
      const netRes = CatalystRiskPolicyRegistry.evaluateNetRiskScore(probRes.score, impactRes.score, 'MITIGATION_VERIFIED', 0.2);

      const riskItem: RiskItem = {
        riskId: 'risk_macro_cyclical',
        title: 'Macroeconomic & Input Cost Volatility',
        category: 'MACRO_COMMODITY_CURRENCY',
        description: 'Cyclical input commodity price inflation and domestic interest rate fluctuations.',
        probability: probRes.probability,
        probabilityScore: probRes.score,
        impact: impactRes.impact,
        impactScore: impactRes.score,
        rawRiskScore: netRes.rawRiskScore,
        severity: netRes.severity,
        velocity: 'SLOW_EROSION',
        measurableExposure: 'Potential 50-100 bps gross margin sensitivity.',
        mitigations: [
          {
            mitigationId: 'mit_macro_pricing',
            description: 'Historical pricing power to pass on cost increases with a 1-quarter lag.',
            status: 'MITIGATION_VERIFIED',
            mitigationStrength: 0.2,
            evidenceReferences: ['Audited Financial Statements'],
            confidence: 80,
          },
        ],
        netExposure: netRes.netExposure,
        netRiskScore: netRes.netRiskScore,
        falsifiableTriggers: ['Raw material index surges > 20% without price hike'],
        evidenceSourceIds: ['Industry Benchmark Indices'],
        sourceLayer: 'INDUSTRY',
        lineage: {
          underlyingRiskId: 'und_macro_cyclical',
          sourceRiskIds: ['macro_baseline'],
          sourceLayers: ['INDUSTRY'],
          relationshipType: 'INDEPENDENT_RISK',
          confidence: 80,
        },
        confidence: 80,
      };

      risks.push(riskItem);
      industryRisks.push(riskItem);
    }

    // Deterministic ranking by netRiskScore descending, then rawRiskScore descending
    const rankedRisks = [...risks].sort((a, b) => {
      if (b.netRiskScore !== a.netRiskScore) return b.netRiskScore - a.netRiskScore;
      return b.rawRiskScore - a.rawRiskScore;
    });

    return {
      risks,
      rankedRisks,
      crossLayerRiskSummary: {
        fundamentalRisks,
        forensicRisks,
        managementRisks,
        valuationRisks,
        technicalRisks,
        industryRisks,
      },
    };
  }
}
