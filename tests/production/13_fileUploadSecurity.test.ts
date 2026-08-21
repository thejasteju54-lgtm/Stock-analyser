/**
 * 13_fileUploadSecurity.test.ts
 * Phase 18 — File Upload Security & Magic Byte Inspection Suite.
 */

import { describe, it, expect } from 'vitest';
import { FileUploadSecurityGuard } from '../../src/domain/security/FileUploadSecurityGuard';

describe('File Upload Security Guard Suite', () => {
  it('accepts valid PDF documents with authentic %PDF magic bytes and clean filenames', () => {
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]); // %PDF-1.7
    const result = FileUploadSecurityGuard.validateUpload('tata_annual_report_fy24.pdf', 'application/pdf', 1024000, pdfBytes);

    expect(result.isValid).toBe(true);
    expect(result.sanitizedFilename).toBe('tata_annual_report_fy24.pdf');
  });

  it('rejects spoofed files where an executable is renamed to .pdf', () => {
    const exeBytes = new Uint8Array([0x4d, 0x5a, 0x90, 0x00]); // MZ executable signature
    const result = FileUploadSecurityGuard.validateUpload('malware.pdf', 'application/pdf', 50000, exeBytes);

    expect(result.isValid).toBe(false);
    expect(result.rejectionReason).toContain('SPOOFED_FILE');
  });

  it('rejects path traversal filenames, null bytes, and oversized uploads', () => {
    const pathTraversal = FileUploadSecurityGuard.validateUpload('../../../etc/shadow.pdf', 'application/pdf', 1000);
    expect(pathTraversal.isValid).toBe(false);
    expect(pathTraversal.rejectionReason).toContain('PATH_TRAVERSAL_DETECTED');

    const oversized = FileUploadSecurityGuard.validateUpload('huge_doc.pdf', 'application/pdf', 60 * 1024 * 1024);
    expect(oversized.isValid).toBe(false);
    expect(oversized.rejectionReason).toContain('FILE_TOO_LARGE');
  });
});
