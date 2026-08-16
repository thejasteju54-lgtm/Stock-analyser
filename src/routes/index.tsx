import React from 'react';
import {
  ShieldCheck,
  Server,
  Activity,
  Layers,
  ArrowRight,
  Database,
  Lock,
  Code2,
} from 'lucide-react';
import { TerminalRoute, CompanyEntitySummary } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

interface RouteViewProps {
  company: CompanyEntitySummary | null;
  onNavigate: (route: TerminalRoute) => void;
}

export const OverviewView: React.FC<RouteViewProps> = ({ company, onNavigate }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} id="view-overview">
      {/* Welcome & Terminal Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0c1524 0%, #070a12 100%)',
          border: '1px solid #1e293b',
          borderRadius: '4px',
          padding: '18px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '0.02em', color: '#f8fafc' }}>
              Indian Equity Research Intelligence Terminal
            </h1>
            <Badge variant="cyan" icon={<ShieldCheck size={11} />}>
              Phase 1 Live
            </Badge>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', maxWidth: '780px' }}>
            Institutional-grade fundamental analysis, forensic accounting, management DNA evaluation, sector-specific valuation, and technical analysis engine designed for Indian listed equities.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="primary"
            icon={<ArrowRight size={13} />}
            onClick={() => onNavigate('ingestion')}
          >
            Start Ingestion (P3)
          </Button>
        </div>
      </div>

      {/* Grid: System Pillars & Terminal Specifications */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
        {/* Core Architecture Status */}
        <Card
          title="Terminal Architecture & Integrity"
          icon={<Server size={14} color="#38bdf8" />}
          action={<Badge variant="bullish">OPERATIONAL</Badge>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Design System:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>High-Density Dark Terminal</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Calculation Model:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#10b981' }}>100% Deterministic (Pure TS)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Data Quality Gate:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>Mandatory Phase 13.5 Gating</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Anti-Hallucination Policy:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#10b981' }}>Zero Fabrication Enforced</span>
            </div>
          </div>
        </Card>

        {/* Active Research Target Context */}
        <Card
          title="Active Research Context"
          icon={<Database size={14} color="#f59e0b" />}
          action={
            company ? (
              <Badge variant="cyan">{company.exchange}:{company.symbol}</Badge>
            ) : (
              <Badge variant="neutral">STANDBY</Badge>
            )
          }
        >
          {company ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{company.name}</div>
              <div style={{ color: 'var(--text-secondary)', display: 'flex', gap: '8px' }}>
                <span>Sector: <strong>{company.sector}</strong></span>
                <span>•</span>
                <span>Subsector: <strong>{company.subsector}</strong></span>
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                <Badge variant="neutral">{company.marketCapCategory.replace('_', ' ')}</Badge>
                <Badge variant="bullish">2-Year Audit Pipeline</Badge>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', padding: '8px 0' }}>
              No research project active. Select or create a company research profile in Phase 2.
            </div>
          )}
        </Card>

        {/* 20-Phase Engine Roadmap Progress */}
        <Card
          title="Engine Pipeline Status"
          icon={<Activity size={14} color="#10b981" />}
          action={<Badge variant="neutral">PHASE 1 / 20</Badge>}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
              <span>[✓] P00: REPOSITORY INTELLIGENCE</span>
              <span>COMPLETE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8', fontWeight: 600 }}>
              <span>[●] P01: APPLICATION SHELL & TOKENS</span>
              <span>ACTIVE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>[ ] P02: RESEARCH PROJECT ONBOARDING</span>
              <span>NEXT</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>[ ] P03: MULTI-STAGE INGESTION & OCR</span>
              <span>QUEUED</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Modules Quick Navigation Matrix */}
      <Card
        title="Research Intelligence Modules (15 Engines)"
        icon={<Layers size={14} color="#6366f1" />}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
          {[
            { route: 'ingestion' as TerminalRoute, name: '1. Document Ingestion', phase: 'P3', status: 'Pending P3' },
            { route: 'extraction' as TerminalRoute, name: '2. Extraction Review', phase: 'P4', status: 'Pending P4' },
            { route: 'fundamentals' as TerminalRoute, name: '3. Fundamental Health', phase: 'P6', status: 'Pending P6' },
            { route: 'forensic' as TerminalRoute, name: '4. Forensic Accounting', phase: 'P7', status: 'Pending P7' },
            { route: 'management' as TerminalRoute, name: '5. Management DNA', phase: 'P8', status: 'Pending P8' },
            { route: 'valuation' as TerminalRoute, name: '6. Sector Valuation', phase: 'P9', status: 'Pending P9' },
            { route: 'technical' as TerminalRoute, name: '7. Technical Structure', phase: 'P10', status: 'Pending P10' },
            { route: 'industry' as TerminalRoute, name: '8. Industry Moat', phase: 'P8', status: 'Pending P8' },
            { route: 'news' as TerminalRoute, name: '9. News Intelligence', phase: 'P11', status: 'Pending P11' },
            { route: 'catalysts-risks' as TerminalRoute, name: '10. Catalysts & Risks', phase: 'P12', status: 'Pending P12' },
            { route: 'scenarios' as TerminalRoute, name: '11. Scenario Modeling', phase: 'P13', status: 'Pending P13' },
            { route: 'quality-gate' as TerminalRoute, name: '12. Data Quality Gate', phase: 'P13.5', status: 'Pending P13.5' },
            { route: 'verdict' as TerminalRoute, name: '13. Investment Verdict', phase: 'P14', status: 'Pending P14' },
            { route: 'evidence' as TerminalRoute, name: '14. Evidence Explorer', phase: 'P15', status: 'Pending P15' },
          ].map((mod) => (
            <div
              key={mod.route}
              onClick={() => onNavigate(mod.route)}
              style={{
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '3px',
                padding: '10px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-active)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>{mod.name}</span>
                <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{mod.phase}</span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{mod.status}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

interface PhasePlaceholderViewProps {
  route: TerminalRoute;
  title: string;
  phaseNumber: string;
  description: string;
  requiredEngine: string;
  onBackToOverview: () => void;
}

export const PhasePlaceholderView: React.FC<PhasePlaceholderViewProps> = ({
  route,
  title,
  phaseNumber,
  description,
  requiredEngine,
  onBackToOverview,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} id={`view-${route}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
              {title}
            </h1>
            <Badge variant="cyan">{phaseNumber}</Badge>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>
            {description}
          </p>
        </div>

        <Button size="sm" onClick={onBackToOverview}>
          Return to Overview
        </Button>
      </div>

      <Card
        title="Module Implementation Status"
        icon={<Code2 size={14} color="#38bdf8" />}
        action={<Badge variant="neutral">SCOPED TO {phaseNumber}</Badge>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
          <div style={{ color: 'var(--text-secondary)' }}>
            This engine component is strictly scoped to <strong>{phaseNumber}</strong> in accordance with <code>Phases.md</code> and the approved architecture roadmap.
          </div>

          <div
            style={{
              background: 'var(--bg-surface-raised)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '3px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: 600 }}>
              <Lock size={12} /> Target Engine: {requiredEngine}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              To maintain financial data integrity and avoid premature/mock implementations, domain logic will be integrated during its scheduled phase.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
