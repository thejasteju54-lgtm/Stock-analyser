import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Database, Clock, Plus } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { SystemStatus } from '../../types';
import { ResearchProject } from '../../domain/models/ResearchProject';
import { ProjectSwitcher } from '../project/ProjectSwitcher';

interface TopBarProps {
  activeProject: ResearchProject | null;
  systemStatus: SystemStatus;
  onProjectChange: (project: ResearchProject) => void;
  onOpenNewProjectModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeProject,
  systemStatus,
  onProjectChange,
  onOpenNewProjectModal,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' IST'
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="terminal-header" id="terminal-topbar">
      {/* Brand / Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '18px',
              height: '18px',
              background: '#0284c7',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
            }}
          >
            EQ
          </div>
          <span
            style={{
              fontWeight: 700,
              fontSize: '12px',
              letterSpacing: '0.06em',
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
            }}
          >
            Equity Intelligence Terminal
          </span>
        </div>

        <Badge variant="cyan" icon={<ShieldCheck size={11} />}>
          Institutional Grade
        </Badge>
      </div>

      {/* Active Project Switcher & Company Context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {activeProject ? (
          <ProjectSwitcher
            activeProject={activeProject}
            onProjectChange={onProjectChange}
            onOpenNewProjectModal={onOpenNewProjectModal}
          />
        ) : (
          <Button
            size="sm"
            variant="primary"
            icon={<Plus size={11} />}
            onClick={onOpenNewProjectModal}
          >
            Create Research Project
          </Button>
        )}

        <Button
          size="sm"
          icon={<Plus size={11} />}
          onClick={onOpenNewProjectModal}
          id="topbar-new-project-btn"
        >
          New Company (P2)
        </Button>
      </div>

      {/* Right Controls: Market Time & Engine Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
          }}
        >
          <Clock size={12} color="var(--text-muted)" />
          <span className="tabular-nums">{currentTime}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity size={12} color={systemStatus.engineStatus === 'READY' ? '#10b981' : '#f59e0b'} />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: systemStatus.engineStatus === 'READY' ? '#10b981' : '#f59e0b',
              fontWeight: 600,
            }}
          >
            {systemStatus.engineStatus}
          </span>
        </div>

        <Badge variant="neutral" icon={<Database size={10} />}>
          Phase 2 Active
        </Badge>
      </div>
    </header>
  );
};
