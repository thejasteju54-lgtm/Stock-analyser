import { ResearchProject, createResearchProject } from '../models/ResearchProject';
import { CompanyIdentity, createCompanyEntity } from '../models/Company';
import { IngestedDocument } from '../ingestion/DocumentTypes';
import {
  FinancialFact,
  ManagementClaim,
  ContradictionRecord,
} from '../extraction/FinancialFactTypes';

const STORAGE_KEY_PROJECTS = 'eq_terminal_research_projects_v1';
const STORAGE_KEY_ACTIVE_PROJECT_ID = 'eq_terminal_active_project_id_v1';

// Initial verified default company project to seed initial session if empty
const DEFAULT_INITIAL_COMPANY: CompanyIdentity = createCompanyEntity({
  legalName: 'Tata Motors Limited',
  displayName: 'Tata Motors',
  symbol: 'TATAMOTORS',
  exchange: 'NSE',
  isin: 'INE155A01022',
  sector: 'Automobile',
  subsector: 'Passenger Vehicles (PV)',
  marketCapCategory: 'LARGE_CAP',
});

const DEFAULT_INITIAL_PROJECT: ResearchProject = createResearchProject({
  company: DEFAULT_INITIAL_COMPANY,
  name: 'Tata Motors Limited — Comprehensive Equity Research',
  primaryResearchObjective: '2-Year Fundamental, Forensic & Valuation Audit',
  targetInvestmentHorizon: '3_YEARS',
  sourceFilingYears: ['FY24', 'FY23'],
});

