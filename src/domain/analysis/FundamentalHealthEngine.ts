import { FinancialFact } from '../extraction/FinancialFactTypes';
import { CalculatedMetric } from '../calculations/CalculationTypes';
import {
  FundamentalHealthAnalysis,
  CategoryScore,
  AnalysisSection,
  FundamentalRedFlag,
  FundamentalStrength,
  WatchItem,
  DriverDecomposition,
  HealthSignal,
  AnalysisConfidence,
} from './FundamentalHealthTypes';
import { HealthScoringPolicyRegistry } from './HealthScoringPolicyRegistry';

export const ANALYSIS_ENGINE_VERSION = 'fundamental-analysis-v1';
export const METHODOLOGY_VERSION = 'india-equity-methodology-v1';

export class FundamentalHealthEngine {
  /**
   * Main entry point to run deterministic fundamental health analysis
   */
  public static analyze(
    projectId: string,
    companySymbol: string,
    businessModelCode: string,
    facts: FinancialFact[],
    metrics: CalculatedMetric[],
    targetFY: string = 'FY24',
    baseFY: string = 'FY23'
  ): FundamentalHealthAnalysis {
    const policy = HealthScoringPolicyRegistry.getPolicy(businessModelCode);

    // Filter relevant facts and metrics
    const targetMetrics = metrics.filter((m) => m.period === targetFY);
    const targetFacts = facts.filter((f) => f.reportingPeriod?.fiscalYear === targetFY);

    // 1. Evaluate Data Completeness & Evidence Quality
    const dataCompleteness = this.evaluateDataCompleteness(policy.applicableMetrics, targetMetrics, targetFacts);
    const evidenceQuality = this.evaluateEvidenceQuality(targetFacts);

    // 2. Determine Analysis Confidence & Assessability
    const isAssessable = dataCompleteness >= policy.minimumCompletenessThreshold;
    let analysisConfidence: AnalysisConfidence = 'NOT_ASSESSABLE';
    if (isAssessable) {
      if (dataCompleteness >= 80 && evidenceQuality >= 80) {
        analysisConfidence = 'HIGH';
      } else if (dataCompleteness >= 50) {
        analysisConfidence = 'MEDIUM';
      } else {
        analysisConfidence = 'LOW';
      }
    }

    // 3. Evaluate 7 Categories
    const categoryScores: CategoryScore[] = [];
    const allSignals: HealthSignal[] = [];
    const redFlags: FundamentalRedFlag[] = [];
    const strengths: FundamentalStrength[] = [];
    const watchItems: WatchItem[] = [];

    // Category 1: Growth Quality
    const growthEval = this.evaluateGrowthQuality(companySymbol, targetFY, baseFY, targetMetrics, policy);
    categoryScores.push(growthEval.score);
    allSignals.push(...growthEval.signals);
    redFlags.push(...growthEval.redFlags);
    strengths.push(...growthEval.strengths);
    watchItems.push(...growthEval.watchItems);

    // Category 2: Profitability & Margins
    const marginEval = this.evaluateProfitability(companySymbol, targetFY, targetMetrics, policy);
    categoryScores.push(marginEval.score);
    allSignals.push(...marginEval.signals);
    redFlags.push(...marginEval.redFlags);
    strengths.push(...marginEval.strengths);
    watchItems.push(...marginEval.watchItems);

    // Category 3: Cash Flow Quality
    const cfEval = this.evaluateCashFlowQuality(companySymbol, targetFY, targetMetrics, targetFacts, policy);
    categoryScores.push(cfEval.score);
    allSignals.push(...cfEval.signals);
    redFlags.push(...cfEval.redFlags);
    strengths.push(...cfEval.strengths);
    watchItems.push(...cfEval.watchItems);

    // Category 4: Balance Sheet & Solvency
    const bsEval = this.evaluateBalanceSheet(companySymbol, targetFY, targetMetrics, targetFacts, policy);
    categoryScores.push(bsEval.score);
    allSignals.push(...bsEval.signals);
    redFlags.push(...bsEval.redFlags);
    strengths.push(...bsEval.strengths);
    watchItems.push(...bsEval.watchItems);

    // Category 5: Capital Efficiency
    const retEval = this.evaluateCapitalEfficiency(companySymbol, targetFY, targetMetrics, policy);
    categoryScores.push(retEval.score);
    allSignals.push(...retEval.signals);
    redFlags.push(...retEval.redFlags);
    strengths.push(...retEval.strengths);
    watchItems.push(...retEval.watchItems);

    // Category 6: Working Capital Efficiency
    const wcEval = this.evaluateWorkingCapital(companySymbol, targetFY, targetMetrics, policy);
    categoryScores.push(wcEval.score);
    allSignals.push(...wcEval.signals);
    redFlags.push(...wcEval.redFlags);
    strengths.push(...wcEval.strengths);
    watchItems.push(...wcEval.watchItems);

    // 4. Renormalize Weights across applicable categories
    const applicableSum = categoryScores
      .filter((c) => c.isApplicable)
      .reduce((sum, c) => sum + c.applicableWeight, 0);

    let overallWeightedScore: number | undefined = undefined;
    if (isAssessable && applicableSum > 0) {
      let weightedSum = 0;
      for (const cat of categoryScores) {
        if (cat.isApplicable) {
          cat.normalizedWeight = Math.round((cat.applicableWeight / applicableSum) * 100 * 10) / 10;
          if (cat.rawScore !== undefined) {
            weightedSum += (cat.rawScore * cat.normalizedWeight) / 100;
          }
        } else {
          cat.normalizedWeight = 0;
        }
      }
      overallWeightedScore = Math.round(weightedSum * 10) / 10;
    } else {
      for (const cat of categoryScores) {
        cat.normalizedWeight = 0;
      }
    }

    // 5. Evidence-Driven Driver Decomposition (ROE & ROCE)
    const driverDecompositions = this.decomposeReturnDrivers(targetFY, targetMetrics, facts);

    // 6. Generate Sections
    const sections = this.buildAnalysisSections(categoryScores);

    // 7. Collect Evidence References and Limitations
    const evidenceReferences = Array.from(
      new Set([
        ...facts.map((f) => f.sourceReference ? `${f.sourceReference.documentTitle || 'Document'} (P.${f.sourceReference.pageNumber || 'N/A'})` : '').filter(Boolean),
        ...metrics.flatMap((m) => m.inputFactsSummary ? m.inputFactsSummary.map((s) => `${s.documentName} (P.${s.pageNumber || 'N/A'})`) : []).filter(Boolean),
      ])
    );

    const limitations: string[] = [];
    if (dataCompleteness < 100) {
      limitations.push(`Analysis data completeness is ${dataCompleteness}% based on ${policy.policyName}.`);
    }
    if (categoryScores.some((c) => c.status === 'MISSING_DATA')) {
      const missingCats = categoryScores.filter((c) => c.status === 'MISSING_DATA').map((c) => c.categoryName);
      limitations.push(`Incomplete reporting data for categories: ${missingCats.join(', ')}.`);
    }

    return {
      analysisId: `health_${companySymbol}_${targetFY}_${Date.now()}`,
      projectId,
      companyId: companySymbol,
      companySymbol,
      businessModelCode: policy.businessModelCode,
      analysisVersion: ANALYSIS_ENGINE_VERSION,
      methodologyVersion: METHODOLOGY_VERSION,
      generatedAt: new Date().toISOString(),
      overallHealthScore: overallWeightedScore,
      dataCompleteness,
      evidenceQuality,
      analysisConfidence,
      isAssessable,
      categoryScores,
      sections,
      redFlags,
      strengths,
      watchItems,
      driverDecompositions,
      evidenceReferences,
      limitations,
      notes: 'Fundamental Health Analysis is an objective diagnostic assessment of financial robustness and does not constitute a valuation or investment recommendation (BUY/HOLD/AVOID).',
    };
  }

