import { DiscoveredNewsEventItem } from '../../infrastructure/researchSources/SourceAdapterTypes';

export interface DeduplicatedNewsGroup {
  primaryEvent: DiscoveredNewsEventItem;
  duplicateGroupId: string;
  totalArticles: number;
  sources: string[];
  isSyndicated: boolean;
}

export class NewsDeduplicationEngine {
  /**
   * Groups syndicated and republished news articles by duplicateGroupId or headline similarity
   */
  static deduplicateNews(events: DiscoveredNewsEventItem[]): DeduplicatedNewsGroup[] {
    const groups: Map<string, DiscoveredNewsEventItem[]> = new Map();

    for (const evt of events) {
      // Use duplicateGroupId if present, otherwise normalize headline
      const key =
        evt.duplicateGroupId ||
        evt.headline.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 40);

      const existing = groups.get(key) || [];
      existing.push(evt);
      groups.set(key, existing);
    }

    const result: DeduplicatedNewsGroup[] = [];

    for (const [key, items] of groups.entries()) {
      // Pick the highest Tier source as the primary item
      const sorted = [...items].sort((a, b) => a.sourceTier - b.sourceTier);
      const primary = sorted[0];

      result.push({
        primaryEvent: primary,
        duplicateGroupId: key,
        totalArticles: items.length,
        sources: Array.from(new Set(items.map((i) => i.source))),
        isSyndicated: items.length > 1 || Boolean(primary.isSyndicated),
      });
    }

    return result;
  }
}
