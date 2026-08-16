import React, { useState } from 'react';
import { ChevronDown, Plus, Check, Briefcase } from 'lucide-react';
import { ResearchProject } from '../../domain/models/ResearchProject';
import { ProjectStorage } from '../../domain/storage/ProjectStorage';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface ProjectSwitcherProps {
  activeProject: ResearchProject;
  onProjectChange: (project: ResearchProject) => void;
  onOpenNewProjectModal: () => void;
}

export const ProjectSwitcher: React.FC<ProjectSwitcherProps> = ({
  activeProject,
  onProjectChange,
  onOpenNewProjectModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const projects = ProjectStorage.listProjects();

  const handleSelect = (projectId: string) => {
    try {
      ProjectStorage.setActiveProject(projectId);
      const selected = ProjectStorage.getActiveProject();
      onProjectChange(selected);
      setIsOpen(false);
    } catch (e) {
      console.error('Failed to select project:', e);
    }
  };

  return (
    <div style={{ position: 'relative' }} id="project-switcher-container">
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-surface-raised)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '4px',
          padding: '4px 10px',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          outline: 'none',
          fontSize: '12px',
        }}
        id="project-switcher-btn"
      >
        <Briefcase size={12} color="#38bdf8" />
        <span style={{ fontWeight: 600, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {activeProject.company.displayName}
        </span>
        <Badge variant="cyan">{activeProject.company.exchange}:{activeProject.company.symbol}</Badge>
        <ChevronDown size={12} color="var(--text-muted)" />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            width: '320px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: '4px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            overflow: 'hidden',
          }}
          id="project-switcher-dropdown"
        >
          <div
            style={{
              padding: '8px 12px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            <span>Active Research Projects ({projects.length})</span>
            <Button
              size="sm"
              variant="primary"
              icon={<Plus size={11} />}
              onClick={() => {
                setIsOpen(false);
                onOpenNewProjectModal();
              }}
              id="new-project-dropdown-btn"
            >
              New
            </Button>
          </div>

          <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
            {projects.map((proj) => {
              const isSelected = proj.id === activeProject.id;
              return (
                <div
                  key={proj.id}
                  onClick={() => handleSelect(proj.id)}
                  style={{
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--bg-surface-active)' : 'transparent',
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background 0.12s ease',
                  }}
                  className="project-dropdown-item"
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ fontWeight: isSelected ? 600 : 400, color: 'var(--text-primary)', fontSize: '12px' }}>
                      {proj.company.legalName}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span className="tabular-nums">{proj.company.exchange}:{proj.company.symbol}</span>
                      <span>•</span>
                      <span>{proj.company.sector}</span>
                    </div>
                  </div>

                  {isSelected && <Check size={14} color="#38bdf8" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