  // ===========================================================================
  // CATEGORY 1: GROWTH QUALITY
  // ===========================================================================
  private static evaluateGrowthQuality(
    _companySymbol: string,
    targetFY: string,
    _baseFY: string,
    metrics: CalculatedMetric[],
    policy: any
  ) {
    const isApplicable = policy.applicableCategories.includes('GROWTH');
    const origWeight = policy.categoryWeights.GROWTH || 0;
    const signals: HealthSignal[] = [];
    const redFlags: FundamentalRedFlag[] = [];
    const strengths: FundamentalStrength[] = [];
    const watchItems: WatchItem[] = [];
    const positiveFactors: string[] = [];
    const negativeFactors: string[] = [];
    const missingInputs: string[] = [];

    if (!isApplicable) {
      return {
        score: {
          category: 'GROWTH' as const,
          categoryName: 'Growth Quality',
          originalWeight: origWeight,
          applicableWeight: 0,
          normalizedWeight: 0,
          isApplicable: false,
          status: 'NOT_APPLICABLE' as const,
          supportingSignals: [],
          positiveFactors: [],
          negativeFactors: [],
          missingInputs: [],
          confidence: 'NOT_ASSESSABLE' as const,
          evidenceReferences: [],
        },
        signals,
        redFlags,
        strengths,
        watchItems,
      };
    }

    const revGrowth = metrics.find((m) => m.metricCode === 'REVENUE_GROWTH');
    const ebitdaGrowth = metrics.find((m) => m.metricCode === 'EBITDA_GROWTH');
    const patGrowth = metrics.find((m) => m.metricCode === 'PAT_GROWTH');

    let score = 5.0; // neutral base

    if (!revGrowth || revGrowth.value === undefined) {
      missingInputs.push('Revenue Growth');
    } else {
      if (revGrowth.value > 15) {
        score += 2.5;
        positiveFactors.push(`Strong revenue growth of ${revGrowth.value}% YoY.`);
        if (ebitdaGrowth && ebitdaGrowth.value !== undefined && ebitdaGrowth.value > 15) {
          positiveFactors.push(`Operating EBITDA grew ${ebitdaGrowth.value}% YoY.`);
        }
        strengths.push({
          strengthId: `str_rev_growth_${targetFY}`,
          category: 'GROWTH',
          title: 'Strong Top-Line Growth Momentum',
          description: `Consolidated revenue increased by ${revGrowth.value}% YoY in ${targetFY}.`,
          supportingMetricIds: [revGrowth.metricId],
          supportingFactIds: revGrowth.inputFactIds,
          evidenceReferences: revGrowth.inputFactsSummary?.map((s) => `${s.documentName} (P.${s.pageNumber || 'N/A'})`) || [],
          confidence: 95,
        });
      } else if (revGrowth.value > 5) {
        score += 1.5;
        positiveFactors.push(`Steady revenue growth of ${revGrowth.value}% YoY.`);
      } else if (revGrowth.value >= 0) {
        score += 0.5;
        positiveFactors.push(`Subdued positive revenue growth of ${revGrowth.value}% YoY.`);
      } else {
        score -= 2.0;
        negativeFactors.push(`Top-line contraction of ${revGrowth.value}% YoY.`);
        const signal: HealthSignal = {
          signalId: `sig_rev_decline_${targetFY}`,
          signalCode: 'REVENUE_CONTRACTION_SIGNAL',
          category: 'GROWTH',
          title: 'Revenue Contraction Observed',
          metricCode: 'REVENUE_GROWTH',
          currentValue: revGrowth.value,
          thresholdValue: 0,
          signalDirection: 'NEGATIVE',
          description: `Consolidated revenue declined by ${revGrowth.value}% YoY in ${targetFY}.`,
          supportingMetricIds: [revGrowth.metricId],
          supportingFactIds: revGrowth.inputFactIds,
        };
        signals.push(signal);
        redFlags.push({
          redFlagId: `rf_rev_decline_${targetFY}`,
          category: 'GROWTH',
          signal,
          title: 'Top-Line Contraction',
          description: `Revenue declined by ${revGrowth.value}% YoY. Potential demand weakness or volume loss requiring monitorable investigation.`,
          severity: Math.abs(revGrowth.value) > 15 ? 'HIGH' : 'MEDIUM',
          status: 'OBSERVED',
          triggerMetricIds: [revGrowth.metricId],
          supportingFactIds: revGrowth.inputFactIds,
          supportingMetricIds: [revGrowth.metricId],
          evidenceReferences: revGrowth.inputFactsSummary?.map((s) => `${s.documentName} (P.${s.pageNumber || 'N/A'})`) || [],
          confidence: 90,
          requiresForensicReview: false,
        });
      }
    }

    if (patGrowth && patGrowth.value !== undefined) {
      if (patGrowth.growthStatus === 'TURNAROUND') {
        score += 2.0;
        positiveFactors.push('Turnaround to net profitability from previous-year accounting loss.');
      } else if (patGrowth.value > 20) {
        score += 1.5;
        positiveFactors.push(`Robust PAT expansion of ${patGrowth.value}% YoY.`);
      } else if (patGrowth.value < -20) {
        score -= 1.5;
        negativeFactors.push(`Significant PAT decline of ${patGrowth.value}% YoY.`);
      }
    }

    score = Math.max(0, Math.min(10, Math.round(score * 10) / 10));

    return {
      score: {
        category: 'GROWTH' as const,
        categoryName: 'Growth Quality',
        rawScore: missingInputs.length > 0 && !revGrowth ? undefined : score,
        originalWeight: origWeight,
        applicableWeight: origWeight,
        normalizedWeight: origWeight,
        isApplicable: true,
        status: missingInputs.length > 0 && !revGrowth ? ('MISSING_DATA' as const) : ('ASSESSED' as const),
        supportingSignals: signals,
        positiveFactors,
        negativeFactors,
        missingInputs,
        confidence: missingInputs.length > 0 ? ('LOW' as const) : ('HIGH' as const),
        evidenceReferences: revGrowth?.inputFactsSummary?.map((s) => `${s.documentName} (P.${s.pageNumber || 'N/A'})`) || [],
      },
      signals,
      redFlags,
      strengths,
      watchItems,
    };
  }

