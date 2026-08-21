import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InvestmentVerdictView } from '../../../src/routes/InvestmentVerdictView';
import { createResearchProject } from '../../../src/domain/models/ResearchProject';
import { createCompanyEntity } from '../../../src/domain/models/Company';

describe('Phase 14 — Investment Verdict UI View & Audit Drawer', () => {
  const company = createCompanyEntity({
    legalName: 'Tata Motors Limited',
    displayName: 'Tata Motors',
    symbol: 'TATAMOTORS',
    exchange: 'NSE',
    isin: 'INE155A01022',
    sector: 'Automobile',
    subsector: 'Passenger Vehicles (PV)',
    marketCapCategory: 'LARGE_CAP',
  });

  const project = createResearchProject({
    company,
    name: 'Tata Motors FY24 Deep Research',
  });

  it('renders all modular research cards on the verdict dashboard', () => {
    render(<InvestmentVerdictView project={project} />);

    // Assert cards present
    expect(screen.getByText(/Price, Valuation & Margin of Safety/i)).toBeInTheDocument();
    expect(screen.getByText(/Business Quality, Forensics & Governance/i)).toBeInTheDocument();
    expect(screen.getByText(/Evidence-Grounded Investment Thesis/i)).toBeInTheDocument();
    expect(screen.getByText(/Forward Scenarios & Downside Cushion/i)).toBeInTheDocument();
    expect(screen.getByText(/Catalysts, Key Risks & Thesis Breakers/i)).toBeInTheDocument();
    expect(screen.getByText(/Forward Horizons, Timing & Behavioral Context/i)).toBeInTheDocument();
  });

  it('opens and closes the Decision Audit Trail Drawer upon user click', () => {
    render(<InvestmentVerdictView project={project} />);

    const auditBtn = screen.getByRole('button', { name: /Inspect Decision Audit Trail/i });
    fireEvent.click(auditBtn);

    expect(screen.getByText(/Decision Audit Trail & Provenance/i)).toBeInTheDocument();
    expect(screen.getByText(/Execution Snapshot Metadata/i)).toBeInTheDocument();
    expect(screen.getByText(/What Would Change the Verdict\?/i)).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /Close Audit Inspector/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByText(/Execution Snapshot Metadata/i)).not.toBeInTheDocument();
  });
});
