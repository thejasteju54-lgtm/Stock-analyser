/**
 * NewsDeduplicationEngine.ts
 * Phase 11 — News Deduplication, Source Lineage & Corroboration Engine.
 * Prevents syndicated/rewritten news copies from being counted as independent confirmations.
 */

import {
  NewsSource,
  SourceLineage,
  CorroborationStatus,
} from './NewsAndIndustryTypes';

export interface RawNewsArticle {
  articleId: string;
  headline: string;
  body: string;
  publishedAt: string;
  source: NewsSource;
}

export interface ClusteredNewsGroup {
  groupId: string;
  canonicalHeadline: string;
  canonicalSummary: string;
  earliestPublishedAt: string;
  sources: NewsSource[];
  lineage: SourceLineage;
  corroborationStatus: CorroborationStatus;
  independentSourceCount: number;
  primarySourceCount: number;
}

export class NewsDeduplicationEngine {
  /**
   * Clusters a list of raw news articles into deduplicated canonical event groups.
   */
  public static clusterArticles(articles: RawNewsArticle[]): ClusteredNewsGroup[] {
    const groups: ClusteredNewsGroup[] = [];

    // Sort articles by publication date ascending
    const sorted = [...articles].sort(
      (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
    );

    for (const article of sorted) {
      let matchedGroup: ClusteredNewsGroup | null = null;

      for (const group of groups) {
        if (this.isDuplicateOrSyndicated(article, group)) {
          matchedGroup = group;
          break;
        }
      }

      if (matchedGroup) {
        // Add to existing cluster
        matchedGroup.sources.push(article.source);
        matchedGroup.lineage.derivedSourceIds.push(article.source.sourceId);

        // Recompute corroboration and counts
        this.updateGroupCorroboration(matchedGroup);
      } else {
        // Create new cluster group
        const lineageId = `lin_${article.articleId}`;
        const newGroup: ClusteredNewsGroup = {
          groupId: `grp_${article.articleId}`,
          canonicalHeadline: article.headline,
          canonicalSummary: article.body.slice(0, 300),
          earliestPublishedAt: article.publishedAt,
          sources: [article.source],
          lineage: {
            lineageId,
            primarySourceId: article.source.sourceId,
            derivedSourceIds: [],
            relationshipType: article.source.sourceTier === 'TIER_1_PRIMARY' ? 'DIRECT_PRIMARY' : 'INDEPENDENT_REPORT',
            confidence: 90,
          },
          corroborationStatus: 'SINGLE_RELIABLE_SOURCE',
          independentSourceCount: 1,
          primarySourceCount: article.source.sourceTier === 'TIER_1_PRIMARY' ? 1 : 0,
        };

        this.updateGroupCorroboration(newGroup);
        groups.push(newGroup);
      }
    }

    return groups;
  }

  private static isDuplicateOrSyndicated(
    article: RawNewsArticle,
    group: ClusteredNewsGroup
  ): boolean {
    // 1. Text / Headline Similarity
    const sim = this.calculateJaccardSimilarity(article.headline, group.canonicalHeadline);
    if (sim >= 0.45) return true;

    // 2. Exact match on key numerical facts (e.g. order value, revenue figure, plant capacity)
    const artNumbers = this.extractNumbers(article.headline);
    const grpNumbers = this.extractNumbers(group.canonicalHeadline);

    if (artNumbers.length > 0 && grpNumbers.length > 0) {
      const commonNumbers = artNumbers.filter((n) => grpNumbers.includes(n));
      if (commonNumbers.length > 0 && sim >= 0.30) {
        return true;
      }
    }

    return false;
  }

  private static updateGroupCorroboration(group: ClusteredNewsGroup): void {
    const tier1Count = group.sources.filter((s) => s.sourceTier === 'TIER_1_PRIMARY').length;
    const tier2Count = group.sources.filter((s) => s.sourceTier === 'TIER_2_HIGH_QUALITY_MEDIA').length;
    const tier3Count = group.sources.filter((s) => s.sourceTier === 'TIER_3_SECONDARY').length;
    const tier4Count = group.sources.filter((s) => s.sourceTier === 'TIER_4_DISCOVERY_ONLY').length;

    // Independent count (distinct publishers, excluding syndicated copies from same publisher/wire)
    const distinctPublishers = new Set(group.sources.map((s) => s.publisher.toLowerCase()));
    const independentCount = distinctPublishers.size;

    group.primarySourceCount = tier1Count;
    group.independentSourceCount = independentCount;

    if (tier1Count > 0) {
      group.corroborationStatus = 'PRIMARY_CONFIRMED';
    } else if (independentCount >= 2 && (tier2Count >= 2 || (tier2Count >= 1 && tier3Count >= 1))) {
      group.corroborationStatus = 'MULTI_SOURCE_CONFIRMED';
    } else if (tier2Count === 1) {
      group.corroborationStatus = 'SINGLE_RELIABLE_SOURCE';
    } else if (tier3Count > 0) {
      group.corroborationStatus = 'SECONDARY_ONLY';
    } else if (tier4Count > 0) {
      group.corroborationStatus = 'UNVERIFIED';
    }
  }

  private static calculateJaccardSimilarity(str1: string, str2: string): number {
    const words1 = new Set(
      str1
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 3)
    );
    const words2 = new Set(
      str2
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 3)
    );

    if (words1.size === 0 || words2.size === 0) return 0;

    let intersection = 0;
    for (const w of words1) {
      if (words2.has(w)) intersection++;
    }

    const union = words1.size + words2.size - intersection;
    return union > 0 ? intersection / union : 0;
  }

  private static extractNumbers(str: string): string[] {
    const matches = str.match(/\b\d+(\.\d+)?\b/g);
    return matches || [];
  }
}