  // ===========================================================================
  // CATEGORY 2: PROFITABILITY & MARGINS
  // ===========================================================================
  private static evaluateProfitability(
    _companySymbol: string,
    targetFY: string,
    metrics: CalculatedMetric[],
    policy: any
  ) {
    const isApplicable = policy.applicableCategories.includes('MARGINS');
    const origWeight = policy.categoryWeights.MARGINS || 0;
    const signals: HealthSignal[] = [];
    const redFlags: FundamentalRedFlag[] = [];
    const strengths: FundamentalStrength[] = [];
    const watchItems: WatchItem[] = [];
    const positiveFactors: string[] = [];
    const negativeFactors: string[] = [];
    const missingInputs: string[] = [];

    if (!isApplicable) {
      return {
        score: {
          category: 'MARGINS' as const,
          categoryName: 'Profitability & Margins',
          originalWeight: origWeight,
          applicableWeight: 0,
          normalizedWeight: 0,
          isApplicable: false,
          status: 'NOT_APPLICABLE' as const,
          supportingSignals: [],
          positiveFactors: [],
          negativeFactors: [],
          missingInputs: [],
          confidence: 'NOT_ASSESSABLE' as const,
          evidenceReferences: [],
        },
        signals,
        redFlags,
        strengths,
        watchItems,
      };
    }

    const ebitdaMargin = metrics.find((m) => m.metricCode === 'EBITDA_MARGIN');
    const patMargin = metrics.find((m) => m.metricCode === 'PAT_MARGIN');

    let score = 5.0;

    if (!ebitdaMargin && !patMargin) {
      missingInputs.push('EBITDA Margin / PAT Margin');
    } else {
      if (ebitdaMargin && ebitdaMargin.value !== undefined) {
        if (ebitdaMargin.value > 20) {
          score += 3.0;
          positiveFactors.push(`High operating EBITDA margin of ${ebitdaMargin.value}%.`);
        } else if (ebitdaMargin.value > 12) {
          score += 2.0;
          positiveFactors.push(`Healthy operating EBITDA margin of ${ebitdaMargin.value}%.`);
        } else if (ebitdaMargin.value > 6) {
          score += 1.0;
          positiveFactors.push(`Moderate EBITDA margin of ${ebitdaMargin.value}%.`);
        } else if (ebitdaMargin.value > 0) {
          score -= 1.0;
          negativeFactors.push(`Thin EBITDA margin of ${ebitdaMargin.value}%.`);
        } else {
          score -= 3.0;
          negativeFactors.push(`Operating loss: Negative EBITDA margin of ${ebitdaMargin.value}%.`);
          const signal: HealthSignal = {
            signalId: `sig_neg_ebitda_${targetFY}`,
            signalCode: 'NEGATIVE_EBITDA_MARGIN_SIGNAL',
            category: 'MARGINS',
            title: 'Operating Loss at EBITDA Level',
            metricCode: 'EBITDA_MARGIN',
            currentValue: ebitdaMargin.value,
            thresholdValue: 0,
            signalDirection: 'NEGATIVE',
            description: `EBITDA margin is negative (${ebitdaMargin.value}%).`,
            supportingMetricIds: [ebitdaMargin.metricId],
            supportingFactIds: ebitdaMargin.inputFactIds,
          };
          signals.push(signal);
          redFlags.push({
            redFlagId: `rf_neg_ebitda_${targetFY}`,
            category: 'MARGINS',
            signal,
            title: 'Negative Operating Margin',
            description: `Operating loss generated at EBITDA level (${ebitdaMargin.value}%). Company is failing to cover direct operating expenses from revenues.`,
            severity: 'HIGH',
            status: 'MATERIAL_CONCERN',
            triggerMetricIds: [ebitdaMargin.metricId],
            supportingFactIds: ebitdaMargin.inputFactIds,
            supportingMetricIds: [ebitdaMargin.metricId],
            evidenceReferences: ebitdaMargin.inputFactsSummary?.map((s) => `${s.documentName} (P.${s.pageNumber || 'N/A'})`) || [],
            confidence: 95,
            requiresForensicReview: false,
          });
        }
      }

      if (patMargin && patMargin.value !== undefined) {
        if (patMargin.value > 10) {
          score += 2.0;
          positiveFactors.push(`Strong net profit margin of ${patMargin.value}%.`);
        } else if (patMargin.value < 0) {
          score -= 1.5;
          negativeFactors.push(`Net accounting loss: PAT margin of ${patMargin.value}%.`);
        }
      }
    }

    score = Math.max(0, Math.min(10, Math.round(score * 10) / 10));

    return {
      score: {
        category: 'MARGINS' as const,
        categoryName: 'Profitability & Margins',
        rawScore: missingInputs.length > 0 ? undefined : score,
        originalWeight: origWeight,
        applicableWeight: origWeight,
        normalizedWeight: origWeight,
        isApplicable: true,
        status: missingInputs.length > 0 ? ('MISSING_DATA' as const) : ('ASSESSED' as const),
        supportingSignals: signals,
        positiveFactors,
        negativeFactors,
        missingInputs,
        confidence: missingInputs.length > 0 ? ('LOW' as const) : ('HIGH' as const),
        evidenceReferences: ebitdaMargin?.inputFactsSummary?.map((s) => `${s.documentName} (P.${s.pageNumber || 'N/A'})`) || [],
      },
      signals,
      redFlags,
      strengths,
      watchItems,
    };
  }

