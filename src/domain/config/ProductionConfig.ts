/**
 * ProductionConfig.ts
 * Phase 18 — Strict Production Configuration Model & Startup Validation Engine.
 * Enforces fail-closed configuration validation and prevents test/prod environment cross-contamination.
 */

export type AppEnvironment = 'DEVELOPMENT' | 'TEST' | 'STAGING' | 'PRODUCTION';

export type ConfigFailureCategory =
  | 'MISSING_REQUIRED_CONFIG'
  | 'INVALID_CONFIG'
  | 'INSECURE_CONFIG'
  | 'OPTIONAL_CONFIG_UNAVAILABLE';

export interface ConfigValidationIssue {
  variableName: string;
  category: ConfigFailureCategory;
  message: string;
}

export interface ProductionConfigSchema {
  APP_ENV: AppEnvironment;
  APP_URL: string;
  DATABASE_URL: string;
  STORAGE_DRIVER: 'LOCAL' | 'INDEXED_DB' | 'S3_COMPLIANT' | 'GCS';
  ENCRYPTION_KEY: string;
  SESSION_SECRET: string;
  ALLOWED_ORIGINS: string[];
  LIVE_FEED_API_KEY?: string;
  ENABLE_DEBUG_MODE: boolean;
  MAX_FILE_SIZE_BYTES: number;
}

export interface ConfigValidationResult {
  isValid: boolean;
  environment: AppEnvironment;
  config?: ProductionConfigSchema;
  issues: ConfigValidationIssue[];
}

export class ProductionConfig {
  private static activeConfig: ProductionConfigSchema | null = null;

  public static validateEnvironment(rawEnv: Record<string, string | undefined>): ConfigValidationResult {
    const issues: ConfigValidationIssue[] = [];

    const envStr = (rawEnv.APP_ENV || rawEnv.NODE_ENV || 'DEVELOPMENT').toUpperCase();
    let environment: AppEnvironment = 'DEVELOPMENT';
    if (['DEVELOPMENT', 'TEST', 'STAGING', 'PRODUCTION'].includes(envStr)) {
      environment = envStr as AppEnvironment;
    } else {
      issues.push({
        variableName: 'APP_ENV',
        category: 'INVALID_CONFIG',
        message: `Invalid environment: ${envStr}. Must be DEVELOPMENT, TEST, STAGING, or PRODUCTION.`,
      });
    }

    const appUrl = rawEnv.APP_URL || (environment === 'PRODUCTION' ? '' : 'http://localhost:5173');
    if (!appUrl) {
      issues.push({
        variableName: 'APP_URL',
        category: 'MISSING_REQUIRED_CONFIG',
        message: 'APP_URL must be specified in production environment.',
      });
    } else if (environment === 'PRODUCTION' && !appUrl.startsWith('https://')) {
      issues.push({
        variableName: 'APP_URL',
        category: 'INSECURE_CONFIG',
        message: 'APP_URL must use HTTPS protocol in production.',
      });
    }

    const dbUrl = rawEnv.DATABASE_URL || (environment === 'PRODUCTION' ? '' : 'memory://localhost/eq_terminal');
    if (!dbUrl) {
      issues.push({
        variableName: 'DATABASE_URL',
        category: 'MISSING_REQUIRED_CONFIG',
        message: 'DATABASE_URL is required.',
      });
    }

    const storageDriver = (rawEnv.STORAGE_DRIVER || 'INDEXED_DB').toUpperCase() as ProductionConfigSchema['STORAGE_DRIVER'];
    if (!['LOCAL', 'INDEXED_DB', 'S3_COMPLIANT', 'GCS'].includes(storageDriver)) {
      issues.push({
        variableName: 'STORAGE_DRIVER',
        category: 'INVALID_CONFIG',
        message: `Unsupported STORAGE_DRIVER: ${storageDriver}.`,
      });
    }

    const encryptionKey = rawEnv.ENCRYPTION_KEY || (environment === 'PRODUCTION' ? '' : 'dev_default_key_32_bytes_long_secure!!');
    if (!encryptionKey) {
      issues.push({
        variableName: 'ENCRYPTION_KEY',
        category: 'MISSING_REQUIRED_CONFIG',
        message: 'ENCRYPTION_KEY must be provided.',
      });
    } else if (encryptionKey.length < 32) {
      issues.push({
        variableName: 'ENCRYPTION_KEY',
        category: 'INSECURE_CONFIG',
        message: 'ENCRYPTION_KEY must be at least 32 characters (256-bit).',
      });
    }

    const sessionSecret = rawEnv.SESSION_SECRET || (environment === 'PRODUCTION' ? '' : 'dev_session_secret_32_bytes_long_secret!');
    if (!sessionSecret) {
      issues.push({
        variableName: 'SESSION_SECRET',
        category: 'MISSING_REQUIRED_CONFIG',
        message: 'SESSION_SECRET must be provided.',
      });
    } else if (sessionSecret.length < 32) {
      issues.push({
        variableName: 'SESSION_SECRET',
        category: 'INSECURE_CONFIG',
        message: 'SESSION_SECRET must be at least 32 characters.',
      });
    }

    const allowedOriginsRaw = rawEnv.ALLOWED_ORIGINS || (environment === 'PRODUCTION' ? '' : 'http://localhost:5173,http://localhost:3000');
    const allowedOrigins = allowedOriginsRaw
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);

