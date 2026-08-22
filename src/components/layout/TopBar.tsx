import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Clock, Plus, BarChart3, Compass, BookOpen } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { SystemStatus } from '../../types';
import { ResearchProject } from '../../domain/models/ResearchProject';
import { ProjectSwitcher } from '../project/ProjectSwitcher';
import { useGuidedTour } from '../guided/GuidedTourContext';

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
  const { startTour, openRulesModal } = useGuidedTour();

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
      {/* Brand & Platform Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              background: 'var(--brand-blue)',
              borderRadius: '5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <BarChart3 size={15} />
          </div>
          <span
            style={{
              fontWeight: 800,
              fontSize: '13px',
              letterSpacing: '0.04em',
              color: 'var(--brand-navy)',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            icon={<Plus size={12} />}
            onClick={onOpenNewProjectModal}
          >
            Create Research Project
          </Button>
        )}

        <Button
          size="sm"
          variant="secondary"
          icon={<Plus size={12} />}
          onClick={onOpenNewProjectModal}
          id="topbar-new-project-btn"
        >
          New Company
        </Button>
      </div>

      {/* Right Controls: Guided Tour, Institutional Rules, Market Time & Engine Health */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Guided Tour Trigger */}
        <Button
          size="sm"
          variant="primary"
          icon={<Compass size={12} />}
          onClick={() => startTour(0)}
          id="topbar-guided-tour-btn"
        >
          Guided Tour
        </Button>

        {/* Institutional Rules */}
        <Button
          size="sm"
          variant="secondary"
          icon={<BookOpen size={12} />}
          onClick={openRulesModal}
          id="topbar-rules-btn"
        >
          Analyst Rules
        </Button>

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
          <span className="tabular-nums" style={{ fontWeight: 600 }}>{currentTime}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity size={13} color={systemStatus.engineStatus === 'READY' ? 'var(--color-bullish)' : 'var(--color-warning)'} />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: systemStatus.engineStatus === 'READY' ? 'var(--color-bullish)' : 'var(--color-warning)',
              fontWeight: 700,
            }}
          >
            ENGINE {systemStatus.engineStatus}
          </span>
        </div>

        <Badge variant="bullish">
          OPERATIONAL
        </Badge>
      </div>
    </header>
  );
};