  // ===========================================================================
  // CATEGORY 3: CASH FLOW QUALITY
  // ===========================================================================
  private static evaluateCashFlowQuality(
    _companySymbol: string,
    targetFY: string,
    metrics: CalculatedMetric[],
    _facts: FinancialFact[],
    policy: any
  ) {
    const isApplicable = policy.applicableCategories.includes('CASH_FLOW_QUALITY');
    const origWeight = policy.categoryWeights.CASH_FLOW_QUALITY || 0;
    const signals: HealthSignal[] = [];
    const redFlags: FundamentalRedFlag[] = [];
    const strengths: FundamentalStrength[] = [];
    const watchItems: WatchItem[] = [];
    const positiveFactors: string[] = [];
    const negativeFactors: string[] = [];
    const missingInputs: string[] = [];

    if (!isApplicable) {
      return {
        score: {
          category: 'CASH_FLOW_QUALITY' as const,
          categoryName: 'Cash Flow Quality',
          originalWeight: origWeight,
          applicableWeight: 0,
          normalizedWeight: 0,
          isApplicable: false,
          status: 'NOT_APPLICABLE' as const,
          supportingSignals: [],
          positiveFactors: [],
          negativeFactors: [],
          missingInputs: [],
          confidence: 'NOT_ASSESSABLE' as const,
          evidenceReferences: [],
        },
        signals,
        redFlags,
        strengths,
        watchItems,
      };
    }

    const cfoToPat = metrics.find((m) => m.metricCode === 'CFO_TO_PAT_RATIO');
    const fcf = metrics.find((m) => m.metricCode === 'FREE_CASH_FLOW');

    let score = 5.0;

    if (!cfoToPat && !fcf) {
      missingInputs.push('CFO / FCF');
    } else {
      if (cfoToPat) {
        if (cfoToPat.status === 'CALCULATED' && cfoToPat.value !== undefined) {
          if (cfoToPat.value >= 1.0) {
            score += 2.5;
            positiveFactors.push(`High cash conversion: CFO/PAT ratio of ${cfoToPat.value}x (> 1.0x).`);
            strengths.push({
              strengthId: `str_cfo_conv_${targetFY}`,
              category: 'CASH_FLOW_QUALITY',
              title: 'Robust Cash Flow Realization',
              description: `Operating cash flow conversion exceeds reported PAT (${cfoToPat.value}x in ${targetFY}), demonstrating strong working cash earnings quality.`,
              supportingMetricIds: [cfoToPat.metricId],
              supportingFactIds: cfoToPat.inputFactIds,
              evidenceReferences: cfoToPat.inputFactsSummary?.map((s) => `${s.documentName} (P.${s.pageNumber || 'N/A'})`) || [],
              confidence: 95,
            });
          } else if (cfoToPat.value >= 0.7) {
            score += 1.0;
            positiveFactors.push(`Moderate cash conversion: CFO/PAT ratio of ${cfoToPat.value}x.`);
          } else if (cfoToPat.value < 0.5) {
            score -= 2.5;
            negativeFactors.push(`Weak cash realization: CFO/PAT ratio of ${cfoToPat.value}x (< 0.5x).`);
            const signal: HealthSignal = {
              signalId: `sig_cfo_pat_div_${targetFY}`,
              signalCode: 'LOW_CFO_PAT_CONVERSION_SIGNAL',
              category: 'CASH_FLOW_QUALITY',
              title: 'Low Operating Cash Conversion',
              metricCode: 'CFO_TO_PAT_RATIO',
              currentValue: cfoToPat.value,
              thresholdValue: 0.5,
              signalDirection: 'NEGATIVE',
              description: `CFO/PAT ratio is ${cfoToPat.value}x. Accounting profits are not translating efficiently into operating cash flows.`,
              supportingMetricIds: [cfoToPat.metricId],
              supportingFactIds: cfoToPat.inputFactIds,
            };
            signals.push(signal);
            redFlags.push({
              redFlagId: `rf_low_cfo_pat_${targetFY}`,
              category: 'CASH_FLOW_QUALITY',
              signal,
              title: 'Weak Cash Conversion / Potential Working Capital Drain',
              description: `CFO is significantly lower than PAT (${cfoToPat.value}x). Potential working capital tie-up or uncollected revenues warranting monitoring.`,
              severity: cfoToPat.value < 0.3 ? 'HIGH' : 'MEDIUM',
              status: 'REQUIRES_INVESTIGATION',
              triggerMetricIds: [cfoToPat.metricId],
              supportingFactIds: cfoToPat.inputFactIds,
              supportingMetricIds: [cfoToPat.metricId],
              evidenceReferences: cfoToPat.inputFactsSummary?.map((s) => `${s.documentName} (P.${s.pageNumber || 'N/A'})`) || [],
              confidence: 90,
              requiresForensicReview: true, // Lead for Phase 7
            });
          }
        } else if (cfoToPat.cfoPatDiagnostic === 'CASH_GENERATION_DURING_ACCOUNTING_LOSS') {
          score += 1.0;
          positiveFactors.push('Cash generation observed during accounting loss (CFO is positive despite negative PAT).');
        } else if (cfoToPat.cfoPatDiagnostic === 'CASH_BURN_DURING_ACCOUNTING_LOSS') {
          score -= 3.0;
          negativeFactors.push('Dual operating loss and operating cash drain (CFO < 0 and PAT < 0).');
          const signal: HealthSignal = {
            signalId: `sig_cash_burn_${targetFY}`,
            signalCode: 'CASH_BURN_DURING_LOSS_SIGNAL',
            category: 'CASH_FLOW_QUALITY',
            title: 'Operating Cash Burn During Net Loss',
            metricCode: 'CFO_TO_PAT_RATIO',
            signalDirection: 'NEGATIVE',
            description: 'Company is experiencing both net accounting loss and negative operating cash flow.',
            supportingMetricIds: [cfoToPat.metricId],
            supportingFactIds: cfoToPat.inputFactIds,
          };
          signals.push(signal);
          redFlags.push({
            redFlagId: `rf_cash_burn_${targetFY}`,
            category: 'CASH_FLOW_QUALITY',
            signal,
            title: 'Operating Cash Burn During Loss',
            description: 'Both PAT and CFO are negative, indicating operational cash drain requiring liquidity monitoring.',
            severity: 'HIGH',
            status: 'MATERIAL_CONCERN',
            triggerMetricIds: [cfoToPat.metricId],
            supportingFactIds: cfoToPat.inputFactIds,
            supportingMetricIds: [cfoToPat.metricId],
            evidenceReferences: cfoToPat.inputFactsSummary?.map((s) => `${s.documentName} (P.${s.pageNumber || 'N/A'})`) || [],
            confidence: 95,
            requiresForensicReview: false,
          });
        }
      }

      if (fcf && fcf.value !== undefined) {
        if (fcf.value > 0) {
          score += 2.5;
          positiveFactors.push(`Positive Free Cash Flow of ${fcf.value} Cr generated after qualifying capex.`);
          strengths.push({
            strengthId: `str_fcf_pos_${targetFY}`,
            category: 'CASH_FLOW_QUALITY',
            title: 'Positive Free Cash Flow Generation',
            description: `Generated ${fcf.value} Cr in FCF after fully funding capital expenditures in ${targetFY}.`,
            supportingMetricIds: [fcf.metricId],
            supportingFactIds: fcf.inputFactIds,
            evidenceReferences: fcf.inputFactsSummary?.map((s) => `${s.documentName} (P.${s.pageNumber || 'N/A'})`) || [],
            confidence: 95,
          });
        } else {
          score -= 1.0;
          watchItems.push({
            watchItemId: `wi_neg_fcf_${targetFY}`,
            category: 'CASH_FLOW_QUALITY',
            title: 'Negative Free Cash Flow (Reinvestment Cycle)',
            description: `FCF is negative (${fcf.value} Cr) due to capital expenditure reinvestment.`,
            metricOrFact: 'FREE_CASH_FLOW',
            currentValue: `${fcf.value} Cr`,
            historicalComparison: 'Reinvestment monitoring',
            reasonForMonitoring: 'Evaluate whether negative FCF is driven by growth capex or underlying operating cash insufficiency.',
            evidenceReferences: fcf.inputFactsSummary?.map((s) => `${s.documentName} (P.${s.pageNumber || 'N/A'})`) || [],
            confidence: 90,
          });
        }
      }
    }

    score = Math.max(0, Math.min(10, Math.round(score * 10) / 10));

    return {
      score: {
        category: 'CASH_FLOW_QUALITY' as const,
        categoryName: 'Cash Flow Quality',
        rawScore: missingInputs.length > 0 ? undefined : score,
        originalWeight: origWeight,
        applicableWeight: origWeight,
        normalizedWeight: origWeight,
        isApplicable: true,
        status: missingInputs.length > 0 ? ('MISSING_DATA' as const) : ('ASSESSED' as const),
        supportingSignals: signals,
        positiveFactors,
        negativeFactors,
        missingInputs,
        confidence: missingInputs.length > 0 ? ('LOW' as const) : ('HIGH' as const),
        evidenceReferences: cfoToPat?.inputFactsSummary?.map((s) => `${s.documentName} (P.${s.pageNumber || 'N/A'})`) || [],
      },
      signals,
      redFlags,
      strengths,
      watchItems,
    };
  }

