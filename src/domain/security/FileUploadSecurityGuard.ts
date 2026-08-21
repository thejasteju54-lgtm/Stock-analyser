/**
 * FileUploadSecurityGuard.ts
 * Phase 18 — File Upload Security & Magic Byte Validation.
 * Validates file size, MIME types, extensions, filename path traversal, and null-bytes.
 */

export interface FileUploadValidationResult {
  isValid: boolean;
  sanitizedFilename?: string;
  detectedMimeType?: string;
  rejectionReason?: string;
}

export class FileUploadSecurityGuard {
  private static readonly MAX_FILE_SIZE_BYTES = 52428800; // 50MB
  private static readonly ALLOWED_EXTENSIONS = new Set(['pdf', 'png', 'jpg', 'jpeg', 'webp']);
  private static readonly ALLOWED_MIME_TYPES = new Set([
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
  ]);

  public static validateUpload(
    filename: string,
    mimeType: string,
    fileSizeBytes: number,
    magicBytes?: Uint8Array
  ): FileUploadValidationResult {
    // 1. File Size
    if (fileSizeBytes > this.MAX_FILE_SIZE_BYTES) {
      return {
        isValid: false,
        rejectionReason: `FILE_TOO_LARGE: File size (${fileSizeBytes} bytes) exceeds 50MB limit`,
      };
    }

    if (fileSizeBytes <= 0) {
      return {
        isValid: false,
        rejectionReason: 'EMPTY_FILE: File contains zero bytes',
      };
    }

    // 2. Filename Sanitization & Path Traversal Guard
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\') || filename.includes('\0')) {
      return {
        isValid: false,
        rejectionReason: 'PATH_TRAVERSAL_DETECTED: Filename contains illegal directory navigation or null bytes',
      };
    }

    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
    const ext = sanitizedFilename.split('.').pop()?.toLowerCase();

    if (!ext || !this.ALLOWED_EXTENSIONS.has(ext)) {
      return {
        isValid: false,
        rejectionReason: `UNSUPPORTED_EXTENSION: File extension .${ext} is not allowed`,
      };
    }

    // 3. MIME type check
    if (!this.ALLOWED_MIME_TYPES.has(mimeType.toLowerCase())) {
      return {
        isValid: false,
        rejectionReason: `INVALID_MIME_TYPE: MIME type ${mimeType} is not permitted`,
      };
    }

    // 4. Magic Bytes Inspection (if available)
    if (magicBytes && magicBytes.length >= 4) {
      if (ext === 'pdf') {
        // PDF magic bytes: %PDF (0x25, 0x50, 0x44, 0x46)
        const isPdfMagic =
          magicBytes[0] === 0x25 && magicBytes[1] === 0x50 && magicBytes[2] === 0x44 && magicBytes[3] === 0x46;
        if (!isPdfMagic) {
          return {
            isValid: false,
            rejectionReason: 'SPOOFED_FILE: File extension is .pdf but byte signature does not match PDF standard',
          };
        }
      }
    }

    return {
      isValid: true,
      sanitizedFilename,
      detectedMimeType: mimeType,
    };
  }
}
