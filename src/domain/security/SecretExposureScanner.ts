/**
 * SecretExposureScanner.ts
 * Phase 18 — Automated Code, Bundle & Payload Secret Exposure Audit.
 * Scans JavaScript bundles, error stacks, reports, and payloads for unredacted credentials.
 */

export interface SecretAuditFinding {
  location: string;
  matchedPattern: string;
  severity: 'P0_CRITICAL';
}

export class SecretExposureScanner {
  private static readonly LEAK_PATTERNS: RegExp[] = [
    /AKIA[0-9A-Z]{16}/, // AWS Access Key
    /ghp_[a-zA-Z0-9]{36}/, // GitHub Personal Access Token
    /sk_live_[0-9a-zA-Z]{24}/, // Stripe Live Key
    /AIza[0-9A-Za-z-_]{35}/, // Google API Key
    /-----BEGIN (RSA|EC|DSA|OPENSSH) PRIVATE KEY-----/,
    /Bearer\s+[a-zA-Z0-9_\-\.]{30,}/i,
    /postgres:\/\/[a-zA-Z0-9_]+:[a-zA-Z0-9_]+@/i,
  ];

  public static scanText(text: string, location: string = 'unknown'): SecretAuditFinding[] {
    const findings: SecretAuditFinding[] = [];
    if (!text || typeof text !== 'string') return findings;

    for (const pattern of this.LEAK_PATTERNS) {
      if (pattern.test(text)) {
        findings.push({
          location,
          matchedPattern: pattern.toString(),
          severity: 'P0_CRITICAL',
        });
      }
    }
    return findings;
  }

  public static auditObject(obj: unknown, location: string = 'root'): SecretAuditFinding[] {
    const text = typeof obj === 'string' ? obj : JSON.stringify(obj);
    return this.scanText(text, location);
  }
}
