import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GuidedTourProvider, useGuidedTour, TOUR_STEPS } from '../../src/components/guided/GuidedTourContext';
import { GuidedTourOverlay } from '../../src/components/guided/GuidedTourOverlay';
import { InstitutionalRulesModal } from '../../src/components/guided/InstitutionalRulesModal';
import { ContextualHelpModal } from '../../src/components/guided/ContextualHelpModal';

// Test consumer component
const TestTourConsumer: React.FC = () => {
  const {
    isTourActive,
    currentStep,
    currentStepIndex,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    exitTour,
    isRulesModalOpen,
    openRulesModal,
    closeRulesModal,
    isHelpModalOpen,
    openHelpModal,
    closeHelpModal,
  } = useGuidedTour();

  return (
    <div>
      <div data-testid="tour-active">{isTourActive ? 'ACTIVE' : 'INACTIVE'}</div>
      <div data-testid="step-index">{currentStepIndex}</div>
      <div data-testid="step-title">{currentStep.title}</div>
      <div data-testid="rules-modal">{isRulesModalOpen ? 'RULES_OPEN' : 'RULES_CLOSED'}</div>
      <div data-testid="help-modal">{isHelpModalOpen ? 'HELP_OPEN' : 'HELP_CLOSED'}</div>

      <button onClick={() => startTour(0)} data-testid="btn-start">Start</button>
      <button onClick={nextStep} data-testid="btn-next">Next</button>
      <button onClick={prevStep} data-testid="btn-prev">Prev</button>
      <button onClick={skipTour} data-testid="btn-skip">Skip</button>
      <button onClick={exitTour} data-testid="btn-exit">Exit</button>
      <button onClick={openRulesModal} data-testid="btn-open-rules">Open Rules</button>
      <button onClick={closeRulesModal} data-testid="btn-close-rules">Close Rules</button>
      <button onClick={() => openHelpModal('ROCE')} data-testid="btn-open-help">Open Help</button>
      <button onClick={closeHelpModal} data-testid="btn-close-help">Close Help</button>
    </div>
  );
};

describe('Phase UI-4 — Interactive Guided Research Tour & Onboarding Engine', () => {
  it('initializes with 21 institutional research steps in the correct canonical sequence', () => {
    expect(TOUR_STEPS.length).toBe(21);
    expect(TOUR_STEPS[0].title).toBe('Welcome to the Equity Research Terminal');
    expect(TOUR_STEPS[1].title).toBe('Create or Select a Research Project');
    expect(TOUR_STEPS[4].title).toBe('Document Intake & Source Authority');
    expect(TOUR_STEPS[5].title).toBe('Universal "Why?" Evidence Inspector');
    expect(TOUR_STEPS[6].title).toBe('5-Year Financial Statement Trajectory');
    expect(TOUR_STEPS[10].title).toBe('Sector-Aware Valuation Spectrum');
    expect(TOUR_STEPS[14].title).toBe('Mathematical Thesis Breakers');
    expect(TOUR_STEPS[16].title).toBe('Final Institutional Investment Verdict');
    expect(TOUR_STEPS[17].title).toBe('Decision Audit Trail & Gating Rules');
    expect(TOUR_STEPS[18].title).toBe('Canonical 22-Section Research Report');
    expect(TOUR_STEPS[19].title).toBe('Immutable Research Snapshots');
    expect(TOUR_STEPS[20].title).toBe('How to Get the Most From the Terminal');
  });

  it('manages tour step progression, next, previous, and termination correctly', () => {
    render(
      <GuidedTourProvider>
        <TestTourConsumer />
        <GuidedTourOverlay />
      </GuidedTourProvider>
    );

    expect(screen.getByTestId('tour-active').textContent).toBe('INACTIVE');

    // Start tour
    fireEvent.click(screen.getByTestId('btn-start'));
    expect(screen.getByTestId('tour-active').textContent).toBe('ACTIVE');
    expect(screen.getByTestId('step-index').textContent).toBe('0');
    expect(screen.getByText(/STEP 01/i)).toBeDefined();

    // Advance to Step 2
    fireEvent.click(screen.getByTestId('btn-next'));
    expect(screen.getByTestId('step-index').textContent).toBe('1');
    expect(screen.getByTestId('step-title').textContent).toBe('Create or Select a Research Project');

    // Return to Step 1
    fireEvent.click(screen.getByTestId('btn-prev'));
    expect(screen.getByTestId('step-index').textContent).toBe('0');

    // Exit tour
    fireEvent.click(screen.getByTestId('btn-exit'));
    expect(screen.getByTestId('tour-active').textContent).toBe('INACTIVE');
  });

  it('handles keyboard navigation with Escape to exit and Arrow keys to navigate', () => {
    render(
      <GuidedTourProvider>
        <TestTourConsumer />
        <GuidedTourOverlay />
      </GuidedTourProvider>
    );

    // Start Tour
    fireEvent.click(screen.getByTestId('btn-start'));
    expect(screen.getByTestId('tour-active').textContent).toBe('ACTIVE');

    // Press ArrowRight
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    });
    expect(screen.getByTestId('step-index').textContent).toBe('1');

    // Press ArrowLeft
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    });
    expect(screen.getByTestId('step-index').textContent).toBe('0');

    // Press Escape to exit
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(screen.getByTestId('tour-active').textContent).toBe('INACTIVE');
  });

  it('renders the 10 Institutional Rules modal with NOT_ASSESSABLE guidance', () => {
    const handleClose = () => {};
    render(
      <InstitutionalRulesModal isOpen={true} onClose={handleClose} />
    );

    expect(screen.getByText('How to Get the Most from Stock Analyser')).toBeDefined();
    expect(screen.getByText('Start with Primary Evidence')).toBeDefined();
    expect(screen.getByText('Never Ignore Provenance')).toBeDefined();
    expect(screen.getByText('Separate Fact from Inference')).toBeDefined();
    expect(screen.getByText('Understand Business Quality First')).toBeDefined();
    expect(screen.getByText('Monitor Mathematical Thesis Breakers')).toBeDefined();
    expect(screen.getByText('Never Treat NOT_ASSESSABLE as Zero')).toBeDefined();
  });

  it('renders the Contextual Help dictionary for financial metrics', () => {
    const handleClose = () => {};
    render(
      <ContextualHelpModal isOpen={true} onClose={handleClose} topic="ROCE" />
    );

    expect(screen.getByText('Return on Capital Employed (ROCE)')).toBeDefined();
    expect(screen.getByText('ROCE = EBIT / (Total Equity + Total Debt)')).toBeDefined();
  });
});
