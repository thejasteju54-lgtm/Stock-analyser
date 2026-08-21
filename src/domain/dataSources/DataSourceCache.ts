/**
 * DataSourceCache.ts
 * Phase 16 — Hash-Indexed Response Cache with Policy-Aware TTL Invalidation.
 */

import { CanonicalJsonSerializer } from '../audit/CanonicalJsonSerializer';
import { DataFetchQuery } from './DataSourceTypes';

export interface CachedResponseRecord<T = unknown> {
  cacheKey: string;
  sourceId: string;
  query: DataFetchQuery;
  captureId: string;
  data: T;
  cachedAt: number; // epoch ms
  expiresAt: number; // epoch ms
  ttlMs: number;
}

export class DataSourceCache {
  private static readonly cache = new Map<string, CachedResponseRecord<unknown>>();

  public static generateKey(sourceId: string, query: DataFetchQuery): string {
    const canonicalQuery = CanonicalJsonSerializer.canonicalize(query);
    return `${sourceId}::${CanonicalJsonSerializer.sha256(canonicalQuery)}`;
  }

  public static get<T>(sourceId: string, query: DataFetchQuery): CachedResponseRecord<T> | null {
    const key = this.generateKey(sourceId, query);
    const item = this.cache.get(key) as CachedResponseRecord<T> | undefined;
    if (!item) return null;

    const now = Date.now();
    if (now > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item;
  }

  public static set<T>(
    sourceId: string,
    query: DataFetchQuery,
    captureId: string,
    data: T,
    ttlMinutes: number = 60
  ): CachedResponseRecord<T> {
    const key = this.generateKey(sourceId, query);
    const now = Date.now();
    const ttlMs = ttlMinutes * 60 * 1000;
    const record: CachedResponseRecord<T> = {
      cacheKey: key,
      sourceId,
      query,
      captureId,
      data,
      cachedAt: now,
      expiresAt: now + ttlMs,
      ttlMs,
    };
    this.cache.set(key, record as CachedResponseRecord<unknown>);
    return record;
  }

  public static invalidate(sourceId?: string): void {
    if (sourceId) {
      for (const [key, record] of this.cache.entries()) {
        if (record.sourceId === sourceId) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  public static count(): number {
    return this.cache.size;
  }
}
