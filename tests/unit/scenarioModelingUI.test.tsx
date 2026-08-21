/**
 * scenarioModelingUI.test.tsx
 * Phase 13 — UI Integration & User Journey Tests for ScenarioModelingView.
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScenarioModelingView } from '../../src/routes/ScenarioModelingView';
import { createResearchProject } from '../../src/domain/models/ResearchProject';
import { createCompanyEntity } from '../../src/domain/models/Company';

describe('Phase 13 — Scenario Modeling Terminal UI View Tests', () => {
  const mockCompany = createCompanyEntity({
    symbol: 'TATAMOTORS',
    displayName: 'Tata Motors Limited',
    legalName: 'Tata Motors Limited',
    exchange: 'NSE',
    sector: 'Automobile',
    subsector: 'Passenger Vehicles (PV)',
    businessModel: 'NON_FINANCIAL_OPERATING',
    marketCapCategory: 'LARGE_CAP',
  });

  it('renders ScenarioModelingView with overview cards, comparison table, financial table, and sensitivity grids', () => {
    const project = createResearchProject({ company: mockCompany });
    render(<ScenarioModelingView project={project} />);

    expect(screen.getByText(/Scenario Modeling & Forward Financial Projection Engine/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Base Case/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Bull Case/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Bear Case/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Scenario Comparison & Distribution Matrix/i)).toBeInTheDocument();
    expect(screen.getByText(/2D Valuation Sensitivity Matrix/i)).toBeInTheDocument();
  });

  it('allows switching scenarios and updates the financial dashboard card title', () => {
    const project = createResearchProject({ company: mockCompany });
    render(<ScenarioModelingView project={project} />);

    // Click Bull Case card
    const bullCards = screen.getAllByText(/Bull Case/i);
    fireEvent.click(bullCards[0]);

    expect(screen.getByText(/Forward Financial Projections — Bull Case/i)).toBeInTheDocument();
  });

  it('opens and closes the assumption detail inspector modal', () => {
    const project = createResearchProject({ company: mockCompany });
    render(<ScenarioModelingView project={project} />);

    // Click Inspect button on first assumption
    const inspectBtns = screen.getAllByRole('button', { name: /Inspect/i });
    expect(inspectBtns.length).toBeGreaterThan(0);
    fireEvent.click(inspectBtns[0]);

    expect(screen.getByText(/Source Provenance/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Close Inspector/i })).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByRole('button', { name: /Close Inspector/i }));
    expect(screen.queryByText(/Close Inspector/i)).not.toBeInTheDocument();
  });
});
