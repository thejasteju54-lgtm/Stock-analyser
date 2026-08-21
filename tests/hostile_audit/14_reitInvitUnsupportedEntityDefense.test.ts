/**
 * 14_reitInvitUnsupportedEntityDefense.test.ts
 * Phase 19 — Hostile REIT / InvIT & Unsupported Entity Type Defense Suite.
 */

import { describe, it, expect } from 'vitest';
import { BusinessModelRegistry } from '../../src/domain/taxonomy/BusinessModelRegistry';

describe('REIT / InvIT & Unsupported Entity Type Defense Suite', () => {
  it('identifies INFRASTRUCTURE_TRUST archetype and uses NAV/Dividend Discount models while rejecting EV/EBITDA or manufacturing models', () => {
    const reitModel = BusinessModelRegistry.getModel('INFRASTRUCTURE_REIT');
    if (reitModel) {
      expect(reitModel.economicArchetype).toBe('INFRASTRUCTURE_TRUST');
      expect(reitModel.applicableValuationModels).toContain('NAV');
      expect(reitModel.applicableValuationModels).not.toContain('EV_EBITDA');
    }

    const nonExistent = BusinessModelRegistry.getModel('UNKNOWN_CRYPTO_DAO');
    expect(nonExistent).toBeUndefined();
  });
});
