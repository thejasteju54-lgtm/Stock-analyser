import React from 'react';
import { InvestmentVerdictReport } from '../../domain/verdict/VerdictTypes';
import { Compass, ThumbsUp, ThumbsDown, Check, AlertCircle, Layers } from 'lucide-react';

interface CoreThesisCardProps {
  report: InvestmentVerdictReport;
}

export const CoreThesisCard: React.FC<CoreThesisCardProps> = ({ report }) => {
  const { thesis } = report;

  return (
    <div
      className="terminal-card"
      style={{
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        background: '#ffffff',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--brand-navy)', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Compass size={16} color="var(--brand-blue)" />
          Evidence-Grounded Investment Thesis
        </h3>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--brand-blue)',
            background: 'var(--brand-blue-light)',
            padding: '3px 8px',
            borderRadius: '4px',
            border: '1px solid var(--brand-blue-subtle)',
          }}
        >
          Thesis Quality: {thesis.thesisQualityScore}
        </span>
      </div>

      {/* Side-by-Side Bullish vs Bearish Thesis */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {/* Bullish Thesis */}
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-bullish)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
            <ThumbsUp size={14} />
            Bullish Thesis (Value Drivers)
          </div>
          <p style={{ fontSize: '12px', color: 'var(--brand-navy)', lineHeight: 1.5, marginBottom: '10px' }}>
            {thesis.bullishThesis.corePremise}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {thesis.bullishThesis.arguments.map((arg, idx) => (
              <div key={idx} style={{ background: '#ffffff', border: '1px solid #dcfce7', borderRadius: '4px', padding: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-bullish)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={12} /> {arg.claim}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '3px' }}>{arg.evidence}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', fontStyle: 'italic' }}>Source: {arg.source} ({arg.confidence}% conf)</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bearish Thesis */}
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-bearish)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
            <ThumbsDown size={14} />
            Bearish Thesis (Key Vulnerabilities)
          </div>
          <p style={{ fontSize: '12px', color: 'var(--brand-navy)', lineHeight: 1.5, marginBottom: '10px' }}>
            {thesis.bearishThesis.corePremise}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {thesis.bearishThesis.arguments.map((arg, idx) => (
              <div key={idx} style={{ background: '#ffffff', border: '1px solid #fee2e2', borderRadius: '4px', padding: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-bearish)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={12} /> {arg.claim}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '3px' }}>{arg.evidence}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', fontStyle: 'italic' }}>Source: {arg.source} ({arg.confidence}% conf)</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Underlying Drivers Pill Bar */}
      <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', marginTop: 'auto' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Layers size={13} /> Key Value Drivers:
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {thesis.keyDrivers.map((driver, idx) => (
            <span key={idx} style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', color: 'var(--brand-navy)', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
              {driver}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
