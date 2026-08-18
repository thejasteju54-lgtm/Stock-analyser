import { describe, it, expect } from 'vitest';
import { ManagementDnaEngine } from '../../src/domain/management/ManagementDnaEngine';

describe('Phase 8 — Language Shift & Certainty Analysis', () => {
  it('analyzes observable YoY language shifts on core topics', () => {
    const shifts = ManagementDnaEngine.analyzeLanguageShifts([], 'FY24', 'FY23');
    expect(shifts.length).toBeGreaterThan(0);

    const demandShift = shifts.find((s) => s.topic.includes('Demand'));
    expect(demandShift).toBeDefined();
    expect(demandShift?.shiftType).toBe('GUIDANCE_SPECIFICITY_DECREASED');
    expect(demandShift?.isMaterialShift).toBe(true);
    expect(demandShift?.previousEvidence.documentName).toBeDefined();
    expect(demandShift?.currentEvidence.documentName).toBeDefined();
  });

  it('contains zero emotional or psychological claims in shift observations', () => {
    const shifts = ManagementDnaEngine.analyzeLanguageShifts([], 'FY24', 'FY23');
    for (const shift of shifts) {
      const combinedText = `${shift.shiftObservation} ${shift.disclosedReason || ''}`.toLowerCase();
      expect(combinedText).not.toContain('nervous');
      expect(combinedText).not.toContain('scared');
      expect(combinedText).not.toContain('fear');
      expect(combinedText).not.toContain('lying');
      expect(combinedText).not.toContain('fraud');
      expect(combinedText).not.toContain('dishonest');
    }
  });
});
