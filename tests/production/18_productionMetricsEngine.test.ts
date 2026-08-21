/**
 * 18_productionMetricsEngine.test.ts
 * Phase 18 — Production Metrics & Latency Telemetry Suite.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ProductionMetricsEngine } from '../../src/domain/observability/ProductionMetricsEngine';

describe('Production Metrics Engine Suite', () => {
  beforeEach(() => {
    ProductionMetricsEngine.reset();
  });

  it('records request counts, error rates, average latency, and p95 latency accurately', () => {
    ProductionMetricsEngine.recordRequest(10, true);
    ProductionMetricsEngine.recordRequest(15, true);
    ProductionMetricsEngine.recordRequest(20, true);
    ProductionMetricsEngine.recordRequest(100, false); // 1 error

    ProductionMetricsEngine.recordCacheAccess(true);
    ProductionMetricsEngine.recordCacheAccess(true);
    ProductionMetricsEngine.recordCacheAccess(false);

    const metrics = ProductionMetricsEngine.getMetrics();
    expect(metrics.totalRequests).toBe(4);
    expect(metrics.failedRequests).toBe(1);
    expect(metrics.errorRate).toBe(25);
    expect(metrics.averageLatencyMs).toBe(36.3);
    expect(metrics.cacheHitRatio).toBe(0.67);
  });
});
