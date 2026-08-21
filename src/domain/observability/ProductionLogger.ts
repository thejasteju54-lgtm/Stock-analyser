/**
 * ProductionLogger.ts
 * Phase 18 — Structured JSON Logging & Secret-Safe Telemetry.
 * Outputs structured JSON logs with correlation IDs, timestamps, log levels, and automatic secret redaction.
 */

import { SecretRedactionEngine } from '../security/SecretRedactionEngine';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface StructuredLogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  projectId?: string;
  component: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
  error?: {
    code?: string;
    message: string;
    stack?: string;
  };
}

export class ProductionLogger {
  private static minLogLevel: LogLevel = 'INFO';
  private static logBuffer: StructuredLogEntry[] = [];
  private static readonly LEVEL_PRIORITY: Record<LogLevel, number> = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
  };

  public static setLogLevel(level: LogLevel): void {
    this.minLogLevel = level;
  }

  public static clearBuffer(): void {
    this.logBuffer = [];
  }

  public static getBuffer(): StructuredLogEntry[] {
    return [...this.logBuffer];
  }

  private static log(
    level: LogLevel,
    component: string,
    message: string,
    context: {
      requestId?: string;
      projectId?: string;
      durationMs?: number;
      metadata?: Record<string, unknown>;
      error?: Error;
    } = {}
  ): StructuredLogEntry | null {
    if (this.LEVEL_PRIORITY[level] < this.LEVEL_PRIORITY[this.minLogLevel]) {
      return null;
    }

    const sanitizedMessage = SecretRedactionEngine.redactString(message);
    const sanitizedMetadata = context.metadata
      ? (SecretRedactionEngine.redactObject(context.metadata) as Record<string, unknown>)
      : undefined;

    const entry: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: sanitizedMessage,
      component,
      requestId: context.requestId,
      projectId: context.projectId,
      durationMs: context.durationMs,
      metadata: sanitizedMetadata,
      error: context.error
        ? {
            message: SecretRedactionEngine.redactString(context.error.message),
            stack: context.error.stack ? SecretRedactionEngine.redactString(context.error.stack) : undefined,
          }
        : undefined,
    };

    this.logBuffer.push(entry);
    return entry;
  }

  public static debug(component: string, message: string, context?: Parameters<typeof ProductionLogger.log>[3]): void {
    this.log('DEBUG', component, message, context);
  }

  public static info(component: string, message: string, context?: Parameters<typeof ProductionLogger.log>[3]): void {
    this.log('INFO', component, message, context);
  }

  public static warn(component: string, message: string, context?: Parameters<typeof ProductionLogger.log>[3]): void {
    this.log('WARN', component, message, context);
  }

  public static error(component: string, message: string, context?: Parameters<typeof ProductionLogger.log>[3]): void {
    this.log('ERROR', component, message, context);
  }
}