  // ===========================================================================
  // CATEGORY 4: BALANCE SHEET & SOLVENCY
  // ===========================================================================
  private static evaluateBalanceSheet(
    _companySymbol: string,
    targetFY: string,
    metrics: CalculatedMetric[],
    _facts: FinancialFact[],
    policy: any
  ) {
    const isApplicable = policy.applicableCategories.includes('LEVERAGE');
    const origWeight = policy.categoryWeights.LEVERAGE || 0;
    const signals: HealthSignal[] = [];
    const redFlags: FundamentalRedFlag[] = [];
    const strengths: FundamentalStrength[] = [];
    const watchItems: WatchItem[] = [];
    const positiveFactors: string[] = [];
    const negativeFactors: string[] = [];
    const missingInputs: string[] = [];

    if (!isApplicable) {
      return {
        score: {
          category: 'LEVERAGE' as const,
          categoryName: 'Balance Sheet & Solvency',
          originalWeight: origWeight,
          applicableWeight: 0,
          normalizedWeight: 0,
          isApplicable: false,
          status: 'NOT_APPLICABLE' as const,
          supportingSignals: [],
          positiveFactors: [],
          negativeFactors: [],
          missingInputs: [],
          confidence: 'NOT_ASSESSABLE' as const,
          evidenceReferences: [],
        },
        signals,
        redFlags,
        strengths,
        watchItems,
      };
    }

    const de = metrics.find((m) => m.metricCode === 'DEBT_TO_EQUITY');
    const netDebtEbitda = metrics.find((m) => m.metricCode === 'NET_DEBT_TO_EBITDA');
    const intCoverage = metrics.find((m) => m.metricCode === 'INTEREST_COVERAGE');

    let score = 5.0;

    if (!de && !netDebtEbitda && !intCoverage) {
      missingInputs.push('D/E / Net Debt to EBITDA / Interest Coverage');
    } else {
      if (de && de.value !== undefined) {
        if (de.value <= 0.3) {
          score += 2.5;
          positiveFactors.push(`Low leverage: Debt to Equity ratio of ${de.value}x.`);
          strengths.push({
            strengthId: `str_low_de_${targetFY}`,
            category: 'LEVERAGE',
            title: 'Conservative Leverage Profile',
            description: `Debt/Equity ratio stands at a conservative ${de.value}x in ${targetFY}.`,
            supportingMetricIds: [de.metricId],
            supportingFactIds: de.inputFactIds,
            evidenceReferences: de.inputFactsSummary?.map((s) => `${s.documentName} (P.${s.pageNumber || 'N/A'})`) || [],
            confidence: 95,
          });
        } else if (de.value <= 1.0) {
          score += 1.0;
          positiveFactors.push(`Manageable Debt to Equity ratio of ${de.value}x.`);
        } else if (de.value > 2.0) {
          score -= 2.5;
          negativeFactors.push(`High leverage: Debt to Equity ratio of ${de.value}x.`);
          const signal: HealthSignal = {
            signalId: `sig_high_de_${targetFY}`,
            signalCode: 'HIGH_LEVERAGE_SIGNAL',
            category: 'LEVERAGE',
            title: 'High Debt to Equity Leverage',
            metricCode: 'DEBT_TO_EQUITY',
            currentValue: de.value,
            thresholdValue: 2.0,
            signalDirection: 'NEGATIVE',
            description: `D/E ratio exceeds 2.0x (${de.value}x).`,
            supportingMetricIds: [de.metricId],
            supportingFactIds: de.inputFactIds,
          };
          signals.push(signal);
          redFlags.push({
            redFlagId: `rf_high_de_${targetFY}`,
            category: 'LEVERAGE',
            signal,
            title: 'Elevated Balance Sheet Leverage',
            description: `High financial leverage (D/E: ${de.value}x) increases debt-servicing sensitivity during operating downturns.`,
            severity: de.value > 3.0 ? 'HIGH' : 'MEDIUM',
            status: 'OBSERVED',
            triggerMetricIds: [de.metricId],
            supportingFactIds: de.inputFactIds,
            supportingMetricIds: [de.metricId],
            evidenceReferences: de.inputFactsSummary?.map((s) => `${s.documentName} (P.${s.pageNumber || 'N/A'})`) || [],
            confidence: 95,
            requiresForensicReview: false,
          });
        }
      }

      if (netDebtEbitda && netDebtEbitda.value !== undefined) {
        if (netDebtEbitda.value < 0) {
          score += 2.0;
          positiveFactors.push('Net Cash Position: Cash & equivalents exceed total debt.');
        } else if (netDebtEbitda.value <= 1.5) {
          score += 1.0;
          positiveFactors.push(`Comfortable Net Debt/EBITDA ratio of ${netDebtEbitda.value}x.`);
        } else if (netDebtEbitda.value > 4.0) {
          score -= 2.0;
          negativeFactors.push(`Elevated Net Debt/EBITDA of ${netDebtEbitda.value}x.`);
        }
      }

      if (intCoverage && intCoverage.value !== undefined) {
        if (intCoverage.value > 5.0) {
          score += 1.5;
          positiveFactors.push(`Robust interest coverage ratio of ${intCoverage.value}x.`);
        } else if (intCoverage.value < 1.5) {
          score -= 3.0;
          negativeFactors.push(`Stressed interest coverage ratio of ${intCoverage.value}x (< 1.5x).`);
          const signal: HealthSignal = {
            signalId: `sig_low_int_cov_${targetFY}`,
            signalCode: 'LOW_INTEREST_COVERAGE_SIGNAL',
            category: 'LEVERAGE',
            title: 'Stressed Interest Coverage',
            metricCode: 'INTEREST_COVERAGE',
            currentValue: intCoverage.value,
            thresholdValue: 1.5,
            signalDirection: 'NEGATIVE',
            description: `Interest coverage ratio is ${intCoverage.value}x.`,
            supportingMetricIds: [intCoverage.metricId],
            supportingFactIds: intCoverage.inputFactIds,
          };
          signals.push(signal);
          redFlags.push({
            redFlagId: `rf_low_int_cov_${targetFY}`,
            category: 'LEVERAGE',
            signal,
            title: 'Stressed Debt Servicing Capability',
            description: `Operating earnings provide limited buffer over interest expenses (${intCoverage.value}x). Heightened financial solvency sensitivity.`,
            severity: intCoverage.value < 1.0 ? 'CRITICAL' : 'HIGH',
            status: 'MATERIAL_CONCERN',
            triggerMetricIds: [intCoverage.metricId],
            supportingFactIds: intCoverage.inputFactIds,
            supportingMetricIds: [intCoverage.metricId],
            evidenceReferences: intCoverage.inputFactsSummary?.map((s) => `${s.documentName} (P.${s.pageNumber || 'N/A'})`) || [],
            confidence: 95,
            requiresForensicReview: false,
          });
        }
      }
    }

    score = Math.max(0, Math.min(10, Math.round(score * 10) / 10));

    return {
      score: {
        category: 'LEVERAGE' as const,
        categoryName: 'Balance Sheet & Solvency',
        rawScore: missingInputs.length > 0 ? undefined : score,
        originalWeight: origWeight,
        applicableWeight: origWeight,
        normalizedWeight: origWeight,
        isApplicable: true,
        status: missingInputs.length > 0 ? ('MISSING_DATA' as const) : ('ASSESSED' as const),
        supportingSignals: signals,
        positiveFactors,
        negativeFactors,
        missingInputs,
        confidence: missingInputs.length > 0 ? ('LOW' as const) : ('HIGH' as const),
        evidenceReferences: de?.inputFactsSummary?.map((s) => `${s.documentName} (P.${s.pageNumber || 'N/A'})`) || [],
      },
      signals,
      redFlags,
      strengths,
      watchItems,
    };
  }

