import { describe, it, expect, beforeEach } from 'vitest';
import { ProjectStorage } from '../../src/domain/storage/ProjectStorage';
import { createCompanyEntity } from '../../src/domain/models/Company';
import { createResearchProject } from '../../src/domain/models/ResearchProject';

describe('Phase 2 — Research Project Storage & Persistence', () => {
  beforeEach(() => {
    ProjectStorage.clearAll();
  });

  it('initializes with default seed project when storage is empty', () => {
    const list = ProjectStorage.listProjects();
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list[0].company.symbol).toBe('TATAMOTORS');

    const active = ProjectStorage.getActiveProject();
    expect(active.company.symbol).toBe('TATAMOTORS');
  });

  it('saves a new research project and sets it active', () => {
    const reliance = createCompanyEntity({
      legalName: 'Reliance Industries Limited',
      displayName: 'Reliance',
      symbol: 'RELIANCE',
      exchange: 'NSE',
      sector: 'Oil & Gas',
      subsector: 'Refining & Marketing (R&M)',
      marketCapCategory: 'LARGE_CAP',
    });

    const project = createResearchProject({
      company: reliance,
      name: 'Reliance Industries 2-Year Deep Research',
      primaryResearchObjective: 'O2C cash flow and retail expansion audit',
    });

    ProjectStorage.saveProject(project);

    const all = ProjectStorage.listProjects();
    expect(all.some((p) => p.company.symbol === 'RELIANCE')).toBe(true);

    const active = ProjectStorage.getActiveProject();
    expect(active.company.symbol).toBe('RELIANCE');
    expect(active.status).toBe('ONBOARDED');
  });

  it('prevents saving duplicate research projects with the same exchange and symbol', () => {
    const tcs = createCompanyEntity({
      legalName: 'Tata Consultancy Services Limited',
      displayName: 'TCS',
      symbol: 'TCS',
      exchange: 'NSE',
      sector: 'IT Services',
      subsector: 'Tier 1 IT Exporters',
    });

    const project1 = createResearchProject({ company: tcs, name: 'TCS Research 1' });
    ProjectStorage.saveProject(project1);

    const project2 = createResearchProject({ company: tcs, name: 'TCS Research 2' });
    expect(() => ProjectStorage.saveProject(project2)).toThrowError(/already exists/i);
  });

  it('switches active projects cleanly', () => {
    const infy = createCompanyEntity({
      legalName: 'Infosys Limited',
      displayName: 'Infosys',
      symbol: 'INFY',
      exchange: 'NSE',
      sector: 'IT Services',
      subsector: 'Tier 1 IT Exporters',
    });
    const infyProj = createResearchProject({ company: infy });
    ProjectStorage.saveProject(infyProj);

    const activeFirst = ProjectStorage.getActiveProject();
    expect(activeFirst.company.symbol).toBe('INFY');

    // Switch back to initial default project
    const all = ProjectStorage.listProjects();
    const tataProj = all.find((p) => p.company.symbol === 'TATAMOTORS');
    expect(tataProj).toBeDefined();

    if (tataProj) {
      ProjectStorage.setActiveProject(tataProj.id);
      const activeSwitched = ProjectStorage.getActiveProject();
      expect(activeSwitched.company.symbol).toBe('TATAMOTORS');
    }
  });
});
