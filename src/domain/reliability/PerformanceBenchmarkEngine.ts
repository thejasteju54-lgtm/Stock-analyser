/**
 * PerformanceBenchmarkEngine.ts
 * Phase 17 — Precision Micro-Benchmarking & Performance Telemetry Engine.
 * Measures execution duration, memory allocation estimates, and throughput across 14 lifecycle stages.
 */

export type LifecycleStage =
  | 'APPLICATION_STARTUP'
  | 'INITIAL_ROUTE_LOAD'
  | 'PROJECT_CREATION'
  | 'DOCUMENT_UPLOAD'
  | 'PDF_PARSING'
  | 'OCR'
  | 'EVIDENCE_EXTRACTION'
  | 'ANALYSIS_EXECUTION'
  | 'NEWS_PROCESSING'
  | 'SCENARIO_GENERATION'
  | 'VERDICT_GENERATION'
  | 'REPORT_GENERATION'
  | 'SNAPSHOT_GENERATION'
  | 'LIVE_DATA_REFRESH';

export interface StageBenchmarkRecord {
  stage: LifecycleStage;
  durationMs: number;
  startTimeIso: string;
  endTimeIso: string;
  itemCount?: number;
  throughputPerSecond?: number;
  memoryEstimateBytes?: number;
  metadata?: Record<string, unknown>;
}

export class PerformanceBenchmarkEngine {
  private static records: StageBenchmarkRecord[] = [];

  /**
   * Times a synchronous or asynchronous operation and registers telemetry.
   */
  public static async measureAsync<T>(
    stage: LifecycleStage,
    fn: () => Promise<T>,
    itemCount?: number,
    metadata?: Record<string, unknown>
  ): Promise<{ result: T; record: StageBenchmarkRecord }> {
    const startTime = performance.now();
    const startIso = new Date().toISOString();

    const result = await fn();

    const endTime = performance.now();
    const endIso = new Date().toISOString();
    const durationMs = Math.max(0, endTime - startTime);

    const throughputPerSecond = itemCount && durationMs > 0
      ? (itemCount / durationMs) * 1000
      : undefined;

    const record: StageBenchmarkRecord = {
      stage,
      durationMs,
      startTimeIso: startIso,
      endTimeIso: endIso,
      itemCount,
      throughputPerSecond,
      metadata,
    };

    this.records.push(record);
    return { result, record };
  }

  public static measureSync<T>(
    stage: LifecycleStage,
    fn: () => T,
    itemCount?: number,
    metadata?: Record<string, unknown>
  ): { result: T; record: StageBenchmarkRecord } {
    const startTime = performance.now();
    const startIso = new Date().toISOString();

    const result = fn();

    const endTime = performance.now();
    const endIso = new Date().toISOString();
    const durationMs = Math.max(0, endTime - startTime);

    const throughputPerSecond = itemCount && durationMs > 0
      ? (itemCount / durationMs) * 1000
      : undefined;

    const record: StageBenchmarkRecord = {
      stage,
      durationMs,
      startTimeIso: startIso,
      endTimeIso: endIso,
      itemCount,
      throughputPerSecond,
      metadata,
    };

    this.records.push(record);
    return { result, record };
  }

  public static getRecords(): StageBenchmarkRecord[] {
    return [...this.records];
  }

  public static getRecordsForStage(stage: LifecycleStage): StageBenchmarkRecord[] {
    return this.records.filter((r) => r.stage === stage);
  }

  public static clear(): void {
    this.records = [];
  }
}
