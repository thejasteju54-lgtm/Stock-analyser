import React, { useEffect, useState } from 'react';
import { useGuidedTour } from './GuidedTourContext';
import { Sparkles, ArrowRight, ArrowLeft, X, HelpCircle, Compass, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';

export const GuidedTourOverlay: React.FC = () => {
  const {
    isTourActive,
    currentStep,
    currentStepIndex,
    nextStep,
    prevStep,
    exitTour,
    openRulesModal,
  } = useGuidedTour();

  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  // Position spotlight on target element if found on screen
  useEffect(() => {
    if (!isTourActive) {
      setHighlightRect(null);
      return;
    }

    const updatePosition = () => {
      if (currentStep.targetSelector) {
        const el = document.querySelector(currentStep.targetSelector);
        if (el) {
          const rect = el.getBoundingClientRect();
          setHighlightRect(rect);
          // Gently scroll target into view if outside viewport
          if (rect.top < 0 || rect.bottom > window.innerHeight) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          return;
        }
      }
      setHighlightRect(null);
    };

    updatePosition();
    const timer = setTimeout(updatePosition, 200);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isTourActive, currentStep]);

  if (!isTourActive) return null;

  return (
    <>
      {/* 1. Spotlight Outline Box around Target Element */}
      {highlightRect && (
        <div
          style={{
            position: 'fixed',
            top: Math.max(0, highlightRect.top - 6),
            left: Math.max(0, highlightRect.left - 6),
            width: highlightRect.width + 12,
            height: highlightRect.height + 12,
            border: '2px solid var(--brand-blue)',
            borderRadius: '8px',
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.45)',
            pointerEvents: 'none',
            zIndex: 9990,
            transition: 'all 0.25s ease-out',
          }}
        />
      )}

      {/* 2. Floating Institutional Guidance Box */}
      <div
        id="guided-tour-box"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '460px',
          maxWidth: 'calc(100vw - 48px)',
          background: '#ffffff',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-glass)',
          zIndex: 9999,
          padding: '20px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          animation: 'slideUp 0.2s ease-out',
        }}
      >
        {/* Step Progress & Category Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'var(--brand-blue-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-blue)',
              }}
            >
              <Compass size={14} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--brand-blue)', letterSpacing: '0.05em' }}>
              {currentStep.category} • STEP {String(currentStep.stepNumber).padStart(2, '0')} / {currentStep.totalSteps}
            </span>
          </div>

          <button
            onClick={exitTour}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
            title="Exit Guided Tour (Esc)"
          >
            <X size={14} />
          </button>
        </div>

        {/* Step Title & Main Explanation */}
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--brand-navy)', margin: '0 0 6px 0', letterSpacing: '-0.01em' }}>
            {currentStep.title}
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            {currentStep.explanation}
          </p>
        </div>

        {/* "Why This Exists" Rationale Box */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid var(--border-subtle)',
            borderLeft: '3px solid var(--brand-blue)',
            borderRadius: '0 6px 6px 0',
            padding: '10px 12px',
            fontSize: '11px',
            color: 'var(--brand-navy)',
            lineHeight: 1.4,
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--brand-blue)', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={12} /> WHY THIS MATTERS:
          </div>
          {currentStep.whyThisExists}
        </div>

        {/* Action Hint */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-bullish)', fontWeight: 600 }}>
          <CheckCircle2 size={13} />
          <span>{currentStep.actionHint}</span>
        </div>

        {/* Footer Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
          <button
            onClick={openRulesModal}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--brand-blue)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: 0,
            }}
          >
            <HelpCircle size={13} /> Institutional Rules
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            {currentStepIndex > 0 && (
              <Button
                size="sm"
                variant="secondary"
                icon={<ArrowLeft size={12} />}
                onClick={prevStep}
              >
                Back
              </Button>
            )}

            <Button
              size="sm"
              variant="primary"
              icon={currentStepIndex === currentStep.totalSteps - 1 ? <CheckCircle2 size={12} /> : <ArrowRight size={12} />}
              onClick={nextStep}
            >
              {currentStepIndex === currentStep.totalSteps - 1 ? 'Finish Tour' : 'Next Step'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
