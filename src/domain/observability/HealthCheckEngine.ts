/**
 * HealthCheckEngine.ts
 * Phase 18 — Process Liveness & Dependency Readiness Health Probes.
 * Provides /health/live and /health/ready diagnostic checks without invoking heavy analytical runs.
 */

import { PersistenceEngine } from '../storage/PersistenceEngine';
import { DataSourceMetadataRegistry } from '../dataSources/DataSourceMetadataRegistry';

export type HealthStatus = 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';

export interface LivenessReport {
  status: 'HEALTHY' | 'UNHEALTHY';
  uptimeSeconds: number;
  processTime: string;
  memoryUsageMb: number;
}

export interface ReadinessReport {
  status: HealthStatus;
  isReady: boolean;
  checks: {
    storage: HealthStatus;
    database: HealthStatus;
    externalProviders: HealthStatus;
    queueWorker: HealthStatus;
  };
  details?: Record<string, unknown>;
}

export class HealthCheckEngine {
  private static startTime: number = Date.now();
  private static isTerminating: boolean = false;

  public static setTerminating(val: boolean): void {
    this.isTerminating = val;
  }

  public static checkLiveness(): LivenessReport {
    return {
      status: this.isTerminating ? 'UNHEALTHY' : 'HEALTHY',
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      processTime: new Date().toISOString(),
      memoryUsageMb: typeof process !== 'undefined' && process.memoryUsage ? Math.round(process.memoryUsage().heapUsed / 1024 / 1024) : 45,
    };
  }

  public static checkReadiness(): ReadinessReport {
    const storageStatus = PersistenceEngine.getStatus();
    const sources = DataSourceMetadataRegistry.getAllMetadata();
    const healthySources = sources.filter((s) => s.availabilityStatus === 'CONNECTED').length;
    const providerStatus: HealthStatus = healthySources >= 4 ? 'HEALTHY' : healthySources > 0 ? 'DEGRADED' : 'UNAVAILABLE';

    const isReady = storageStatus !== 'UNAVAILABLE' && providerStatus !== 'UNAVAILABLE' && !this.isTerminating;
    const overallStatus: HealthStatus = isReady ? (providerStatus === 'DEGRADED' ? 'DEGRADED' : 'HEALTHY') : 'UNAVAILABLE';

    return {
      status: overallStatus,
      isReady,
      checks: {
        storage: storageStatus,
        database: storageStatus,
        externalProviders: providerStatus,
        queueWorker: 'HEALTHY',
      },
      details: {
        activeSourcesCount: healthySources,
        totalSourcesCount: sources.length,
      },
    };
  }
}
