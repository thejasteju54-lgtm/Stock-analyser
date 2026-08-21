/**
 * SsrfProtectionPolicy.ts
 * Phase 18 — Server-Side Request Forgery (SSRF) Protection & URL Firewall.
 * Blocks requests targeting localhost, private subnets, cloud metadata endpoints, and dangerous URI schemes.
 */

export interface SsrfValidationResult {
  isAllowed: boolean;
  reason?: string;
}

export class SsrfProtectionPolicy {
  private static readonly BLOCKED_HOSTNAMES: Set<string> = new Set([
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    'metadata.google.internal',
    '169.254.169.254',
    'instance-data',
  ]);

  public static validateUrl(urlString: string): SsrfValidationResult {
    if (!urlString || typeof urlString !== 'string') {
      return { isAllowed: false, reason: 'INVALID_URL: URL string is empty or invalid' };
    }

    // Check scheme
    const lower = urlString.trim().toLowerCase();
    if (!lower.startsWith('http://') && !lower.startsWith('https://')) {
      return {
        isAllowed: false,
        reason: 'UNSUPPORTED_PROTOCOL: Only HTTP and HTTPS protocols are permitted',
      };
    }

    try {
      const parsed = new URL(urlString);
      const hostname = parsed.hostname.toLowerCase();

      // Check blocked hostnames
      if (this.BLOCKED_HOSTNAMES.has(hostname)) {
        return {
          isAllowed: false,
          reason: `SSRF_BLOCKED: Access to protected hostname ${hostname} is prohibited`,
        };
      }

      // Check loopback & private IPv4 ranges
      if (this.isPrivateIp(hostname)) {
        return {
          isAllowed: false,
          reason: `SSRF_BLOCKED: Access to private IP subnet ${hostname} is prohibited`,
        };
      }

      // Check port restrictions (only 80, 443 permitted in production)
      if (parsed.port && parsed.port !== '80' && parsed.port !== '443') {
        return {
          isAllowed: false,
          reason: `SSRF_BLOCKED: Port ${parsed.port} is not in permitted port allowlist (80, 443)`,
        };
      }

      return { isAllowed: true };
    } catch {
      return { isAllowed: false, reason: 'MALFORMED_URL: Failed to parse URL structure' };
    }
  }

  private static isPrivateIp(ip: string): boolean {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
      return false;
    }

    // 127.0.0.0/8 (Loopback)
    if (parts[0] === 127) return true;
    // 10.0.0.0/8 (Private)
    if (parts[0] === 10) return true;
    // 172.16.0.0/12 (Private)
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16 (Private)
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 169.254.0.0/16 (Link Local / Cloud Metadata)
    if (parts[0] === 169 && parts[1] === 254) return true;

    return false;
  }
}
