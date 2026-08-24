/**
 * MarketDataProvider.ts
 * Real-Time & Historical Market Data Provider with Live Gatekeeper
 * Connects directly to Indian Market Feeds (NSE, Yahoo Finance, AlphaVantage) via Vite API proxy.
 */

import { fetchLiveMarketQuote, fetchHistoricalMarketSeries, getIndianMarketStatus, getDynamicTop10Opportunities } from '../../../server/api';

export interface LiveMarketQuote {
  symbol: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  marketCap: number;
  peRatio?: number;
  timestamp: string;
  delayStatus: 'LIVE' | 'DELAYED_15MIN' | 'LAST_AVAILABLE';
  exchangeStatus: 'OPEN' | 'CLOSED' | 'PRE_MARKET' | 'POST_MARKET';
}

export interface HistoricalCandle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class MarketDataProvider {
  /**
   * Fetches genuine real-time / last-available quote for an Indian listed security.
   */
  static async getQuote(symbol: string): Promise<LiveMarketQuote> {
    const cleanSymbol = symbol.trim().toUpperCase();

    if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
      try {
        const resp = await fetch(`/api/market/quote?symbol=${encodeURIComponent(cleanSymbol)}`);
        const json = await resp.json();
        if (json.status === 'SUCCESS' && json.data) {
          return json.data;
        }
      } catch (e) {
        // Fallback to server direct fetch
      }
    }

    const q = await fetchLiveMarketQuote(cleanSymbol);
    const mkt = getIndianMarketStatus();
    return {
      symbol: q.symbol,
      price: q.price,
      previousClose: q.previousClose,
      change: q.change,
      changePercent: q.changePercent,
      open: q.open,
      high: q.high,
      low: q.low,
      volume: q.volume,
      fiftyTwoWeekHigh: q.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: q.fiftyTwoWeekLow,
      marketCap: q.marketCap || (q.price * 10000000),
      peRatio: q.peRatio,
      timestamp: q.timestamp,
      delayStatus: q.delayStatus as any,
      exchangeStatus: mkt.status as any,
    };
  }

  /**
   * Fetches actual historical OHLCV daily series.
   */
  static async getHistorical(symbol: string, range: string = '1y'): Promise<HistoricalCandle[]> {
    const cleanSymbol = symbol.trim().toUpperCase();

    if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
      try {
        const resp = await fetch(`/api/market/historical?symbol=${encodeURIComponent(cleanSymbol)}&range=${range}`);
        const json = await resp.json();
        if (json.status === 'SUCCESS' && json.data) {
          return json.data;
        }
      } catch (e) {
        // Fallback to direct fetch
      }
    }

    return await fetchHistoricalMarketSeries(cleanSymbol, range as any);
  }

  /**
   * Returns market session status (LIVE vs CLOSED vs PRE_MARKET).
   */
  static async getStatus() {
    if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
      try {
        const resp = await fetch('/api/market/status');
        const json = await resp.json();
        if (json.status === 'SUCCESS' && json.data) {
          return json.data;
        }
      } catch (e) {
        // Fallback
      }
    }

    return getIndianMarketStatus();
  }

  /**
   * Dynamically evaluates active top 10 market opportunities.
   */
  static async getTopOpportunities() {
    if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
      try {
        const resp = await fetch('/api/market/top10');
        const json = await resp.json();
        if (json.status === 'SUCCESS' && json.data) {
          return json.data;
        }
      } catch (e) {
        // Fallback
      }
    }

    return getDynamicTop10Opportunities();
  }
}
