/**
 * SecretRedactionEngine.ts
 * Phase 18 — Secret Redaction & Log/Report Sanitization Engine.
 * Recursively redacts sensitive API keys, passwords, bearer tokens, and private keys.
 */

export class SecretRedactionEngine {
  private static readonly SECRET_PATTERNS: RegExp[] = [
    /bearer\s+[a-zA-Z0-9_\-\.]{15,}/gi,
    /api[_-]?key\s*[:=]\s*['"]?[a-zA-Z0-9_\-]{10,}['"]?/gi,
    /password\s*[:=]\s*['"]?[^\s'"]{6,}['"]?/gi,
    /secret\s*[:=]\s*['"]?[a-zA-Z0-9_\-]{10,}['"]?/gi,
    /private[_-]?key\s*[:=]\s*['"]?[^\s'"]{20,}['"]?/gi,
    /postgres:\/\/[^:]+:[^@]+@/gi,
    /mongodb(\+srv)?:\/\/[^:]+:[^@]+@/gi,
  ];

  public static redactString(text: string): string {
    if (!text || typeof text !== 'string') return text;

    let sanitized = text;
    for (const pattern of this.SECRET_PATTERNS) {
      sanitized = sanitized.replace(pattern, (match) => {
        if (match.toLowerCase().startsWith('bearer ')) {
          return 'Bearer ***REDACTED***';
        }
        if (match.includes('://')) {
          return match.replace(/:[^:@]+@/, ':***REDACTED***@');
        }
        const delimiter = match.includes(':') ? ':' : '=';
        const parts = match.split(delimiter);
        return `${parts[0]}${delimiter} ***REDACTED***`;
      });
    }
    return sanitized;
  }

  public static redactObject<T>(obj: T): T {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') {
      return this.redactString(obj) as unknown as T;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.redactObject(item)) as unknown as T;
    }

    if (typeof obj === 'object') {
      const cloned: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        const lowerKey = key.toLowerCase();
        if (
          lowerKey.includes('password') ||
          lowerKey.includes('secret') ||
          lowerKey.includes('apikey') ||
          lowerKey.includes('api_key') ||
          lowerKey.includes('privatekey') ||
          lowerKey.includes('token')
        ) {
          cloned[key] = '***REDACTED***';
        } else {
          cloned[key] = this.redactObject(value);
        }
      }
      return cloned as unknown as T;
    }

    return obj;
  }
}