    if (allowedOrigins.length === 0) {
      issues.push({
        variableName: 'ALLOWED_ORIGINS',
        category: 'MISSING_REQUIRED_CONFIG',
        message: 'ALLOWED_ORIGINS must specify at least one valid origin.',
      });
    } else if (environment === 'PRODUCTION' && allowedOrigins.includes('*')) {
      issues.push({
        variableName: 'ALLOWED_ORIGINS',
        category: 'INSECURE_CONFIG',
        message: 'Wildcard CORS (*) is strictly prohibited in production environment.',
      });
    }

    const enableDebugMode = rawEnv.ENABLE_DEBUG_MODE === 'true';
    if (environment === 'PRODUCTION' && enableDebugMode) {
      issues.push({
        variableName: 'ENABLE_DEBUG_MODE',
        category: 'INSECURE_CONFIG',
        message: 'ENABLE_DEBUG_MODE must be disabled in production.',
      });
    }

    const maxFileSize = rawEnv.MAX_FILE_SIZE_BYTES ? parseInt(rawEnv.MAX_FILE_SIZE_BYTES, 10) : 52428800; // 50MB default
    if (isNaN(maxFileSize) || maxFileSize <= 0) {
      issues.push({
        variableName: 'MAX_FILE_SIZE_BYTES',
        category: 'INVALID_CONFIG',
        message: 'MAX_FILE_SIZE_BYTES must be a positive integer.',
      });
    }

    const isValid = issues.length === 0;

    const validatedConfig: ProductionConfigSchema | undefined = isValid
      ? {
          APP_ENV: environment,
          APP_URL: appUrl,
          DATABASE_URL: dbUrl,
          STORAGE_DRIVER: storageDriver,
          ENCRYPTION_KEY: encryptionKey,
          SESSION_SECRET: sessionSecret,
          ALLOWED_ORIGINS: allowedOrigins,
          LIVE_FEED_API_KEY: rawEnv.LIVE_FEED_API_KEY,
          ENABLE_DEBUG_MODE: enableDebugMode,
          MAX_FILE_SIZE_BYTES: maxFileSize,
        }
      : undefined;

    if (isValid && validatedConfig) {
      this.activeConfig = validatedConfig;
    }

    return {
      isValid,
      environment,
      config: validatedConfig,
      issues,
    };
  }

  public static getActiveConfig(): ProductionConfigSchema {
    if (!this.activeConfig) {
      const res = this.validateEnvironment({ APP_ENV: 'DEVELOPMENT' });
      return res.config!;
    }
    return this.activeConfig;
  }

  public static resetConfig(): void {
    this.activeConfig = null;
  }
}
