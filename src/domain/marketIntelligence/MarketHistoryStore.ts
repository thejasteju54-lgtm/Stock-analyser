import { DailyMarketSnapshot } from './MarketIntelligenceTypes';

const STORAGE_KEY_DAILY_SNAPSHOTS = 'eq_terminal_market_snapshots_v1';

export class MarketHistoryStore {
  private static isBrowserEnvironment(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private static memoryStore: Map<string, DailyMarketSnapshot> = new Map();

  static saveSnapshot(snapshot: DailyMarketSnapshot): void {
    this.memoryStore.set(snapshot.date, snapshot);
    if (this.isBrowserEnvironment()) {
      try {
        const existing = this.listSnapshots();
        const updated = existing.filter((s) => s.date !== snapshot.date);
        updated.unshift(snapshot);
        window.localStorage.setItem(STORAGE_KEY_DAILY_SNAPSHOTS, JSON.stringify(updated.slice(0, 30)));
      } catch (err) {
        console.warn('Failed to persist market snapshot:', err);
      }
    }
  }

  static getSnapshot(date: string): DailyMarketSnapshot | null {
    if (this.memoryStore.has(date)) {
      return this.memoryStore.get(date)!;
    }
    const snapshots = this.listSnapshots();
    return snapshots.find((s) => s.date === date) || null;
  }

  static listSnapshots(): DailyMarketSnapshot[] {
    if (!this.isBrowserEnvironment()) {
      return Array.from(this.memoryStore.values());
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_DAILY_SNAPSHOTS);
      if (!raw) return Array.from(this.memoryStore.values());
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return Array.from(this.memoryStore.values());
    }
  }
}
