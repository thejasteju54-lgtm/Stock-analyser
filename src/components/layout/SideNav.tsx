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
  Globe,
  Layers,
  Newspaper,
  Flame,
  GitFork,
  CheckCircle2,
  Award,
  Compass,
  History,
} from 'lucide-react';
import { TerminalRoute } from '../../types';

interface NavItemDef {
  id: TerminalRoute;
  label: string;
  icon: React.ReactNode;
  category: string;
}

const NAV_SECTIONS: { title: string; items: NavItemDef[] }[] = [
  {
    title: 'Research Workspace',
    items: [
      { id: 'overview', label: 'Terminal Overview', icon: <LayoutDashboard size={15} />, category: 'Overview' },
      { id: 'market-intelligence', label: 'Daily Market Intelligence', icon: <Globe size={15} />, category: 'Scanner' },
      { id: 'evidence', label: 'Evidence Explorer', icon: <Compass size={15} />, category: 'Workspace' },
      { id: 'ingestion', label: 'Document Ingestion', icon: <UploadCloud size={15} />, category: 'Sources' },
      { id: 'extraction', label: 'Extraction Review', icon: <FileSearch size={15} />, category: 'Facts' },
    ],
  },
  {
    title: 'Financial & Forensic Analysis',
    items: [
      { id: 'fundamentals', label: 'Fundamental Health', icon: <TrendingUp size={15} />, category: 'Financials' },
      { id: 'forensic', label: 'Forensic Accounting', icon: <AlertOctagon size={15} />, category: 'Governance' },
      { id: 'management', label: 'Management DNA', icon: <Users size={15} />, category: 'Credibility' },
      { id: 'valuation', label: 'Sector Valuation', icon: <Calculator size={15} />, category: 'Multiples' },
      { id: 'technical', label: 'Technical Structure', icon: <LineChart size={15} />, category: 'Technicals' },
    ],
  },
  {
    title: 'Market Intelligence & Scenarios',
    items: [
      { id: 'industry', label: 'Industry & Peer Moat', icon: <Layers size={15} />, category: 'Structure' },
      { id: 'news', label: 'News Intelligence', icon: <Newspaper size={15} />, category: 'Events' },
      { id: 'catalysts-risks', label: 'Catalysts & Risks', icon: <Flame size={15} />, category: 'Asymmetry' },
      { id: 'scenarios', label: 'Scenario Modeling', icon: <GitFork size={15} />, category: 'Forecasts' },
    ],
  },
  {
    title: 'Synthesis & Quality Audit',
    items: [
      { id: 'quality-gate', label: 'Data Quality Gate', icon: <CheckCircle2 size={15} />, category: 'Integrity' },
      { id: 'verdict', label: 'Investment Verdict', icon: <Award size={15} />, category: 'Decision' },
      { id: 'history', label: 'Research History', icon: <History size={15} />, category: 'Audit Ledger' },
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
                  width: 'calc(100% - 8px)',
                  background: isActive ? 'var(--brand-blue-light)' : 'transparent',
                  border: 'none',
                  borderLeft: isActive ? '3px solid var(--brand-blue)' : '3px solid transparent',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  color: isActive ? 'var(--brand-blue)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  margin: '1px 4px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                <span style={{ color: isActive ? 'var(--brand-blue)' : 'var(--text-muted)', display: 'inline-flex' }}>
                  {item.icon}
                </span>
                <span style={{ flex: 1, fontSize: '12px' }}>{item.label}</span>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    color: isActive ? 'var(--brand-blue)' : 'var(--text-dim)',
                    background: isActive ? '#ffffff' : '#f1f5f9',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--brand-blue-subtle)' : 'var(--border-subtle)',
                    padding: '1px 5px',
                    borderRadius: '3px',
                  }}
                >
                  {item.category}
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </aside>
  );
};
