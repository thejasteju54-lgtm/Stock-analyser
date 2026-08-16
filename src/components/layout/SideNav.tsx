import React from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  FileSearch,
  TrendingUp,
  AlertOctagon,
  Users,
  Calculator,
  LineChart,
  Layers,
  Newspaper,
  Flame,
  GitFork,
  CheckCircle2,
  Award,
  Compass,
} from 'lucide-react';
import { TerminalRoute } from '../../types';

interface NavItemDef {
  id: TerminalRoute;
  label: string;
  icon: React.ReactNode;
  phase: number;
}

const NAV_SECTIONS: { title: string; items: NavItemDef[] }[] = [
  {
    title: 'Research Workspace',
    items: [
      { id: 'overview', label: 'Terminal Overview', icon: <LayoutDashboard size={14} />, phase: 1 },
      { id: 'ingestion', label: 'Document Ingestion', icon: <UploadCloud size={14} />, phase: 3 },
      { id: 'extraction', label: 'Extraction Review', icon: <FileSearch size={14} />, phase: 4 },
    ],
  },
  {
    title: 'Analysis Engines',
    items: [
      { id: 'fundamentals', label: 'Fundamental Health', icon: <TrendingUp size={14} />, phase: 6 },
      { id: 'forensic', label: 'Forensic Accounting', icon: <AlertOctagon size={14} />, phase: 7 },
      { id: 'management', label: 'Management DNA', icon: <Users size={14} />, phase: 8 },
      { id: 'valuation', label: 'Sector Valuation', icon: <Calculator size={14} />, phase: 9 },
      { id: 'technical', label: 'Technical Structure', icon: <LineChart size={14} />, phase: 10 },
    ],
  },
  {
    title: 'Market & Scenarios',
    items: [
      { id: 'industry', label: 'Industry & Peer Moat', icon: <Layers size={14} />, phase: 8 },
      { id: 'news', label: 'News Intelligence', icon: <Newspaper size={14} />, phase: 11 },
      { id: 'catalysts-risks', label: 'Catalysts & Risks', icon: <Flame size={14} />, phase: 12 },
      { id: 'scenarios', label: 'Scenario Modeling', icon: <GitFork size={14} />, phase: 13 },
    ],
  },
  {
    title: 'Synthesis & Audit',
    items: [
      { id: 'quality-gate', label: 'Data Quality Gate', icon: <CheckCircle2 size={14} />, phase: 13 },
      { id: 'verdict', label: 'Investment Verdict', icon: <Award size={14} />, phase: 14 },
      { id: 'evidence', label: 'Evidence Explorer', icon: <Compass size={14} />, phase: 15 },
    ],
  },
];

interface SideNavProps {
  activeRoute: TerminalRoute;
  onRouteChange: (route: TerminalRoute) => void;
}

export const SideNav: React.FC<SideNavProps> = ({ activeRoute, onRouteChange }) => {
  return (
    <aside className="terminal-sidebar" id="terminal-sidenav">
      {NAV_SECTIONS.map((section, sIdx) => (
        <div key={sIdx} className="nav-section">
          <div className="nav-section-title">{section.title}</div>
          {section.items.map((item) => {
            const isActive = activeRoute === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => onRouteChange(item.id)}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ color: isActive ? '#38bdf8' : 'var(--text-muted)' }}>
                  {item.icon}
                </span>
                <span style={{ flex: 1 }}>{item.label}</span>
                <span
                  style={{
                    fontSize: '9px',
                    fontFamily: 'var(--font-mono)',
                    color: isActive ? '#38bdf8' : 'var(--text-dim)',
                    background: 'var(--bg-surface-raised)',
                    padding: '1px 4px',
                    borderRadius: '2px',
                  }}
                >
                  P{item.phase}
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </aside>
  );
};
