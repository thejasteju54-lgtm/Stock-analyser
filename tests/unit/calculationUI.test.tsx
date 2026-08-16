import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FinancialCalculationsView } from '../../src/routes/FinancialCalculationsView';
import { CalculatedMetricCard } from '../../src/components/calculations/CalculatedMetricCard';
import { MetricProvenanceModal } from '../../src/components/calculations/MetricProvenanceModal';
import { CalculatedMetric } from '../../src/domain/calculations/CalculationTypes';

describe('Phase 5 — Financial Calculations UI Components', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockMetric: CalculatedMetric = {
    metricId: 'calc_tatamotors_ebitda_margin_fy24',
    metricCode: 'EBITDA_MARGIN',
    metricName: 'EBITDA Margin',
    category: 'MARGINS',
    value: 14.19,
    unit: 'PERCENT',
    period: 'FY24',
    formulaId: 'FORMULA_EBITDA_MARGIN_V1',
    formulaName: 'EBITDA Margin',
    formulaExpression: '(EBITDA / Revenue) * 100',
    methodologyId: 'MARGIN_REVENUE_RATIO',
    methodologyVersion: 'india-equity-methodology-v1',
    calculationVersion: 'financial-metrics-v1',
    inputFactIds: ['fact_rev_1', 'fact_ebitda_1'],
    inputFactsSummary: [
      {
        metric: 'EBITDA',
        metricLabel: 'Operating EBITDA',
        period: 'FY24',
        value: 62145,
        unit: 'INR_CRORE',
        currency: 'INR',
        accountingBasis: 'CONSOLIDATED',
        documentName: 'TATAMOTORS_AR_FY24.pdf',
        pageNumber: 112,
        factId: 'fact_ebitda_1',
      },
      {
        metric: 'REVENUE',
        metricLabel: 'Revenue from Operations',
        period: 'FY24',
        value: 437928,
        unit: 'INR_CRORE',
        currency: 'INR',
        accountingBasis: 'CONSOLIDATED',
        documentName: 'TATAMOTORS_AR_FY24.pdf',
        pageNumber: 110,
        factId: 'fact_rev_1',
      },
    ],
    calculationTimestamp: new Date().toISOString(),
    status: 'CALCULATED',
    warnings: [],
    isApplicableForBusinessModel: true,
  };

  it('1. CalculatedMetricCard: renders metric name, value, and formula', () => {
    render(<CalculatedMetricCard metric={mockMetric} onInspect={() => {}} />);

    expect(screen.getByText('EBITDA Margin')).toBeDefined();
    expect(screen.getByText('+14.19%')).toBeDefined();
    expect(screen.getByText('(EBITDA / Revenue) * 100')).toBeDefined();
    expect(screen.getByText('Audit Provenance')).toBeDefined();
  });

  it('2. MetricProvenanceModal: displays multi-hop audit trail with document and page numbers', () => {
    let closed = false;
    render(<MetricProvenanceModal metric={mockMetric} onClose={() => { closed = true; }} />);

    expect(screen.getByText(/Calculation Multi-Hop Provenance Audit/i)).toBeDefined();
    expect(screen.getAllByText('TATAMOTORS_AR_FY24.pdf').length).toBeGreaterThan(0);
    expect(screen.getByText('Page 112')).toBeDefined();
    expect(screen.getByText('india-equity-methodology-v1')).toBeDefined();

    const closeBtn = screen.getByText('Close Provenance');
    fireEvent.click(closeBtn);
    expect(closed).toBe(true);
  });

  it('3. FinancialCalculationsView: renders workspace header, triggers calculation engine, and displays results', async () => {
    render(<FinancialCalculationsView />);

    expect(screen.getByText(/Deterministic Financial Calculation Engine/i)).toBeDefined();
    const runBtn = screen.getByRole('button', { name: /Run Calculation Engine/i });
    expect(runBtn).toBeDefined();

    fireEvent.click(runBtn);
  });
});
