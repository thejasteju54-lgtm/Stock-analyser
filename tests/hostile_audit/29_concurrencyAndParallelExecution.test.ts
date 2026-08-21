/**
 * 29_concurrencyAndParallelExecution.test.ts
 * Phase 19 — Hostile Concurrency & Parallel Execution State Contamination Suite.
 */

import { describe, it, expect } from 'vitest';
import { BackpressureQueueManager } from '../../src/domain/reliability/BackpressureQueueManager';

describe('Concurrency & Parallel Execution Suite', () => {
  it('processes parallel tasks without race condition corruption or leaking active workers', async () => {
    const queue = new BackpressureQueueManager(3, 20);

    const promises = Array.from({ length: 10 }).map((_, i) =>
      queue.enqueue(async () => {
        await new Promise((r) => setTimeout(r, 10));
        return `done_${i}`;
      })
    );

    const results = await Promise.all(promises);
    expect(results.length).toBe(10);

    const telemetry = queue.getTelemetry();
    expect(telemetry.activeWorkers).toBe(0);
    expect(telemetry.totalCompletedJobs).toBe(10);
    expect(telemetry.totalFailedJobs).toBe(0);
  });
});