  // ===========================================================================
  // CATEGORY 5: CAPITAL EFFICIENCY
  // ===========================================================================
  private static evaluateCapitalEfficiency(
    _companySymbol: string,
    targetFY: string,
    metrics: CalculatedMetric[],
    policy: any
  ) {
    const isApplicable = policy.applicableCategories.includes('RETURNS');
    const origWeight = policy.categoryWeights.RETURNS || 0;
    const signals: HealthSignal[] = [];
    const redFlags: FundamentalRedFlag[] = [];
    const strengths: FundamentalStrength[] = [];
    const watchItems: WatchItem[] = [];
    const positiveFactors: string[] = [];
    const negativeFactors: string[] = [];
    const missingInputs: string[] = [];

    if (!isApplicable) {
      return {
        score: {
          category: 'RETURNS' as const,
          categoryName: 'Capital Efficiency',
          originalWeight: origWeight,
          applicableWeight: 0,
          normalizedWeight: 0,
          isApplicable: false,
          status: 'NOT_APPLICABLE' as const,
          supportingSignals: [],
          positiveFactors: [],
          negativeFactors: [],
          missingInputs: [],
          confidence: 'NOT_ASSESSABLE' as const,
          evidenceReferences: [],
        },
        signals,
        redFlags,
        strengths,
        watchItems,
      };
    }

    const roe = metrics.find((m) => m.metricCode === 'ROE');
    const roce = metrics.find((m) => m.metricCode === 'ROCE');

    let score = 5.0;

    if (!roe && !roce) {
      missingInputs.push('ROE / ROCE');
    } else {
      if (roce && roce.value !== undefined) {
        if (roce.value > 20) {
          score += 3.0;
          positiveFactors.push(`Superior ROCE of ${roce.value}% generated on capital employed.`);
          strengths.push({
            strengthId: `str_high_roce_${targetFY}`,
            category: 'RETURNS',
            title: 'High Capital Return Efficiency',
            description: `ROCE stands at ${roce.value}% in ${targetFY}, demonstrating efficient operating asset productivity.`,
            supportingMetricIds: [roce.metricId],
            supportingFactIds: roce.inputFactIds,
            evidenceReferences: roce.inputFactsSummary?.map((s) => `${s.documentName} (P.${s.pageNumber || 'N/A'})`) || [],
            confidence: 95,
          });
        } else if (roce.value > 12) {
          score += 1.5;
          positiveFactors.push(`Adequate ROCE of ${roce.value}%.`);
        } else if (roce.value > 0) {
          score -= 1.0;
          negativeFactors.push(`Sub-par ROCE of ${roce.value}%.`);
        } else {
          score -= 2.5;
          negativeFactors.push(`Negative ROCE of ${roce.value}% due to operating losses.`);
        }
      }

      if (roe && roe.value !== undefined) {
        if (roe.value > 18) {
          score += 2.0;
          positiveFactors.push(`Strong Return on Equity of ${roe.value}%.`);
        } else if (roe.value < 0) {
          score -= 1.5;
          negativeFactors.push(`Negative Return on Equity (${roe.value}%).`);
        }
      }
    }

    score = Math.max(0, Math.min(10, Math.round(score * 10) / 10));

    return {
      score: {
        category: 'RETURNS' as const,
        categoryName: 'Capital Efficiency',
        rawScore: missingInputs.length > 0 ? undefined : score,
        originalWeight: origWeight,
        applicableWeight: origWeight,
        normalizedWeight: origWeight,
        isApplicable: true,
        status: missingInputs.length > 0 ? ('MISSING_DATA' as const) : ('ASSESSED' as const),
        supportingSignals: signals,
        positiveFactors,
        negativeFactors,
        missingInputs,
        confidence: missingInputs.length > 0 ? ('LOW' as const) : ('HIGH' as const),
        evidenceReferences: roce?.inputFactsSummary?.map((s) => `${s.documentName} (P.${s.pageNumber || 'N/A'})`) || [],
      },
      signals,
      redFlags,
      strengths,
      watchItems,
    };
  }

