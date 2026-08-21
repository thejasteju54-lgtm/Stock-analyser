/**
 * CanonicalJsonSerializer.ts
 * Phase 15 — Deterministic recursive JSON canonicalizer for cryptographic hashing and audit integrity.
 */

export class CanonicalJsonSerializer {
  /**
   * Recursively serializes any JSON-compatible value into a canonical, deterministic string:
   * 1. Object keys are recursively sorted alphabetically.
   * 2. Array elements maintain their order while their inner contents are recursively canonicalized.
   * 3. Primitives (null, boolean, number, string) are normalized.
   * 4. undefined and function properties are omitted.
   */
  public static canonicalize(value: unknown): string {
    if (value === null || value === undefined) {
      return 'null';
    }

    if (typeof value === 'boolean' || typeof value === 'number') {
      return JSON.stringify(value);
    }

    if (typeof value === 'string') {
      return JSON.stringify(value);
    }

    if (Array.isArray(value)) {
      return '[' + value.map((item) => this.canonicalize(item)).join(',') + ']';
    }

    if (typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      const sortedKeys = Object.keys(obj).sort();
      const pairs: string[] = [];

      for (const key of sortedKeys) {
        const val = obj[key];
        if (val !== undefined && typeof val !== 'function') {
          pairs.push(`${JSON.stringify(key)}:${this.canonicalize(val)}`);
        }
      }

      return '{' + pairs.join(',') + '}';
    }

    return 'null';
  }
}
