/**
 * 25_productionFaultInjectionE2E.test.ts
 * Phase 18 — Production Fault Injection & Graceful Degradation E2E Suite.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PersistenceEngine } from '../../src/domain/storage/PersistenceEngine';
import { createResearchProject } from '../../src/domain/models/ResearchProject';
import { HealthCheckEngine } from '../../src/domain/observability/HealthCheckEngine';

describe('Production Fault Injection E2E Suite', () => {
  beforeEach(() => {
    PersistenceEngine.clear();
  });

  it('fails gracefully when storage layer is disrupted and reports accurate error diagnostics without silent data loss', async () => {
    const project = createResearchProject({
      company: {
        id: 'comp_fault_test',
        legalName: 'Fault Test Corp',
        displayName: 'FaultCo',
        symbol: 'FAULTCO',
        exchange: 'NSE',
        isin: 'INE000A01099',
        sector: 'Technology',
        subsector: 'Software',
        businessModel: 'NON_FINANCIAL_OPERATING',
        marketCapCategory: 'LARGE_CAP',
        createdAt: '2024-01-01',
        updatedAt: '2024-06-30',
      },
    });

    // 1. Storage fault injection
    PersistenceEngine.setSimulateOutage(true);

    const saveRes = await PersistenceEngine.saveProjectAtomic(project);
    expect(saveRes.isSuccess).toBe(false);
    expect(saveRes.error).toContain('STORAGE_UNAVAILABLE');

    // 2. Health check reacts immediately
    const readiness = HealthCheckEngine.checkReadiness();
    expect(readiness.isReady).toBe(false);
    expect(readiness.checks.storage).toBe('UNAVAILABLE');

    // 3. Storage recovery
    PersistenceEngine.setSimulateOutage(false);
    const retrySave = await PersistenceEngine.saveProjectAtomic(project);
    expect(retrySave.isSuccess).toBe(true);

    const restoredReadiness = HealthCheckEngine.checkReadiness();
    expect(restoredReadiness.isReady).toBe(true);
    expect(restoredReadiness.checks.storage).toBe('HEALTHY');
  });
});