  // ===========================================================================
  // CATEGORY 6: WORKING CAPITAL EFFICIENCY
  // ===========================================================================
  private static evaluateWorkingCapital(
    _companySymbol: string,
    targetFY: string,
    metrics: CalculatedMetric[],
    policy: any
  ) {
    const isApplicable = policy.applicableCategories.includes('WORKING_CAPITAL');
    const origWeight = policy.categoryWeights.WORKING_CAPITAL || 0;
    const signals: HealthSignal[] = [];
    const redFlags: FundamentalRedFlag[] = [];
    const strengths: FundamentalStrength[] = [];
    const watchItems: WatchItem[] = [];
    const positiveFactors: string[] = [];
    const negativeFactors: string[] = [];
    const missingInputs: string[] = [];

    if (!isApplicable) {
      return {
        score: {
          category: 'WORKING_CAPITAL' as const,
          categoryName: 'Working Capital Efficiency',
          originalWeight: origWeight,
          applicableWeight: 0,
          normalizedWeight: 0,
          isApplicable: false,
          status: 'NOT_APPLICABLE' as const,
          supportingSignals: [],
          positiveFactors: [],
          negativeFactors: [],
          missingInputs: [],
          confidence: 'NOT_ASSESSABLE' as const,
          evidenceReferences: [],
        },
        signals,
        redFlags,
        strengths,
        watchItems,
      };
    }

    const wcDays = metrics.find((m) => m.metricCode === 'WORKING_CAPITAL_DAYS');
    const recDays = metrics.find((m) => m.metricCode === 'RECEIVABLE_DAYS');

    let score = 5.0;

    if (!wcDays && !recDays) {
      missingInputs.push('Working Capital Days / Debtor Days');
    } else {
      if (wcDays && wcDays.value !== undefined) {
        if (wcDays.value < 0) {
          score += 3.0;
          positiveFactors.push(`Negative working capital cycle (${wcDays.value} days): Highly cash-generative operational model funded by supplier credits.`);
          strengths.push({
            strengthId: `str_neg_wc_${targetFY}`,
            category: 'WORKING_CAPITAL',
            title: 'Favorable Negative Working Capital Cycle',
            description: `Operating working capital days stood at ${wcDays.value} days in ${targetFY}, allowing operations to be financed by supply-chain liabilities.`,
            supportingMetricIds: [wcDays.metricId],
            supportingFactIds: wcDays.inputFactIds,
            evidenceReferences: wcDays.inputFactsSummary?.map((s) => `${s.documentName} (P.${s.pageNumber || 'N/A'})`) || [],
            confidence: 95,
          });
        } else if (wcDays.value <= 45) {
          score += 1.5;
          positiveFactors.push(`Lean working capital cycle of ${wcDays.value} days.`);
        } else if (wcDays.value > 120) {
          score -= 2.5;
          negativeFactors.push(`High working capital intensity (${wcDays.value} days).`);
          const signal: HealthSignal = {
            signalId: `sig_high_wc_days_${targetFY}`,
            signalCode: 'HIGH_WC_DAYS_SIGNAL',
            category: 'WORKING_CAPITAL',
            title: 'High Working Capital Intensity',
            metricCode: 'WORKING_CAPITAL_DAYS',
            currentValue: wcDays.value,
            thresholdValue: 120,
            signalDirection: 'NEGATIVE',
            description: `Working capital cycle is ${wcDays.value} days. Significant liquidity locked in inventory and receivables.`,
            supportingMetricIds: [wcDays.metricId],
            supportingFactIds: wcDays.inputFactIds,
          };
          signals.push(signal);
          redFlags.push({
            redFlagId: `rf_high_wc_${targetFY}`,
            category: 'WORKING_CAPITAL',
            signal,
            title: 'Elevated Working Capital Lockup',
            description: `Extended working capital cycle (${wcDays.value} days) ties up liquidity and exposes the business to short-term funding pressure.`,
            severity: wcDays.value > 180 ? 'HIGH' : 'MEDIUM',
            status: 'OBSERVED',
            triggerMetricIds: [wcDays.metricId],
            supportingFactIds: wcDays.inputFactIds,
            supportingMetricIds: [wcDays.metricId],
            evidenceReferences: wcDays.inputFactsSummary?.map((s) => `${s.documentName} (P.${s.pageNumber || 'N/A'})`) || [],
            confidence: 90,
            requiresForensicReview: false,
          });
        }
      }

      if (recDays && recDays.value !== undefined) {
        if (recDays.value > 90) {
          watchItems.push({
            watchItemId: `wi_rec_days_${targetFY}`,
            category: 'WORKING_CAPITAL',
            title: 'Extended Debtor Collection Period',
            description: `Receivable days stand at ${recDays.value} days.`,
            metricOrFact: 'RECEIVABLE_DAYS',
            currentValue: `${recDays.value} Days`,
            historicalComparison: 'Collection monitoring',
            reasonForMonitoring: 'Monitor customer credit terms and receivable aging for delayed collections.',
            evidenceReferences: recDays.inputFactsSummary?.map((s) => `${s.documentName} (P.${s.pageNumber || 'N/A'})`) || [],
            confidence: 90,
          });
        }
      }
    }

    score = Math.max(0, Math.min(10, Math.round(score * 10) / 10));

    return {
      score: {
        category: 'WORKING_CAPITAL' as const,
        categoryName: 'Working Capital Efficiency',
        rawScore: missingInputs.length > 0 ? undefined : score,
        originalWeight: origWeight,
        applicableWeight: origWeight,
        normalizedWeight: origWeight,
        isApplicable: true,
        status: missingInputs.length > 0 ? ('MISSING_DATA' as const) : ('ASSESSED' as const),
        supportingSignals: signals,
        positiveFactors,
        negativeFactors,
        missingInputs,
        confidence: missingInputs.length > 0 ? ('LOW' as const) : ('HIGH' as const),
        evidenceReferences: wcDays?.inputFactsSummary?.map((s) => `${s.documentName} (P.${s.pageNumber || 'N/A'})`) || [],
      },
      signals,
      redFlags,
      strengths,
      watchItems,
    };
  }

