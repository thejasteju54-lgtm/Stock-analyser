import {
  FinancialFact,
  TwoYearReconciliationRecord,
  FactCategory,
} from './FinancialFactTypes';

export class TwoYearReconciliation {
  /**
   * Reconciles financial facts across two consecutive financial years (FY-1 and FY-0)
   * establishes side-by-side comparability without calculating derived growth or margins.
   */
  public static reconcile(params: {
    facts: FinancialFact[];
    fy1Period: string; // e.g. 'FY23'
    fy0Period: string; // e.g. 'FY24'
    preferredAccountingBasis?: 'CONSOLIDATED' | 'STANDALONE';
  }): TwoYearReconciliationRecord[] {
    const { facts, fy1Period, fy0Period, preferredAccountingBasis = 'CONSOLIDATED' } = params;

    // Filter facts by preferred basis (or fallback)
    const relevantFacts = facts.filter((f) => f.accountingBasis === preferredAccountingBasis);

    // Group by category and metric
    const metricMap = new Map<
      string,
      {
        metric: string;
        label: string;
        category: FactCategory;
        fy1Fact?: FinancialFact;
        fy0Fact?: FinancialFact;
      }
    >();

    for (const fact of relevantFacts) {
      const fy = fact.reportingPeriod.fiscalYear || fact.reportingPeriod.rawPeriodString || fact.reportingPeriod.periodType;
      const key = `${fact.category}_${fact.metric}`;

      let entry = metricMap.get(key);
      if (!entry) {
        entry = {
          metric: fact.metric,
          label: fact.metricLabel,
          category: fact.category,
        };
        metricMap.set(key, entry);
      }

      if (fy === fy1Period) {
        entry.fy1Fact = fact;
      } else if (fy === fy0Period) {
        entry.fy0Fact = fact;
      }
    }

    const records: TwoYearReconciliationRecord[] = [];

    for (const entry of metricMap.values()) {
      let isComparable = true;
      let notes: string | undefined = undefined;

      if (entry.fy1Fact && entry.fy0Fact) {
        // Check accounting basis
        if (entry.fy1Fact.accountingBasis !== entry.fy0Fact.accountingBasis) {
          isComparable = false;
          notes = `Accounting basis mismatch: FY-1 (${entry.fy1Fact.accountingBasis}) vs FY-0 (${entry.fy0Fact.accountingBasis})`;
        } else if (entry.fy1Fact.normalizedCurrency !== entry.fy0Fact.normalizedCurrency) {
          isComparable = false;
          notes = `Currency mismatch: FY-1 (${entry.fy1Fact.normalizedCurrency}) vs FY-0 (${entry.fy0Fact.normalizedCurrency})`;
        } else {
          notes = 'Comparable across both consecutive audited reports.';
        }
      } else if (!entry.fy1Fact && entry.fy0Fact) {
        isComparable = false;
        notes = `Reported only in ${fy0Period}; missing from ${fy1Period} filings.`;
      } else if (entry.fy1Fact && !entry.fy0Fact) {
        isComparable = false;
        notes = `Reported in ${fy1Period}; discontinued or absent in ${fy0Period}.`;
      }

      records.push({
        metric: entry.metric,
        metricLabel: entry.label,
        category: entry.category,
        accountingBasis: preferredAccountingBasis,
        fy1Fact: entry.fy1Fact,
        fy0Fact: entry.fy0Fact,
        isComparable,
        comparabilityNotes: notes,
      });
    }

    return records;
  }
}