export class ProjectStorage {
  private static isBrowserEnvironment(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  public static listProjects(): ResearchProject[] {
    if (!this.isBrowserEnvironment()) {
      return [DEFAULT_INITIAL_PROJECT];
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_PROJECTS);
      if (!raw) {
        // Seed initial default project
        const initialList = [DEFAULT_INITIAL_PROJECT];
        window.localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(initialList));
        window.localStorage.setItem(STORAGE_KEY_ACTIVE_PROJECT_ID, DEFAULT_INITIAL_PROJECT.id);
        return initialList;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return [DEFAULT_INITIAL_PROJECT];
      }
      return parsed;
    } catch (e) {
      console.warn('Failed to parse stored projects, resetting to default:', e);
      return [DEFAULT_INITIAL_PROJECT];
    }
  }

  public static getActiveProjectId(): string {
    if (!this.isBrowserEnvironment()) {
      return DEFAULT_INITIAL_PROJECT.id;
    }

    const activeId = window.localStorage.getItem(STORAGE_KEY_ACTIVE_PROJECT_ID);
    if (activeId) return activeId;

    const all = this.listProjects();
    return all[0]?.id || DEFAULT_INITIAL_PROJECT.id;
  }

  public static getActiveProject(): ResearchProject {
    const activeId = this.getActiveProjectId();
    const all = this.listProjects();
    const found = all.find((p) => p.id === activeId);
    return found || all[0] || DEFAULT_INITIAL_PROJECT;
  }

  public static setActiveProject(projectId: string): void {
    if (!this.isBrowserEnvironment()) return;

    const all = this.listProjects();
    const project = all.find((p) => p.id === projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found.`);
    }

    project.lastAccessedAt = new Date().toISOString();
    this.saveAllProjects(all);
    window.localStorage.setItem(STORAGE_KEY_ACTIVE_PROJECT_ID, projectId);
  }

  public static saveProject(project: ResearchProject): void {
    const all = this.listProjects();
    const existingIndex = all.findIndex((p) => p.id === project.id);

    // Check for duplicate company symbol on the same exchange (excluding this project id)
    const duplicate = all.find(
      (p) =>
        p.id !== project.id &&
        p.company.symbol.toUpperCase() === project.company.symbol.toUpperCase() &&
        (p.company.exchange || 'NSE').toUpperCase() === (project.company.exchange || 'NSE').toUpperCase()
    );
    if (duplicate) {
      throw new Error(
        `A research project for ${project.company.exchange || 'NSE'}:${project.company.symbol} already exists (${duplicate.name}).`
      );
    }

    if (existingIndex >= 0) {
      all[existingIndex] = {
        ...project,
        updatedAt: new Date().toISOString(),
      };
    } else {
      all.unshift(project);
    }

    this.saveAllProjects(all);
    this.setActiveProject(project.id);
  }

  public static deleteProject(projectId: string): void {
    const all = this.listProjects();
    if (all.length <= 1) {
      throw new Error('Cannot delete the only remaining research project.');
    }

    const filtered = all.filter((p) => p.id !== projectId);
    this.saveAllProjects(filtered);

    if (this.getActiveProjectId() === projectId) {
      this.setActiveProject(filtered[0].id);
    }
  }

  public static getProject(projectId: string): ResearchProject | undefined {
    return this.listProjects().find((p) => p.id === projectId);
  }

  public static getDocumentsForProject(projectId: string): IngestedDocument[] {
    const project = this.getProject(projectId);
    return project ? project.documents || [] : [];
  }

  public static addDocumentToProject(projectId: string, document: IngestedDocument): ResearchProject {
    const project = this.getProject(projectId);
    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    const docs = project.documents || [];
    const updatedDocs = [document, ...docs.filter((d: IngestedDocument) => d.id !== document.id)];
    const updatedProject: ResearchProject = {
      ...project,
      documents: updatedDocs,
      status: updatedDocs.length > 0 && project.status === 'ONBOARDED' ? 'INGESTING' : project.status,
      updatedAt: new Date().toISOString(),
    };

    this.saveProject(updatedProject);
    return updatedProject;
  }

  public static updateDocumentInProject(projectId: string, document: IngestedDocument): ResearchProject {
    const project = this.getProject(projectId);
    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    const docs = project.documents || [];
    const updatedDocs = docs.map((d: IngestedDocument) => (d.id === document.id ? document : d));
    const updatedProject: ResearchProject = {
      ...project,
      documents: updatedDocs,
      updatedAt: new Date().toISOString(),
    };

    this.saveProject(updatedProject);
    return updatedProject;
  }

  public static removeDocumentFromProject(projectId: string, documentId: string): ResearchProject {
    const project = this.getProject(projectId);
    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    const docs = project.documents || [];
    const updatedDocs = docs.filter((d: IngestedDocument) => d.id !== documentId);
    const updatedProject: ResearchProject = {
      ...project,
      documents: updatedDocs,
      updatedAt: new Date().toISOString(),
    };

    this.saveProject(updatedProject);
    return updatedProject;
  }

  public static getFactsForProject(projectId: string): FinancialFact[] {
    const project = this.getProject(projectId);
    return project?.facts || [];
  }

  public static saveFactsForProject(projectId: string, facts: FinancialFact[]): ResearchProject {
    const project = this.getProject(projectId);
    if (!project) throw new Error(`Project not found: ${projectId}`);

    const updatedProject: ResearchProject = {
      ...project,
      facts,
      status: facts.length > 0 ? 'EXTRACTED' : project.status,
      updatedAt: new Date().toISOString(),
    };

    this.saveProject(updatedProject);
    return updatedProject;
  }

  public static getClaimsForProject(projectId: string): ManagementClaim[] {
    const project = this.getProject(projectId);
    return project?.managementClaims || [];
  }

  public static saveClaimsForProject(projectId: string, claims: ManagementClaim[]): ResearchProject {
    const project = this.getProject(projectId);
    if (!project) throw new Error(`Project not found: ${projectId}`);

    const updatedProject: ResearchProject = {
      ...project,
      managementClaims: claims,
      updatedAt: new Date().toISOString(),
    };

    this.saveProject(updatedProject);
    return updatedProject;
  }

  public static getContradictionsForProject(projectId: string): ContradictionRecord[] {
    const project = this.getProject(projectId);
    return project?.contradictions || [];
  }

  public static saveContradictionsForProject(
    projectId: string,
    contradictions: ContradictionRecord[]
  ): ResearchProject {
    const project = this.getProject(projectId);
    if (!project) throw new Error(`Project not found: ${projectId}`);

    const updatedProject: ResearchProject = {
      ...project,
      contradictions,
      updatedAt: new Date().toISOString(),
    };

    this.saveProject(updatedProject);
    return updatedProject;
  }

  public static resolveContradiction(
    projectId: string,
    contradictionId: string,
    resolution: ContradictionRecord['resolutionStatus'],
    notes?: string
  ): ResearchProject {
    const project = this.getProject(projectId);
    if (!project) throw new Error(`Project not found: ${projectId}`);

    const contradictions = (project.contradictions || []).map((c) =>
      c.id === contradictionId
        ? {
            ...c,
            resolutionStatus: resolution,
            resolvedAt: new Date().toISOString(),
            resolutionNotes: notes,
          }
        : c
    );

    const updatedProject: ResearchProject = {
      ...project,
      contradictions,
      updatedAt: new Date().toISOString(),
    };

    this.saveProject(updatedProject);
    return updatedProject;
  }

  public static getCalculatedMetricsForProject(projectId: string): any[] {
    const project = this.getProject(projectId);
    return project?.calculatedMetrics || [];
  }

  public static saveCalculatedMetricsForProject(
    projectId: string,
    calculatedMetrics: any[]
  ): ResearchProject {
    const project = this.getProject(projectId);
    if (!project) throw new Error(`Project not found: ${projectId}`);

    const updatedProject: ResearchProject = {
      ...project,
      calculatedMetrics,
      status: 'ANALYZED',
      updatedAt: new Date().toISOString(),
    };

    this.saveProject(updatedProject);
    return updatedProject;
  }

  public static getFundamentalAnalysisForProject(projectId: string): any | undefined {
    const project = this.getProject(projectId);
    return project?.fundamentalAnalysis;
  }

  public static saveFundamentalAnalysisForProject(
    projectId: string,
    fundamentalAnalysis: any
  ): ResearchProject | undefined {
    const project = this.getProject(projectId);
    if (!project) return undefined;

    const updatedProject: ResearchProject = {
      ...project,
      fundamentalAnalysis,
      status: 'ANALYZED',
      updatedAt: new Date().toISOString(),
    };

    this.saveProject(updatedProject);
    return updatedProject;
  }

  public static getForensicAnalysisForProject(projectId: string): any | undefined {
    const project = this.getProject(projectId);
    return project?.forensicAnalysis;
  }

  public static saveForensicAnalysisForProject(
    projectId: string,
    forensicAnalysis: any
  ): ResearchProject | undefined {
    const project = this.getProject(projectId);
    if (!project) return undefined;

    const updatedProject: ResearchProject = {
      ...project,
      forensicAnalysis,
      status: 'ANALYZED',
      updatedAt: new Date().toISOString(),
    };

    this.saveProject(updatedProject);
    return updatedProject;
  }

  public static getManagementAnalysisForProject(projectId: string): any | undefined {
    const project = this.getProject(projectId);
    return project?.managementAnalysis;
  }

  public static saveManagementAnalysisForProject(
    projectId: string,
    managementAnalysis: any
  ): ResearchProject | undefined {
    const project = this.getProject(projectId);
    if (!project) return undefined;

    const updatedProject: ResearchProject = {
      ...project,
      managementAnalysis,
      status: 'ANALYZED',
      updatedAt: new Date().toISOString(),
    };

    this.saveProject(updatedProject);
    return updatedProject;
  }

  private static saveAllProjects(projects: ResearchProject[]): void {
    if (!this.isBrowserEnvironment()) return;
    window.localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
  }

  public static clearAll(): void {
    if (!this.isBrowserEnvironment()) return;
    window.localStorage.removeItem(STORAGE_KEY_PROJECTS);
    window.localStorage.removeItem(STORAGE_KEY_ACTIVE_PROJECT_ID);
  }
}