  // ===========================================================================
  // EVIDENCE-DRIVEN ROE / ROCE DRIVER DECOMPOSITION
  // ===========================================================================
  private static decomposeReturnDrivers(
    targetFY: string,
    metrics: CalculatedMetric[],
    facts: FinancialFact[]
  ): DriverDecomposition[] {
    const results: DriverDecomposition[] = [];

    const roeMetric = metrics.find((m) => m.metricCode === 'ROE');
    const patMarginMetric = metrics.find((m) => m.metricCode === 'PAT_MARGIN');
    const deMetric = metrics.find((m) => m.metricCode === 'DEBT_TO_EQUITY');
    const eqFact = facts.find((f) => f.metric === 'NET_WORTH' && f.reportingPeriod?.fiscalYear === targetFY);

    if (roeMetric && roeMetric.value !== undefined && patMarginMetric && patMarginMetric.value !== undefined) {
      const isMarginDriven = patMarginMetric.value > 8;
      const isLeverageDriven = deMetric && deMetric.value !== undefined && deMetric.value > 1.5;

      let explanation = '';
      if (isMarginDriven && !isLeverageDriven) {
        explanation = `ROE of ${roeMetric.value}% is primarily supported by healthy underlying net profit margins (${patMarginMetric.value}%) rather than excessive financial gearing.`;
      } else if (isLeverageDriven) {
        explanation = `ROE of ${roeMetric.value}% reflects financial gearing leverage (D/E: ${deMetric?.value}x) alongside operating profitability (${patMarginMetric.value}%).`;
      } else {
        explanation = `ROE of ${roeMetric.value}% is driven by moderate profitability (${patMarginMetric.value}%) and balanced equity capitalization.`;
      }

      results.push({
        returnMetric: 'ROE',
        currentReturn: roeMetric.value,
        status: 'SUPPORTED_DRIVER',
        primaryDriver: isMarginDriven ? 'OPERATING_PROFITABILITY' : isLeverageDriven ? 'FINANCIAL_LEVERAGE' : 'BALANCED_EQUITY',
        driverExplanation: explanation,
        supportingEvidence: [
          { component: 'PAT Margin', value: patMarginMetric.value, unit: '%', period: targetFY, factId: patMarginMetric.inputFactIds[0] },
          { component: 'Debt to Equity', value: deMetric?.value, unit: 'x', period: targetFY, factId: deMetric?.inputFactIds[0] },
          { component: 'Closing Net Worth', value: eqFact?.value, unit: 'INR_CRORE', period: targetFY, factId: eqFact?.factId },
        ],
      });
    } else {
      results.push({
        returnMetric: 'ROE',
        currentReturn: roeMetric?.value,
        status: 'DRIVER_NOT_DETERMINABLE',
        driverExplanation: 'Component revenue, margin, or equity breakdown facts are unavailable; return drivers cannot be deterministically decomposed.',
        supportingEvidence: [],
      });
    }

    // ROCE Decomposition
    const roceMetric = metrics.find((m) => m.metricCode === 'ROCE');
    const ebitMarginMetric = metrics.find((m) => m.metricCode === 'EBIT_MARGIN');
    const ebitFact = facts.find((f) => f.metric === 'EBIT' && f.reportingPeriod?.fiscalYear === targetFY);

    if (roceMetric && roceMetric.value !== undefined && ebitMarginMetric && ebitMarginMetric.value !== undefined) {
      results.push({
        returnMetric: 'ROCE',
        currentReturn: roceMetric.value,
        status: 'SUPPORTED_DRIVER',
        primaryDriver: ebitMarginMetric.value > 12 ? 'OPERATING_MARGIN_PRODUCTIVITY' : 'CAPITAL_ASSET_UTILIZATION',
        driverExplanation: `ROCE of ${roceMetric.value}% is underpinned by an EBIT operating margin of ${ebitMarginMetric.value}% on capital employed.`,
        supportingEvidence: [
          { component: 'EBIT Margin', value: ebitMarginMetric.value, unit: '%', period: targetFY, factId: ebitMarginMetric.inputFactIds[0] },
          { component: 'Operating EBIT', value: ebitFact?.value, unit: 'INR_CRORE', period: targetFY, factId: ebitFact?.factId },
        ],
      });
    } else {
      results.push({
        returnMetric: 'ROCE',
        currentReturn: roceMetric?.value,
        status: 'DRIVER_NOT_DETERMINABLE',
        driverExplanation: 'EBIT or Capital Employed component facts are unavailable to deterministically isolate ROCE drivers.',
        supportingEvidence: [],
      });
    }

    return results;
  }

  // ===========================================================================
  // DATA COMPLETENESS & EVIDENCE QUALITY
  // ===========================================================================
  private static evaluateDataCompleteness(
    applicableMetrics: string[],
    targetMetrics: CalculatedMetric[],
    targetFacts: FinancialFact[]
  ): number {
    if (applicableMetrics.length === 0) return 100;
    let availableCount = 0;
    for (const code of applicableMetrics) {
      const hasMetric = targetMetrics.some((m) => m.metricCode === code && m.status === 'CALCULATED');
      const hasFact = targetFacts.some((f) => f.metric === code && f.availabilityStatus === 'AVAILABLE');
      if (hasMetric || hasFact) {
        availableCount++;
      }
    }
    return Math.round((availableCount / applicableMetrics.length) * 100);
  }

  private static evaluateEvidenceQuality(facts: FinancialFact[]): number {
    if (facts.length === 0) return 0;
    let totalConfidence = 0;
    for (const fact of facts) {
      let score = fact.confidence || 75;
      if (fact.verificationStatus === 'VERIFIED') score += 10;
      if (fact.provenanceSourceType === 'PRIMARY_SOURCE_DERIVED') score += 10;
      totalConfidence += Math.min(100, score);
    }
    return Math.round(totalConfidence / facts.length);
  }

  // ===========================================================================
  // ANALYSIS SECTIONS
  // ===========================================================================
  private static buildAnalysisSections(
    categoryScores: CategoryScore[]
  ): AnalysisSection[] {
    return categoryScores.map((cat) => {
      let summary = '';
      if (!cat.isApplicable) {
        summary = `${cat.categoryName} is gated as not applicable for this business model.`;
      } else if (cat.status === 'MISSING_DATA') {
        summary = `Required inputs are missing from reported filings to assess ${cat.categoryName.toLowerCase()}.`;
      } else {
        summary = `${cat.categoryName} score is ${cat.rawScore}/10 with ${cat.positiveFactors.length} positive factor(s) and ${cat.negativeFactors.length} negative factor(s).`;
      }

      return {
        sectionId: `sec_${cat.category.toLowerCase()}`,
        title: cat.categoryName,
        category: cat.category,
        summary,
        score: cat.rawScore,
        keyFindings: cat.positiveFactors,
        concerns: cat.negativeFactors,
        evidenceCitations: cat.evidenceReferences,
      };
    });
  }
}
