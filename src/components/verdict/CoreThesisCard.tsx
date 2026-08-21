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
      style={{
        background: '#0c1017',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '20px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: '#f8fafc', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={16} className="text-cyan-400" />
          Evidence-Grounded Investment Thesis
        </h3>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#38bdf8',
            background: 'rgba(56, 189, 248, 0.1)',
            padding: '3px 8px',
            borderRadius: '4px',
            border: '1px solid rgba(56, 189, 248, 0.3)',
          }}
        >
          Thesis Quality: {thesis.thesisQualityScore}
        </span>
      </div>

      {/* Side-by-Side Bullish vs Bearish Thesis */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
        {/* Bullish Thesis */}
        <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '6px', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
            <ThumbsUp size={14} />
            Bullish Thesis (Value Drivers)
          </div>
          <p style={{ fontSize: '12px', color: '#f1f5f9', lineHeight: 1.5, marginBottom: '10px' }}>
            {thesis.bullishThesis.corePremise}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {thesis.bullishThesis.arguments.map((arg, idx) => (
              <div key={idx} style={{ background: 'rgba(18, 24, 38, 0.6)', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={12} /> {arg.claim}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '3px' }}>{arg.evidence}</div>
                <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px', fontStyle: 'italic' }}>Source: {arg.source} ({arg.confidence}% conf)</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bearish Thesis */}
        <div style={{ background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '6px', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
            <ThumbsDown size={14} />
            Bearish Thesis (Key Vulnerabilities)
          </div>
          <p style={{ fontSize: '12px', color: '#f1f5f9', lineHeight: 1.5, marginBottom: '10px' }}>
            {thesis.bearishThesis.corePremise}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {thesis.bearishThesis.arguments.map((arg, idx) => (
              <div key={idx} style={{ background: 'rgba(18, 24, 38, 0.6)', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={12} /> {arg.claim}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '3px' }}>{arg.evidence}</div>
                <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px', fontStyle: 'italic' }}>Source: {arg.source} ({arg.confidence}% conf)</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Underlying Drivers Pill Bar */}
      <div style={{ background: '#121824', border: '1px solid #1e293b', borderRadius: '6px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', marginTop: 'auto' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Layers size={13} /> Key Value Drivers:
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {thesis.keyDrivers.map((driver, idx) => (
            <span key={idx} style={{ background: '#1e293b', color: '#e2e8f0', fontSize: '11px', padding: '2px 8px', borderRadius: '4px' }}>
              {driver}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
