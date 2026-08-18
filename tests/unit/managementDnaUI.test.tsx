import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ManagementCredibilityCard } from '../../src/components/management/ManagementCredibilityCard';
import { PromiseVsDeliveryCard } from '../../src/components/management/PromiseVsDeliveryCard';
import { GuidanceTrackingCard } from '../../src/components/management/GuidanceTrackingCard';
import { LanguageShiftCard } from '../../src/components/management/LanguageShiftCard';
import { ManagementDataTensionsCard } from '../../src/components/management/ManagementDataTensionsCard';
import { ManagementDnaCard } from '../../src/components/management/ManagementDnaCard';
import { PromiseTimelineModal } from '../../src/components/management/PromiseTimelineModal';
import { ManagementDnaEngine } from '../../src/domain/management/ManagementDnaEngine';

describe('Phase 8 — Management DNA UI Components', () => {
  const sampleMetrics: any[] = [
    {
      metricId: 'calc_rev_growth_fy24',
      metricCode: 'REVENUE_GROWTH',
      metricName: 'Revenue Growth YoY',
      category: 'GROWTH',
      period: 'FY24',
      value: 26.6,
      unit: 'PERCENT',
      formula: '((Rev FY24 - Rev FY23)/Rev FY23)*100',
      inputFactIds: ['f1', 'f2'],
      confidence: 95,
      calculatedAt: new Date().toISOString(),
    },
    {
      metricId: 'calc_debt_fy24',
      metricCode: 'DEBT_TO_EQUITY',
      metricName: 'Debt to Equity',
      category: 'LEVERAGE',
      period: 'FY24',
      value: 0.8,
      unit: 'RATIO',
      formula: 'Debt / Equity',
      inputFactIds: ['f3', 'f4'],
      confidence: 95,
      calculatedAt: new Date().toISOString(),
    },
  ];

  const mockReport = ManagementDnaEngine.analyze('proj_1', 'TATAMOTORS', [], [], sampleMetrics, null, 'FY24', 'FY23');

  it('renders ManagementCredibilityCard with score and definition notice', () => {
    render(<ManagementCredibilityCard assessment={mockReport.credibilityAssessment} />);
    expect(screen.getByText(/Execution Credibility Assessment/i)).toBeInTheDocument();
    expect(screen.getByText(/Methodology Definition:/i)).toBeInTheDocument();
    expect(screen.getByText(/Derived from/i)).toBeInTheDocument();
  });

  it('renders PromiseVsDeliveryCard and filters by status', () => {
    render(<PromiseVsDeliveryCard commitments={mockReport.commitments} />);
    expect(screen.getByText(/Promise vs Delivery Register/i)).toBeInTheDocument();
    expect(screen.getByText(/Revenue Growth YoY/i)).toBeInTheDocument();

    const select = screen.getByTestId('status-filter-select');
    fireEvent.change(select, { target: { value: 'MISSED' } });
    expect(screen.getByText(/No management commitments match the selected filter/i)).toBeInTheDocument();
  });

  it('renders GuidanceTrackingCard with stable guidance notice', () => {
    render(<GuidanceTrackingCard revisions={mockReport.guidanceRevisions} commitments={mockReport.commitments} />);
    expect(screen.getByText(/Guidance Revision & Target Postponement Ledger/i)).toBeInTheDocument();
    expect(screen.getByText(/Original guidance targets are strictly preserved/i)).toBeInTheDocument();
  });

  it('renders LanguageShiftCard with observable shift topics', () => {
    render(<LanguageShiftCard shifts={mockReport.languageShifts} />);
    expect(screen.getByText(/Year-over-Year Language & Communication Shift Analysis/i)).toBeInTheDocument();
    expect(screen.getByText(/Topic: Demand Outlook & Volume Growth/i)).toBeInTheDocument();
  });

  it('renders ManagementDataTensionsCard', () => {
    render(<ManagementDataTensionsCard tensions={mockReport.dataTensions} />);
    expect(screen.getByText(/Management Commentary vs Financial Data Tensions/i)).toBeInTheDocument();
  });

  it('renders ManagementDnaCard with 7 discipline dimensions', () => {
    render(<ManagementDnaCard profile={mockReport.dnaProfile} />);
    expect(screen.getByText(/Management DNA Profile & Behavioral Disciplines/i)).toBeInTheDocument();
    expect(screen.getByText(/Execution Discipline & Target Delivery/i)).toBeInTheDocument();
    expect(screen.getByText(/Observed Execution Strengths/i)).toBeInTheDocument();
  });

  it('renders PromiseTimelineModal and closes on button click', () => {
    let isOpen = true;
    const handleClose = () => {
      isOpen = false;
    };

    const { rerender } = render(
      <PromiseTimelineModal
        isOpen={isOpen}
        onClose={handleClose}
        commitments={mockReport.commitments}
        companySymbol="TATAMOTORS"
      />
    );

    expect(screen.getByText(/Promise Timeline & Execution Journey \(TATAMOTORS\)/i)).toBeInTheDocument();
    const closeBtn = screen.getByText(/Close Timeline/i);
    fireEvent.click(closeBtn);
    expect(isOpen).toBe(false);

    rerender(
      <PromiseTimelineModal
        isOpen={isOpen}
        onClose={handleClose}
        commitments={mockReport.commitments}
        companySymbol="TATAMOTORS"
      />
    );
    expect(screen.queryByText(/Promise Timeline & Execution Journey/i)).not.toBeInTheDocument();
  });
});
