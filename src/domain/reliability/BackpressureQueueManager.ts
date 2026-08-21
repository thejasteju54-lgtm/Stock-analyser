/**
 * BackpressureQueueManager.ts
 * Phase 17 — Bounded Concurrency, Workload Throttling & Backpressure Telemetry Engine.
 * Prevents memory exhaustion and API storming under high concurrent document ingestion workloads.
 */

export interface QueueJob<T> {
  jobId: string;
  task: (signal?: AbortSignal) => Promise<T>;
  priority: number;
  enqueuedAt: number;
}

export interface QueueStatusTelemetry {
  activeWorkers: number;
  maxConcurrency: number;
  pendingQueueDepth: number;
  maxQueueCapacity: number;
  totalCompletedJobs: number;
  totalFailedJobs: number;
  isThrottled: boolean;
}

export class BackpressureQueueManager {
  private readonly maxConcurrency: number;
  private readonly maxQueueCapacity: number;
  private activeWorkers = 0;
  private queue: Array<QueueJob<any>> = [];
  private totalCompleted = 0;
  private totalFailed = 0;

  constructor(maxConcurrency = 4, maxQueueCapacity = 100) {
    this.maxConcurrency = maxConcurrency;
    this.maxQueueCapacity = maxQueueCapacity;
  }

  /**
   * Enqueues an asynchronous task with backpressure protection.
   * Rejects if queue is saturated rather than unbounded memory allocation.
   */
  public enqueue<T>(
    task: (signal?: AbortSignal) => Promise<T>,
    jobId?: string,
    priority = 0
  ): Promise<T> {
    if (this.queue.length >= this.maxQueueCapacity) {
      return Promise.reject(new Error(`Backpressure limit exceeded: queue capacity ${this.maxQueueCapacity} reached.`));
    }

    const id = jobId || `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return new Promise<T>((resolve, reject) => {
      const job: QueueJob<T> = {
        jobId: id,
        task: async (signal) => {
          try {
            const result = await task(signal);
            resolve(result);
            return result;
          } catch (err) {
            reject(err);
            throw err;
          }
        },
        priority,
        enqueuedAt: Date.now(),
      };

      this.queue.push(job);
      // Sort by priority descending
      this.queue.sort((a, b) => b.priority - a.priority);
      this.drainQueue();
    });
  }

  private async drainQueue(): Promise<void> {
    if (this.activeWorkers >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    const job = this.queue.shift();
    if (!job) return;

    this.activeWorkers++;

    try {
      await job.task();
      this.totalCompleted++;
    } catch {
      this.totalFailed++;
    } finally {
      this.activeWorkers--;
      this.drainQueue();
    }
  }

  public getTelemetry(): QueueStatusTelemetry {
    return {
      activeWorkers: this.activeWorkers,
      maxConcurrency: this.maxConcurrency,
      pendingQueueDepth: this.queue.length,
      maxQueueCapacity: this.maxQueueCapacity,
      totalCompletedJobs: this.totalCompleted,
      totalFailedJobs: this.totalFailed,
      isThrottled: this.queue.length > 0 || this.activeWorkers >= this.maxConcurrency,
    };
  }

  public clear(): void {
    this.queue = [];
  }
}
