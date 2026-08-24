/**
 * AIResearchProvider.ts
 * Configurable AI Research Provider Abstraction
 * Handles Google Gemini, OpenAI, Anthropic, or reports AI_RESEARCH_UNAVAILABLE when no key is set.
 */

import { executeAiResearchWithGemini } from '../../../server/api';
import { ResearchContext } from './ResearchContext';

export interface AIResearchReport {
  status: 'SUCCESS' | 'AI_RESEARCH_UNAVAILABLE';
  provider: string;
  analysisDate: string;
  executiveThesis: string;
  fundamentalObservations: string[];
  forensicRiskFlags: string[];
  catalysts: string[];
  keyRisks: string[];
  thesisBreakers: string[];
  recommendedValuationApproach: string;
  rawConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export class AIResearchProvider {
  /**
   * Dispatches research request to backend AI service.
   */
  static async runResearch(context: ResearchContext): Promise<AIResearchReport> {
    if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
      try {
        const resp = await fetch('/api/ai/research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company: context.company,
            marketData: context.marketData,
            extractedFacts: context.financialFacts,
            newsEvents: context.newsEvents,
          }),
        });

        if (resp.ok) {
          const json = await resp.json();
          return json;
        }
      } catch (e) {
        // Fall through to in-process invocation
      }
    }

    return await executeAiResearchWithGemini({
      company: context.company as any,
      marketData: context.marketData,
      extractedFacts: context.financialFacts,
      newsEvents: context.newsEvents,
    });
  }
}
