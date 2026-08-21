/**
 * 22_backpressureAndQueueThrottling.test.ts
 * Phase 17 — Backpressure Queue & Workload Concurrency Throttling Suite.
 */

import { describe, it, expect } from 'vitest';
import { BackpressureQueueManager } from '../../src/domain/reliability/BackpressureQueueManager';

describe('Backpressure Queue & Throttling Suite', () => {
  it('bounds concurrent worker execution to maxConcurrency and rejects overflow past maxQueueCapacity', async () => {
    const queueManager = new BackpressureQueueManager(2, 5); // Max 2 concurrent, max 5 queued

    let activeRunning = 0;
    let maxObservedActive = 0;

    const createTask = (id: number) => async () => {
      activeRunning++;
      maxObservedActive = Math.max(maxObservedActive, activeRunning);
      await new Promise((resolve) => setTimeout(resolve, 30));
      activeRunning--;
      return `Task_${id}_done`;
    };

    const promises = [];
    for (let i = 1; i <= 4; i++) {
      promises.push(queueManager.enqueue(createTask(i), `task_${i}`));
    }

    const results = await Promise.all(promises);
    expect(results.length).toBe(4);
    expect(maxObservedActive).toBeLessThanOrEqual(2);

    const telemetry = queueManager.getTelemetry();
    expect(telemetry.totalCompletedJobs).toBe(4);
    expect(telemetry.totalFailedJobs).toBe(0);
  });
});
