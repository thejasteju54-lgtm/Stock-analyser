import { DailyStockSignal, OpportunityScoreBreakdown, OpportunityType } from './MarketIntelligenceTypes';
import { OpportunityPolicyRegistry } from './OpportunityPolicyRegistry';

export class OpportunityScoreEngine {
  /**
   * Computes deterministic Opportunity Score and component breakdown
   */
  static calculateOpportunityScore(
    signal: DailyStockSignal,
    policyVersion: string = OpportunityPolicyRegistry.CURRENT_VERSION
  ): {
    breakdown: OpportunityScoreBreakdown;
    opportunityType: OpportunityType;
    whyTodayBullets: string[];
    keyCatalysts: string[];
    keyRisks: string[];
  } {
    const policy = OpportunityPolicyRegistry.getPolicy(policyVersion);

    // 1. Momentum Score (Max 15)
    // Combines 1M (40%), 3M (30%), 1D (30%)
    let momentumScore = 0;
    const m1 = Math.max(-20, Math.min(30, signal.returns.m1));
    const d1 = Math.max(-10, Math.min(15, signal.returns.d1));
    momentumScore = Math.min(15, Math.max(0, (m1 * 0.3 + d1 * 0.4 + 5) * (15 / 15)));
    momentumScore = Math.min(15, Math.max(2, momentumScore));

    // 2. Fundamentals Score (Max 20)
    // Evaluates ROCE, Revenue Growth, and Margin
    let fundamentalsScore = 0;
    const roce = signal.fundamentals.roce || 0;
    const revGrowth = signal.fundamentals.revenueGrowthYoY || 0;
    const margin = signal.fundamentals.ebitdaMargin || 0;

    if (roce >= 25) fundamentalsScore += 8;
    else if (roce >= 18) fundamentalsScore += 6;
    else if (roce >= 12) fundamentalsScore += 4;

    if (revGrowth >= 20) fundamentalsScore += 7;
    else if (revGrowth >= 12) fundamentalsScore += 5;
    else if (revGrowth >= 5) fundamentalsScore += 3;

    if (margin >= 20) fundamentalsScore += 5;
    else if (margin >= 12) fundamentalsScore += 3;
    else if (margin >= 6) fundamentalsScore += 2;

    fundamentalsScore = Math.min(20, fundamentalsScore);

    // 3. Catalysts Score (Max 20)
    let catalystsScore = 0;
    const orderWins = signal.events.filter((e) => e.type === 'ORDER_WIN');
    const earningsSurprise = signal.events.filter((e) => e.type === 'EARNINGS_SURPRISE');
    const highEvents = signal.events.filter((e) => e.materiality === 'HIGH' && e.impact === 'POSITIVE');

    if (orderWins.length > 0) catalystsScore += 12;
    if (earningsSurprise.length > 0) catalystsScore += 8;
    catalystsScore += highEvents.length * 5;
    catalystsScore = Math.min(20, Math.max(5, catalystsScore));

    // 4. Valuation Score (Max 15)
    let valuationScore = 8;
    const pe = signal.fundamentals.peRatio || 30;
    if (pe < 20) valuationScore = 14;
    else if (pe < 35) valuationScore = 11;
    else if (pe < 50) valuationScore = 7;
    else valuationScore = 4;

    // 5. Technical Structure Score (Max 10)
    let technicalScore = 0;
    if (signal.technical.above50Dma && signal.technical.above200Dma) technicalScore += 5;
    if (signal.technical.isBreakout) technicalScore += 3;
    if (signal.technical.rsi14 >= 50 && signal.technical.rsi14 <= 70) technicalScore += 2;
    technicalScore = Math.min(10, technicalScore);

    // 6. Sector Strength Score (Max 5)
    const sectorScore = signal.returns.d5 >= 2.0 ? 5 : signal.returns.d5 >= 0 ? 3 : 1;

    // 7. News Quality Score (Max 5)
    let newsScore = 3;
    if (signal.newsIntensity.independentSourceCount >= 2 && !signal.newsIntensity.isSyndicatedWire) {
      newsScore = 5;
    } else if (signal.newsIntensity.isSyndicatedWire) {
      newsScore = 2;
    }

    // 8. Volume Confirmation Score (Max 5)
    let volumeScore = 2;
    if (signal.technical.volumeMultiple >= 2.0) volumeScore = 5;
    else if (signal.technical.volumeMultiple >= 1.4) volumeScore = 4;

    // 9. Data Confidence Score (Max 5)
    let confidenceScore = 3;
    if (signal.dataConfidence === 'HIGH') confidenceScore = 5;
    else if (signal.dataConfidence === 'MEDIUM') confidenceScore = 3;
    else if (signal.dataConfidence === 'LOW') confidenceScore = 1;

    const rawTotal = Math.round(
      momentumScore +
      fundamentalsScore +
      catalystsScore +
      valuationScore +
      technicalScore +
      sectorScore +
      newsScore +
      volumeScore +
      confidenceScore
    );

    // 10. Risk Penalty (Max 40)
    let riskPenalty = 0;
    for (const r of signal.risks) {
      if (r.severity === 'CRITICAL') riskPenalty += policy.riskPenalties.critical;
      else if (r.severity === 'HIGH') riskPenalty += policy.riskPenalties.high;
      else if (r.severity === 'MEDIUM') riskPenalty += policy.riskPenalties.medium;
      else if (r.severity === 'LOW') riskPenalty += policy.riskPenalties.low;
    }
    riskPenalty = Math.min(policy.maxPenaltyCap, riskPenalty);

    const finalOpportunityScore = Math.max(0, Math.min(100, rawTotal - riskPenalty));

    const breakdown: OpportunityScoreBreakdown = {
      momentumScore: Math.round(momentumScore),
      fundamentalsScore: Math.round(fundamentalsScore),
      catalystsScore: Math.round(catalystsScore),
      valuationScore: Math.round(valuationScore),
      technicalScore: Math.round(technicalScore),
      sectorScore: Math.round(sectorScore),
      newsScore: Math.round(newsScore),
      volumeScore: Math.round(volumeScore),
      confidenceScore: Math.round(confidenceScore),
      rawTotal,
      riskPenalty,
      finalOpportunityScore,
    };

    // Determine Opportunity Type
    let opportunityType: OpportunityType = 'MOMENTUM';
    if (orderWins.length > 0) opportunityType = 'ORDER_BOOK';
    else if (earningsSurprise.length > 0) opportunityType = 'EARNINGS';
    else if (signal.technical.isBreakout) opportunityType = 'BREAKOUT';
    else if (fundamentalsScore >= 16 && valuationScore >= 10) opportunityType = 'QUALITY_COMPOUNDER';
    else if (valuationScore >= 12) opportunityType = 'VALUE';
    else if (revGrowth >= 18) opportunityType = 'GROWTH';

    // Formulate "Why Today?" bullets
    const whyTodayBullets: string[] = [];
    if (orderWins.length > 0) {
      whyTodayBullets.push(`Major order flow announcement (${orderWins[0].headline}).`);
    }
    if (signal.technical.volumeMultiple >= 1.5) {
      whyTodayBullets.push(`Unusual volume expansion at ${signal.technical.volumeMultiple.toFixed(1)}× 20-day average.`);
    }
    if (signal.returns.d1 >= 2.0) {
      whyTodayBullets.push(`Strong price momentum (+${signal.returns.d1.toFixed(1)}% today).`);
    }
    if (signal.fundamentals.roce >= 18) {
      whyTodayBullets.push(`Robust capital efficiency (ROCE: ${signal.fundamentals.roce.toFixed(1)}%).`);
    }
    if (whyTodayBullets.length === 0) {
      whyTodayBullets.push('Corroborated technical momentum across moving averages.');
    }

    const keyCatalysts = signal.events.map((e) => e.headline).slice(0, 3);
    if (keyCatalysts.length === 0) {
      keyCatalysts.push(`Sector tailwind in ${signal.sector}`);
    }

    const keyRisks = signal.risks.map((r) => r.description).slice(0, 3);
    if (keyRisks.length === 0) {
      keyRisks.push('Execution and broader market volatility');
    }

    return {
      breakdown,
      opportunityType,
      whyTodayBullets,
      keyCatalysts,
      keyRisks,
    };
  }
}
