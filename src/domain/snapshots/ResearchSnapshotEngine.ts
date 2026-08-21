/**
 * ResearchSnapshotEngine.ts
 * Phase 15 — Immutable Research Snapshot Generator & Reproducibility Checksum Engine.
 */

import { ResearchProject } from '../models/ResearchProject';
import { ResearchSnapshot } from './SnapshotTypes';
import { sha256Sync } from '../audit/ResearchAuditLog';
import { CanonicalJsonSerializer } from '../audit/CanonicalJsonSerializer';

export class ResearchSnapshotEngine {
  public static readonly CODE_VERSION = '1.0.0';
  public static readonly GIT_COMMIT = 'git-HEAD-main-verified';
  public static readonly BUILD_ID = 'build-phase-15-prod';
  public static readonly SCHEMA_VERSION = 'v15.0';
  public static readonly ANALYSIS_VERSION = 'v14.0-deterministic-verdict';

  /**
   * Generates an immutable, cryptographically verifiable ResearchSnapshot from a project state.
   */
  public static createSnapshot(
    project: ResearchProject,
    parentSnapshotId?: string,
    analystNotes?: string
  ): ResearchSnapshot {
    const createdAt = new Date().toISOString();
    const snapshotId = `snap_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Extract input hash
    const inputPayload = {
      company: project.company,
      documentsCount: project.documents?.length || 0,
      facts: project.facts || [],
      claims: project.managementClaims || [],
    };
    const inputHash = sha256Sync(CanonicalJsonSerializer.canonicalize(inputPayload));

    // Extract output payload
    const outputPayload = {
      calculatedMetricsCount: project.calculatedMetrics?.length || 0,
      fundamentalHealthScore: project.fundamentalAnalysis?.overallHealthScore ?? (project.fundamentalAnalysis as any)?.overallScore?.score ?? null,
      forensicRiskTier: (project.forensicAnalysis as any)?.overallForensicRiskTier ?? (project.forensicAnalysis as any)?.forensicRiskTier ?? null,
      managementCredibility: (project.managementAnalysis as any)?.credibilityAssessment?.credibilityScore ?? (project.managementAnalysis as any)?.credibilityAssessment?.overallCredibilityScore ?? null,
      valuationBase: (project.valuationAnalysis as any)?.valuationAssessment?.triangulatedBasePrice ?? (project.valuationAnalysis as any)?.summary?.triangulatedFairValue ?? null,
      scenarioExpectedValue: project.verdictAnalysis?.scenarios?.expectedScenarioValue ?? (project.scenarioAnalysis?.scenarios?.BASE as any)?.impliedFairValuePerShare ?? null,
      verdict: project.verdictAnalysis?.verdict ?? (project.verdictAnalysis as any)?.decision ?? 'DECISION_NOT_ASSESSABLE',
      conviction: project.verdictAnalysis?.convictionScore ?? 0,
    };
    const outputHash = sha256Sync(CanonicalJsonSerializer.canonicalize(outputPayload));

    // Extract document versions
    const documentVersions = (project.documents || []).map((d: any) => ({
      documentId: d.id,
      version: 1,
      hash: d.contentHash || d.hash || 'hash_pending',
    }));

    // Policy versions
    const policyVersions: Record<string, string> = {
      businessModelTaxonomy: 'v2.0',
      formulaRegistry: 'v5.0',
      forensicPolicy: 'v7.0',
      managementPolicy: 'v8.0',
      valuationPolicy: 'v9.0',
      riskMatrixPolicy: 'v12.0',
      scenarioPolicy: 'v13.0',
      decisionPolicy: 'v14.0',
      freshnessPolicy: 'v15.0',
    };

    // Phase statuses
    const phaseStatuses: Record<string, any> = {
      PHASE_5_CALCULATIONS: project.calculatedMetrics ? 'COMPLETE' : 'NOT_STARTED',
      PHASE_6_FUNDAMENTAL: project.fundamentalAnalysis ? 'COMPLETE' : 'NOT_STARTED',
      PHASE_7_FORENSIC: project.forensicAnalysis ? 'COMPLETE' : 'NOT_STARTED',
      PHASE_8_MANAGEMENT: project.managementAnalysis ? 'COMPLETE' : 'NOT_STARTED',
      PHASE_9_VALUATION: project.valuationAnalysis ? 'COMPLETE' : 'NOT_STARTED',
      PHASE_10_TECHNICAL: project.technicalAnalysis ? 'COMPLETE' : 'NOT_STARTED',
      PHASE_11_NEWS_INDUSTRY: project.newsAndIndustryAnalysis ? 'COMPLETE' : 'NOT_STARTED',
      PHASE_12_CATALYSTS_RISKS: project.catalystAndRiskAnalysis ? 'COMPLETE' : 'NOT_STARTED',
      PHASE_13_SCENARIOS: project.scenarioAnalysis ? 'COMPLETE' : 'NOT_STARTED',
      PHASE_14_VERDICT: project.verdictAnalysis ? 'COMPLETE' : 'NOT_STARTED',
      PHASE_15_REPORT: 'COMPLETE',
    };

    // Decision fields
    const decision = project.verdictAnalysis?.verdict || (project.verdictAnalysis as any)?.decision || 'DECISION_NOT_ASSESSABLE';
    const convictionScore = project.verdictAnalysis?.convictionScore || 0;
    const convictionBand = project.verdictAnalysis?.convictionBand || 'LOW';

    // Valuation fields (preserving null)
    const marketPrice = project.verdictAnalysis?.marketPrice?.price ?? (project.verdictAnalysis as any)?.priceAndValuation?.currentPrice ?? null;
    const marketPriceStatus = project.verdictAnalysis?.marketPrice?.freshnessStatus || (project.verdictAnalysis as any)?.priceAndValuation?.freshnessStatus || 'UNKNOWN';
    const intrinsicBaseValue = project.verdictAnalysis?.valuationAssessment?.triangulatedBasePrice ?? (project.verdictAnalysis as any)?.priceAndValuation?.intrinsicFairValue ?? null;
    const marginOfSafetyPercent = project.verdictAnalysis?.valuationAssessment?.marginOfSafety?.actualMarginOfSafetyPercent ?? (project.verdictAnalysis as any)?.priceAndValuation?.actualMarginOfSafetyPercent ?? null;

    // Scenarios (preserving placeholder status)
    const bearValuation = project.verdictAnalysis?.scenarios?.bearValuation ?? (project.scenarioAnalysis?.scenarios?.BEAR as any)?.impliedFairValuePerShare ?? null;
    const baseValuation = project.verdictAnalysis?.scenarios?.baseValuation ?? (project.scenarioAnalysis?.scenarios?.BASE as any)?.impliedFairValuePerShare ?? null;
    const bullValuation = project.verdictAnalysis?.scenarios?.bullValuation ?? (project.scenarioAnalysis?.scenarios?.BULL as any)?.impliedFairValuePerShare ?? null;
    const expectedScenarioValue = project.verdictAnalysis?.scenarios?.expectedScenarioValue ?? null;
    const areProbabilitiesPlaceholders = project.verdictAnalysis?.scenarios?.areProbabilitiesPlaceholders ?? true;
    const probabilityStatus = (project.verdictAnalysis?.scenarios as any)?.expectedValueStatus || 'EXPECTED_VALUE_NOT_ASSESSABLE';

    // Master snapshot hash calculation
    const snapshotCore = {
      snapshotId,
      projectId: project.id,
      companySymbol: project.company.symbol,
      createdAt,
      inputHash,
      outputHash,
      decision,
      convictionScore,
      parentSnapshotId,
    };
    const hash = sha256Sync(CanonicalJsonSerializer.canonicalize(snapshotCore));

    return {
      snapshotId,
      projectId: project.id,
      companyId: project.company.symbol,
      companySymbol: project.company.symbol,
      createdAt,
      dataCutoffDate: project.updatedAt || createdAt,
      codeVersion: this.CODE_VERSION,
      gitCommit: this.GIT_COMMIT,
      buildId: this.BUILD_ID,
      schemaVersion: this.SCHEMA_VERSION,
      analysisVersion: this.ANALYSIS_VERSION,
      policyVersions,
      documentVersions,
      phaseStatuses,
      decision,
      convictionScore,
      convictionBand,
      marketPrice,
      marketPriceStatus,
      intrinsicBaseValue,
      marginOfSafetyPercent,
      scenarioSummary: {
        bearValuation,
        baseValuation,
        bullValuation,
        expectedScenarioValue,
        areProbabilitiesPlaceholders,
        probabilityStatus,
      },
      hash,
      inputHash,
      outputHash,
      parentSnapshotId,
      analystNotes,
    };
  }
}
