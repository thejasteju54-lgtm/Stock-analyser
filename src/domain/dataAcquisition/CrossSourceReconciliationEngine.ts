import { NormalizedFinancialStatementItem, SourceTier } from '../../infrastructure/researchSources/SourceAdapterTypes';

export interface ReconciliationReportItem {
  metricKey: string;
  periodLabel: string;
  reconciledValue: number | null;
  unit: string;
  status: 'CORROBORATED' | 'RECONCILED' | 'SINGLE_SOURCE' | 'SOURCE_CONFLICT';
  authoritativeSourceTier: SourceTier;
  sourcesCompared: {
    sourceId: string;
    sourceTier: SourceTier;
    value: number;
    basis: string;
  }[];
  deltaAmount?: number;
  explanation?: string;
}

export class CrossSourceReconciliationEngine {
  static reconcileMetric(
    items: NormalizedFinancialStatementItem[]
  ): ReconciliationReportItem {
    if (items.length === 0) {
      return {
        metricKey: 'UNKNOWN',
        periodLabel: 'UNKNOWN',
        reconciledValue: null,
        unit: 'INR_CR',
        status: 'SOURCE_CONFLICT',
        authoritativeSourceTier: 5,
        sourcesCompared: [],
        explanation: 'No sources provided for reconciliation.',
      };
    }

    const first = items[0];
    const metricKey = first.metricKey;
    const periodLabel = first.periodLabel;

    const sourcesCompared = items.map((i) => ({
      sourceId: i.sourceId,
      sourceTier: i.sourceTier,
      value: i.value,
      basis: i.reportingBasis,
    }));

    if (items.length === 1) {
      return {
        metricKey,
        periodLabel,
        reconciledValue: first.value,
        unit: 'INR_CR',
        status: 'SINGLE_SOURCE',
        authoritativeSourceTier: first.sourceTier,
        sourcesCompared,
        explanation: `Single source available from ${first.sourceId} (Tier ${first.sourceTier}).`,
      };
    }

    // Sort by Source Tier (Tier 1 is highest priority)
    const sorted = [...items].sort((a, b) => a.sourceTier - b.sourceTier);
    const topSource = sorted[0];

    // Check if values match within 0.1% tolerance
    const valuesMatch = sorted.every(
      (i) => Math.abs(i.value - topSource.value) / (Math.abs(topSource.value) || 1) < 0.001
    );

    if (valuesMatch) {
      return {
        metricKey,
        periodLabel,
        reconciledValue: topSource.value,
        unit: 'INR_CR',
        status: 'CORROBORATED',
        authoritativeSourceTier: topSource.sourceTier,
        sourcesCompared,
        explanation: `Corroborated across ${items.length} independent sources.`,
      };
    }

    // Check if difference is due to restatement or basis
    const hasDifferentBasis = sorted.some((i) => i.reportingBasis !== topSource.reportingBasis);
    if (hasDifferentBasis) {
      return {
        metricKey,
        periodLabel,
        reconciledValue: topSource.value,
        unit: 'INR_CR',
        status: 'RECONCILED',
        authoritativeSourceTier: topSource.sourceTier,
        sourcesCompared,
        explanation: `Reconciled: Preference given to ${topSource.reportingBasis} from Tier ${topSource.sourceTier} source.`,
      };
    }

    // Disagreement within same reporting basis -> Source Conflict
    const maxDelta = Math.max(...sorted.map((i) => Math.abs(i.value - topSource.value)));

    return {
      metricKey,
      periodLabel,
      reconciledValue: topSource.value,
      unit: 'INR_CR',
      status: 'SOURCE_CONFLICT',
      authoritativeSourceTier: topSource.sourceTier,
      sourcesCompared,
      deltaAmount: maxDelta,
      explanation: `Conflict detected across sources with delta ₹${maxDelta.toLocaleString('en-IN')} Cr. Tier ${topSource.sourceTier} prioritized for downstream calculation.`,
    };
  }
}
