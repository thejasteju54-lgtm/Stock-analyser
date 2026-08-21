/**
 * CapexClassificationPolicyRegistry.ts
 * Phase 13 — Deterministic Maintenance vs Growth Capex Classification Policy.
 */

import { CapexProjection, CapexClassification } from './ScenarioTypes';

export interface CapexInputs {
  historicalDepreciation: number; // in INR Cr
  historicalCapex?: number; // in INR Cr
  announcedExpansionCapex?: number; // in INR Cr (from Phase 11/12)
  projectedRevenue: number; // in INR Cr
  capacityExpansionMilestone?: string;
  sourceReferences?: string[];
  scenarioType: 'BASE' | 'BULL' | 'BEAR';
}

export class CapexClassificationPolicyRegistry {
  /**
   * Deterministically classifies and calculates Maintenance vs Growth Capex.
   * Maintenance Capex = Historical Depreciation * 1.05 (inflation-adjusted replacement).
   * Growth Capex = Announced expansion or project-specific discretionary additions.
   */
  public static evaluateCapex(inputs: CapexInputs): CapexProjection {
    const dep = Math.max(0, inputs.historicalDepreciation || 0);
    const histCapex = inputs.historicalCapex || dep * 1.2;
    const announcedGrowth = Math.max(0, inputs.announcedExpansionCapex || 0);

    if (dep <= 0 && (!inputs.historicalCapex || inputs.historicalCapex <= 0)) {
      return {
        classification: 'NOT_ASSESSABLE',
        maintenanceCapex: 0,
        growthCapex: 0,
        totalCapex: 0,
        capexToRevenuePercent: 0,
        sourceReferences: inputs.sourceReferences || [],
        confidence: 0,
      };
    }

    // Baseline maintenance replacement is historical depreciation with 5% inflation factor
    const maintenanceCapex = Math.round(dep * 1.05 * 100) / 100;

    let growthCapex = 0;
    let classification: CapexClassification = 'MAINTENANCE_CAPEX';

    if (announcedGrowth > 0) {
      growthCapex = announcedGrowth;
      classification = maintenanceCapex > 0 ? 'GROWTH_CAPEX' : 'GROWTH_CAPEX';
    } else if (histCapex > maintenanceCapex) {
      // Historical residual growth capex
      growthCapex = Math.round((histCapex - maintenanceCapex) * 100) / 100;
      classification = 'MIXED';
    }

    // Scenario differentiation
    if (inputs.scenarioType === 'BULL') {
      // Bull case assumes full execution of growth capex + 10% acceleration
      growthCapex = Math.round(growthCapex * 1.1 * 100) / 100;
    } else if (inputs.scenarioType === 'BEAR') {
      // Bear case assumes growth capex curtailed by 30-50% to conserve liquidity
      growthCapex = Math.round(growthCapex * 0.5 * 100) / 100;
    }

    const totalCapex = Math.round((maintenanceCapex + growthCapex) * 100) / 100;
    const capexToRevPct = inputs.projectedRevenue > 0
      ? Math.round((totalCapex / inputs.projectedRevenue) * 1000) / 10
      : 0;

    const confidence = announcedGrowth > 0 ? 90 : histCapex > 0 ? 75 : 50;

    return {
      classification,
      maintenanceCapex,
      growthCapex,
      totalCapex,
      capexToRevenuePercent: capexToRevPct,
      capacityExpansionMilestone: inputs.capacityExpansionMilestone,
      sourceReferences: inputs.sourceReferences || ['Audited Fixed Assets Schedule Note', 'Annual Report MD&A Project Disclosures'],
      confidence,
    };
  }
}
