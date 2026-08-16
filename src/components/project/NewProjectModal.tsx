import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, CheckCircle2, Building, Layers } from 'lucide-react';
import {
  getAllSectors,
  getSubsectorsForSector,
  getSectorDefinition,
  resolveDefaultBusinessModelForSector,
  getAllBusinessModels,
  getBusinessModelDefinition,
  SectorTaxonomyDefinition,
  BusinessModelDefinition,
} from '../../domain/taxonomy/SectorTaxonomyRegistry';
import { createCompanyEntity, ExchangeType, MarketCapCategory } from '../../domain/models/Company';
import { createResearchProject, ResearchProject } from '../../domain/models/ResearchProject';
import { ProjectStorage } from '../../domain/storage/ProjectStorage';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: ResearchProject) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const [legalName, setLegalName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [exchange, setExchange] = useState<ExchangeType>('NSE');
  const [isin, setIsin] = useState('');
  const [sector, setSector] = useState(getAllSectors()[0] || 'Automobile');
  const [subsector, setSubsector] = useState('');
  const [businessModel, setBusinessModel] = useState('NON_FINANCIAL_OPERATING');
  const [marketCapCategory, setMarketCapCategory] = useState<MarketCapCategory>('LARGE_CAP');
  const [primaryObjective, setPrimaryObjective] = useState(
    'Comprehensive 2-Year Fundamental, Forensic & Valuation Analysis'
  );
  const [targetHorizon, setTargetHorizon] = useState<'1_YEAR' | '3_YEARS' | '5_PLUS_YEARS'>('3_YEARS');

  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize subsectors when sector changes
  useEffect(() => {
    const subs = getSubsectorsForSector(sector);
    if (subs.length > 0) {
      setSubsector((prev) => (subs.includes(prev) ? prev : subs[0]));
    } else {
      setSubsector('');
    }
  }, [sector]);

  // Synchronize business model when sector or subsector changes
  useEffect(() => {
    const defaultModel = resolveDefaultBusinessModelForSector(sector, subsector);
    setBusinessModel(defaultModel);
  }, [sector, subsector]);

  if (!isOpen) return null;

  const currentSectorDef: SectorTaxonomyDefinition | undefined = getSectorDefinition(sector);
  const currentBusinessModelDef: BusinessModelDefinition | undefined =
    getBusinessModelDefinition(businessModel) || getBusinessModelDefinition('NON_FINANCIAL_OPERATING');
  const allBusinessModels = getAllBusinessModels();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    setIsSubmitting(true);

    try {
      // 1. Create & Validate Company Entity
      const company = createCompanyEntity({
        legalName,
        displayName: displayName || legalName,
        symbol: symbol.trim().toUpperCase(),
        exchange,
        isin: isin.trim() || undefined,
        sector,
        subsector,
        businessModel,
        marketCapCategory,
      });

      // 2. Create Research Project Container
      const newProject = createResearchProject({
        company,
        primaryResearchObjective: primaryObjective,
        targetInvestmentHorizon: targetHorizon,
      });

      // 3. Persist to storage (with duplicate check)
      ProjectStorage.saveProject(newProject);

      // 4. Callback & Close
      onProjectCreated(newProject);
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create research project.';
      setErrorBanner(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      id="new-project-modal-backdrop"
    >
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '6px',
          width: '100%',
          maxWidth: '720px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
        }}
        id="new-project-modal-content"
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface-raised)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={16} color="#38bdf8" />
            <span style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Onboard Indian Listed Company (Phase 2)
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
            id="close-modal-btn"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form noValidate onSubmit={handleSubmit} style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {errorBanner && (
            <div
              style={{
                background: 'var(--color-bearish-bg)',
                border: '1px solid var(--color-bearish-border)',
                borderRadius: '4px',
                padding: '10px 12px',
                color: '#f87171',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              id="onboarding-error-banner"
            >
              <ShieldAlert size={16} />
              <span>{errorBanner}</span>
            </div>
          )}

          {/* Row 1: Company Legal Name & Display Name */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label htmlFor="input-legal-name" style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                COMPANY LEGAL NAME *
              </label>
              <input
                type="text"
                required
                id="input-legal-name"
                placeholder="e.g. HDFC Bank Limited"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '3px',
                  padding: '7px 10px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <label htmlFor="input-display-name" style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                DISPLAY / SHORT NAME
              </label>
              <input
                type="text"
                id="input-display-name"
                placeholder="e.g. HDFC Bank"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '3px',
                  padding: '7px 10px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Row 2: Stock Symbol & Exchange */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', gap: '12px' }}>
            <div>
              <label htmlFor="input-symbol" style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                STOCK SYMBOL *
              </label>
              <input
                type="text"
                required
                id="input-symbol"
                placeholder="e.g. HDFCBANK"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                style={{
                  width: '100%',
                  background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '3px',
                  padding: '7px 10px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label htmlFor="select-exchange" style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                EXCHANGE *
              </label>
              <select
                id="select-exchange"
                value={exchange}
                onChange={(e) => setExchange(e.target.value as ExchangeType)}
                style={{
                  width: '100%',
                  background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '3px',
                  padding: '7px 10px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  outline: 'none',
                }}
              >
                <option value="NSE">NSE</option>
                <option value="BSE">BSE</option>
              </select>
            </div>

            <div>
              <label htmlFor="select-market-cap" style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                MARKET CAP CATEGORY
              </label>
              <select
                id="select-market-cap"
                value={marketCapCategory}
                onChange={(e) => setMarketCapCategory(e.target.value as MarketCapCategory)}
                style={{
                  width: '100%',
                  background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '3px',
                  padding: '7px 10px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  outline: 'none',
                }}
              >
                <option value="LARGE_CAP">Large Cap (&gt; ₹20,000 Cr)</option>
                <option value="MID_CAP">Mid Cap (₹5,000 - ₹20,000 Cr)</option>
                <option value="SMALL_CAP">Small Cap (₹1,000 - ₹5,000 Cr)</option>
                <option value="MICRO_CAP">Micro Cap (&lt; ₹1,000 Cr)</option>
              </select>
            </div>
          </div>

          {/* Row 3: Sector & Subsector from SectorTaxonomy */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label htmlFor="select-sector" style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                SECTOR TAXONOMY (30+ VERTICALS) *
              </label>
              <select
                id="select-sector"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '3px',
                  padding: '7px 10px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  outline: 'none',
                }}
              >
                {getAllSectors().map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="select-subsector" style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                SUBSECTOR VERTICAL *
              </label>
              <select
                id="select-subsector"
                value={subsector}
                onChange={(e) => setSubsector(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '3px',
                  padding: '7px 10px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  outline: 'none',
                }}
              >
                {getSubsectorsForSector(sector).map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Configurable Business Model Classification */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label htmlFor="select-business-model" style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                ECONOMIC BUSINESS MODEL ARCHETYPE *
              </label>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                Configurable model routing engine
              </span>
            </div>
            <select
              id="select-business-model"
              value={businessModel}
              onChange={(e) => setBusinessModel(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '3px',
                padding: '7px 10px',
                color: 'var(--color-brand)',
                fontWeight: 600,
                fontSize: '12px',
                outline: 'none',
              }}
            >
              {allBusinessModels.map((bm) => (
                <option key={bm.code} value={bm.code}>
                  {bm.code} — {bm.displayName} ({bm.economicArchetype.replace(/_/g, ' ')})
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Business Model & Sector Preview / Gated Models */}
          {currentBusinessModelDef && (
            <div
              style={{
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
              id="sector-taxonomy-preview"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={13} color="#38bdf8" />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    BUSINESS MODEL: {currentBusinessModelDef.code}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Badge variant="cyan">{currentBusinessModelDef.economicArchetype.replace(/_/g, ' ')}</Badge>
                  {currentSectorDef && <Badge variant="neutral">{currentSectorDef.sector}</Badge>}
                </div>
              </div>

              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {currentBusinessModelDef.description}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  GATED FORENSIC MODELS:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {currentBusinessModelDef.applicableForensicModels.map((m) => (
                    <Badge key={m} variant="neutral">
                      {m}
                    </Badge>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  GATED VALUATION FRAMEWORKS:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {currentBusinessModelDef.applicableValuationModels.map((v) => (
                    <Badge key={v} variant="bullish">
                      {v}
                    </Badge>
                  ))}
                </div>
              </div>

              {currentBusinessModelDef.applicableMetrics && currentBusinessModelDef.applicableMetrics.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    PRIMARY FINANCIAL METRICS:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {currentBusinessModelDef.applicableMetrics.map((met) => (
                      <span
                        key={met}
                        style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '2px',
                          background: 'rgba(56, 189, 248, 0.1)',
                          color: '#38bdf8',
                          border: '1px solid rgba(56, 189, 248, 0.2)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {met}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Row 5: Optional ISIN & Investment Horizon */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label htmlFor="input-isin" style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                ISIN (OPTIONAL)
              </label>
              <input
                type="text"
                id="input-isin"
                placeholder="e.g. INE040A01034"
                value={isin}
                onChange={(e) => setIsin(e.target.value.toUpperCase())}
                style={{
                  width: '100%',
                  background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '3px',
                  padding: '7px 10px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label htmlFor="select-horizon" style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                RESEARCH TIME HORIZON
              </label>
              <select
                id="select-horizon"
                value={targetHorizon}
                onChange={(e) => setTargetHorizon(e.target.value as '1_YEAR' | '3_YEARS' | '5_PLUS_YEARS')}
                style={{
                  width: '100%',
                  background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '3px',
                  padding: '7px 10px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  outline: 'none',
                }}
              >
                <option value="1_YEAR">1-Year Tactical Target</option>
                <option value="3_YEARS">3-Year Strategic Cycle</option>
                <option value="5_PLUS_YEARS">5+ Year Structural Compounder</option>
              </select>
            </div>
          </div>

          {/* Primary Objective */}
          <div>
            <label htmlFor="input-objective" style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
              PRIMARY RESEARCH OBJECTIVE
            </label>
            <input
              type="text"
              id="input-objective"
              value={primaryObjective}
              onChange={(e) => setPrimaryObjective(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '3px',
                padding: '7px 10px',
                color: 'var(--text-primary)',
                fontSize: '12px',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          </div>

          {/* Footer Controls */}
          <div
            style={{
              marginTop: '8px',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
            }}
          >
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              icon={<CheckCircle2 size={13} />}
              id="submit-onboard-btn"
            >
              {isSubmitting ? 'Validating...' : 'Onboard Company & Create Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
