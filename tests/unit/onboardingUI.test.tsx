import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NewProjectModal } from '../../src/components/project/NewProjectModal';
import { ProjectSwitcher } from '../../src/components/project/ProjectSwitcher';
import { ProjectStorage } from '../../src/domain/storage/ProjectStorage';
import { createCompanyEntity } from '../../src/domain/models/Company';
import { createResearchProject } from '../../src/domain/models/ResearchProject';

describe('Phase 2 — Onboarding UI & Project Switcher', () => {
  beforeEach(() => {
    ProjectStorage.clearAll();
  });

  it('renders NewProjectModal and dynamically updates subsectors when changing sector', () => {
    const handleClose = vi.fn();
    const handleCreated = vi.fn();

    render(
      <NewProjectModal
        isOpen={true}
        onClose={handleClose}
        onProjectCreated={handleCreated}
      />
    );

    expect(screen.getByText(/Onboard Indian Listed Company/i)).toBeInTheDocument();

    const sectorSelect = screen.getByLabelText(/SECTOR TAXONOMY/i);
    expect(sectorSelect).toBeInTheDocument();

    // Change sector to Banking
    fireEvent.change(sectorSelect, { target: { value: 'Banking' } });

    // Verify subsectors updated to Banking subsectors
    const subsectorSelect = screen.getByLabelText(/SUBSECTOR VERTICAL/i);
    expect(subsectorSelect).toHaveTextContent(/Private Sector Bank/i);
    expect(screen.getByText(/BUSINESS MODEL: BANKING/i)).toBeInTheDocument();
    expect(screen.getByText(/NPA_PCR_QUALITY/i)).toBeInTheDocument();
  });

  it('displays explicit error banner when required fields are missing or invalid', () => {
    const handleClose = vi.fn();
    const handleCreated = vi.fn();

    render(
      <NewProjectModal
        isOpen={true}
        onClose={handleClose}
        onProjectCreated={handleCreated}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /Onboard Company & Create Project/i });
    fireEvent.click(submitBtn);

    // Should display validation error banner
    expect(screen.getByText(/Company legal name is required/i)).toBeInTheDocument();
    expect(handleCreated).not.toHaveBeenCalled();
  });

  it('successfully creates and submits a new project when valid inputs are provided', () => {
    const handleClose = vi.fn();
    const handleCreated = vi.fn();

    render(
      <NewProjectModal
        isOpen={true}
        onClose={handleClose}
        onProjectCreated={handleCreated}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/e.g. HDFC Bank Limited/i), {
      target: { value: 'HDFC Bank Limited' },
    });
    fireEvent.change(screen.getByPlaceholderText(/e.g. HDFCBANK/i), {
      target: { value: 'HDFCBANK' },
    });

    const sectorSelect = screen.getByLabelText(/SECTOR TAXONOMY/i);
    fireEvent.change(sectorSelect, { target: { value: 'Banking' } });

    const submitBtn = screen.getByRole('button', { name: /Onboard Company & Create Project/i });
    fireEvent.click(submitBtn);

    expect(handleCreated).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);

    const createdProj = handleCreated.mock.calls[0][0];
    expect(createdProj.company.symbol).toBe('HDFCBANK');
    expect(createdProj.company.sector).toBe('Banking');
    expect(createdProj.company.businessModel).toBe('BANKING');
  });

  it('renders ProjectSwitcher and allows opening dropdown to view project library', () => {
    const mockCompany = createCompanyEntity({
      legalName: 'State Bank of India',
      symbol: 'SBIN',
      exchange: 'NSE',
      sector: 'Banking',
      subsector: 'Public Sector Bank',
    });
    const mockProject = createResearchProject({ company: mockCompany });

    const handleChange = vi.fn();
    const handleOpenModal = vi.fn();

    render(
      <ProjectSwitcher
        activeProject={mockProject}
        onProjectChange={handleChange}
        onOpenNewProjectModal={handleOpenModal}
      />
    );

    const switcherBtn = screen.getByRole('button', { name: /State Bank of India/i });
    expect(switcherBtn).toBeInTheDocument();

    // Click to open dropdown
    fireEvent.click(switcherBtn);

    expect(screen.getByText(/Active Research Projects/i)).toBeInTheDocument();
  });
});
