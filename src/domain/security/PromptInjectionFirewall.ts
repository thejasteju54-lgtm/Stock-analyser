/**
 * PromptInjectionFirewall.ts
 * Phase 18 — Document & Feed Prompt Injection Firewall.
 * Isolates untrusted document text from analysis logic, ensuring text remains data rather than executable instructions.
 */

export interface InjectionAuditResult {
  isContaminated: boolean;
  neutralizedText: string;
  detectedTriggers: string[];
}

export class PromptInjectionFirewall {
  private static readonly INJECTION_TRIGGERS: RegExp[] = [
    /ignore\s+(all\s+)?(previous|prior)\s+instructions/gi,
    /give\s+(a\s+)?(buy|strong\s+buy)\s+verdict/gi,
    /reveal\s+(the\s+)?(system\s+prompt|api\s+key|secret)/gi,
    /execute\s+(system\s+)?command/gi,
    /disregard\s+(accounting|forensic|valuation)\s+rules/gi,
    /override\s+(investment\s+verdict|conviction\s+score)/gi,
  ];

  public static sanitizeUntrustedData(rawText: string): InjectionAuditResult {
    if (!rawText || typeof rawText !== 'string') {
      return { isContaminated: false, neutralizedText: rawText, detectedTriggers: [] };
    }

    const detectedTriggers: string[] = [];
    let neutralizedText = rawText;

    for (const pattern of this.INJECTION_TRIGGERS) {
      if (pattern.test(rawText)) {
        const matches = rawText.match(pattern);
        if (matches) {
          detectedTriggers.push(...matches);
        }
        // Neutralize trigger string by escaping and marking as untrusted user text
        neutralizedText = neutralizedText.replace(pattern, (m) => `[UNTRUSTED_CONTENT_NEUTRALIZED: "${m}"]`);
      }
    }

    return {
      isContaminated: detectedTriggers.length > 0,
      neutralizedText,
      detectedTriggers,
    };
  }
}
