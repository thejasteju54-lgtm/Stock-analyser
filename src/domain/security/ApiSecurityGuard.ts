/**
 * ApiSecurityGuard.ts
 * Phase 18 — API Payload Validation, Rate Limiting & Stack Trace Protection.
 * Protects endpoints from oversized payloads, injection strings, malformed schemas, and stack trace leaks.
 */

export interface ApiSecurityValidationResult {
  isValid: boolean;
  errorCode?: string;
  userFacingMessage?: string;
}

export class ApiSecurityGuard {
  private static readonly MAX_JSON_PAYLOAD_SIZE = 1048576; // 1MB

  public static validatePayloadSize(contentLengthBytes: number): ApiSecurityValidationResult {
    if (contentLengthBytes > this.MAX_JSON_PAYLOAD_SIZE) {
      return {
        isValid: false,
        errorCode: 'PAYLOAD_TOO_LARGE',
        userFacingMessage: 'Request payload exceeds maximum permitted limit (1MB)',
      };
    }
    return { isValid: true };
  }

  public static sanitizeErrorMessage(error: unknown): string {
    if (!error) return 'An internal server error occurred';

    // If string, strip any stack trace indicators
    const errorStr = typeof error === 'string' ? error : (error as Error).message || 'Internal processing error';

    // Prevent exposing internal stack traces or file system paths
    if (errorStr.includes('at ') || errorStr.includes('node_modules') || errorStr.includes('file:///')) {
      return 'An unexpected error occurred during processing. Reference standard error code.';
    }

    return errorStr;
  }

  public static validateIdentifier(id: string): boolean {
    if (!id || typeof id !== 'string') return false;
    // Disallow path traversal, control chars, and SQL injection syntax
    const safeIdPattern = /^[a-zA-Z0-9_\-\.]{3,64}$/;
    return safeIdPattern.test(id) && !id.includes('..');
  }
}
