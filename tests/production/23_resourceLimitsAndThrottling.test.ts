/**
 * 23_resourceLimitsAndThrottling.test.ts
 * Phase 18 — Resource Limits & System Bounds Suite.
 */

import { describe, it, expect } from 'vitest';
import { ProductionConfig } from '../../src/domain/config/ProductionConfig';
import { FileUploadSecurityGuard } from '../../src/domain/security/FileUploadSecurityGuard';

describe('Resource Limits & Throttling Suite', () => {
  it('enforces maximum upload limits and validates positive file size limits', () => {
    const config = ProductionConfig.getActiveConfig();
    expect(config.MAX_FILE_SIZE_BYTES).toBe(52428800); // 50MB

    const oversized = FileUploadSecurityGuard.validateUpload('test.pdf', 'application/pdf', 55 * 1024 * 1024);
    expect(oversized.isValid).toBe(false);
    expect(oversized.rejectionReason).toContain('FILE_TOO_LARGE');
  });
});
