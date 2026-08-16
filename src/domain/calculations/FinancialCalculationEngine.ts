import { FinancialFact } from '../extraction/FinancialFactTypes';
import {
  CalculatedMetric,
  CalculationStatus,
  GrowthStatus,
  InputFactSummary,
} from './CalculationTypes';
import { FormulaRegistry, CALCULATION_VERSION, METHODOLOGY_VERSION } from './FormulaRegistry';
import { BusinessModelRegistry, EconomicArchetype } from '../taxonomy/BusinessModelRegistry';

export class FinancialCalculationEngine {
  /**
   * Main entry point: Computes all applicable deterministic metrics for a given project facts dataset and fiscal periods.
   */
  public static calculateAllMetrics(
    projectId: string,
    companySymbol: string,
    businessModelCode: string,
    facts: FinancialFact[],
    targetFY: string = 'FY24',
    baseFY: string = 'FY23'
  ): CalculatedMetric[] {
    const results: CalculatedMetric[] = [];

    // Lookup business model definition and economic archetype
    const modelDef = BusinessModelRegistry.getModel(businessModelCode);
    const archetype: EconomicArchetype = modelDef ? modelDef.economicArchetype : 'OPERATING_INDUSTRIAL';

    // Index facts by metric and period (for consolidated basis by default, fallback to standalone if unavailable)
    const getFact = (metric: string, periodFY: string, basis: 'CONSOLIDATED' | 'STANDALONE' = 'CONSOLIDATED'): FinancialFact | undefined => {
      const match = facts.find(
        (f) =>
          f.metric === metric &&
          (f.reportingPeriod.fiscalYear === periodFY || f.reportingPeriod.rawPeriodString === periodFY) &&
          f.accountingBasis === basis
      );
      if (match) return match;
      // Fallback to standalone if consolidated is not present
      return facts.find(
        (f) =>
          f.metric === metric &&
          (f.reportingPeriod.fiscalYear === periodFY || f.reportingPeriod.rawPeriodString === periodFY)
      );
    };

    // Helper to summarize an input fact for provenance
    const toSummary = (fact?: FinancialFact): InputFactSummary[] => {
      if (!fact) return [];
      return [
        {
          metric: fact.metric,
          metricLabel: fact.metricLabel,
          period: fact.reportingPeriod.fiscalYear || fact.reportingPeriod.rawPeriodString || fact.reportingPeriod.periodType,
          value: fact.value,
          unit: fact.normalizedUnit,
          currency: fact.normalizedCurrency,
          accountingBasis: fact.accountingBasis,
          documentName: fact.documentName,
          pageNumber: fact.pageNumber,
          factId: fact.factId,
        },
      ];
    };

    // =========================================================================
    // 1. GROWTH METRICS (Base FY -> Target FY)
    // =========================================================================
    const growthMetrics = [
      { code: 'REVENUE_GROWTH', metricInput: 'REVENUE', name: 'Revenue Growth' },
      { code: 'EBITDA_GROWTH', metricInput: 'EBITDA', name: 'EBITDA Growth' },
      { code: 'EBIT_GROWTH', metricInput: 'EBIT', name: 'EBIT Growth' },
      { code: 'PAT_GROWTH', metricInput: 'PAT', name: 'PAT Growth' },
      { code: 'EPS_GROWTH', metricInput: 'EPS', name: 'Diluted EPS Growth' },
      { code: 'CFO_GROWTH', metricInput: 'CFO', name: 'CFO Growth' },
    ];

    for (const g of growthMetrics) {
      const formula = FormulaRegistry.getFormula(g.code);
      if (!formula) continue;

      const isApplicable = formula.applicableArchetypes.includes(archetype);
      if (!isApplicable) {
        results.push(this.createNotApplicableMetric(projectId, g.code, g.name, 'GROWTH', `${targetFY}`, formula));
        continue;
      }

      const factCurrent = getFact(g.metricInput, targetFY);
      const factPrevious = getFact(g.metricInput, baseFY);

      const inputIds: string[] = [];
      const summaries: InputFactSummary[] = [];
      if (factCurrent) {
        inputIds.push(factCurrent.factId);
        summaries.push(...toSummary(factCurrent));
      }
      if (factPrevious) {
        inputIds.push(factPrevious.factId);
        summaries.push(...toSummary(factPrevious));
      }

      if (!factCurrent || factCurrent.value === undefined || !factPrevious || factPrevious.value === undefined) {
        results.push({
          metricId: `calc_${companySymbol}_${g.code.toLowerCase()}_${targetFY}`,
          metricCode: g.code,
          metricName: g.name,
          category: 'GROWTH',
          unit: 'PERCENT',
          period: `${baseFY}->${targetFY}`,
          formulaId: formula.formulaId,
          formulaName: formula.formulaName,
          formulaExpression: formula.formulaExpression,
          methodologyId: 'GROWTH_YOY_STANDARD',
          methodologyVersion: METHODOLOGY_VERSION,
          calculationVersion: CALCULATION_VERSION,
          inputFactIds: inputIds,
          inputFactsSummary: summaries,
          calculationTimestamp: new Date().toISOString(),
          status: 'MISSING_INPUT',
          warnings: [`Missing input facts for either ${targetFY} or ${baseFY} to calculate ${g.name}.`],
          isApplicableForBusinessModel: true,
        });
        continue;
      }

      const curVal = factCurrent.value;
      const prevVal = factPrevious.value;

      // Mathematical growth evaluation with explicit status mapping
      let growthStatus: GrowthStatus = 'NORMAL_GROWTH';
      let status: CalculationStatus = 'CALCULATED';
      let calculatedValue: number | undefined = undefined;
      const warnings: string[] = [];

      if (prevVal === 0) {
        growthStatus = 'ZERO_BASE';
        status = 'NOT_CALCULABLE';
        warnings.push(`Base year (${baseFY}) value is zero; percentage growth is mathematically undefined.`);
      } else if (prevVal < 0 && curVal > 0) {
        growthStatus = 'TURNAROUND';
        status = 'CALCULATED';
        calculatedValue = Math.round(((curVal - prevVal) / Math.abs(prevVal)) * 100 * 100) / 100;
        warnings.push(`Turnaround from net loss in ${baseFY} to profit in ${targetFY}. Percentage uses absolute base.`);
      } else if (prevVal < 0 && curVal < 0) {
        growthStatus = curVal < prevVal ? 'DECLINE_FROM_LOSS' : 'NEGATIVE_BASE';
        status = 'CALCULATED';
        calculatedValue = Math.round(((curVal - prevVal) / Math.abs(prevVal)) * 100 * 100) / 100;
        warnings.push(`Base year (${baseFY}) and current year (${targetFY}) are both negative losses.`);
      } else {
        growthStatus = 'NORMAL_GROWTH';
        status = 'CALCULATED';
        calculatedValue = Math.round(((curVal - prevVal) / prevVal) * 100 * 100) / 100;
      }

      results.push({
        metricId: `calc_${companySymbol}_${g.code.toLowerCase()}_${targetFY}`,
        metricCode: g.code,
        metricName: g.name,
        category: 'GROWTH',
        value: calculatedValue,
        unit: 'PERCENT',
        period: `${baseFY}->${targetFY}`,
        formulaId: formula.formulaId,
        formulaName: formula.formulaName,
        formulaExpression: formula.formulaExpression,
        methodologyId: 'GROWTH_YOY_STANDARD',
        methodologyVersion: METHODOLOGY_VERSION,
        calculationVersion: CALCULATION_VERSION,
        growthStatus,
        inputFactIds: inputIds,
        inputFactsSummary: summaries,
        calculationTimestamp: new Date().toISOString(),
        status,
        warnings,
        isApplicableForBusinessModel: true,
      });
    }

    // =========================================================================
    // 2. MARGIN METRICS (Target FY)
    // =========================================================================
    const revFact = getFact('REVENUE', targetFY);

    const marginConfigs = [
      { code: 'EBITDA_MARGIN', numMetric: 'EBITDA', name: 'EBITDA Margin' },
      { code: 'EBIT_MARGIN', numMetric: 'EBIT', name: 'EBIT Margin' },
      { code: 'PAT_MARGIN', numMetric: 'PAT', name: 'PAT Margin' },
      { code: 'CFO_MARGIN', numMetric: 'CFO', name: 'CFO Margin' },
      { code: 'FCF_MARGIN', numMetric: 'FCF', name: 'FCF Margin' },
    ];

    for (const m of marginConfigs) {
      const formula = FormulaRegistry.getFormula(m.code);
      if (!formula) continue;

      const isApplicable = formula.applicableArchetypes.includes(archetype);
      if (!isApplicable) {
        results.push(this.createNotApplicableMetric(projectId, m.code, m.name, 'MARGINS', targetFY, formula));
        continue;
      }

      let numFact = m.numMetric === 'FCF' ? undefined : getFact(m.numMetric, targetFY);
      const cfoFact = getFact('CFO', targetFY);
      const capexFact = getFact('CAPEX', targetFY);

      const inputIds: string[] = [];
      const summaries: InputFactSummary[] = [];

      if (m.numMetric === 'FCF') {
        if (cfoFact) {
          inputIds.push(cfoFact.factId);
          summaries.push(...toSummary(cfoFact));
        }
        if (capexFact) {
          inputIds.push(capexFact.factId);
          summaries.push(...toSummary(capexFact));
        }
      } else if (numFact) {
        inputIds.push(numFact.factId);
        summaries.push(...toSummary(numFact));
      }

      if (revFact) {
        inputIds.push(revFact.factId);
        summaries.push(...toSummary(revFact));
      }

      // Check missing inputs
      const isNumMissing = m.numMetric === 'FCF' ? !cfoFact || cfoFact.value === undefined || !capexFact || capexFact.value === undefined : !numFact || numFact.value === undefined;
      if (isNumMissing || !revFact || revFact.value === undefined) {
        results.push({
          metricId: `calc_${companySymbol}_${m.code.toLowerCase()}_${targetFY}`,
          metricCode: m.code,
          metricName: m.name,
          category: 'MARGINS',
          unit: 'PERCENT',
          period: targetFY,
          formulaId: formula.formulaId,
          formulaName: formula.formulaName,
          formulaExpression: formula.formulaExpression,
          methodologyId: 'MARGIN_REVENUE_RATIO',
          methodologyVersion: METHODOLOGY_VERSION,
          calculationVersion: CALCULATION_VERSION,
          inputFactIds: inputIds,
          inputFactsSummary: summaries,
          calculationTimestamp: new Date().toISOString(),
          status: 'MISSING_INPUT',
          warnings: [`Missing numerator or revenue input for ${targetFY}.`],
          isApplicableForBusinessModel: true,
        });
        continue;
      }

      const revVal = revFact.value;
      const numVal = m.numMetric === 'FCF' ? (cfoFact!.value! - capexFact!.value!) : numFact!.value!;

      // Denominator rules: Revenue == 0 -> NOT_CALCULABLE, Revenue < 0 -> INVALID_INPUT
      if (revVal === 0) {
        results.push({
          metricId: `calc_${companySymbol}_${m.code.toLowerCase()}_${targetFY}`,
          metricCode: m.code,
          metricName: m.name,
          category: 'MARGINS',
          unit: 'PERCENT',
          period: targetFY,
          formulaId: formula.formulaId,
          formulaName: formula.formulaName,
          formulaExpression: formula.formulaExpression,
          methodologyId: 'MARGIN_REVENUE_RATIO',
          methodologyVersion: METHODOLOGY_VERSION,
          calculationVersion: CALCULATION_VERSION,
          inputFactIds: inputIds,
          inputFactsSummary: summaries,
          calculationTimestamp: new Date().toISOString(),
          status: 'NOT_CALCULABLE',
          warnings: [`Revenue is zero for ${targetFY}; margin cannot be calculated.`],
          isApplicableForBusinessModel: true,
        });
        continue;
      }

      if (revVal < 0) {
        results.push({
          metricId: `calc_${companySymbol}_${m.code.toLowerCase()}_${targetFY}`,
          metricCode: m.code,
          metricName: m.name,
          category: 'MARGINS',
          unit: 'PERCENT',
          period: targetFY,
          formulaId: formula.formulaId,
          formulaName: formula.formulaName,
          formulaExpression: formula.formulaExpression,
          methodologyId: 'MARGIN_REVENUE_RATIO',
          methodologyVersion: METHODOLOGY_VERSION,
          calculationVersion: CALCULATION_VERSION,
          inputFactIds: inputIds,
          inputFactsSummary: summaries,
          calculationTimestamp: new Date().toISOString(),
          status: 'INVALID_INPUT',
          warnings: [`Revenue is negative (${revVal}) for ${targetFY}; economically invalid denominator.`],
          isApplicableForBusinessModel: true,
        });
        continue;
      }

      const marginVal = Math.round((numVal / revVal) * 100 * 100) / 100;
      results.push({
        metricId: `calc_${companySymbol}_${m.code.toLowerCase()}_${targetFY}`,
        metricCode: m.code,
        metricName: m.name,
        category: 'MARGINS',
        value: marginVal,
        unit: 'PERCENT',
        period: targetFY,
        formulaId: formula.formulaId,
        formulaName: formula.formulaName,
        formulaExpression: formula.formulaExpression,
        methodologyId: 'MARGIN_REVENUE_RATIO',
        methodologyVersion: METHODOLOGY_VERSION,
        calculationVersion: CALCULATION_VERSION,
        inputFactIds: inputIds,
        inputFactsSummary: summaries,
        calculationTimestamp: new Date().toISOString(),
        status: 'CALCULATED',
        warnings: numVal < 0 ? [`Operating deficit: Numerator is negative (${numVal} Cr).`] : [],
        isApplicableForBusinessModel: true,
      });
    }

    // =========================================================================
    // 3. CASH FLOW QUALITY METRICS
    // =========================================================================
    const cfoFact = getFact('CFO', targetFY);
    const patFact = getFact('PAT', targetFY);
    const capexFact = getFact('CAPEX', targetFY);

    // CFO / PAT Ratio
    const cfoToPatFormula = FormulaRegistry.getFormula('CFO_TO_PAT_RATIO');
    if (cfoToPatFormula) {
      const isApplicable = cfoToPatFormula.applicableArchetypes.includes(archetype);
      if (!isApplicable) {
        results.push(this.createNotApplicableMetric(projectId, 'CFO_TO_PAT_RATIO', 'CFO to PAT Ratio', 'CASH_FLOW_QUALITY', targetFY, cfoToPatFormula));
      } else {
        const inputIds: string[] = [];
        const summaries: InputFactSummary[] = [];
        if (cfoFact) {
          inputIds.push(cfoFact.factId);
          summaries.push(...toSummary(cfoFact));
        }
        if (patFact) {
          inputIds.push(patFact.factId);
          summaries.push(...toSummary(patFact));
        }

        if (!cfoFact || cfoFact.value === undefined || !patFact || patFact.value === undefined) {
          results.push({
            metricId: `calc_${companySymbol}_cfo_to_pat_${targetFY}`,
            metricCode: 'CFO_TO_PAT_RATIO',
            metricName: 'CFO to PAT Ratio',
            category: 'CASH_FLOW_QUALITY',
            unit: 'RATIO',
            period: targetFY,
            formulaId: cfoToPatFormula.formulaId,
            formulaName: cfoToPatFormula.formulaName,
            formulaExpression: cfoToPatFormula.formulaExpression,
            methodologyId: 'CFO_PAT_CONVERSION_V1',
            methodologyVersion: METHODOLOGY_VERSION,
            calculationVersion: CALCULATION_VERSION,
            inputFactIds: inputIds,
            inputFactsSummary: summaries,
            calculationTimestamp: new Date().toISOString(),
            status: 'MISSING_INPUT',
            warnings: [`Missing CFO or PAT for ${targetFY}.`],
            isApplicableForBusinessModel: true,
          });
        } else if (patFact.value === 0) {
          results.push({
            metricId: `calc_${companySymbol}_cfo_to_pat_${targetFY}`,
            metricCode: 'CFO_TO_PAT_RATIO',
            metricName: 'CFO to PAT Ratio',
            category: 'CASH_FLOW_QUALITY',
            unit: 'RATIO',
            period: targetFY,
            formulaId: cfoToPatFormula.formulaId,
            formulaName: cfoToPatFormula.formulaName,
            formulaExpression: cfoToPatFormula.formulaExpression,
            methodologyId: 'CFO_PAT_CONVERSION_V1',
            methodologyVersion: METHODOLOGY_VERSION,
            calculationVersion: CALCULATION_VERSION,
            cfoPatDiagnostic: 'ZERO_PAT',
            inputFactIds: inputIds,
            inputFactsSummary: summaries,
            calculationTimestamp: new Date().toISOString(),
            status: 'NOT_CALCULABLE',
            warnings: [`PAT is zero in ${targetFY}; CFO/PAT conversion ratio cannot be calculated.`],
            isApplicableForBusinessModel: true,
          });
        } else if (patFact.value < 0) {
          const diagnostic = cfoFact.value > 0 ? 'CASH_GENERATION_DURING_ACCOUNTING_LOSS' : 'CASH_BURN_DURING_ACCOUNTING_LOSS';
          const diagWarning = cfoFact.value > 0
            ? `PAT is negative (${patFact.value} Cr) and CFO is positive (${cfoFact.value} Cr): CASH_GENERATION_DURING_ACCOUNTING_LOSS diagnostic status recorded. Ratio is not calculable.`
            : `PAT is negative (${patFact.value} Cr) and CFO is negative (${cfoFact.value} Cr): CASH_BURN_DURING_ACCOUNTING_LOSS diagnostic status recorded. Ratio is not calculable.`;

          results.push({
            metricId: `calc_${companySymbol}_cfo_to_pat_${targetFY}`,
            metricCode: 'CFO_TO_PAT_RATIO',
            metricName: 'CFO to PAT Ratio',
            category: 'CASH_FLOW_QUALITY',
            unit: 'RATIO',
            period: targetFY,
            formulaId: cfoToPatFormula.formulaId,
            formulaName: cfoToPatFormula.formulaName,
            formulaExpression: cfoToPatFormula.formulaExpression,
            methodologyId: 'CFO_PAT_CONVERSION_V1',
            methodologyVersion: METHODOLOGY_VERSION,
            calculationVersion: CALCULATION_VERSION,
            cfoPatDiagnostic: diagnostic,
            inputFactIds: inputIds,
            inputFactsSummary: summaries,
            calculationTimestamp: new Date().toISOString(),
            status: 'NOT_CALCULABLE',
            warnings: [diagWarning],
            isApplicableForBusinessModel: true,
          });
        } else {
          const ratioVal = Math.round((cfoFact.value / patFact.value) * 100) / 100;
          results.push({
            metricId: `calc_${companySymbol}_cfo_to_pat_${targetFY}`,
            metricCode: 'CFO_TO_PAT_RATIO',
            metricName: 'CFO to PAT Ratio',
            category: 'CASH_FLOW_QUALITY',
            value: ratioVal,
            unit: 'RATIO',
            period: targetFY,
            formulaId: cfoToPatFormula.formulaId,
            formulaName: cfoToPatFormula.formulaName,
            formulaExpression: cfoToPatFormula.formulaExpression,
            methodologyId: 'CFO_PAT_CONVERSION_V1',
            methodologyVersion: METHODOLOGY_VERSION,
            calculationVersion: CALCULATION_VERSION,
            cfoPatDiagnostic: 'NORMAL_POSITIVE',
            inputFactIds: inputIds,
            inputFactsSummary: summaries,
            calculationTimestamp: new Date().toISOString(),
            status: 'CALCULATED',
            warnings: [],
            isApplicableForBusinessModel: true,
          });
        }
      }
    }

    // Free Cash Flow (FCF)
    const fcfFormula = FormulaRegistry.getFormula('FREE_CASH_FLOW');
    if (fcfFormula) {
      const isApplicable = fcfFormula.applicableArchetypes.includes(archetype);
      if (!isApplicable) {
        results.push(this.createNotApplicableMetric(projectId, 'FREE_CASH_FLOW', 'Free Cash Flow (FCF)', 'CASH_FLOW_QUALITY', targetFY, fcfFormula));
      } else {
        const inputIds: string[] = [];
        const summaries: InputFactSummary[] = [];
        if (cfoFact) {
          inputIds.push(cfoFact.factId);
          summaries.push(...toSummary(cfoFact));
        }
        if (capexFact) {
          inputIds.push(capexFact.factId);
          summaries.push(...toSummary(capexFact));
        }

        if (!cfoFact || cfoFact.value === undefined || !capexFact || capexFact.value === undefined) {
          results.push({
            metricId: `calc_${companySymbol}_free_cash_flow_${targetFY}`,
            metricCode: 'FREE_CASH_FLOW',
            metricName: 'Free Cash Flow (FCF)',
            category: 'CASH_FLOW_QUALITY',
            unit: 'INR_CRORE',
            period: targetFY,
            formulaId: fcfFormula.formulaId,
            formulaName: fcfFormula.formulaName,
            formulaExpression: fcfFormula.formulaExpression,
            methodologyId: 'FCF_CFO_MINUS_QUALIFYING_CAPEX_V1',
            methodologyVersion: METHODOLOGY_VERSION,
            calculationVersion: CALCULATION_VERSION,
            inputFactIds: inputIds,
            inputFactsSummary: summaries,
            calculationTimestamp: new Date().toISOString(),
            status: 'MISSING_INPUT',
            warnings: [`Missing CFO or qualifying Capex facts for ${targetFY}.`],
            isApplicableForBusinessModel: true,
          });
        } else {
          const fcfVal = Math.round((cfoFact.value - capexFact.value) * 100) / 100;
          results.push({
            metricId: `calc_${companySymbol}_free_cash_flow_${targetFY}`,
            metricCode: 'FREE_CASH_FLOW',
            metricName: 'Free Cash Flow (FCF)',
            category: 'CASH_FLOW_QUALITY',
            value: fcfVal,
            unit: 'INR_CRORE',
            period: targetFY,
            formulaId: fcfFormula.formulaId,
            formulaName: fcfFormula.formulaName,
            formulaExpression: fcfFormula.formulaExpression,
            methodologyId: 'FCF_CFO_MINUS_QUALIFYING_CAPEX_V1',
            methodologyVersion: METHODOLOGY_VERSION,
            calculationVersion: CALCULATION_VERSION,
            inputFactIds: inputIds,
            inputFactsSummary: summaries,
            calculationTimestamp: new Date().toISOString(),
            status: 'CALCULATED',
            warnings: fcfVal < 0 ? [`Negative FCF: Capital expenditures (${capexFact.value} Cr) exceeded operating cash flow (${cfoFact.value} Cr).`] : [],
            isApplicableForBusinessModel: true,
          });
        }
      }
    }

    // =========================================================================
    // 4. RETURN METRICS (ROE & ROCE)
    // =========================================================================
    const closingEquityFact = getFact('NET_WORTH', targetFY);
    const openingEquityFact = getFact('NET_WORTH', baseFY);
    const ebitFact = getFact('EBIT', targetFY);
    const totalDebtFact = getFact('TOTAL_DEBT', targetFY);
    const cashFact = getFact('CASH', targetFY);
    const openingDebtFact = getFact('TOTAL_DEBT', baseFY);
    const openingCashFact = getFact('CASH', baseFY);

    // ROE Calculation
    const roeFormula = FormulaRegistry.getFormula('ROE');
    if (roeFormula) {
      const inputIds: string[] = [];
      const summaries: InputFactSummary[] = [];
      if (patFact) {
        inputIds.push(patFact.factId);
        summaries.push(...toSummary(patFact));
      }
      if (closingEquityFact) {
        inputIds.push(closingEquityFact.factId);
        summaries.push(...toSummary(closingEquityFact));
      }
      if (openingEquityFact) {
        inputIds.push(openingEquityFact.factId);
        summaries.push(...toSummary(openingEquityFact));
      }

      if (!patFact || patFact.value === undefined || !closingEquityFact || closingEquityFact.value === undefined) {
        results.push({
          metricId: `calc_${companySymbol}_roe_${targetFY}`,
          metricCode: 'ROE',
          metricName: 'Return on Equity (ROE)',
          category: 'RETURNS',
          unit: 'PERCENT',
          period: targetFY,
          formulaId: roeFormula.formulaId,
          formulaName: roeFormula.formulaName,
          formulaExpression: roeFormula.formulaExpression,
          methodologyId: 'ROE_AVERAGE_EQUITY_V1',
          methodologyVersion: METHODOLOGY_VERSION,
          calculationVersion: CALCULATION_VERSION,
          inputFactIds: inputIds,
          inputFactsSummary: summaries,
          calculationTimestamp: new Date().toISOString(),
          status: 'MISSING_INPUT',
          warnings: [`Missing PAT or Net Worth inputs for ${targetFY}.`],
          isApplicableForBusinessModel: true,
        });
      } else {
        const hasOpening = openingEquityFact && openingEquityFact.value !== undefined;
        const avgEquity = hasOpening
          ? (openingEquityFact!.value! + closingEquityFact.value) / 2
          : closingEquityFact.value;

        if (avgEquity <= 0) {
          results.push({
            metricId: `calc_${companySymbol}_roe_${targetFY}`,
            metricCode: 'ROE',
            metricName: 'Return on Equity (ROE)',
            category: 'RETURNS',
            unit: 'PERCENT',
            period: targetFY,
            formulaId: roeFormula.formulaId,
            formulaName: roeFormula.formulaName,
            formulaExpression: roeFormula.formulaExpression,
            methodologyId: hasOpening ? 'ROE_AVERAGE_EQUITY_V1' : 'ROE_CLOSING_EQUITY_FALLBACK_V1',
            methodologyVersion: METHODOLOGY_VERSION,
            calculationVersion: CALCULATION_VERSION,
            inputFactIds: inputIds,
            inputFactsSummary: summaries,
            calculationTimestamp: new Date().toISOString(),
            status: 'NOT_CALCULABLE',
            warnings: [`Net worth is non-positive (${avgEquity} Cr); ROE cannot be computed on negative equity.`],
            isApplicableForBusinessModel: true,
          });
        } else {
          const roeVal = Math.round((patFact.value / avgEquity) * 100 * 100) / 100;
          const warnings: string[] = [];
          if (!hasOpening) {
            warnings.push('FALLBACK_CLOSING_EQUITY_USED: Opening net worth was unavailable; calculated on closing equity.');
          }

          results.push({
            metricId: `calc_${companySymbol}_roe_${targetFY}`,
            metricCode: 'ROE',
            metricName: 'Return on Equity (ROE)',
            category: 'RETURNS',
            value: roeVal,
            unit: 'PERCENT',
            period: targetFY,
            formulaId: roeFormula.formulaId,
            formulaName: roeFormula.formulaName,
            formulaExpression: hasOpening ? roeFormula.formulaExpression : '(PAT / Closing_Equity) * 100',
            methodologyId: hasOpening ? 'ROE_AVERAGE_EQUITY_V1' : 'ROE_CLOSING_EQUITY_FALLBACK_V1',
            methodologyVersion: METHODOLOGY_VERSION,
            calculationVersion: CALCULATION_VERSION,
            inputFactIds: inputIds,
            inputFactsSummary: summaries,
            calculationTimestamp: new Date().toISOString(),
            status: 'CALCULATED',
            warnings,
            isApplicableForBusinessModel: true,
          });
        }
      }
    }

    // ROCE Calculation
    const roceFormula = FormulaRegistry.getFormula('ROCE');
    if (roceFormula) {
      const isApplicable = roceFormula.applicableArchetypes.includes(archetype);
      if (!isApplicable) {
        results.push(this.createNotApplicableMetric(projectId, 'ROCE', 'Return on Capital Employed (ROCE)', 'RETURNS', targetFY, roceFormula));
      } else {
        const inputIds: string[] = [];
        const summaries: InputFactSummary[] = [];
        if (ebitFact) {
          inputIds.push(ebitFact.factId);
          summaries.push(...toSummary(ebitFact));
        }
        if (closingEquityFact) {
          inputIds.push(closingEquityFact.factId);
          summaries.push(...toSummary(closingEquityFact));
        }
        if (totalDebtFact) {
          inputIds.push(totalDebtFact.factId);
          summaries.push(...toSummary(totalDebtFact));
        }
        if (cashFact) {
          inputIds.push(cashFact.factId);
          summaries.push(...toSummary(cashFact));
        }

        if (
          !ebitFact ||
          ebitFact.value === undefined ||
          !closingEquityFact ||
          closingEquityFact.value === undefined ||
          !totalDebtFact ||
          totalDebtFact.value === undefined ||
          !cashFact ||
          cashFact.value === undefined
        ) {
          results.push({
            metricId: `calc_${companySymbol}_roce_${targetFY}`,
            metricCode: 'ROCE',
            metricName: 'Return on Capital Employed (ROCE)',
            category: 'RETURNS',
            unit: 'PERCENT',
            period: targetFY,
            formulaId: roceFormula.formulaId,
            formulaName: roceFormula.formulaName,
            formulaExpression: roceFormula.formulaExpression,
            methodologyId: 'ROCE_AVERAGE_CAPITAL_EMPLOYED_V1',
            methodologyVersion: METHODOLOGY_VERSION,
            calculationVersion: CALCULATION_VERSION,
            inputFactIds: inputIds,
            inputFactsSummary: summaries,
            calculationTimestamp: new Date().toISOString(),
            status: 'MISSING_INPUT',
            warnings: [`Missing EBIT, Debt, Equity, or Cash facts for ${targetFY}.`],
            isApplicableForBusinessModel: true,
          });
        } else {
          const closingCE = totalDebtFact.value + closingEquityFact.value - cashFact.value;
          const hasOpeningCE =
            openingEquityFact &&
            openingEquityFact.value !== undefined &&
            openingDebtFact &&
            openingDebtFact.value !== undefined &&
            openingCashFact &&
            openingCashFact.value !== undefined;

          const avgCE = hasOpeningCE
            ? (openingDebtFact!.value! + openingEquityFact!.value! - openingCashFact!.value! + closingCE) / 2
            : closingCE;

          if (avgCE <= 0) {
            results.push({
              metricId: `calc_${companySymbol}_roce_${targetFY}`,
              metricCode: 'ROCE',
              metricName: 'Return on Capital Employed (ROCE)',
              category: 'RETURNS',
              unit: 'PERCENT',
              period: targetFY,
              formulaId: roceFormula.formulaId,
              formulaName: roceFormula.formulaName,
              formulaExpression: roceFormula.formulaExpression,
              methodologyId: hasOpeningCE ? 'ROCE_AVERAGE_CAPITAL_EMPLOYED_V1' : 'ROCE_CLOSING_CAPITAL_EMPLOYED_FALLBACK_V1',
              methodologyVersion: METHODOLOGY_VERSION,
              calculationVersion: CALCULATION_VERSION,
              inputFactIds: inputIds,
              inputFactsSummary: summaries,
              calculationTimestamp: new Date().toISOString(),
              status: 'NOT_CALCULABLE',
              warnings: [`Capital employed is non-positive (${avgCE} Cr); ROCE cannot be calculated.`],
              isApplicableForBusinessModel: true,
            });
          } else {
            const roceVal = Math.round((ebitFact.value / avgCE) * 100 * 100) / 100;
            const warnings: string[] = [];
            if (!hasOpeningCE) {
              warnings.push('FALLBACK_CLOSING_CE_USED: Opening capital employed was unavailable; calculated on closing capital employed.');
            }

            results.push({
              metricId: `calc_${companySymbol}_roce_${targetFY}`,
              metricCode: 'ROCE',
              metricName: 'Return on Capital Employed (ROCE)',
              category: 'RETURNS',
              value: roceVal,
              unit: 'PERCENT',
              period: targetFY,
              formulaId: roceFormula.formulaId,
              formulaName: roceFormula.formulaName,
              formulaExpression: hasOpeningCE ? roceFormula.formulaExpression : '(EBIT / Closing_Capital_Employed) * 100',
              methodologyId: hasOpeningCE ? 'ROCE_AVERAGE_CAPITAL_EMPLOYED_V1' : 'ROCE_CLOSING_CAPITAL_EMPLOYED_FALLBACK_V1',
              methodologyVersion: METHODOLOGY_VERSION,
              calculationVersion: CALCULATION_VERSION,
              inputFactIds: inputIds,
              inputFactsSummary: summaries,
              calculationTimestamp: new Date().toISOString(),
              status: 'CALCULATED',
              warnings,
              isApplicableForBusinessModel: true,
            });
          }
        }
      }
    }

    // =========================================================================
    // 5. LEVERAGE METRICS
    // =========================================================================
    const financeCostFact = getFact('FINANCE_COST', targetFY);
    const ebitdaFact = getFact('EBITDA', targetFY);

    // Debt to Equity
    const deFormula = FormulaRegistry.getFormula('DEBT_TO_EQUITY');
    if (deFormula) {
      const isApplicable = deFormula.applicableArchetypes.includes(archetype);
      if (!isApplicable) {
        results.push(this.createNotApplicableMetric(projectId, 'DEBT_TO_EQUITY', 'Debt to Equity Ratio', 'LEVERAGE', targetFY, deFormula));
      } else {
        const inputIds: string[] = [];
        const summaries: InputFactSummary[] = [];
        if (totalDebtFact) {
          inputIds.push(totalDebtFact.factId);
          summaries.push(...toSummary(totalDebtFact));
        }
        if (closingEquityFact) {
          inputIds.push(closingEquityFact.factId);
          summaries.push(...toSummary(closingEquityFact));
        }

        if (!totalDebtFact || totalDebtFact.value === undefined || !closingEquityFact || closingEquityFact.value === undefined) {
          results.push({
            metricId: `calc_${companySymbol}_debt_to_equity_${targetFY}`,
            metricCode: 'DEBT_TO_EQUITY',
            metricName: 'Debt to Equity Ratio',
            category: 'LEVERAGE',
            unit: 'RATIO',
            period: targetFY,
            formulaId: deFormula.formulaId,
            formulaName: deFormula.formulaName,
            formulaExpression: deFormula.formulaExpression,
            methodologyId: 'LEVERAGE_DEBT_TO_EQUITY_V1',
            methodologyVersion: METHODOLOGY_VERSION,
            calculationVersion: CALCULATION_VERSION,
            inputFactIds: inputIds,
            inputFactsSummary: summaries,
            calculationTimestamp: new Date().toISOString(),
            status: 'MISSING_INPUT',
            warnings: [`Missing Total Debt or Net Worth facts for ${targetFY}.`],
            isApplicableForBusinessModel: true,
          });
        } else if (closingEquityFact.value <= 0) {
          results.push({
            metricId: `calc_${companySymbol}_debt_to_equity_${targetFY}`,
            metricCode: 'DEBT_TO_EQUITY',
            metricName: 'Debt to Equity Ratio',
            category: 'LEVERAGE',
            unit: 'RATIO',
            period: targetFY,
            formulaId: deFormula.formulaId,
            formulaName: deFormula.formulaName,
            formulaExpression: deFormula.formulaExpression,
            methodologyId: 'LEVERAGE_DEBT_TO_EQUITY_V1',
            methodologyVersion: METHODOLOGY_VERSION,
            calculationVersion: CALCULATION_VERSION,
            inputFactIds: inputIds,
            inputFactsSummary: summaries,
            calculationTimestamp: new Date().toISOString(),
            status: 'NOT_CALCULABLE',
            warnings: [`Net worth is non-positive (${closingEquityFact.value} Cr); Debt/Equity ratio cannot be computed on negative equity.`],
            isApplicableForBusinessModel: true,
          });
        } else {
          const deVal = Math.round((totalDebtFact.value / closingEquityFact.value) * 100) / 100;
          results.push({
            metricId: `calc_${companySymbol}_debt_to_equity_${targetFY}`,
            metricCode: 'DEBT_TO_EQUITY',
            metricName: 'Debt to Equity Ratio',
            category: 'LEVERAGE',
            value: deVal,
            unit: 'RATIO',
            period: targetFY,
            formulaId: deFormula.formulaId,
            formulaName: deFormula.formulaName,
            formulaExpression: deFormula.formulaExpression,
            methodologyId: 'LEVERAGE_DEBT_TO_EQUITY_V1',
            methodologyVersion: METHODOLOGY_VERSION,
            calculationVersion: CALCULATION_VERSION,
            inputFactIds: inputIds,
            inputFactsSummary: summaries,
            calculationTimestamp: new Date().toISOString(),
            status: 'CALCULATED',
            warnings: [],
            isApplicableForBusinessModel: true,
          });
        }
      }
    }

    // Net Debt to EBITDA
    const netDebtFormula = FormulaRegistry.getFormula('NET_DEBT_TO_EBITDA');
    if (netDebtFormula) {
      const isApplicable = netDebtFormula.applicableArchetypes.includes(archetype);
      if (!isApplicable) {
        results.push(this.createNotApplicableMetric(projectId, 'NET_DEBT_TO_EBITDA', 'Net Debt to EBITDA', 'LEVERAGE', targetFY, netDebtFormula));
      } else {
        const inputIds: string[] = [];
        const summaries: InputFactSummary[] = [];
        if (totalDebtFact) {
          inputIds.push(totalDebtFact.factId);
          summaries.push(...toSummary(totalDebtFact));
        }
        if (cashFact) {
          inputIds.push(cashFact.factId);
          summaries.push(...toSummary(cashFact));
        }
        if (ebitdaFact) {
          inputIds.push(ebitdaFact.factId);
          summaries.push(...toSummary(ebitdaFact));
        }

        if (
          !totalDebtFact ||
          totalDebtFact.value === undefined ||
          !cashFact ||
          cashFact.value === undefined ||
          !ebitdaFact ||
          ebitdaFact.value === undefined
        ) {
          results.push({
            metricId: `calc_${companySymbol}_net_debt_to_ebitda_${targetFY}`,
            metricCode: 'NET_DEBT_TO_EBITDA',
            metricName: 'Net Debt to EBITDA',
            category: 'LEVERAGE',
            unit: 'RATIO',
            period: targetFY,
            formulaId: netDebtFormula.formulaId,
            formulaName: netDebtFormula.formulaName,
            formulaExpression: netDebtFormula.formulaExpression,
            methodologyId: 'LEVERAGE_NET_DEBT_EBITDA_V1',
            methodologyVersion: METHODOLOGY_VERSION,
            calculationVersion: CALCULATION_VERSION,
            inputFactIds: inputIds,
            inputFactsSummary: summaries,
            calculationTimestamp: new Date().toISOString(),
            status: 'MISSING_INPUT',
            warnings: [`Missing Total Debt, Cash, or EBITDA facts for ${targetFY}.`],
            isApplicableForBusinessModel: true,
          });
        } else if (ebitdaFact.value <= 0) {
          results.push({
            metricId: `calc_${companySymbol}_net_debt_to_ebitda_${targetFY}`,
            metricCode: 'NET_DEBT_TO_EBITDA',
            metricName: 'Net Debt to EBITDA',
            category: 'LEVERAGE',
            unit: 'RATIO',
            period: targetFY,
            formulaId: netDebtFormula.formulaId,
            formulaName: netDebtFormula.formulaName,
            formulaExpression: netDebtFormula.formulaExpression,
            methodologyId: 'LEVERAGE_NET_DEBT_EBITDA_V1',
            methodologyVersion: METHODOLOGY_VERSION,
            calculationVersion: CALCULATION_VERSION,
            inputFactIds: inputIds,
            inputFactsSummary: summaries,
            calculationTimestamp: new Date().toISOString(),
            status: 'NOT_CALCULABLE',
            warnings: [`EBITDA is non-positive (${ebitdaFact.value} Cr) in ${targetFY}; Net Debt / EBITDA ratio cannot be computed.`],
            isApplicableForBusinessModel: true,
          });
        } else {
          const netDebtVal = Math.round(((totalDebtFact.value - cashFact.value) / ebitdaFact.value) * 100) / 100;
          results.push({
            metricId: `calc_${companySymbol}_net_debt_to_ebitda_${targetFY}`,
            metricCode: 'NET_DEBT_TO_EBITDA',
            metricName: 'Net Debt to EBITDA',
            category: 'LEVERAGE',
            value: netDebtVal,
            unit: 'RATIO',
            period: targetFY,
            formulaId: netDebtFormula.formulaId,
            formulaName: netDebtFormula.formulaName,
            formulaExpression: netDebtFormula.formulaExpression,
            methodologyId: 'LEVERAGE_NET_DEBT_EBITDA_V1',
            methodologyVersion: METHODOLOGY_VERSION,
            calculationVersion: CALCULATION_VERSION,
            inputFactIds: inputIds,
            inputFactsSummary: summaries,
            calculationTimestamp: new Date().toISOString(),
            status: 'CALCULATED',
            warnings: netDebtVal < 0 ? ['Net Cash Position: Cash exceeds total debt.'] : [],
            isApplicableForBusinessModel: true,
          });
        }
      }
    }

    // Interest Coverage
    const intCovFormula = FormulaRegistry.getFormula('INTEREST_COVERAGE');
    if (intCovFormula) {
      const isApplicable = intCovFormula.applicableArchetypes.includes(archetype);
      if (!isApplicable) {
        results.push(this.createNotApplicableMetric(projectId, 'INTEREST_COVERAGE', 'Interest Coverage Ratio', 'LEVERAGE', targetFY, intCovFormula));
      } else {
        const inputIds: string[] = [];
        const summaries: InputFactSummary[] = [];
        if (ebitFact) {
          inputIds.push(ebitFact.factId);
          summaries.push(...toSummary(ebitFact));
        }
        if (financeCostFact) {
          inputIds.push(financeCostFact.factId);
          summaries.push(...toSummary(financeCostFact));
        }

        if (!ebitFact || ebitFact.value === undefined || !financeCostFact || financeCostFact.value === undefined) {
          results.push({
            metricId: `calc_${companySymbol}_interest_coverage_${targetFY}`,
            metricCode: 'INTEREST_COVERAGE',
            metricName: 'Interest Coverage Ratio',
            category: 'LEVERAGE',
            unit: 'RATIO',
            period: targetFY,
            formulaId: intCovFormula.formulaId,
            formulaName: intCovFormula.formulaName,
            formulaExpression: intCovFormula.formulaExpression,
            methodologyId: 'LEVERAGE_INTEREST_COVERAGE_V1',
            methodologyVersion: METHODOLOGY_VERSION,
            calculationVersion: CALCULATION_VERSION,
            inputFactIds: inputIds,
            inputFactsSummary: summaries,
            calculationTimestamp: new Date().toISOString(),
            status: 'MISSING_INPUT',
            warnings: [`Missing EBIT or Finance Cost facts for ${targetFY}.`],
            isApplicableForBusinessModel: true,
          });
        } else if (financeCostFact.value <= 0) {
          results.push({
            metricId: `calc_${companySymbol}_interest_coverage_${targetFY}`,
            metricCode: 'INTEREST_COVERAGE',
            metricName: 'Interest Coverage Ratio',
            category: 'LEVERAGE',
            unit: 'RATIO',
            period: targetFY,
            formulaId: intCovFormula.formulaId,
            formulaName: intCovFormula.formulaName,
            formulaExpression: intCovFormula.formulaExpression,
            methodologyId: 'LEVERAGE_INTEREST_COVERAGE_V1',
            methodologyVersion: METHODOLOGY_VERSION,
            calculationVersion: CALCULATION_VERSION,
            inputFactIds: inputIds,
            inputFactsSummary: summaries,
            calculationTimestamp: new Date().toISOString(),
            status: 'NOT_CALCULABLE',
            warnings: [`Finance cost is non-positive or zero (${financeCostFact.value} Cr) in ${targetFY}; interest coverage cannot be computed.`],
            isApplicableForBusinessModel: true,
          });
        } else {
          const intCovVal = Math.round((ebitFact.value / financeCostFact.value) * 100) / 100;
          results.push({
            metricId: `calc_${companySymbol}_interest_coverage_${targetFY}`,
            metricCode: 'INTEREST_COVERAGE',
            metricName: 'Interest Coverage Ratio',
            category: 'LEVERAGE',
            value: intCovVal,
            unit: 'RATIO',
            period: targetFY,
            formulaId: intCovFormula.formulaId,
            formulaName: intCovFormula.formulaName,
            formulaExpression: intCovFormula.formulaExpression,
            methodologyId: 'LEVERAGE_INTEREST_COVERAGE_V1',
            methodologyVersion: METHODOLOGY_VERSION,
            calculationVersion: CALCULATION_VERSION,
            inputFactIds: inputIds,
            inputFactsSummary: summaries,
            calculationTimestamp: new Date().toISOString(),
            status: 'CALCULATED',
            warnings: ebitFact.value < 0 ? [`Operating loss (${ebitFact.value} Cr): Debt service is unearned.`] : [],
            isApplicableForBusinessModel: true,
          });
        }
      }
    }

    // =========================================================================
    // 6. WORKING CAPITAL METRICS
    // =========================================================================
    const recFact = getFact('RECEIVABLES', targetFY);
    const openRecFact = getFact('RECEIVABLES', baseFY);
    const invFact = getFact('INVENTORY', targetFY);
    const openInvFact = getFact('INVENTORY', baseFY);
    const payFact = getFact('PAYABLES', targetFY);
    const openPayFact = getFact('PAYABLES', baseFY);
    const cogsFact = getFact('COGS', targetFY);

    // Debtor Days (Receivable Days)
    const recDaysFormula = FormulaRegistry.getFormula('RECEIVABLE_DAYS');
    if (recDaysFormula) {
      const isApplicable = recDaysFormula.applicableArchetypes.includes(archetype);
      if (!isApplicable) {
        results.push(this.createNotApplicableMetric(projectId, 'RECEIVABLE_DAYS', 'Debtor Days', 'WORKING_CAPITAL', targetFY, recDaysFormula));
      } else {
        const inputIds: string[] = [];
        const summaries: InputFactSummary[] = [];
        if (recFact) {
          inputIds.push(recFact.factId);
          summaries.push(...toSummary(recFact));
        }
        if (openRecFact) {
          inputIds.push(openRecFact.factId);
          summaries.push(...toSummary(openRecFact));
        }
        if (revFact) {
          inputIds.push(revFact.factId);
          summaries.push(...toSummary(revFact));
        }

        if (!recFact || recFact.value === undefined || !revFact || revFact.value === undefined) {
          results.push({
            metricId: `calc_${companySymbol}_receivable_days_${targetFY}`,
            metricCode: 'RECEIVABLE_DAYS',
            metricName: 'Debtor Days (Receivable Days)',
            category: 'WORKING_CAPITAL',
            unit: 'DAYS',
            period: targetFY,
            formulaId: recDaysFormula.formulaId,
            formulaName: recDaysFormula.formulaName,
            formulaExpression: recDaysFormula.formulaExpression,
            methodologyId: 'WC_RECEIVABLE_DAYS_V1',
            methodologyVersion: METHODOLOGY_VERSION,
            calculationVersion: CALCULATION_VERSION,
            inputFactIds: inputIds,
            inputFactsSummary: summaries,
            calculationTimestamp: new Date().toISOString(),
            status: 'MISSING_INPUT',
            warnings: [`Missing Receivables or Revenue for ${targetFY}.`],
            isApplicableForBusinessModel: true,
          });
        } else if (revFact.value <= 0) {
          results.push({
            metricId: `calc_${companySymbol}_receivable_days_${targetFY}`,
            metricCode: 'RECEIVABLE_DAYS',
            metricName: 'Debtor Days (Receivable Days)',
            category: 'WORKING_CAPITAL',
            unit: 'DAYS',
            period: targetFY,
            formulaId: recDaysFormula.formulaId,
            formulaName: recDaysFormula.formulaName,
            formulaExpression: recDaysFormula.formulaExpression,
            methodologyId: 'WC_RECEIVABLE_DAYS_V1',
            methodologyVersion: METHODOLOGY_VERSION,
            calculationVersion: CALCULATION_VERSION,
            inputFactIds: inputIds,
            inputFactsSummary: summaries,
            calculationTimestamp: new Date().toISOString(),
            status: 'NOT_CALCULABLE',
            warnings: [`Revenue is non-positive (${revFact.value} Cr); debtor days cannot be calculated.`],
            isApplicableForBusinessModel: true,
          });
        } else {
          const avgRec = openRecFact && openRecFact.value !== undefined ? (openRecFact.value + recFact.value) / 2 : recFact.value;
          const recDays = Math.round(((avgRec / revFact.value) * 365) * 10) / 10;
          results.push({
            metricId: `calc_${companySymbol}_receivable_days_${targetFY}`,
            metricCode: 'RECEIVABLE_DAYS',
            metricName: 'Debtor Days (Receivable Days)',
            category: 'WORKING_CAPITAL',
            value: recDays,
            unit: 'DAYS',
            period: targetFY,
            formulaId: recDaysFormula.formulaId,
            formulaName: recDaysFormula.formulaName,
            formulaExpression: recDaysFormula.formulaExpression,
            methodologyId: 'WC_RECEIVABLE_DAYS_V1',
            methodologyVersion: METHODOLOGY_VERSION,
            calculationVersion: CALCULATION_VERSION,
            inputFactIds: inputIds,
            inputFactsSummary: summaries,
            calculationTimestamp: new Date().toISOString(),
            status: 'CALCULATED',
            warnings: !openRecFact ? ['Calculated on closing receivables (opening balance unavailable).'] : [],
            isApplicableForBusinessModel: true,
          });
        }
      }
    }

    // Inventory Days (Strict COGS Denominator)
    const invDaysFormula = FormulaRegistry.getFormula('INVENTORY_DAYS');
    if (invDaysFormula) {
      const isApplicable = invDaysFormula.applicableArchetypes.includes(archetype);
      if (!isApplicable) {
        results.push(this.createNotApplicableMetric(projectId, 'INVENTORY_DAYS', 'Inventory Days', 'WORKING_CAPITAL', targetFY, invDaysFormula));
      } else {
        const inputIds: string[] = [];
        const summaries: InputFactSummary[] = [];
        if (invFact) {
          inputIds.push(invFact.factId);
          summaries.push(...toSummary(invFact));
        }
        if (openInvFact) {
          inputIds.push(openInvFact.factId);
          summaries.push(...toSummary(openInvFact));
        }
        if (cogsFact) {
          inputIds.push(cogsFact.factId);
          summaries.push(...toSummary(cogsFact));
        }

        // Strict COGS Policy: If COGS is missing, return MISSING_INPUT (never silently substitute Revenue)
        if (!cogsFact || cogsFact.value === undefined || !invFact || invFact.value === undefined) {
          results.push({
            metricId: `calc_${companySymbol}_inventory_days_${targetFY}`,
            metricCode: 'INVENTORY_DAYS',
            metricName: 'Inventory Days (DSI)',
            category: 'WORKING_CAPITAL',
            unit: 'DAYS',
            period: targetFY,
            formulaId: invDaysFormula.formulaId,
            formulaName: invDaysFormula.formulaName,
            formulaExpression: invDaysFormula.formulaExpression,
            methodologyId: 'WC_INVENTORY_DAYS_COGS_V1',
            methodologyVersion: METHODOLOGY_VERSION,
            calculationVersion: CALCULATION_VERSION,
            inputFactIds: inputIds,
            inputFactsSummary: summaries,
            calculationTimestamp: new Date().toISOString(),
            status: 'MISSING_INPUT',
            warnings: [
              !cogsFact
                ? 'MISSING_INPUT: COGS is required for accurate inventory turnover. Revenue is not substituted.'
                : `Missing Inventory fact for ${targetFY}.`,
            ],
            isApplicableForBusinessModel: true,
          });
        } else if (cogsFact.value <= 0) {
          results.push({
            metricId: `calc_${companySymbol}_inventory_days_${targetFY}`,
            metricCode: 'INVENTORY_DAYS',
            metricName: 'Inventory Days (DSI)',
            category: 'WORKING_CAPITAL',
            unit: 'DAYS',
            period: targetFY,
            formulaId: invDaysFormula.formulaId,
            formulaName: invDaysFormula.formulaName,
            formulaExpression: invDaysFormula.formulaExpression,
            methodologyId: 'WC_INVENTORY_DAYS_COGS_V1',
            methodologyVersion: METHODOLOGY_VERSION,
            calculationVersion: CALCULATION_VERSION,
            inputFactIds: inputIds,
            inputFactsSummary: summaries,
            calculationTimestamp: new Date().toISOString(),
            status: 'NOT_CALCULABLE',
            warnings: [`COGS is non-positive (${cogsFact.value} Cr); inventory days cannot be computed.`],
            isApplicableForBusinessModel: true,
          });
        } else {
          const avgInv = openInvFact && openInvFact.value !== undefined ? (openInvFact.value + invFact.value) / 2 : invFact.value;
          const invDays = Math.round(((avgInv / cogsFact.value) * 365) * 10) / 10;
          results.push({
            metricId: `calc_${companySymbol}_inventory_days_${targetFY}`,
            metricCode: 'INVENTORY_DAYS',
            metricName: 'Inventory Days (DSI)',
            category: 'WORKING_CAPITAL',
            value: invDays,
            unit: 'DAYS',
            period: targetFY,
            formulaId: invDaysFormula.formulaId,
            formulaName: invDaysFormula.formulaName,
            formulaExpression: invDaysFormula.formulaExpression,
            methodologyId: 'WC_INVENTORY_DAYS_COGS_V1',
            methodologyVersion: METHODOLOGY_VERSION,
            calculationVersion: CALCULATION_VERSION,
            inputFactIds: inputIds,
            inputFactsSummary: summaries,
            calculationTimestamp: new Date().toISOString(),
            status: 'CALCULATED',
            warnings: !openInvFact ? ['Calculated on closing inventory (opening balance unavailable).'] : [],
            isApplicableForBusinessModel: true,
          });
        }
      }
    }

    // Payable Days (Strict COGS Denominator)
    const payDaysFormula = FormulaRegistry.getFormula('PAYABLE_DAYS');
    if (payDaysFormula) {
      const isApplicable = payDaysFormula.applicableArchetypes.includes(archetype);
      if (!isApplicable) {
        results.push(this.createNotApplicableMetric(projectId, 'PAYABLE_DAYS', 'Creditor Days', 'WORKING_CAPITAL', targetFY, payDaysFormula));
      } else {
        const inputIds: string[] = [];
        const summaries: InputFactSummary[] = [];
        if (payFact) {
          inputIds.push(payFact.factId);
          summaries.push(...toSummary(payFact));
        }
        if (openPayFact) {
          inputIds.push(openPayFact.factId);
          summaries.push(...toSummary(openPayFact));
        }
        if (cogsFact) {
          inputIds.push(cogsFact.factId);
          summaries.push(...toSummary(cogsFact));
        }

        if (!cogsFact || cogsFact.value === undefined || !payFact || payFact.value === undefined) {
          results.push({
            metricId: `calc_${companySymbol}_payable_days_${targetFY}`,
            metricCode: 'PAYABLE_DAYS',
            metricName: 'Creditor Days (Payable Days)',
            category: 'WORKING_CAPITAL',
            unit: 'DAYS',
            period: targetFY,
            formulaId: payDaysFormula.formulaId,
            formulaName: payDaysFormula.formulaName,
            formulaExpression: payDaysFormula.formulaExpression,
            methodologyId: 'WC_PAYABLE_DAYS_COGS_V1',
            methodologyVersion: METHODOLOGY_VERSION,
            calculationVersion: CALCULATION_VERSION,
            inputFactIds: inputIds,
            inputFactsSummary: summaries,
            calculationTimestamp: new Date().toISOString(),
            status: 'MISSING_INPUT',
            warnings: [
              !cogsFact
                ? 'MISSING_INPUT: COGS is required for accurate creditor days. Revenue is not substituted.'
                : `Missing Payables fact for ${targetFY}.`,
            ],
            isApplicableForBusinessModel: true,
          });
        } else if (cogsFact.value <= 0) {
          results.push({
            metricId: `calc_${companySymbol}_payable_days_${targetFY}`,
            metricCode: 'PAYABLE_DAYS',
            metricName: 'Creditor Days (Payable Days)',
            category: 'WORKING_CAPITAL',
            unit: 'DAYS',
            period: targetFY,
            formulaId: payDaysFormula.formulaId,
            formulaName: payDaysFormula.formulaName,
            formulaExpression: payDaysFormula.formulaExpression,
            methodologyId: 'WC_PAYABLE_DAYS_COGS_V1',
            methodologyVersion: METHODOLOGY_VERSION,
            calculationVersion: CALCULATION_VERSION,
            inputFactIds: inputIds,
            inputFactsSummary: summaries,
            calculationTimestamp: new Date().toISOString(),
            status: 'NOT_CALCULABLE',
            warnings: [`COGS is non-positive (${cogsFact.value} Cr); payable days cannot be computed.`],
            isApplicableForBusinessModel: true,
          });
        } else {
          const avgPay = openPayFact && openPayFact.value !== undefined ? (openPayFact.value + payFact.value) / 2 : payFact.value;
          const payDays = Math.round(((avgPay / cogsFact.value) * 365) * 10) / 10;
          results.push({
            metricId: `calc_${companySymbol}_payable_days_${targetFY}`,
            metricCode: 'PAYABLE_DAYS',
            metricName: 'Creditor Days (Payable Days)',
            category: 'WORKING_CAPITAL',
            value: payDays,
            unit: 'DAYS',
            period: targetFY,
            formulaId: payDaysFormula.formulaId,
            formulaName: payDaysFormula.formulaName,
            formulaExpression: payDaysFormula.formulaExpression,
            methodologyId: 'WC_PAYABLE_DAYS_COGS_V1',
            methodologyVersion: METHODOLOGY_VERSION,
            calculationVersion: CALCULATION_VERSION,
            inputFactIds: inputIds,
            inputFactsSummary: summaries,
            calculationTimestamp: new Date().toISOString(),
            status: 'CALCULATED',
            warnings: !openPayFact ? ['Calculated on closing payables (opening balance unavailable).'] : [],
            isApplicableForBusinessModel: true,
          });
        }
      }
    }

    // Working Capital Days
    const wcDaysFormula = FormulaRegistry.getFormula('WORKING_CAPITAL_DAYS');
    if (wcDaysFormula) {
      const isApplicable = wcDaysFormula.applicableArchetypes.includes(archetype);
      if (!isApplicable) {
        results.push(this.createNotApplicableMetric(projectId, 'WORKING_CAPITAL_DAYS', 'Working Capital Days', 'WORKING_CAPITAL', targetFY, wcDaysFormula));
      } else {
        const inputIds: string[] = [];
        const summaries: InputFactSummary[] = [];
        if (recFact) {
          inputIds.push(recFact.factId);
          summaries.push(...toSummary(recFact));
        }
        if (openRecFact) {
          inputIds.push(openRecFact.factId);
          summaries.push(...toSummary(openRecFact));
        }
        if (invFact) {
          inputIds.push(invFact.factId);
          summaries.push(...toSummary(invFact));
        }
        if (openInvFact) {
          inputIds.push(openInvFact.factId);
          summaries.push(...toSummary(openInvFact));
        }
        if (payFact) {
          inputIds.push(payFact.factId);
          summaries.push(...toSummary(payFact));
        }
        if (openPayFact) {
          inputIds.push(openPayFact.factId);
          summaries.push(...toSummary(openPayFact));
        }
        if (revFact) {
          inputIds.push(revFact.factId);
          summaries.push(...toSummary(revFact));
        }

        if (
          !recFact ||
          recFact.value === undefined ||
          !invFact ||
          invFact.value === undefined ||
          !payFact ||
          payFact.value === undefined ||
          !revFact ||
          revFact.value === undefined
        ) {
          results.push({
            metricId: `calc_${companySymbol}_working_capital_days_${targetFY}`,
            metricCode: 'WORKING_CAPITAL_DAYS',
            metricName: 'Working Capital Days (Average WC)',
            category: 'WORKING_CAPITAL',
            unit: 'DAYS',
            period: targetFY,
            formulaId: wcDaysFormula.formulaId,
            formulaName: wcDaysFormula.formulaName,
            formulaExpression: wcDaysFormula.formulaExpression,
            methodologyId: 'WC_AVERAGE_OPERATING_DAYS_V1',
            methodologyVersion: METHODOLOGY_VERSION,
            calculationVersion: CALCULATION_VERSION,
            inputFactIds: inputIds,
            inputFactsSummary: summaries,
            calculationTimestamp: new Date().toISOString(),
            status: 'MISSING_INPUT',
            warnings: [`Missing Receivables, Inventory, Payables, or Revenue for ${targetFY}.`],
            isApplicableForBusinessModel: true,
          });
        } else if (revFact.value <= 0) {
          results.push({
            metricId: `calc_${companySymbol}_working_capital_days_${targetFY}`,
            metricCode: 'WORKING_CAPITAL_DAYS',
            metricName: 'Working Capital Days (Average WC)',
            category: 'WORKING_CAPITAL',
            unit: 'DAYS',
            period: targetFY,
            formulaId: wcDaysFormula.formulaId,
            formulaName: wcDaysFormula.formulaName,
            formulaExpression: wcDaysFormula.formulaExpression,
            methodologyId: 'WC_AVERAGE_OPERATING_DAYS_V1',
            methodologyVersion: METHODOLOGY_VERSION,
            calculationVersion: CALCULATION_VERSION,
            inputFactIds: inputIds,
            inputFactsSummary: summaries,
            calculationTimestamp: new Date().toISOString(),
            status: 'NOT_CALCULABLE',
            warnings: [`Revenue is non-positive (${revFact.value} Cr); working capital days cannot be computed.`],
            isApplicableForBusinessModel: true,
          });
        } else {
          const hasFullOpening =
            openRecFact && openRecFact.value !== undefined &&
            openInvFact && openInvFact.value !== undefined &&
            openPayFact && openPayFact.value !== undefined;

          const avgRec = openRecFact && openRecFact.value !== undefined ? (openRecFact.value + recFact.value) / 2 : recFact.value;
          const avgInv = openInvFact && openInvFact.value !== undefined ? (openInvFact.value + invFact.value) / 2 : invFact.value;
          const avgPay = openPayFact && openPayFact.value !== undefined ? (openPayFact.value + payFact.value) / 2 : payFact.value;

          const avgOperatingWC = avgRec + avgInv - avgPay;
          const wcDays = Math.round(((avgOperatingWC / revFact.value) * 365) * 10) / 10;

          const warnings: string[] = [];
          if (!hasFullOpening) {
            warnings.push('FALLBACK_CLOSING_WC_USED: Some or all opening working capital balances were unavailable; calculated using available balances.');
          }
          if (wcDays < 0) {
            warnings.push('Negative working capital days (favorable cash-generative working capital model).');
          }

          results.push({
            metricId: `calc_${companySymbol}_working_capital_days_${targetFY}`,
            metricCode: 'WORKING_CAPITAL_DAYS',
            metricName: 'Working Capital Days (Average WC)',
            category: 'WORKING_CAPITAL',
            value: wcDays,
            unit: 'DAYS',
            period: targetFY,
            formulaId: wcDaysFormula.formulaId,
            formulaName: wcDaysFormula.formulaName,
            formulaExpression: wcDaysFormula.formulaExpression,
            methodologyId: hasFullOpening ? 'WC_AVERAGE_OPERATING_DAYS_V1' : 'WC_CLOSING_OPERATING_DAYS_FALLBACK_V1',
            methodologyVersion: METHODOLOGY_VERSION,
            calculationVersion: CALCULATION_VERSION,
            inputFactIds: inputIds,
            inputFactsSummary: summaries,
            calculationTimestamp: new Date().toISOString(),
            status: 'CALCULATED',
            warnings,
            isApplicableForBusinessModel: true,
          });
        }
      }
    }

    // Cash Conversion Cycle (CCC)
    const cccFormula = FormulaRegistry.getFormula('CASH_CONVERSION_CYCLE');
    if (cccFormula) {
      const isApplicable = cccFormula.applicableArchetypes.includes(archetype);
      if (!isApplicable) {
        results.push(this.createNotApplicableMetric(projectId, 'CASH_CONVERSION_CYCLE', 'Cash Conversion Cycle (CCC)', 'WORKING_CAPITAL', targetFY, cccFormula));
      } else {
        const recDaysMetric = results.find((r) => r.metricCode === 'RECEIVABLE_DAYS');
        const invDaysMetric = results.find((r) => r.metricCode === 'INVENTORY_DAYS');
        const payDaysMetric = results.find((r) => r.metricCode === 'PAYABLE_DAYS');

        const inputIds: string[] = [];
        const summaries: InputFactSummary[] = [];
        if (recDaysMetric?.inputFactIds) inputIds.push(...recDaysMetric.inputFactIds);
        if (invDaysMetric?.inputFactIds) inputIds.push(...invDaysMetric.inputFactIds);
        if (payDaysMetric?.inputFactIds) inputIds.push(...payDaysMetric.inputFactIds);
        if (recDaysMetric?.inputFactsSummary) summaries.push(...recDaysMetric.inputFactsSummary);
        if (invDaysMetric?.inputFactsSummary) summaries.push(...invDaysMetric.inputFactsSummary);
        if (payDaysMetric?.inputFactsSummary) summaries.push(...payDaysMetric.inputFactsSummary);

        if (
          !recDaysMetric ||
          recDaysMetric.value === undefined ||
          !invDaysMetric ||
          invDaysMetric.value === undefined ||
          !payDaysMetric ||
          payDaysMetric.value === undefined
        ) {
          results.push({
            metricId: `calc_${companySymbol}_cash_conversion_cycle_${targetFY}`,
            metricCode: 'CASH_CONVERSION_CYCLE',
            metricName: 'Cash Conversion Cycle (CCC)',
            category: 'WORKING_CAPITAL',
            unit: 'DAYS',
            period: targetFY,
            formulaId: cccFormula.formulaId,
            formulaName: cccFormula.formulaName,
            formulaExpression: cccFormula.formulaExpression,
            methodologyId: 'WC_CASH_CONVERSION_CYCLE_V1',
            methodologyVersion: METHODOLOGY_VERSION,
            calculationVersion: CALCULATION_VERSION,
            inputFactIds: Array.from(new Set(inputIds)),
            inputFactsSummary: summaries,
            calculationTimestamp: new Date().toISOString(),
            status: 'MISSING_INPUT',
            warnings: ['Underlying activity day metrics (Receivable, Inventory, or Payable days) are missing.'],
            isApplicableForBusinessModel: true,
          });
        } else {
          const cccVal = Math.round((recDaysMetric.value + invDaysMetric.value - payDaysMetric.value) * 10) / 10;
          results.push({
            metricId: `calc_${companySymbol}_cash_conversion_cycle_${targetFY}`,
            metricCode: 'CASH_CONVERSION_CYCLE',
            metricName: 'Cash Conversion Cycle (CCC)',
            category: 'WORKING_CAPITAL',
            value: cccVal,
            unit: 'DAYS',
            period: targetFY,
            formulaId: cccFormula.formulaId,
            formulaName: cccFormula.formulaName,
            formulaExpression: cccFormula.formulaExpression,
            methodologyId: 'WC_CASH_CONVERSION_CYCLE_V1',
            methodologyVersion: METHODOLOGY_VERSION,
            calculationVersion: CALCULATION_VERSION,
            inputFactIds: Array.from(new Set(inputIds)),
            inputFactsSummary: summaries,
            calculationTimestamp: new Date().toISOString(),
            status: 'CALCULATED',
            warnings: cccVal < 0 ? ['Negative Cash Conversion Cycle: Business is funded by supplier credit.'] : [],
            isApplicableForBusinessModel: true,
          });
        }
      }
    }

    return results;
  }

  private static createNotApplicableMetric(
    projectId: string,
    metricCode: string,
    metricName: string,
    category: CalculatedMetric['category'],
    period: string,
    formula: any
  ): CalculatedMetric {
    return {
      metricId: `calc_${projectId}_${metricCode.toLowerCase()}_${period}`,
      metricCode,
      metricName,
      category,
      unit: formula.unit,
      period,
      formulaId: formula.formulaId,
      formulaName: formula.formulaName,
      formulaExpression: formula.formulaExpression,
      methodologyId: 'BUSINESS_MODEL_GATED_NOT_APPLICABLE',
      methodologyVersion: METHODOLOGY_VERSION,
      calculationVersion: CALCULATION_VERSION,
      inputFactIds: [],
      inputFactsSummary: [],
      calculationTimestamp: new Date().toISOString(),
      status: 'NOT_APPLICABLE',
      warnings: [`Metric is NOT_APPLICABLE for this company economic archetype/business model.`],
      isApplicableForBusinessModel: false,
    };
  }
}
