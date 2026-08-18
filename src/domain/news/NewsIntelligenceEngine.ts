/**
 * NewsIntelligenceEngine.ts
 * Phase 11 — Pipeline A: News Intelligence & External Event Analysis Engine.
 */

import {
  NewsEvent,
  NewsSource,
  SourceConflict,
  CatalystEvent,
  UpcomingEvent,
  NewsRisk,
  MaterialNewsAlert,
  ImpactAssessment,
  NewsCategory,
  ImpactDirection,
  ImpactMagnitude,
  ImpactHorizon,
  FactCertainty,
} from './NewsAndIndustryTypes';
import { NewsAndIndustryPolicyRegistry } from './NewsAndIndustryPolicyRegistry';
import { EntityResolutionEngine, CompanyEntityProfile } from './EntityResolutionEngine';
import { NewsDeduplicationEngine, RawNewsArticle } from './NewsDeduplicationEngine';

export class NewsIntelligenceEngine {
  /**
   * Processes raw articles into verified, deduplicated NewsEvent records.
   */
  public static processNewsFeed(
    articles: RawNewsArticle[],
    companyProfile: CompanyEntityProfile,
    currentDate: string = new Date().toISOString().split('T')[0]
  ): {
    newsEvents: NewsEvent[];
    materialAlerts: MaterialNewsAlert[];
    catalysts: CatalystEvent[];
    upcomingEvents: UpcomingEvent[];
    newsRisks: NewsRisk[];
    sourceConflicts: SourceConflict[];
  } {
    // 1. Cluster articles into deduplicated groups
    const clusters = NewsDeduplicationEngine.clusterArticles(articles);

    const newsEvents: NewsEvent[] = [];
    const materialAlerts: MaterialNewsAlert[] = [];
    const catalysts: CatalystEvent[] = [];
    const upcomingEvents: UpcomingEvent[] = [];
    const newsRisks: NewsRisk[] = [];
    const sourceConflicts: SourceConflict[] = [];

    for (const cluster of clusters) {
      // 2. Entity Resolution
      const entities = EntityResolutionEngine.resolveEntities(
        cluster.canonicalHeadline,
        cluster.canonicalSummary,
        companyProfile
      );

      // 3. Category & Impact Extraction
      const category = this.categorizeHeadline(cluster.canonicalHeadline);
      const impact = this.evaluateImpact(cluster.canonicalHeadline, category, entities.relevance);

      // Highest source tier in cluster
      const highestTier = cluster.sources.some((s) => s.sourceTier === 'TIER_1_PRIMARY')
        ? 'TIER_1_PRIMARY'
        : cluster.sources.some((s) => s.sourceTier === 'TIER_2_HIGH_QUALITY_MEDIA')
        ? 'TIER_2_HIGH_QUALITY_MEDIA'
        : cluster.sources.some((s) => s.sourceTier === 'TIER_3_SECONDARY')
        ? 'TIER_3_SECONDARY'
        : 'TIER_4_DISCOVERY_ONLY';

      // 4. Temporal Classification & Event Date Precision
      const isInvestigation = category === 'LEGAL' || category === 'LITIGATION' || category === 'REGULATORY';
      const eventStatus = NewsAndIndustryPolicyRegistry.classifyTemporalStatus(
        cluster.earliestPublishedAt.split('T')[0],
        currentDate,
        isInvestigation,
        false
      );

      // Check for conflicts within cluster
      const clusterConflict = this.detectSourceConflict(cluster.sources, cluster.groupId);
      if (clusterConflict) {
        sourceConflicts.push(clusterConflict);
      }

      // 5. Materiality Score
      const certainty: FactCertainty = cluster.canonicalHeadline.toLowerCase().includes('rumour') || cluster.canonicalHeadline.toLowerCase().includes('rumor')
        ? 'RUMOR'
        : cluster.canonicalHeadline.toLowerCase().includes('likely') || cluster.canonicalHeadline.toLowerCase().includes('may')
        ? 'REPORTED'
        : 'CONFIRMED';

      const materialityScore = NewsAndIndustryPolicyRegistry.calculateMaterialityScore({
        relevance: entities.relevance,
        magnitude: impact.magnitude,
        horizon: impact.horizon,
        highestSourceTier: highestTier,
        isCorroborated: cluster.independentSourceCount >= 2 || cluster.primarySourceCount >= 1,
        hasConflict: clusterConflict !== null && clusterConflict.status === 'CONFLICTING_INFORMATION',
        certainty,
      });

      const eventId = `ev_${cluster.groupId}`;
      const newsEvent: NewsEvent = {
        eventId,
        headline: cluster.canonicalHeadline,
        summary: cluster.canonicalSummary,
        eventDate: cluster.earliestPublishedAt.split('T')[0],
        eventDatePrecision: 'EXACT_DATE',
        publicationDate: cluster.earliestPublishedAt,
        retrievedAt: new Date().toISOString(),
        timezone: 'Asia/Kolkata',
        sourceReferences: cluster.sources,
        companyEntities: entities.companyEntities,
        peopleEntities: entities.peopleEntities,
        industryEntities: entities.industryEntities,
        eventCategory: category,
        relevance: entities.relevance,
        impactAssessment: impact,
        duplicateGroupId: cluster.groupId,
        sourceLineageIds: [cluster.lineage.lineageId],
        corroborationStatus: cluster.corroborationStatus,
        eventStatus,
        confidence: materialityScore,
        evidenceReferences: cluster.sources.map((s) => `${s.publisher} (${s.publishedAt.split('T')[0]})`),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      newsEvents.push(newsEvent);

      // Material Alert Trigger
      if (
        (entities.relevance === 'DIRECT_COMPANY' || entities.relevance === 'MATERIAL_COMPANY') &&
        (impact.magnitude === 'MATERIAL' || impact.magnitude === 'HIGH') &&
        materialityScore >= 70
      ) {
        materialAlerts.push({
          alertId: `alt_${newsEvent.eventId}`,
          headline: newsEvent.headline,
          eventDate: newsEvent.eventDate || currentDate,
          category: newsEvent.eventCategory,
          magnitude: impact.magnitude,
          relevance: entities.relevance,
          sourceTier: highestTier,
          summary: newsEvent.summary,
        });
      }

      // Catalysts & Risks
      if (impact.direction === 'POSITIVE' && (impact.magnitude === 'HIGH' || impact.magnitude === 'MATERIAL')) {
        catalysts.push({
          catalystId: `cat_${newsEvent.eventId}`,
          event: newsEvent.headline,
          category: newsEvent.eventCategory,
          expectedDate: newsEvent.eventDate,
          datePrecision: 'EXACT_DATE',
          businessImpact: impact.potentialEffect,
          financialChannel: impact.financialChannels[0] || 'REVENUE',
          status: 'COMPLETED',
          confidence: newsEvent.confidence,
          sourceReferences: newsEvent.sourceReferences,
        });
      } else if (impact.direction === 'NEGATIVE' && (impact.magnitude === 'HIGH' || impact.magnitude === 'MATERIAL')) {
        newsRisks.push({
          riskId: `risk_${newsEvent.eventId}`,
          riskCategory: category === 'REGULATORY' ? 'REGULATORY' : category === 'LITIGATION' ? 'LITIGATION' : 'COMPETITIVE_PRESSURE',
          severity: impact.magnitude === 'MATERIAL' ? 'CRITICAL' : 'HIGH',
          businessChannel: impact.businessChannels[0] || 'Operating constraints',
          financialChannel: impact.financialChannels[0] || 'MARGINS',
          horizon: impact.horizon,
          confidence: newsEvent.confidence,
          evidence: newsEvent.headline,
          sources: newsEvent.sourceReferences,
        });
      }
    }

    // Detect cross-cluster conflicts (e.g. Official denial filing vs discovery rumor)
    const tier1FilingEvents = newsEvents.filter((e) =>
      e.sourceReferences.some((s) => s.sourceTier === 'TIER_1_PRIMARY')
    );
    const tier4DiscoveryEvents = newsEvents.filter((e) =>
      e.sourceReferences.some((s) => s.sourceTier === 'TIER_4_DISCOVERY_ONLY')
    );

    for (const filing of tier1FilingEvents) {
      for (const discovery of tier4DiscoveryEvents) {
        if (
          filing.headline.toLowerCase().includes('denies') ||
          filing.headline.toLowerCase().includes('clarifies') ||
          filing.headline.toLowerCase().includes('no merger')
        ) {
          const conflict: SourceConflict = {
            conflictId: `conf_${filing.eventId}_${discovery.eventId}`,
            eventId: filing.eventId,
            claim: `Filing (${filing.headline}) contradicts Discovery report (${discovery.headline})`,
            sourceA: filing.sourceReferences[0],
            sourceB: discovery.sourceReferences[0],
            difference: 'Official regulatory disclosure contradicts social media discovery speculation.',
            sourceReliabilityA: filing.sourceReferences[0].reliabilityScore,
            sourceReliabilityB: discovery.sourceReferences[0].reliabilityScore,
            resolution: 'RESOLVED_BY_PRIMARY_SOURCE',
            resolutionEvidence: 'Tier 1 official exchange disclosure supersedes Tier 4 discovery source.',
            status: 'RESOLVED',
          };
          sourceConflicts.push(conflict);
        }
      }
    }

    return {
      newsEvents,
      materialAlerts,
      catalysts,
      upcomingEvents,
      newsRisks,
      sourceConflicts,
    };
  }

  private static categorizeHeadline(headline: string): NewsCategory {
    const h = headline.toLowerCase();
    if (h.includes('order') || h.includes('contract') || h.includes('bagged') || h.includes('bags') || h.includes('deal') || h.includes('wins')) return 'ORDER_WIN';
    if (h.includes('q1') || h.includes('q2') || h.includes('q3') || h.includes('q4') || h.includes('profit') || h.includes('revenue') || h.includes('results') || h.includes('earnings')) return 'RESULTS';
    if (h.includes('capex') || h.includes('expansion') || h.includes('plant') || h.includes('capacity')) return 'CAPEX';
    if (h.includes('acquisition') || h.includes('acquires') || h.includes('stake') || h.includes('merger') || h.includes('buyout')) return 'ACQUISITION';
    if (h.includes('guidance') || h.includes('target') || h.includes('outlook')) return 'GUIDANCE';
    if (h.includes('sebi') || h.includes('rbi') || h.includes('penalty') || h.includes('regulator') || h.includes('investigation') || h.includes('clarifies')) return 'REGULATORY';
    if (h.includes('court') || h.includes('litigation') || h.includes('nclt') || h.includes('dispute')) return 'LITIGATION';
    if (h.includes('commodity') || h.includes('steel') || h.includes('crude') || h.includes('input cost')) return 'COMMODITY';
    if (h.includes('rating') || h.includes('crisil') || h.includes('icra') || h.includes('downgrade') || h.includes('upgrade')) return 'CREDIT_RATING';
    if (h.includes('promoter') || h.includes('pledge') || h.includes('stake sale')) return 'PROMOTER_ACTIVITY';
    if (h.includes('ceo') || h.includes('cfo') || h.includes('resigns') || h.includes('appoints')) return 'MANAGEMENT_CHANGE';
    return 'OTHER';
  }

  private static evaluateImpact(
    headline: string,
    category: NewsCategory,
    relevance: any
  ): ImpactAssessment {
    const h = headline.toLowerCase();
    const channels = NewsAndIndustryPolicyRegistry.getChannelsForCategory(category);

    let direction: ImpactDirection = 'NEUTRAL';
    let magnitude: ImpactMagnitude = 'LOW';
    let horizon: ImpactHorizon = 'SHORT_TERM';

    if (category === 'ORDER_WIN' || category === 'CONTRACT') {
      direction = 'POSITIVE';
      magnitude = h.includes('crore') || h.includes('cr') || h.includes('major') || h.includes('billion') ? 'MATERIAL' : 'HIGH';
      horizon = 'MEDIUM_TERM';
    } else if (category === 'RESULTS') {
      if (h.includes('surge') || h.includes('jump') || h.includes('beats') || h.includes('up') || h.includes('record')) {
        direction = 'POSITIVE';
        magnitude = 'HIGH';
      } else if (h.includes('drop') || h.includes('fall') || h.includes('miss') || h.includes('down')) {
        direction = 'NEGATIVE';
        magnitude = 'HIGH';
      } else {
        direction = 'MIXED';
        magnitude = 'MEDIUM';
      }
      horizon = 'SHORT_TERM';
    } else if (category === 'REGULATORY' || category === 'LITIGATION') {
      direction = h.includes('clarifies no') || h.includes('no merger') ? 'NEUTRAL' : 'NEGATIVE';
      magnitude = 'MATERIAL';
      horizon = 'STRUCTURAL';
    } else if (category === 'CAPEX' || category === 'EXPANSION' || category === 'ACQUISITION') {
      direction = 'POSITIVE';
      magnitude = 'HIGH';
      horizon = 'LONG_TERM';
    }

    const rationale = `Headline indicates ${direction.toLowerCase()} impact via ${channels.primaryChannel} channel for ${relevance.toLowerCase()} context.`;
    const potentialEffect = `${direction} influence on ${channels.primaryChannel} driven by ${category.replace('_', ' ').toLowerCase()} event.`;

    return {
      direction,
      magnitude,
      horizon,
      rationale,
      businessChannels: [category.replace('_', ' ')],
      financialChannels: [channels.primaryChannel, ...channels.secondaryChannels],
      potentialEffect,
      confidence: 85,
      evidenceReferences: [headline],
    };
  }

  private static detectSourceConflict(sources: NewsSource[], groupId: string): SourceConflict | null {
    if (sources.length < 2) return null;

    const srcA = sources[0];
    const srcB = sources[1];

    if (
      srcA.sourceTier === 'TIER_1_PRIMARY' &&
      srcB.sourceTier === 'TIER_4_DISCOVERY_ONLY'
    ) {
      return {
        conflictId: `conf_${groupId}`,
        eventId: `ev_${groupId}`,
        claim: 'Discrepancy between official filing and social media forum report.',
        sourceA: srcA,
        sourceB: srcB,
        difference: 'Official disclosure contradicts unverified discovery report.',
        sourceReliabilityA: srcA.reliabilityScore,
        sourceReliabilityB: srcB.reliabilityScore,
        resolution: 'RESOLVED_BY_PRIMARY_SOURCE',
        resolutionEvidence: 'Tier 1 official exchange filing takes absolute precedence.',
        status: 'RESOLVED',
      };
    }

    return null;
  }
}
