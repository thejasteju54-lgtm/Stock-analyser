import { DailyStockSignal, SectorHeatmapItem } from './MarketIntelligenceTypes';

export class SectorHeatmapEngine {
  static generateSectorHeatmap(signals: DailyStockSignal[]): SectorHeatmapItem[] {
    const sectorMap: Map<string, DailyStockSignal[]> = new Map();

    for (const sig of signals) {
      const sec = sig.sector || 'General';
      const existing = sectorMap.get(sec) || [];
      existing.push(sig);
      sectorMap.set(sec, existing);
    }

    const items: SectorHeatmapItem[] = [];

    for (const [sector, stocks] of sectorMap.entries()) {
      const avg1D = stocks.reduce((acc, s) => acc + s.returns.d1, 0) / stocks.length;
      const avg5D = stocks.reduce((acc, s) => acc + s.returns.d5, 0) / stocks.length;
      const avgVol = stocks.reduce((acc, s) => acc + (s.technical.volumeMultiple || 1), 0) / stocks.length;
      const hasHighNews = stocks.some((s) => s.events.some((e) => e.materiality === 'HIGH'));

      const topMovers = [...stocks]
        .sort((a, b) => b.returns.d1 - a.returns.d1)
        .slice(0, 3)
        .map((s) => ({ symbol: s.symbol, changePercent: s.returns.d1 }));

      items.push({
        sector,
        performance1D: Number(avg1D.toFixed(2)),
        performance5D: Number(avg5D.toFixed(2)),
        volumeMultiple: Number(avgVol.toFixed(2)),
        newsIntensity: hasHighNews ? 'HIGH' : avgVol >= 1.5 ? 'MEDIUM' : 'LOW',
        topMovers,
        opportunityCount: stocks.filter((s) => s.returns.d1 > 1.0).length,
      });
    }

    // Sort by 1D performance descending
    return items.sort((a, b) => b.performance1D - a.performance1D);
  }
}
