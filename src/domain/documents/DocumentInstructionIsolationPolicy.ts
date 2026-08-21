/**
 * DocumentInstructionIsolationPolicy.ts
 * Phase 15 — Security & Prompt Injection Defense Policy.
 * Strictly separates evidentiary data from system execution instructions.
 */

export class DocumentInstructionIsolationPolicy {
  private static readonly INJECTION_PATTERNS = [
    /ignore\s+(all\s+)?previous\s+instructions/i,
    /override\s+(system|verdict|decision|recommendation)/i,
    /you\s+must\s+(give|output|recommend)\s+a\s+(buy|strong\s+buy)/i,
    /set\s+conviction\s+to\s+10/i,
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/i,
    /onload\s*=/i,
    /onerror\s*=/i,
  ];

  /**
   * Sanitizes passive documentary text and detects prompt injection attempts.
   */
  public static sanitizeEvidentiaryText(rawText: string): {
    sanitizedText: string;
    hasInjectionAttempt: boolean;
    detectedPatterns: string[];
  } {
    if (!rawText) {
      return { sanitizedText: '', hasInjectionAttempt: false, detectedPatterns: [] };
    }

    const detectedPatterns: string[] = [];
    let sanitizedText = rawText;

    for (const pattern of this.INJECTION_PATTERNS) {
      if (pattern.test(sanitizedText)) {
        detectedPatterns.push(pattern.source);
        sanitizedText = sanitizedText.replace(pattern, '[REDACTED_UNTRUSTED_INSTRUCTION]');
      }
    }

    // HTML Entity Encoding for security against XSS in UI/Report rendering
    sanitizedText = sanitizedText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');

    return {
      sanitizedText,
      hasInjectionAttempt: detectedPatterns.length > 0,
      detectedPatterns,
    };
  }

  /**
   * Asserts that document text cannot control or modify application state directly.
   */
  public static isSafeEvidentiaryPayload(payload: unknown): boolean {
    if (typeof payload === 'string') {
      return !this.INJECTION_PATTERNS.some((p) => p.test(payload));
    }
    return true;
  }
}
