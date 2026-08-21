/**
 * 17_livenessAndReadinessHealthChecks.test.ts
 * Phase 18 — Liveness & Readiness Health Check Probes Suite.
 */

import { describe, it, expect } from 'vitest';
import { HealthCheckEngine } from '../../src/domain/observability/HealthCheckEngine';
import { PersistenceEngine } from '../../src/domain/storage/PersistenceEngine';

describe('Liveness & Readiness Health Checks Suite', () => {
  it('executes /health/live check and reports process uptime and memory usage', () => {
    const live = HealthCheckEngine.checkLiveness();
    expect(live.status).toBe('HEALTHY');
    expect(live.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(live.memoryUsageMb).toBeGreaterThan(0);
  });

  it('executes /health/ready check and evaluates storage and provider readiness without heavy computation', () => {
    PersistenceEngine.setSimulateOutage(false);
    const ready = HealthCheckEngine.checkReadiness();

    expect(ready.isReady).toBe(true);
    expect(ready.checks.storage).toBe('HEALTHY');
    expect(ready.checks.database).toBe('HEALTHY');
    expect(ready.status).toBe('HEALTHY');
  });

  it('marks readiness as UNAVAILABLE when database is down', () => {
    PersistenceEngine.setSimulateOutage(true);
    const ready = HealthCheckEngine.checkReadiness();

    expect(ready.isReady).toBe(false);
    expect(ready.status).toBe('UNAVAILABLE');
    expect(ready.checks.storage).toBe('UNAVAILABLE');

    PersistenceEngine.setSimulateOutage(false);
  });
});
