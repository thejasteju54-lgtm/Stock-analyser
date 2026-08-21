/**
 * SecurityHeadersConfig.ts
 * Phase 18 — HTTP Security Headers & Content-Security-Policy (CSP) Definition.
 * Configures enterprise security headers: HSTS, CSP, X-Frame-Options, and Referrer-Policy.
 */

export interface SecurityHeadersMap {
  'Content-Security-Policy': string;
  'Strict-Transport-Security': string;
  'X-Content-Type-Options': string;
  'X-Frame-Options': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
}

export class SecurityHeadersConfig {
  public static getProductionHeaders(): SecurityHeadersMap {
    return {
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' https://api.nseindia.com https://api.bseindia.com; font-src 'self' data:; object-src 'none'; frame-ancestors 'none';",
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    };
  }

  public static validateHeaders(headers: Record<string, string>): { isValid: boolean; missingHeaders: string[] } {
    const required = [
      'Content-Security-Policy',
      'Strict-Transport-Security',
      'X-Content-Type-Options',
      'X-Frame-Options',
      'Referrer-Policy',
    ];

    const missingHeaders = required.filter((h) => !headers[h] && !headers[h.toLowerCase()]);
    return {
      isValid: missingHeaders.length === 0,
      missingHeaders,
    };
  }
}
