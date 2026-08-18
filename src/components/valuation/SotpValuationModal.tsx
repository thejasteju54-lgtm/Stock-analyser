import React from 'react';
import { SotpValuationReport } from '../../domain/valuation/ValuationTypes';
import { X, Layers } from 'lucide-react';

interface SotpValuationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sotp?: SotpValuationReport;
  companySymbol: string;
}

export const SotpValuationModal: React.FC<SotpValuationModalProps> = ({
  isOpen,
  onClose,
  sotp,
  companySymbol,
}) => {
  if (!isOpen || !sotp) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '750px',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="#0284c7" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
                Sum-of-the-Parts (SOTP) Segment Valuation
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {companySymbol} Multi-Segment Operating Appraisal
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              BUSINESS SEGMENT APPRAISALS:
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>SEGMENT</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600 }}>METRIC</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>VALUE (INR CR)</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>MULTIPLE</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>ENTERPRISE VALUE</th>
                </tr>
              </thead>
              <tbody>
                {sotp.segments.map((seg) => (
                  <tr key={seg.segmentId} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      <div>{seg.segmentName}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{seg.businessModel}</div>
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{seg.metricType}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      ₹{Math.round(seg.metricValue).toLocaleString('en-IN')} Cr
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {seg.valuationMultiple}x {seg.multipleType}
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#0284c7' }}>
                      ₹{Math.round(seg.enterpriseValue).toLocaleString('en-IN')} Cr
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12px' }}>
              <span>Gross Segment Enterprise Value:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>₹{Math.round(sotp.sumOfSegmentEV).toLocaleString('en-IN')} Cr</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12px', color: '#dc2626' }}>
              <span>Less: Corporate Overhead Reserve (5%):</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>- ₹{Math.round(sotp.lessCorporateCosts).toLocaleString('en-IN')} Cr</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12px', color: '#dc2626' }}>
              <span>Less: Conglomerate Holding Discount ({sotp.holdingCompanyDiscountPercent}%):</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>- {sotp.holdingCompanyDiscountPercent}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '12px', color: '#dc2626' }}>
              <span>Less: Net Debt:</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>- ₹{Math.round(sotp.lessNetDebt).toLocaleString('en-IN')} Cr</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '8px',
                marginTop: '8px',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '14px',
                fontWeight: 800,
                color: '#16a34a',
              }}
            >
              <span>Implied SOTP Value Per Share:</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>₹{sotp.valuePerShare.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '6px 16px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
